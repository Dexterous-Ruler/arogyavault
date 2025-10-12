/**
 * Feature Flags Configuration
 * 
 * Controls which screens/features are accessible in the application.
 * Set to true to enable navigation to that screen.
 * 
 * IMPORTANT: Flag changes require a browser reload/rebuild to take effect.
 * This is standard behavior for compile-time feature flags.
 * 
 * BEHAVIOR:
 * - screens.* = false: Route returns 404, screen inaccessible
 * - auth.* = false: Handler not passed to component, button becomes non-functional
 * 
 * UI CONSTRAINT: Buttons remain visible even when disabled to preserve 
 * the exact UI design as provided. Handlers simply don't execute.
 */

export const featureFlags = {
  // Screen availability
  screens: {
    auth: true,           // ✅ Auth page is live
    otp: true,            // ✅ OTP verification is live
    onboarding: true,     // ✅ User onboarding is live
    home: false,          // 🚧 Home dashboard - coming soon
    vault: false,         // 🚧 Secure vault - coming soon
  },
  
  // Authentication methods
  auth: {
    phoneOTP: true,       // ✅ Phone + OTP enabled
    abhaId: true,         // ✅ ABHA ID enabled (stubbed)
    email: true,          // ✅ Email enabled (stubbed)
    guest: true,          // ✅ Guest mode enabled (stubbed)
  },
  
  // Features
  features: {
    multiLanguage: true,  // ✅ English/Hindi support
    guidedMode: true,     // ✅ Accessibility mode
    darkMode: false,      // 🚧 Dark mode - future feature
  }
} as const;

export type FeatureFlags = typeof featureFlags;
