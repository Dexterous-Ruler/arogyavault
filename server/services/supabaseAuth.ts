/**
 * Supabase Authentication Service
 * Handles phone-based authentication using Supabase Auth
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { storage } from "../storage";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[Supabase Auth] Warning: SUPABASE_URL or SUPABASE_ANON_KEY not set in environment variables");
}

// Create Supabase client for auth operations
const supabaseAuth: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // We'll handle sessions ourselves
  },
});

console.log(`[Supabase Auth] Initialized with URL: ${supabaseUrl ? 'Set' : 'Missing'}, Key: ${supabaseAnonKey ? 'Set' : 'Missing'}`);

export class SupabaseAuthService {
  /**
   * Send OTP to phone number
   * @param phoneNumber - Phone number (10 digits, will be formatted to +91XXXXXXXXXX)
   * @returns Success response
   */
  static async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string; otp?: string }> {
    try {
      // Format phone number for Supabase (needs country code)
      const formattedPhone = `+91${phoneNumber}`;

      console.log(`[Supabase Auth] Sending OTP to: ${formattedPhone}`);
      
      const { data, error } = await supabaseAuth.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          // Use SMS channel explicitly
          channel: 'sms',
          // For trial accounts, ensure we're using a verified phone number
          // This should be configured in Supabase dashboard
        },
      });

      if (error) {
        console.error("[Supabase Auth] Error sending OTP:", error);
        console.error("[Supabase Auth] Error details:", JSON.stringify(error, null, 2));
        throw new Error(error.message || "Failed to send OTP");
      }

      // Log full response for debugging
      console.log(`[Supabase Auth] OTP request response:`, JSON.stringify(data, null, 2));
      
      // Check if SMS was actually sent
      if (data && (data as any).message_id) {
        console.log(`[Supabase Auth] ✅ SMS sent - Message ID: ${(data as any).message_id}`);
      } else {
        console.warn(`[Supabase Auth] ⚠️  WARNING: No message_id in response - SMS may not have been sent!`);
        console.warn(`[Supabase Auth] ⚠️  Check Twilio configuration in Supabase Dashboard`);
        console.warn(`[Supabase Auth] ⚠️  Ensure 'Twilio From Number' is set to: +17073480818`);
      }
      
      console.log(`[Supabase Auth] OTP sent successfully to ${formattedPhone}`);

      // In development, Supabase might return the OTP for testing
      // Check if we're in test mode
      const response: any = {
        success: true,
        message: "OTP sent successfully",
      };

      // If Supabase returns OTP in test mode, include it
      if (data && (data as any).otp) {
        response.otp = (data as any).otp;
        response.devMode = true;
        console.log(`[Supabase Auth] ⚠️ TEST MODE: OTP is ${(data as any).otp}`);
      }

      // Check for message ID or other indicators
      if (data && (data as any).message_id) {
        console.log(`[Supabase Auth] Message ID: ${(data as any).message_id}`);
      }

      return response;
    } catch (error: any) {
      console.error("[Supabase Auth] sendOTP error:", error);
      throw error;
    }
  }

  /**
   * Verify OTP
   * @param phoneNumber - Phone number (10 digits)
   * @param otp - OTP code
   * @returns User session data
   */
  static async verifyOTP(
    phoneNumber: string,
    otp: string
  ): Promise<{
    success: boolean;
    user: {
      id: string;
      phoneNumber: string;
      isGuest: boolean;
    };
    session: {
      access_token: string;
      refresh_token: string;
    };
  }> {
    try {
      // Format phone number for Supabase
      const formattedPhone = `+91${phoneNumber}`;

      console.log(`[Supabase Auth] Verifying OTP for: ${formattedPhone}, OTP: ${otp}`);
      
      const { data, error } = await supabaseAuth.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "sms",
      });

      if (error) {
        console.error("[Supabase Auth] Error verifying OTP:", error);
        throw new Error(error.message || "Invalid OTP");
      }

      if (!data.user || !data.session) {
        console.error("[Supabase Auth] Missing user or session in response");
        throw new Error("Authentication failed");
      }

      console.log(`[Supabase Auth] OTP verified successfully for ${formattedPhone}, User ID: ${data.user.id}`);

      // Get or create user in our database
      let user = await storage.getUserByPhoneNumber(phoneNumber);
      if (!user) {
        // Create user in our database
        user = await storage.createOrUpdateUser(phoneNumber, {
          // Map Supabase user ID to our user
          // Note: We'll use our own user ID, but can store Supabase ID if needed
        });
      }

      // Update user with Supabase auth user ID if needed
      // You might want to store auth.users.id in your users table

      return {
        success: true,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          isGuest: user.isGuest,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      };
    } catch (error: any) {
      console.error("[Supabase Auth] verifyOTP error:", error);
      throw error;
    }
  }

  /**
   * Resend OTP
   * @param phoneNumber - Phone number (10 digits)
   * @returns Success response
   */
  static async resendOTP(phoneNumber: string): Promise<{ success: boolean; message: string; otp?: string }> {
    // Resend is the same as sending a new OTP
    return this.sendOTP(phoneNumber);
  }

  /**
   * Get user from Supabase session token
   * @param accessToken - Supabase access token
   * @returns User data or null
   */
  static async getUserFromToken(accessToken: string): Promise<{
    id: string;
    phoneNumber: string;
    isGuest: boolean;
  } | null> {
    try {
      const { data: { user }, error } = await supabaseAuth.auth.getUser(accessToken);

      if (error || !user) {
        return null;
      }

      // Extract phone number from user (remove +91 prefix)
      const phone = user.phone?.replace(/^\+91/, "") || "";

      // Get user from our database
      const dbUser = await storage.getUserByPhoneNumber(phone);
      if (!dbUser) {
        return null;
      }

      return {
        id: dbUser.id,
        phoneNumber: dbUser.phoneNumber,
        isGuest: dbUser.isGuest,
      };
    } catch (error) {
      console.error("[Supabase Auth] getUserFromToken error:", error);
      return null;
    }
  }

  /**
   * Sign out user
   * @param accessToken - Supabase access token
   */
  static async signOut(accessToken: string): Promise<void> {
    try {
      // Create a temporary client with the access token
      const { error } = await supabaseAuth.auth.signOut();
      if (error) {
        console.error("[Supabase Auth] signOut error:", error);
      }
    } catch (error) {
      console.error("[Supabase Auth] signOut error:", error);
    }
  }
}

