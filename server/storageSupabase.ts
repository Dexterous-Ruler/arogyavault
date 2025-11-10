/**
 * Supabase Storage Implementation
 * Implements IStorage interface using Supabase as the backend
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  type User,
  type InsertUser,
  type OTPSession,
  type Session,
  type Document,
  type InsertDocument,
  type DocumentVersion,
  type InsertDocumentVersion,
  type Consent,
  type ConsentAuditLog,
} from "@shared/schema";
import { IStorage } from "./storage";
import { randomUUID } from "crypto";

export class SupabaseStorage implements IStorage {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    return this.mapUserFromDb(data);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) return undefined;
    return this.mapUserFromDb(data);
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("phone_number", phoneNumber)
      .single();

    if (error || !data) return undefined;
    return this.mapUserFromDb(data);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) return undefined;
    return this.mapUserFromDb(data);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const userData = {
      id,
      phone_number: insertUser.phoneNumber,
      username: insertUser.username ?? null,
      email: insertUser.email ?? null,
      abha_id: insertUser.abhaId ?? null,
      is_guest: insertUser.isGuest ?? false,
      password: insertUser.password ?? null,
      name: insertUser.name ?? null,
      date_of_birth: insertUser.dateOfBirth ?? null,
      gender: insertUser.gender ?? null,
      blood_group: insertUser.bloodGroup ?? null,
      address: insertUser.address ?? null,
      settings: insertUser.settings ?? null,
      onboarding_completed: insertUser.onboardingCompleted ?? false,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const { data, error } = await this.supabase
      .from("users")
      .insert(userData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return this.mapUserFromDb(data);
  }

  async createOrUpdateUser(
    phoneNumber: string,
    data?: Partial<User>
  ): Promise<User> {
    const existing = await this.getUserByPhoneNumber(phoneNumber);
    if (existing) {
      return this.updateUserProfile(existing.id, data || {});
    }

    return this.createUser({
      phoneNumber,
      ...data,
      isGuest: data?.isGuest ?? false,
    } as InsertUser);
  }

  // OTP Session methods
  async createOTPSession(
    phoneNumber: string,
    otp: string,
    expiresIn: number
  ): Promise<OTPSession> {
    // Delete existing session for this phone number
    await this.deleteOTPSession(phoneNumber);

    const id = randomUUID();
    const expiresAt = new Date(Date.now() + expiresIn);
    const otpData = {
      id,
      phone_number: phoneNumber,
      otp,
      expires_at: expiresAt.toISOString(),
      attempts: 0,
      verified: false,
      created_at: new Date().toISOString(),
      verified_at: null,
    };

    const { data, error } = await this.supabase
      .from("otp_sessions")
      .insert(otpData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create OTP session: ${error.message}`);
    return this.mapOTPSessionFromDb(data);
  }

  async getOTPSession(phoneNumber: string): Promise<OTPSession | undefined> {
    const { data, error } = await this.supabase
      .from("otp_sessions")
      .select("*")
      .eq("phone_number", phoneNumber)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error(`[Supabase] Error getting OTP session for ${phoneNumber}:`, error);
      return undefined;
    }
    
    if (!data || data.length === 0) {
      console.log(`[Supabase] No OTP session found for phone: ${phoneNumber}`);
      return undefined;
    }
    
    const session = this.mapOTPSessionFromDb(data[0]);
    console.log(`[Supabase] Found OTP session for ${phoneNumber}, OTP: ${session.otp}, Expires: ${session.expiresAt}`);
    return session;
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
    const session = await this.getOTPSession(phoneNumber);
    if (!session) return false;
    if (session.verified) return false;
    if (new Date() > session.expiresAt) return false;
    // Ensure both are strings for comparison
    return String(session.otp).trim() === String(otp).trim();
  }

  async incrementOTPAttempts(phoneNumber: string): Promise<void> {
    const session = await this.getOTPSession(phoneNumber);
    if (!session) return;

    const { error } = await this.supabase
      .from("otp_sessions")
      .update({ attempts: session.attempts + 1 })
      .eq("id", session.id);

    if (error) throw new Error(`Failed to increment OTP attempts: ${error.message}`);
  }

  async markOTPVerified(phoneNumber: string): Promise<void> {
    const session = await this.getOTPSession(phoneNumber);
    if (!session) return;

    const { error } = await this.supabase
      .from("otp_sessions")
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (error) throw new Error(`Failed to mark OTP as verified: ${error.message}`);
  }

  async deleteOTPSession(phoneNumber: string): Promise<void> {
    await this.supabase
      .from("otp_sessions")
      .delete()
      .eq("phone_number", phoneNumber);
  }

  // Session methods
  async createSession(
    userId: string,
    token: string,
    expiresIn: number
  ): Promise<Session> {
    const id = randomUUID();
    const expiresAt = new Date(Date.now() + expiresIn);
    const sessionData = {
      id,
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from("sessions")
      .insert(sessionData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create session: ${error.message}`);
    return this.mapSessionFromDb(data);
  }

  async getSession(token: string): Promise<Session | undefined> {
    const { data, error } = await this.supabase
      .from("sessions")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !data) return undefined;
    return this.mapSessionFromDb(data);
  }

  async deleteSession(token: string): Promise<void> {
    await this.supabase.from("sessions").delete().eq("token", token);
  }

  async updateSessionActivity(token: string): Promise<void> {
    const { error } = await this.supabase
      .from("sessions")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("token", token);

    if (error) throw new Error(`Failed to update session activity: ${error.message}`);
  }

  // User profile methods
  async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.dateOfBirth !== undefined)
      updateData.date_of_birth = data.dateOfBirth?.toISOString() ?? null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.bloodGroup !== undefined) updateData.blood_group = data.bloodGroup;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.onboardingCompleted !== undefined)
      updateData.onboarding_completed = data.onboardingCompleted;

    const { data: updated, error } = await this.supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user profile: ${error.message}`);
    return this.mapUserFromDb(updated);
  }

  async updateUserSettings(
    userId: string,
    settings: { language?: string; guidedMode?: boolean }
  ): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const currentSettings = user.settings ? JSON.parse(user.settings) : {};
    const updatedSettings = { ...currentSettings, ...settings };

    const { data: updated, error } = await this.supabase
      .from("users")
      .update({
        settings: JSON.stringify(updatedSettings),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user settings: ${error.message}`);
    return this.mapUserFromDb(updated);
  }

  // Document methods
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date();
    const documentData = {
      id,
      user_id: insertDocument.userId,
      title: insertDocument.title,
      type: insertDocument.type,
      provider: insertDocument.provider ?? null,
      date: insertDocument.date?.toISOString() ?? null,
      file_url: insertDocument.fileUrl,
      file_type: insertDocument.fileType ?? null,
      file_size: insertDocument.fileSize ?? null,
      tags: insertDocument.tags ?? null,
      sync_status: insertDocument.syncStatus ?? "synced",
      extracted_text: insertDocument.extractedText ?? null,
      embedding: insertDocument.embedding ?? null,
      ocr_processed: insertDocument.ocrProcessed ?? false,
      ocr_processed_at: insertDocument.ocrProcessedAt?.toISOString() ?? null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const { data, error } = await this.supabase
      .from("documents")
      .insert(documentData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create document: ${error.message}`);
    return this.mapDocumentFromDb(data);
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const { data, error } = await this.supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    return this.mapDocumentFromDb(data);
  }

  async getDocumentsByUserId(
    userId: string,
    filters?: { type?: string; search?: string }
  ): Promise<Document[]> {
    let query = this.supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId);

    if (filters?.type && filters.type !== "all") {
      query = query.eq("type", filters.type);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to get documents: ${error.message}`);
    if (!data) return [];

    let documents = data.map((d) => this.mapDocumentFromDb(d));

    // Apply search filter if provided
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      documents = documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchLower) ||
          (doc.provider && doc.provider.toLowerCase().includes(searchLower)) ||
          (doc.tags && doc.tags.toLowerCase().includes(searchLower))
      );
    }

    return documents;
  }

  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.provider !== undefined) updateData.provider = data.provider;
    if (data.date !== undefined)
      updateData.date = data.date?.toISOString() ?? null;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.syncStatus !== undefined) updateData.sync_status = data.syncStatus;
    if (data.aiInsight !== undefined) updateData.ai_insight = data.aiInsight;
    if (data.aiInsightGeneratedAt !== undefined)
      updateData.ai_insight_generated_at = data.aiInsightGeneratedAt?.toISOString() ?? null;

    const { data: updated, error } = await this.supabase
      .from("documents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update document: ${error.message}`);
    return this.mapDocumentFromDb(updated);
  }

  async deleteDocument(id: string): Promise<void> {
    // Delete versions first (cascade should handle this, but being explicit)
    await this.supabase.from("document_versions").delete().eq("document_id", id);

    const { error } = await this.supabase.from("documents").delete().eq("id", id);

    if (error) throw new Error(`Failed to delete document: ${error.message}`);
  }

  // Document version methods
  async createDocumentVersion(
    insertVersion: InsertDocumentVersion
  ): Promise<DocumentVersion> {
    const id = randomUUID();
    const versionData = {
      id,
      document_id: insertVersion.documentId,
      version: insertVersion.version,
      file_url: insertVersion.fileUrl,
      note: insertVersion.note ?? null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from("document_versions")
      .insert(versionData)
      .select()
      .single();

    if (error)
      throw new Error(`Failed to create document version: ${error.message}`);
    return this.mapDocumentVersionFromDb(data);
  }

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await this.supabase
      .from("document_versions")
      .select("*")
      .eq("document_id", documentId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to get document versions: ${error.message}`);
    if (!data) return [];

    return data.map((v) => this.mapDocumentVersionFromDb(v));
  }

  // Helper methods to map database rows to TypeScript types
  private mapUserFromDb(row: any): User {
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      username: row.username,
      email: row.email,
      abhaId: row.abha_id,
      isGuest: row.is_guest,
      password: row.password,
      name: row.name,
      dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : null,
      gender: row.gender,
      bloodGroup: row.blood_group,
      address: row.address,
      settings: row.settings,
      onboardingCompleted: row.onboarding_completed,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapOTPSessionFromDb(row: any): OTPSession {
    // Parse dates correctly - Supabase returns timestamps that need proper handling
    // If the date string doesn't have timezone info, treat it as UTC (since we store as ISO string)
    const parseDate = (dateStr: string | null): Date => {
      if (!dateStr) return new Date();
      // If it's already an ISO string with Z, use it directly
      if (dateStr.includes('Z') || dateStr.includes('+') || dateStr.includes('-', 10)) {
        return new Date(dateStr);
      }
      // If it's a timestamp without timezone, assume it's UTC (since we stored it as UTC)
      // Add 'Z' to indicate UTC
      return new Date(dateStr + 'Z');
    };
    
    const expiresAt = parseDate(row.expires_at);
    const createdAt = parseDate(row.created_at);
    const verifiedAt = row.verified_at ? parseDate(row.verified_at) : null;
    
    // Debug logging to check date parsing
    console.log(`[Supabase] Mapping OTP session - expires_at from DB: "${row.expires_at}", parsed: ${expiresAt.toISOString()}, now: ${new Date().toISOString()}, diff: ${expiresAt.getTime() - Date.now()}ms`);
    
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      otp: row.otp,
      expiresAt: expiresAt,
      attempts: row.attempts,
      verified: row.verified,
      createdAt: createdAt,
      verifiedAt: verifiedAt,
    };
  }

  private mapSessionFromDb(row: any): Session {
    return {
      id: row.id,
      userId: row.user_id,
      token: row.token,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      lastActivityAt: new Date(row.last_activity_at),
    };
  }

  private mapDocumentFromDb(row: any): Document {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      type: row.type,
      provider: row.provider,
      date: row.date ? new Date(row.date) : null,
      fileUrl: row.file_url,
      fileType: row.file_type,
      fileSize: row.file_size,
      tags: row.tags,
      syncStatus: row.sync_status,
      extractedText: row.extracted_text ?? null,
      embedding: row.embedding ?? null,
      ocrProcessed: row.ocr_processed ?? false,
      ocrProcessedAt: row.ocr_processed_at ? new Date(row.ocr_processed_at) : null,
      aiInsight: row.ai_insight ?? null,
      aiInsightGeneratedAt: row.ai_insight_generated_at ? new Date(row.ai_insight_generated_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapDocumentVersionFromDb(row: any): DocumentVersion {
    return {
      id: row.id,
      documentId: row.document_id,
      version: row.version,
      fileUrl: row.file_url,
      note: row.note,
      createdAt: new Date(row.created_at),
    };
  }

  // Consent methods
  generateShareableToken(): string {
    return randomUUID() + randomUUID().replace(/-/g, '');
  }

  async createConsent(userId: string, data: {
    recipientName: string;
    recipientRole: string;
    scopes: string[];
    durationType: '24h' | '7d' | 'custom';
    customExpiryDate?: Date;
    purpose: string;
  }): Promise<Consent> {
    const id = randomUUID();
    const now = new Date();
    
    // Calculate expiry date based on duration type
    let expiresAt: Date;
    if (data.durationType === '24h') {
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (data.durationType === '7d') {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      expiresAt = data.customExpiryDate || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    const shareableToken = this.generateShareableToken();

    const consentData = {
      id,
      user_id: userId,
      recipient_name: data.recipientName,
      recipient_role: data.recipientRole,
      scopes: JSON.stringify(data.scopes),
      duration_type: data.durationType,
      custom_expiry_date: data.customExpiryDate ? data.customExpiryDate.toISOString() : null,
      purpose: data.purpose,
      status: 'active',
      shareable_token: shareableToken,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      revoked_at: null,
    };

    const { data: inserted, error } = await this.supabase
      .from("consents")
      .insert(consentData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create consent: ${error.message}`);
    return this.mapConsentFromDb(inserted);
  }

  async getConsents(userId: string, filters?: { status?: string }): Promise<Consent[]> {
    let query = this.supabase
      .from("consents")
      .select("*")
      .eq("user_id", userId);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to get consents: ${error.message}`);
    
    const consents = (data || []).map(row => this.mapConsentFromDb(row));
    
    // Update status based on expiry
    const now = new Date();
    return consents.map(consent => {
      if (consent.status === 'active' && now > consent.expiresAt) {
        // Update status in database
        this.updateConsentStatus(consent.id, 'expired').catch(console.error);
        return { ...consent, status: 'expired' };
      }
      return consent;
    });
  }

  async getConsent(id: string): Promise<Consent | undefined> {
    const { data, error } = await this.supabase
      .from("consents")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    
    const consent = this.mapConsentFromDb(data);
    
    // Check if expired
    const now = new Date();
    if (consent.status === 'active' && now > consent.expiresAt) {
      await this.updateConsentStatus(id, 'expired');
      return { ...consent, status: 'expired' };
    }
    
    return consent;
  }

  async getConsentByToken(token: string): Promise<Consent | undefined> {
    const { data, error } = await this.supabase
      .from("consents")
      .select("*")
      .eq("shareable_token", token)
      .single();

    if (error || !data) return undefined;
    
    const consent = this.mapConsentFromDb(data);
    
    // Check if expired or revoked
    const now = new Date();
    if (consent.status === 'revoked') return consent;
    if (now > consent.expiresAt) {
      await this.updateConsentStatus(consent.id, 'expired');
      return { ...consent, status: 'expired' };
    }
    
    return consent;
  }

  async updateConsentStatus(id: string, status: 'active' | 'expired' | 'revoked'): Promise<Consent> {
    const updateData: any = {
      status,
    };
    
    if (status === 'revoked') {
      updateData.revoked_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from("consents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update consent status: ${error.message}`);
    return this.mapConsentFromDb(data);
  }

  async revokeConsent(id: string): Promise<Consent> {
    return this.updateConsentStatus(id, 'revoked');
  }

  // Consent audit log methods
  async createAuditLog(consentId: string, action: string, details: {
    userId?: string;
    actorId?: string;
    actorType?: string;
    details?: any;
  }): Promise<ConsentAuditLog> {
    const id = randomUUID();
    const now = new Date();
    
    const auditLogData = {
      id,
      consent_id: consentId,
      user_id: details.userId || null,
      action,
      actor_id: details.actorId || null,
      actor_type: details.actorType || null,
      details: details.details ? JSON.stringify(details.details) : null,
      timestamp: now.toISOString(),
    };

    const { data, error } = await this.supabase
      .from("consent_audit_logs")
      .insert(auditLogData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create audit log: ${error.message}`);
    return this.mapConsentAuditLogFromDb(data);
  }

  async getAuditLogs(consentId: string): Promise<ConsentAuditLog[]> {
    const { data, error } = await this.supabase
      .from("consent_audit_logs")
      .select("*")
      .eq("consent_id", consentId)
      .order("timestamp", { ascending: false });

    if (error) throw new Error(`Failed to get audit logs: ${error.message}`);
    return (data || []).map(row => this.mapConsentAuditLogFromDb(row));
  }

  private mapConsentFromDb(row: any): Consent {
    return {
      id: row.id,
      userId: row.user_id,
      recipientName: row.recipient_name,
      recipientRole: row.recipient_role,
      scopes: row.scopes,
      durationType: row.duration_type,
      customExpiryDate: row.custom_expiry_date ? new Date(row.custom_expiry_date) : null,
      purpose: row.purpose,
      status: row.status,
      shareableToken: row.shareable_token,
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at),
      revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
    };
  }

  private mapConsentAuditLogFromDb(row: any): ConsentAuditLog {
    return {
      id: row.id,
      consentId: row.consent_id,
      userId: row.user_id,
      action: row.action,
      actorId: row.actor_id,
      actorType: row.actor_type,
      details: row.details,
      timestamp: new Date(row.timestamp),
    };
  }
}

