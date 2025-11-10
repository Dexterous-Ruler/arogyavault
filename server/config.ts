/**
 * Server Configuration
 * Centralized configuration management for the Arogya Vault backend
 */

export const config = {
  // OTP Configuration
  otp: {
    length: 6,
    expiryMinutes: 10,
    maxAttempts: 5,
    resendCooldownSeconds: 60,
  },

  // SMS Service Configuration
  sms: {
    provider: (process.env.SMS_PROVIDER || "mock") as "twilio" | "msg91" | "mock",
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || "",
      authToken: process.env.TWILIO_AUTH_TOKEN || "",
      fromNumber: process.env.TWILIO_FROM_NUMBER || "",
    },
    msg91: {
      authKey: process.env.MSG91_AUTH_KEY || "",
      templateId: process.env.MSG91_TEMPLATE_ID || "",
    },
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    cookieName: "arogya_vault_session",
  },

  // Rate Limiting Configuration
  rateLimit: {
    otpRequest: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 requests per window (increased for development)
    },
    otpVerify: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // 20 attempts per window (increased for development)
    },
  },

  // Feature Flags
  features: {
    realOTP: process.env.ENABLE_REAL_OTP === "true",
    databaseStorage: process.env.USE_DATABASE === "true",
    rateLimiting: process.env.ENABLE_RATE_LIMIT !== "false",
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
  },
} as const;

// Type exports for configuration
export type Config = typeof config;
export type SMSProvider = typeof config.sms.provider;

