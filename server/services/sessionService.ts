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
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + config.session.maxAge);

  // Create session in storage
  await storage.createSession(userId, token, config.session.maxAge);

  // Set session in express-session
  req.session.userId = userId;
  req.session.token = token;

  // Explicitly save the session to ensure it's persisted
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        reject(err);
      } else {
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
  const token = req.session.token;
  if (!token) {
    return null;
  }

  // Get session from storage
  const session = await storage.getSession(token);
  if (!session) {
    return null;
  }

  // Check if session expired
  if (new Date() > session.expiresAt) {
    await storage.deleteSession(token);
    return null;
  }

  // Update last activity
  await storage.updateSessionActivity(token);

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

