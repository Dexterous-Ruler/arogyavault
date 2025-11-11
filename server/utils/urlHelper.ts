/**
 * URL Helper Utility
 * Provides centralized URL generation for the application
 * Handles environment detection and URL construction
 */

import { Request } from "express";
import { config } from "../config";

/**
 * Get the base URL for the application
 * Determines the correct base URL based on environment and configuration
 * 
 * Priority order:
 * 1. FRONTEND_URL environment variable (explicit configuration) - highest priority
 * 2. Railway public domain detection (RAILWAY_PUBLIC_DOMAIN)
 * 3. Request protocol and host (for runtime detection in production)
 * 4. Config default (from config.frontend.url)
 * 5. Production default (https://pbl-tanishq-production.up.railway.app)
 * 6. Development fallback (http://localhost:3000)
 * 
 * @param req - Optional Express request object for runtime detection
 * @returns Base URL without trailing slash
 */
export function getBaseURL(req?: Request): string {
  const isProduction = config.server.nodeEnv === "production";
  
  // Priority 1: Explicit FRONTEND_URL environment variable (highest priority)
  if (process.env.FRONTEND_URL) {
    const url = process.env.FRONTEND_URL.trim();
    // Remove trailing slash
    return url.replace(/\/$/, '');
  }
  
  // Priority 2: Railway public domain (if available)
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    const domain = process.env.RAILWAY_PUBLIC_DOMAIN.trim();
    // Ensure HTTPS for Railway domains
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    return url.replace(/\/$/, '');
  }
  
  // Priority 3: Runtime detection from request (for production)
  // This allows dynamic URL detection based on the actual request
  if (req && isProduction) {
    const host = req.get('host');
    if (host) {
      // In production behind proxy, ensure HTTPS
      const forwardedProto = req.get('X-Forwarded-Proto');
      const isSecure = req.secure || forwardedProto === 'https';
      const protocol = isSecure ? 'https' : 'http';
      return `${protocol}://${host}`.replace(/\/$/, '');
    }
  }
  
  // Priority 4: Use config default (from config.frontend.url)
  // This provides a sensible default based on environment
  if (config.frontend.url) {
    return config.frontend.url.replace(/\/$/, '');
  }
  
  // Priority 5: Production default fallback (Railway deployment)
  if (isProduction) {
    return 'https://pbl-tanishq-production.up.railway.app';
  }
  
  // Priority 6: Development fallback
  const port = config.server.port || process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

/**
 * Generate a full URL for a given path
 * 
 * @param path - Path to append to base URL (should start with /)
 * @param req - Optional Express request object for runtime detection
 * @returns Full URL
 */
export function getFullURL(path: string, req?: Request): string {
  const baseUrl = getBaseURL(req);
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

