/**
 * Type declarations for Express Request/Response
 * Extends express-session types
 */

import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    token?: string;
    supabaseAccessToken?: string;
    supabaseRefreshToken?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

