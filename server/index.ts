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
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    name: config.session.cookieName,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: config.session.maxAge,
      sameSite: "lax",
      // Don't set domain - let browser use current domain (works for Railway)
      // Don't set path - use default "/"
    },
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
