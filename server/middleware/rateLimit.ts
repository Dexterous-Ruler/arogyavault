/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP address
 */

import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const stores: { [key: string]: RateLimitStore } = {};

/**
 * Rate limiting middleware factory
 * @param key - Unique identifier for this rate limit
 * @param windowMs - Time window in milliseconds
 * @param max - Maximum number of requests per window
 */
export function rateLimit(key: string, windowMs: number, max: number) {
  // Initialize store for this key if it doesn't exist
  if (!stores[key]) {
    stores[key] = {};
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || req.socket.remoteAddress || "unknown";
    const storeKey = `${key}:${identifier}`;
    const store = stores[key];
    const now = Date.now();

    // Clean up expired entries
    if (store[storeKey] && store[storeKey].resetTime < now) {
      delete store[storeKey];
    }

    // Check limit
    if (!store[storeKey]) {
      store[storeKey] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    if (store[storeKey].count >= max) {
      const resetIn = Math.ceil((store[storeKey].resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please try again in ${resetIn} seconds.`,
        retryAfter: resetIn,
      });
    }

    store[storeKey].count++;
    next();
  };
}

/**
 * Cleanup expired rate limit entries (should be called periodically)
 */
export function cleanupRateLimitStores(): void {
  const now = Date.now();
  Object.keys(stores).forEach((key) => {
    const store = stores[key];
    Object.keys(store).forEach((storeKey) => {
      if (store[storeKey].resetTime < now) {
        delete store[storeKey];
      }
    });
  });
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitStores, 5 * 60 * 1000);

