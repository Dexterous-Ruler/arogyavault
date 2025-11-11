/**
 * Session Service
 * Handles user session creation, validation, and management
 */

import { Request, Response } from "express";
import { storage } from "../storage";
import { config } from "../config";
import { randomBytes } from "crypto";

/**
 * Create a new user session
 * @param userId - User ID to create session for
 * @param req - Express request object
 * @returns Session token
 */
export async function createUserSession(
  userId: string,
  req: Request
): Promise<string> {
  console.log(`[SessionService] ========== createUserSession CALLED ==========`);
  console.log(`[SessionService] UserId: ${userId}`);
  console.log(`[SessionService] Request session ID: ${req.sessionID}`);
  console.log(`[SessionService] Request has session: ${!!req.session}`);
  
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + config.session.maxAge);

  console.log(`[SessionService] Creating session for user ${userId}`);
  console.log(`[SessionService] Token: ${token.substring(0, 8)}...`);
  console.log(`[SessionService] Expires at: ${expiresAt.toISOString()}`);

  // Create session in storage first
  try {
    console.log(`[SessionService] Saving session to storage...`);
    await storage.createSession(userId, token, config.session.maxAge);
    console.log(`[SessionService] ✅ Session saved to storage`);
  } catch (storageError: any) {
    console.error(`[SessionService] ❌ Failed to save session to storage:`, storageError);
    throw new Error(`Failed to save session to storage: ${storageError.message}`);
  }

  // Set session in express-session
  req.session.userId = userId;
  req.session.token = token;
  console.log(`[SessionService] Session data set in req.session`);

  // Explicitly save the session to ensure it's persisted
  return new Promise((resolve, reject) => {
    console.log(`[SessionService] Saving express-session...`);
    req.session.save((err) => {
      if (err) {
        console.error(`[SessionService] ❌ Express session save error:`, err);
        reject(err);
      } else {
        console.log(`[SessionService] ✅ Express session saved successfully`);
        console.log(`[SessionService] Session ID: ${req.sessionID}`);
        resolve(token);
      }
    });
  });
}

/**
 * Get user ID from session
 * @param req - Express request object
 * @returns User ID or null if not authenticated
 */
export async function getSessionUser(req: Request): Promise<string | null> {
  console.log(`[SessionService] Getting session user...`);
  console.log(`[SessionService] Session ID: ${req.sessionID}`);
  console.log(`[SessionService] Session data:`, {
    userId: req.session.userId || 'missing',
    token: req.session.token ? `${req.session.token.substring(0, 8)}...` : 'missing'
  });
  console.log(`[SessionService] Cookies in request:`, req.headers.cookie ? 'yes' : 'no');
  
  const token = req.session.token;
  if (!token) {
    console.log(`[SessionService] ❌ No token in req.session`);
    return null;
  }

  console.log(`[SessionService] Looking up session in storage for token: ${token.substring(0, 8)}...`);
  // Get session from storage
  const session = await storage.getSession(token);
  if (!session) {
    console.log(`[SessionService] ❌ Session not found in storage`);
    return null;
  }

  console.log(`[SessionService] ✅ Session found, expires at: ${session.expiresAt.toISOString()}`);
  
  // Check if session expired
  const now = new Date();
  if (now > session.expiresAt) {
    console.log(`[SessionService] ❌ Session expired (now: ${now.toISOString()}, expires: ${session.expiresAt.toISOString()})`);
    await storage.deleteSession(token);
    return null;
  }

  // Update last activity
  await storage.updateSessionActivity(token);
  console.log(`[SessionService] ✅ Session valid, userId: ${session.userId}`);

  return session.userId;
}

/**
 * Destroy user session
 * @param req - Express request object
 * @param res - Express response object
 */
export async function destroySession(
  req: Request,
  res: Response
): Promise<void> {
  const token = req.session.token;
  if (token) {
    await storage.deleteSession(token);
  }

  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        reject(err);
      } else {
        res.clearCookie(config.session.cookieName);
        resolve();
      }
    });
  });
}

/**
 * Refresh session expiry
 * @param req - Express request object
 */
export async function refreshSession(req: Request): Promise<void> {
  const token = req.session.token;
  if (token) {
    await storage.updateSessionActivity(token);
  }
}

