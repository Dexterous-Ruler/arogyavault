/**
 * OTP Service
 * Handles OTP generation, storage, and verification
 */

import { randomInt } from "crypto";
import { config } from "../config";
import { storage } from "../storage";

export class OTPService {
  /**
   * Generate a 6-digit OTP
   */
  static generateOTP(): string {
    return randomInt(100000, 999999).toString();
  }

  /**
   * Create and store OTP session
   * @param phoneNumber - Phone number to send OTP to
   * @returns The generated OTP (for development/testing)
   */
  static async createOTPSession(phoneNumber: string): Promise<string> {
    // Check if there's an existing unverified session
    const existingSession = await storage.getOTPSession(phoneNumber);
    if (existingSession && !existingSession.verified) {
      const timeSinceCreation = Date.now() - existingSession.createdAt.getTime();
      const cooldownMs = config.otp.resendCooldownSeconds * 1000;

      // Only enforce cooldown if session was created very recently (within cooldown period)
      // Allow resend if session is older than cooldown or if it's expired
      if (timeSinceCreation < cooldownMs && new Date() < existingSession.expiresAt) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceCreation) / 1000);
        throw new Error(
          `Please wait ${remainingSeconds} seconds before requesting a new OTP`
        );
      }
      // If session exists but is expired or cooldown passed, delete it and create new one
      if (new Date() > existingSession.expiresAt || timeSinceCreation >= cooldownMs) {
        await storage.deleteOTPSession(phoneNumber);
      }
    }

    // Generate OTP
    const otp = this.generateOTP();

    // Calculate expiry time (in milliseconds)
    const expiresIn = config.otp.expiryMinutes * 60 * 1000;

    // Create OTP session
    await storage.createOTPSession(phoneNumber, otp, expiresIn);

    return otp;
  }

  /**
   * Verify OTP
   * @param phoneNumber - Phone number to verify
   * @param otp - OTP code to verify
   * @returns true if OTP is valid, false otherwise
   */
  static async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
    const session = await storage.getOTPSession(phoneNumber);

    if (!session) {
      console.error(`[OTP] No session found for phone: ${phoneNumber}`);
      return false;
    }

    // Check if expired - use UTC timestamps for comparison to avoid timezone issues
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    // Debug logging
    console.log(`[OTP] Expiry check - Now: ${now.toISOString()} (${now.getTime()}), Expires: ${expiresAt.toISOString()} (${expiresAt.getTime()}), Diff: ${expiresAt.getTime() - now.getTime()}ms`);
    
    if (now.getTime() > expiresAt.getTime()) {
      console.error(`[OTP] OTP expired - Now: ${now.toISOString()}, Expires: ${expiresAt.toISOString()}`);
      await storage.deleteOTPSession(phoneNumber);
      throw new Error("OTP has expired. Please request a new one.");
    }

    // Check if already verified
    if (session.verified) {
      await storage.deleteOTPSession(phoneNumber);
      throw new Error("OTP has already been used. Please request a new one.");
    }

    // Check if max attempts exceeded
    if (session.attempts >= config.otp.maxAttempts) {
      await storage.deleteOTPSession(phoneNumber);
      throw new Error(
        `Maximum verification attempts (${config.otp.maxAttempts}) exceeded. Please request a new OTP.`
      );
    }

    // Verify OTP - ensure both are strings for comparison
    const sessionOTP = String(session.otp).trim();
    const inputOTP = String(otp).trim();
    
    // Debug logging
    console.log(`[OTP] Verifying - Session OTP: "${sessionOTP}", Input OTP: "${inputOTP}", Match: ${sessionOTP === inputOTP}`);
    
    if (sessionOTP === inputOTP) {
      // Increment attempts and mark as verified
      await storage.incrementOTPAttempts(phoneNumber);
      await storage.markOTPVerified(phoneNumber);
      return true;
    }

    // Increment attempts after failed verification
    await storage.incrementOTPAttempts(phoneNumber);

    // Get updated session to check remaining attempts
    const updatedSession = await storage.getOTPSession(phoneNumber);
    const remainingAttempts = config.otp.maxAttempts - (updatedSession?.attempts || 0);

    if (remainingAttempts > 0) {
      throw new Error(
        `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts > 1 ? "s" : ""} remaining.`
      );
    }

    return false;
  }

  /**
   * Clean up expired OTP sessions
   * This should be called periodically (e.g., via cron job)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    // Note: This is a placeholder for future implementation
    // In a real database, this would be a query to delete expired sessions
    // For in-memory storage, sessions are checked on access
    return 0;
  }

  /**
   * Get OTP session status (for debugging/development)
   * @param phoneNumber - Phone number to check
   * @returns Session info or null
   */
  static async getOTPStatus(phoneNumber: string) {
    const session = await storage.getOTPSession(phoneNumber);
    if (!session) return null;

    return {
      phoneNumber: session.phoneNumber,
      verified: session.verified,
      attempts: session.attempts,
      expiresAt: session.expiresAt,
      isExpired: new Date() > session.expiresAt,
      remainingAttempts: config.otp.maxAttempts - session.attempts,
    };
  }
}

