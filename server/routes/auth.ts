/**
 * Authentication Routes
 * Handles OTP request, verification, and resend using direct Twilio SMS
 * Users are stored in Supabase database
 */

import { Router, type Request, Response, NextFunction } from "express";
import { z } from "zod";
import { OTPService } from "../services/otpService";
import { smsService } from "../services/smsService";
import { storage } from "../storage";
import { config } from "../config";
import { createUserSession, destroySession } from "../services/sessionService";
import { rateLimit } from "../middleware/rateLimit";
import { validate } from "../middleware/validation";
import { SupabaseAuthService } from "../services/supabaseAuth";

const router = Router();

// Validation schemas
const requestOTPSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number. Must be 10 digits starting with 6-9."),
});

const verifyOTPSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number. Must be 10 digits starting with 6-9."),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

// Email validation schemas
const requestEmailOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const verifyEmailOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(6, "OTP must be at least 6 characters"),
});

/**
 * POST /api/auth/otp/request
 * Request OTP for phone number
 */
router.post(
  "/otp/request",
  config.features.rateLimiting
    ? rateLimit(
        "otp-request",
        config.rateLimit.otpRequest.windowMs,
        config.rateLimit.otpRequest.max
      )
    : (req, res, next) => next(),
  validate(requestOTPSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Input already validated by middleware
      const { phoneNumber } = req.body;

      // Generate and store OTP using our custom service
      const otp = await OTPService.createOTPSession(phoneNumber);

      // Send SMS via Twilio (or mock in development)
      try {
        await smsService.sendOTP(`+91${phoneNumber}`, otp);
        console.log(`[Auth] OTP sent to ${phoneNumber} via SMS service`);
      } catch (smsError: any) {
        console.error("[Auth] SMS sending error:", smsError);
        // In development, we might still want to return success
        // In production, you might want to fail here
        if (config.sms.provider === "mock") {
          console.log(`[Auth] [DEV] OTP for ${phoneNumber}: ${otp}`);
        } else {
          throw new Error(`Failed to send SMS: ${smsError.message}`);
        }
      }

      res.json({
        success: true,
        message: "OTP sent successfully",
        // In development/mock mode, include OTP for testing
        ...(config.sms.provider === "mock" && { otp, devMode: true }),
      });
    } catch (error: any) {
      console.error("[Auth] OTP request error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to send OTP",
      });
    }
  }
);

/**
 * POST /api/auth/otp/verify
 * Verify OTP and create session
 */
router.post(
  "/otp/verify",
  config.features.rateLimiting
    ? rateLimit(
        "otp-verify",
        config.rateLimit.otpVerify.windowMs,
        config.rateLimit.otpVerify.max
      )
    : (req, res, next) => next(),
  validate(verifyOTPSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Input already validated by middleware
      const { phoneNumber, otp } = req.body;

      // Verify OTP using our custom service
      const isValid = await OTPService.verifyOTP(phoneNumber, otp);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid OTP",
        });
      }

      // Get or create user in Supabase database
      let user = await storage.getUserByPhoneNumber(phoneNumber);
      if (!user) {
        // Create new user in Supabase database
        user = await storage.createOrUpdateUser(phoneNumber);
        console.log(`[Auth] Created new user in Supabase: ${user.id} for phone: ${phoneNumber}`);
      } else {
        console.log(`[Auth] Found existing user in Supabase: ${user.id} for phone: ${phoneNumber}`);
      }

      // Create session - CRITICAL STEP
      console.log(`[Auth] ========== STARTING SESSION CREATION ==========`);
      console.log(`[Auth] User ID: ${user.id}`);
      console.log(`[Auth] About to call createUserSession...`);
      console.log(`[Auth] Creating session for user ${user.id}...`);
      let sessionToken: string;
      try {
        sessionToken = await createUserSession(user.id, req);
        console.log(`[Auth] ✅ Session created successfully, token: ${sessionToken.substring(0, 8)}...`);
      } catch (sessionError: any) {
        console.error(`[Auth] ❌ Session creation failed:`, sessionError);
        throw new Error(`Failed to create session: ${sessionError.message}`);
      }
      
      // Log session creation for debugging
      console.log(`[Auth] Session details:`, {
        userId: req.session.userId,
        token: req.session.token ? `${req.session.token.substring(0, 8)}...` : 'missing',
        sessionId: req.sessionID,
        cookieName: config.session.cookieName
      });

      // Verify session was saved in storage
      const verifySession = await storage.getSession(sessionToken);
      if (!verifySession) {
        console.error(`[Auth] ❌ CRITICAL: Session not found in storage after creation!`);
        throw new Error("Session creation failed - session not found in storage");
      }
      console.log(`[Auth] ✅ Session verified in storage, expires at: ${verifySession.expiresAt}`);

      // Ensure session is saved and cookie is set before sending response
      console.log(`[Auth] Final session check before response:`, {
        sessionId: req.sessionID,
        hasUserId: !!req.session.userId,
        hasToken: !!req.session.token,
        cookieName: config.session.cookieName
      });

      // Log response headers to verify cookie will be set
      res.on('finish', () => {
        const setCookieHeader = res.getHeader('Set-Cookie');
        console.log(`[Auth] Response finished. Set-Cookie header:`, setCookieHeader ? 'present' : 'missing');
        if (setCookieHeader) {
          console.log(`[Auth] Cookie value:`, Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader);
        }
      });

      // Send response - express-session will set the cookie automatically
      res.json({
        success: true,
        message: "OTP verified successfully",
        token: sessionToken,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          isGuest: user.isGuest,
        },
      });
    } catch (error: any) {
      console.error("[Auth] OTP verify error:", error);
      res.status(401).json({
        success: false,
        message: error.message || "Invalid OTP",
      });
    }
  }
);

