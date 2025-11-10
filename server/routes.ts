import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import documentRoutes from "./routes/documents";
import translationRoutes from "./routes/translations";
import healthRoutes from "./routes/health";
import consentRoutes from "./routes/consents";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register API routes
  // All routes are prefixed with /api

  // Authentication routes
  app.use("/api/auth", authRoutes);

  // User profile routes
  app.use("/api/user", userRoutes);

  // Document routes
  app.use("/api/documents", documentRoutes);

  // Health insights routes
  app.use("/api/health", healthRoutes);

  // Consent routes
  app.use("/api/consents", consentRoutes);

  // Translation routes (public, no auth required)
  app.use("/api/translations", translationRoutes);

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
