import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - Extended for OTP-based authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull().unique(),
  username: text("username"),
  email: text("email"),
  abhaId: text("abha_id"),
  isGuest: boolean("is_guest").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Keep password for backward compatibility (optional for OTP users)
  password: text("password"),
  // Profile fields
  name: text("name"),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"), // 'male' | 'female' | 'other'
  bloodGroup: text("blood_group"), // 'A+', 'B+', 'O+', etc.
  address: text("address"),
  // Settings (stored as JSON for flexibility)
  settings: text("settings"), // JSON string: { language: 'en' | 'hi', guidedMode: boolean }
  // Onboarding completion
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
});

// OTP Sessions table - For OTP verification
export const otpSessions = pgTable("otp_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: text("phone_number").notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
});

// Sessions table - For user authentication sessions
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
});

// Documents table - For storing medical documents
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'prescription' | 'lab' | 'imaging' | 'billing'
  provider: text("provider"), // Hospital/Doctor name
  date: timestamp("date"), // Document date
  fileUrl: text("file_url").notNull(), // Path to stored file
  fileType: text("file_type"), // 'PDF' | 'JPG' | 'PNG' | 'DICOM'
  fileSize: integer("file_size"), // Size in bytes
  tags: text("tags"), // JSON array of tags
  syncStatus: varchar("sync_status", { length: 20 }).default("synced").notNull(), // 'synced' | 'pending'
  extractedText: text("extracted_text"), // OCR-extracted text from document
  embedding: text("embedding"), // OpenAI embedding stored as JSON array
  ocrProcessed: boolean("ocr_processed").default(false).notNull(), // Whether OCR has been processed
  ocrProcessedAt: timestamp("ocr_processed_at"), // Timestamp when OCR was processed
  aiInsight: text("ai_insight"), // Cached AI insight stored as JSON string
  aiInsightGeneratedAt: timestamp("ai_insight_generated_at"), // Timestamp when AI insight was generated
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Document versions table - For version history
export const documentVersions = pgTable("document_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  version: varchar("version", { length: 20 }).notNull(), // 'v1.0', 'v1.1', etc.
  fileUrl: text("file_url").notNull(),
  note: text("note"), // Version note
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Consents table - For managing document sharing and access permissions
export const consents = pgTable("consents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  recipientName: text("recipient_name").notNull(),
  recipientRole: varchar("recipient_role", { length: 50 }).notNull(), // 'doctor' | 'lab' | 'insurance' | 'family' | 'other'
  scopes: text("scopes").notNull(), // JSON array: ['documents', 'emergency', 'insights', 'timeline']
  durationType: varchar("duration_type", { length: 20 }).notNull(), // '24h' | '7d' | 'custom'
  customExpiryDate: timestamp("custom_expiry_date"), // Only used when durationType is 'custom'
  purpose: text("purpose").notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(), // 'active' | 'expired' | 'revoked'
  shareableToken: text("shareable_token").notNull().unique(), // Unique token for shareable link
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
});

// Consent audit logs table - For tracking all consent-related activities
export const consentAuditLogs = pgTable("consent_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consentId: varchar("consent_id").references(() => consents.id).notNull(),
  userId: varchar("user_id").references(() => users.id), // User who performed the action
  action: varchar("action", { length: 50 }).notNull(), // 'grant' | 'revoke' | 'view' | 'access'
  actorId: text("actor_id"), // ID of the person/entity who accessed (for access logs)
  actorType: varchar("actor_type", { length: 50 }), // 'user' | 'recipient' | 'system'
  details: text("details"), // JSON object with additional details
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).pick({
  phoneNumber: true,
  username: true,
  email: true,
  abhaId: true,
  isGuest: true,
  password: true,
  name: true,
  dateOfBirth: true,
  gender: true,
  bloodGroup: true,
  address: true,
  settings: true,
  onboardingCompleted: true,
});

export const insertOTPSessionSchema = createInsertSchema(otpSessions).pick({
  phoneNumber: true,
  otp: true,
  expiresAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  token: true,
  expiresAt: true,
});

// Document schema validation
export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  title: true,
  type: true,
  provider: true,
  date: true,
  fileUrl: true,
  fileType: true,
  fileSize: true,
  tags: true,
  syncStatus: true,
  extractedText: true,
  embedding: true,
  ocrProcessed: true,
  ocrProcessedAt: true,
  aiInsight: true,
  aiInsightGeneratedAt: true,
});

export const insertDocumentVersionSchema = createInsertSchema(documentVersions).pick({
  documentId: true,
  version: true,
  fileUrl: true,
  note: true,
});

// Consent schema validation
export const insertConsentSchema = createInsertSchema(consents).pick({
  userId: true,
  recipientName: true,
  recipientRole: true,
  scopes: true,
  durationType: true,
  customExpiryDate: true,
  purpose: true,
  status: true,
  shareableToken: true,
  expiresAt: true,
  revokedAt: true,
});

export const insertConsentAuditLogSchema = createInsertSchema(consentAuditLogs).pick({
  consentId: true,
  userId: true,
  action: true,
  actorId: true,
  actorType: true,
  details: true,
  timestamp: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type OTPSession = typeof otpSessions.$inferSelect;
export type InsertOTPSession = z.infer<typeof insertOTPSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DocumentVersion = typeof documentVersions.$inferSelect;
export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;
export type Consent = typeof consents.$inferSelect;
export type InsertConsent = z.infer<typeof insertConsentSchema>;
export type ConsentAuditLog = typeof consentAuditLogs.$inferSelect;
export type InsertConsentAuditLog = z.infer<typeof insertConsentAuditLogSchema>;
