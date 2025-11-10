/**
 * SMS Service
 * Abstraction layer for sending SMS via different providers
 */

import { config } from "../config";

export interface ISMSService {
  sendOTP(phoneNumber: string, otp: string): Promise<void>;
}

/**
 * Mock SMS Service - For development
 * Logs OTP to console instead of sending real SMS
 */
export class MockSMSService implements ISMSService {
  async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    console.log("\n" + "=".repeat(50));
    console.log("📱 [MOCK SMS] Arogya Vault OTP Notification");
    console.log("=".repeat(50));
    console.log(`Phone Number: ${phoneNumber}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid for: ${config.otp.expiryMinutes} minutes`);
    console.log("=".repeat(50) + "\n");
  }
}

/**
 * Twilio SMS Service - For production
 * Sends real SMS via Twilio API
 */
export class TwilioSMSService implements ISMSService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private client: any;

  constructor() {
    this.accountSid = config.sms.twilio.accountSid;
    this.authToken = config.sms.twilio.authToken;
    this.fromNumber = config.sms.twilio.fromNumber;

    if (!this.accountSid || !this.authToken) {
      throw new Error(
        "Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables."
      );
    }

    // Initialize Twilio client (will be done lazily on first use)
    this.client = null;
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    // Initialize Twilio client lazily (on first use)
    if (!this.client) {
      try {
        const twilio = await import("twilio");
        this.client = twilio.default(this.accountSid, this.authToken);
      } catch (error: any) {
        console.error("❌ Failed to load Twilio package:", error.message);
        throw new Error("Twilio package not available. Please install it: npm install twilio");
      }
    }

    // Ensure phone number has country code
    // If it's an Indian number (10 digits), add +91
    let formattedNumber = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
    
    // Handle Indian numbers (10 digits without country code)
    if (/^\+?\d{10}$/.test(phoneNumber.replace(/\+/g, ""))) {
      formattedNumber = `+91${phoneNumber.replace(/^\+?/, "")}`;
    }

    // Use fromNumber if available, otherwise Twilio will use account default
    const fromNumber = this.fromNumber || undefined;

    try {
      const message = await this.client.messages.create({
        body: `Your Arogya Vault OTP is ${otp}. Valid for ${config.otp.expiryMinutes} minutes. Do not share this code with anyone.`,
        from: fromNumber,
        to: formattedNumber,
      });

      console.log(`✅ Twilio SMS sent to ${formattedNumber} (SID: ${message.sid})`);
      console.log(`   From: ${fromNumber || 'Twilio Default'}`);
    } catch (error: any) {
      console.error("❌ Twilio SMS error:", error.message);
      console.error("   Error code:", error.code);
      console.error("   Phone number attempted:", formattedNumber);
      console.error("   From number:", fromNumber);
      
      // Provide helpful error messages
      if (error.code === 21211) {
        throw new Error("Invalid phone number format. Please include country code (e.g., +91 for India).");
      } else if (error.code === 21608) {
        throw new Error("Twilio phone number not configured. Please set TWILIO_FROM_NUMBER or use a verified number.");
      } else if (error.code === 20003) {
        throw new Error("Twilio authentication failed. Please check your Account SID and Auth Token.");
      } else if (error.code === 21408) {
        throw new Error("Permission denied. This phone number is not verified for your Twilio trial account.");
      }
      
      throw new Error(`Failed to send SMS: ${error.message} (Code: ${error.code})`);
    }
  }
}

/**
 * MSG91 SMS Service - Alternative provider for India
 * Sends real SMS via MSG91 API
 */
export class MSG91SMSService implements ISMSService {
  private authKey: string;
  private templateId: string;

  constructor() {
    this.authKey = config.sms.msg91.authKey;
    this.templateId = config.sms.msg91.templateId;

    if (!this.authKey) {
      throw new Error(
        "MSG91 credentials not configured. Please set MSG91_AUTH_KEY environment variable."
      );
    }
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<void> {
    // MSG91 API implementation
    // Example: https://control.msg91.com/api/sendhttp.php
    const url = `https://control.msg91.com/api/sendhttp.php?authkey=${this.authKey}&mobiles=${phoneNumber}&message=Your Arogya Vault OTP is ${otp}. Valid for ${config.otp.expiryMinutes} minutes.&sender=AROGYA&route=4`;

    try {
      const response = await fetch(url);
      const result = await response.text();

      if (result.includes("Invalid")) {
        throw new Error(`MSG91 API error: ${result}`);
      }

      console.log(`✅ MSG91 SMS sent to ${phoneNumber}`);
    } catch (error: any) {
      console.error("❌ MSG91 SMS error:", error.message);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }
}

/**
 * Factory function to create appropriate SMS service
 * @returns ISMSService instance based on configuration
 */
export function createSMSService(): ISMSService {
  console.log("🔧 Creating SMS service...");
  console.log("   Provider:", config.sms.provider);
  console.log("   Real OTP enabled:", config.features.realOTP);
  console.log("   Twilio SID:", config.sms.twilio.accountSid ? "Set" : "Missing");
  console.log("   Twilio Token:", config.sms.twilio.authToken ? "Set" : "Missing");
  console.log("   Twilio From:", config.sms.twilio.fromNumber || "Not set");
  
  try {
    switch (config.sms.provider) {
      case "twilio":
        if (config.features.realOTP) {
          try {
            console.log("✅ Attempting to create Twilio SMS service...");
            const service = new TwilioSMSService();
            console.log("✅ Twilio SMS service created successfully!");
            return service;
          } catch (error: any) {
            console.error("❌ Twilio service initialization failed:", error.message);
            console.error("   Stack:", error.stack);
            console.warn("⚠️  Falling back to mock SMS service");
            return new MockSMSService();
          }
        }
        console.log("ℹ️  Real OTP not enabled, using mock service");
        // Fall through to mock if real OTP not enabled
        return new MockSMSService();

      case "msg91":
        if (config.features.realOTP) {
          try {
            return new MSG91SMSService();
          } catch (error: any) {
            console.warn("⚠️  MSG91 service initialization failed, falling back to mock:", error.message);
            return new MockSMSService();
          }
        }
        // Fall through to mock if real OTP not enabled
        return new MockSMSService();

      case "mock":
      default:
        return new MockSMSService();
    }
  } catch (error) {
    console.warn("⚠️  SMS service creation failed, using mock service");
    return new MockSMSService();
  }
}

// Export singleton instance
export const smsService = createSMSService();

