/**
 * Authentication Middleware
 * Protects routes that require authentication
 */

import { Request, Response, NextFunction } from "express";
import { getSessionUser } from "../services/sessionService";

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = await getSessionUser(req);

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  req.userId = userId;
  next();
}

/**
 * Middleware for optional authentication
 * Sets req.userId if authenticated, but doesn't require it
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = await getSessionUser(req);
  req.userId = userId || undefined;
  next();
}

