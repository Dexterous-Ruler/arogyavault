// Load environment variables first
import "dotenv/config";

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config } from "./config";
import { reminderScheduler } from "./services/reminderScheduler";
import * as path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Session middleware
// Railway uses a proxy, so we need to trust the proxy for secure cookies
// Check if we're behind a proxy (Railway sets this)
const isProduction = process.env.NODE_ENV === "production";
const trustProxy = process.env.TRUST_PROXY !== "false"; // Default to true in production

if (trustProxy) {
  app.set("trust proxy", 1); // Trust first proxy (Railway's load balancer)
}

app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    name: config.session.cookieName,
    cookie: {
      // In production with Railway, secure should be true because Railway provides HTTPS
      // We trust the proxy (set above) so Railway's load balancer can forward the request correctly
      secure: isProduction, // true in production (HTTPS), false in development (HTTP)
      httpOnly: true,
      maxAge: config.session.maxAge,
      // Use "lax" for same-site requests (frontend and backend on same domain)
      // Railway serves everything from the same domain, so "lax" works
      sameSite: "lax",
      // Don't set domain - let browser use current domain (works for Railway)
      // Don't set path - use default "/"
    },
    // Force save even if session wasn't modified
    rolling: true,
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
      
      // Log cookie information for auth endpoints
      if (path.includes("/auth")) {
        const setCookieHeader = res.getHeader('Set-Cookie');
        log(`[Cookie Debug] ${path} - Set-Cookie: ${setCookieHeader ? 'present' : 'missing'}`);
        if (setCookieHeader) {
          const cookieValue = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
          log(`[Cookie Debug] ${path} - Cookie: ${cookieValue?.substring(0, 100)}...`);
        }
        log(`[Cookie Debug] ${path} - Request cookies: ${req.headers.cookie || 'none'}`);
      }
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handler (must be last)
  const { errorHandler } = await import("./middleware/errorHandler");
  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    
    // Start reminder scheduler
    reminderScheduler.start();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully...');
    reminderScheduler.stop();
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    log('SIGINT received, shutting down gracefully...');
    reminderScheduler.stop();
    server.close(() => {
      log('Server closed');
      process.exit(0);
    });
  });
})();