/**
 * POST /api/auth/otp/resend
 * Resend OTP
 */
router.post(
  "/otp/resend",
  config.features.rateLimiting
    ? rateLimit(
        "otp-request",
        config.rateLimit.otpRequest.windowMs,
        config.rateLimit.otpRequest.max
      )
    : (req, res, next) => next(),
  validate(requestOTPSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Input already validated by middleware
      const { phoneNumber } = req.body;

      // Generate new OTP (this handles cooldown logic)
      const otp = await OTPService.createOTPSession(phoneNumber);

      // Send SMS via Twilio (or mock in development)
      try {
        await smsService.sendOTP(`+91${phoneNumber}`, otp);
        console.log(`[Auth] OTP resent to ${phoneNumber} via SMS service`);
      } catch (smsError: any) {
        console.error("[Auth] SMS sending error:", smsError);
        if (config.sms.provider === "mock") {
          console.log(`[Auth] [DEV] OTP for ${phoneNumber}: ${otp}`);
        } else {
          throw new Error(`Failed to send SMS: ${smsError.message}`);
        }
      }

      res.json({
        success: true,
        message: "OTP resent successfully",
        // In development/mock mode, include OTP for testing
        ...(config.sms.provider === "mock" && { otp, devMode: true }),
      });
    } catch (error: any) {
      console.error("[Auth] OTP resend error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to resend OTP",
      });
    }
  }
);

/**
 * GET /api/auth/status
 * Check authentication status
 */
router.get("/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Debug logging
    console.log(`[Auth Status] Checking auth status...`);
    console.log(`[Auth Status] Session ID: ${req.sessionID}`);
    console.log(`[Auth Status] Session token: ${req.session.token ? `${req.session.token.substring(0, 8)}...` : 'missing'}`);
    console.log(`[Auth Status] Session userId: ${req.session.userId || 'missing'}`);
    console.log(`[Auth Status] Cookies received:`, req.headers.cookie ? 'yes' : 'no');
    
    const token = req.session.token;
    if (!token) {
      console.log(`[Auth Status] No session token found`);
      return res.json({
        authenticated: false,
        message: "Not authenticated",
      });
    }

    // Check our session
    const session = await storage.getSession(token);
    if (!session) {
      console.log(`[Auth Status] Session not found in storage for token: ${token.substring(0, 8)}...`);
      return res.json({
        authenticated: false,
        message: "Session not found",
      });
    }
    
    if (new Date() > session.expiresAt) {
      console.log(`[Auth Status] Session expired`);
      await storage.deleteSession(token);
      return res.json({
        authenticated: false,
        message: "Session expired",
      });
    }

    // Get user from Supabase database
    const user = await storage.getUser(session.userId);
    if (!user) {
      console.log(`[Auth Status] User not found: ${session.userId}`);
      return res.json({
        authenticated: false,
        message: "User not found",
      });
    }

    console.log(`[Auth Status] User authenticated: ${user.id}`);
    res.json({
      authenticated: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        isGuest: user.isGuest,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout and destroy session
 */
router.post("/logout", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await destroySession(req, res);
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/email/request
 * Request OTP for email using Supabase Auth
 */
router.post(
  "/email/request",
  config.features.rateLimiting
    ? rateLimit(
        "otp-request",
        config.rateLimit.otpRequest.windowMs,
        config.rateLimit.otpRequest.max
      )
    : (req, res, next) => next(),
  validate(requestEmailOTPSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      // Use Supabase Auth to send email OTP
      const supabaseUrl = process.env.SUPABASE_URL || "";
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(500).json({
          success: false,
          message: "Supabase configuration missing",
        });
      }

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: undefined, // We'll handle OTP verification manually
        },
      });

      if (error) {
        console.error("[Auth] Email OTP request error:", error);
        return res.status(400).json({
          success: false,
          message: error.message || "Failed to send email OTP",
        });
      }

      console.log(`[Auth] Email OTP sent to ${email}`);

      res.json({
        success: true,
        message: "OTP sent to your email",
        // In test mode, Supabase might return the OTP
        ...(data && (data as any).otp && { otp: (data as any).otp, devMode: true }),
      });
    } catch (error: any) {
      console.error("[Auth] Email OTP request error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to send email OTP",
      });
    }
  }
);

/**
 * POST /api/auth/email/verify
 * Verify email OTP and create session
 */
router.post(
  "/email/verify",
  config.features.rateLimiting
    ? rateLimit(
        "otp-verify",
        config.rateLimit.otpVerify.windowMs,
        config.rateLimit.otpVerify.max
      )
    : (req, res, next) => next(),
  validate(verifyEmailOTPSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp } = req.body;

      // Use Supabase Auth to verify email OTP
      const supabaseUrl = process.env.SUPABASE_URL || "";
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(500).json({
          success: false,
          message: "Supabase configuration missing",
        });
      }

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error || !data.user || !data.session) {
        console.error("[Auth] Email OTP verify error:", error);
        return res.status(401).json({
          success: false,
          message: error?.message || "Invalid OTP",
        });
      }

      console.log(`[Auth] Email OTP verified for ${email}, User ID: ${data.user.id}`);

      // Get or create user in our database using email
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user with email
        // Use email as phone number placeholder (since phoneNumber is required)
        const placeholderPhone = `email_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
        user = await storage.createOrUpdateUser(placeholderPhone, {
          email: email,
        });
        console.log(`[Auth] Created new user for email: ${email}`);
      } else {
        console.log(`[Auth] Found existing user for email: ${email}`);
      }

      // Create session
      const sessionToken = await createUserSession(user.id, req);

      res.json({
        success: true,
        message: "Email verified successfully",
        token: sessionToken,
        user: {
          id: user.id,
          email: email,
          isGuest: user.isGuest,
        },
      });
    } catch (error: any) {
      console.error("[Auth] Email OTP verify error:", error);
      res.status(401).json({
        success: false,
        message: error.message || "Invalid OTP",
      });
    }
  }
);

/**
 * POST /api/auth/email/resend
 * Resend email OTP
 */
router.post(
  "/email/resend",
  config.features.rateLimiting
    ? rateLimit(
        "otp-request",
        config.rateLimit.otpRequest.windowMs,
        config.rateLimit.otpRequest.max
      )
    : (req, res, next) => next(),
  validate(requestEmailOTPSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      // Use Supabase Auth to resend email OTP
      const supabaseUrl = process.env.SUPABASE_URL || "";
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return res.status(500).json({
          success: false,
          message: "Supabase configuration missing",
        });
      }

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      const { data, error } = await supabase.auth.resend({
        type: "email",
        email,
      });

      if (error) {
        console.error("[Auth] Email OTP resend error:", error);
        return res.status(400).json({
          success: false,
          message: error.message || "Failed to resend email OTP",
        });
      }

      console.log(`[Auth] Email OTP resent to ${email}`);

      res.json({
        success: true,
        message: "OTP resent to your email",
        ...(data && (data as any).otp && { otp: (data as any).otp, devMode: true }),
      });
    } catch (error: any) {
      console.error("[Auth] Email OTP resend error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to resend email OTP",
      });
    }
  }
);

export default router;

