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
  type InsertConsent,
  type ConsentAuditLog,
  type InsertConsentAuditLog,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { SupabaseStorage } from "./storageSupabase";

// Storage interface for all data operations
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createOrUpdateUser(phoneNumber: string, data?: Partial<User>): Promise<User>;

  // OTP Session methods
  createOTPSession(
    phoneNumber: string,
    otp: string,
    expiresIn: number
  ): Promise<OTPSession>;
  getOTPSession(phoneNumber: string): Promise<OTPSession | undefined>;
  verifyOTP(phoneNumber: string, otp: string): Promise<boolean>;
  incrementOTPAttempts(phoneNumber: string): Promise<void>;
  markOTPVerified(phoneNumber: string): Promise<void>;
  deleteOTPSession(phoneNumber: string): Promise<void>;

  // Session methods
  createSession(
    userId: string,
    token: string,
    expiresIn: number
  ): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  updateSessionActivity(token: string): Promise<void>;

  // User profile methods
  updateUserProfile(userId: string, data: Partial<User>): Promise<User>;
  updateUserSettings(userId: string, settings: { language?: string; guidedMode?: boolean }): Promise<User>;

  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsByUserId(userId: string, filters?: { type?: string; search?: string }): Promise<Document[]>;
  updateDocument(id: string, data: Partial<Document>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  
  // Document version methods
  createDocumentVersion(version: InsertDocumentVersion): Promise<DocumentVersion>;
  getDocumentVersions(documentId: string): Promise<DocumentVersion[]>;
  
  // Consent methods
  createConsent(userId: string, data: {
    recipientName: string;
    recipientRole: string;
    scopes: string[];
    durationType: '24h' | '7d' | 'custom';
    customExpiryDate?: Date;
    purpose: string;
  }): Promise<Consent>;
  getConsents(userId: string, filters?: { status?: string }): Promise<Consent[]>;
  getConsent(id: string): Promise<Consent | undefined>;
  getConsentByToken(token: string): Promise<Consent | undefined>;
  updateConsentStatus(id: string, status: 'active' | 'expired' | 'revoked'): Promise<Consent>;
  revokeConsent(id: string): Promise<Consent>;
  generateShareableToken(): string;
  
  // Consent audit log methods
  createAuditLog(consentId: string, action: string, details: {
    userId?: string;
    actorId?: string;
    actorType?: string;
    details?: any;
  }): Promise<ConsentAuditLog>;
  getAuditLogs(consentId: string): Promise<ConsentAuditLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private otpSessions: Map<string, OTPSession>;
  private sessions: Map<string, Session>;
  private documents: Map<string, Document>;
  private documentVersions: Map<string, DocumentVersion>;
  private consents: Map<string, Consent>;
  private consentAuditLogs: Map<string, ConsentAuditLog>;

  constructor() {
    this.users = new Map();
    this.otpSessions = new Map();
    this.sessions = new Map();
    this.documents = new Map();
    this.documentVersions = new Map();
    this.consents = new Map();
    this.consentAuditLogs = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phoneNumber === phoneNumber,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      id,
      phoneNumber: insertUser.phoneNumber,
      username: insertUser.username ?? null,
      email: insertUser.email ?? null,
      abhaId: insertUser.abhaId ?? null,
      password: insertUser.password ?? null,
      isGuest: insertUser.isGuest ?? false,
      name: insertUser.name ?? null,
      dateOfBirth: insertUser.dateOfBirth ?? null,
      gender: insertUser.gender ?? null,
      bloodGroup: insertUser.bloodGroup ?? null,
      address: insertUser.address ?? null,
      settings: insertUser.settings ?? null,
      onboardingCompleted: insertUser.onboardingCompleted ?? false,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async createOrUpdateUser(
    phoneNumber: string,
    data?: Partial<User>
  ): Promise<User> {
    const existing = await this.getUserByPhoneNumber(phoneNumber);
    if (existing) {
      const updated: User = {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
      this.users.set(existing.id, updated);
      return updated;
    }

    return this.createUser({
      phoneNumber,
      ...data,
      isGuest: data?.isGuest ?? false,
    });
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
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresIn);

    const session: OTPSession = {
      id,
      phoneNumber,
      otp,
      expiresAt,
      attempts: 0,
      verified: false,
      createdAt: now,
      verifiedAt: null,
    };

    this.otpSessions.set(phoneNumber, session);
    return session;
  }

  async getOTPSession(phoneNumber: string): Promise<OTPSession | undefined> {
    return this.otpSessions.get(phoneNumber);
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
    const session = await this.getOTPSession(phoneNumber);
    if (!session) return false;

    // Check if expired
    if (new Date() > session.expiresAt) {
      await this.deleteOTPSession(phoneNumber);
      return false;
    }

    // Check if already verified
    if (session.verified) return false;

    // Check if max attempts exceeded
    if (session.attempts >= 5) {
      await this.deleteOTPSession(phoneNumber);
      return false;
    }

    // Increment attempts
    await this.incrementOTPAttempts(phoneNumber);

    // Verify OTP
    if (session.otp === otp) {
      await this.markOTPVerified(phoneNumber);
      return true;
    }

    return false;
  }

  async incrementOTPAttempts(phoneNumber: string): Promise<void> {
    const session = await this.getOTPSession(phoneNumber);
    if (session) {
      const updated: OTPSession = {
        ...session,
        attempts: session.attempts + 1,
      };
      this.otpSessions.set(phoneNumber, updated);
    }
  }

  async markOTPVerified(phoneNumber: string): Promise<void> {
    const session = await this.getOTPSession(phoneNumber);
    if (session) {
      const updated: OTPSession = {
        ...session,
        verified: true,
        verifiedAt: new Date(),
      };
      this.otpSessions.set(phoneNumber, updated);
    }
  }

  async deleteOTPSession(phoneNumber: string): Promise<void> {
    this.otpSessions.delete(phoneNumber);
  }

  // Session methods
  async createSession(
    userId: string,
    token: string,
    expiresIn: number
  ): Promise<Session> {
    const id = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresIn);

    const session: Session = {
      id,
      userId,
      token,
      expiresAt,
      createdAt: now,
      lastActivityAt: now,
    };

    this.sessions.set(token, session);
    return session;
  }

  async getSession(token: string): Promise<Session | undefined> {
    return this.sessions.get(token);
  }

  async deleteSession(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  async updateSessionActivity(token: string): Promise<void> {
    const session = await this.getSession(token);
    if (session) {
      const updated: Session = {
        ...session,
        lastActivityAt: new Date(),
      };
      this.sessions.set(token, updated);
    }
  }

  // User profile methods
  async updateUserProfile(userId: string, data: Partial<User>): Promise<User> {
    if (!userId) {
      throw new Error("User ID is required");
    }
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    const updated: User = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    this.users.set(userId, updated);
    return updated;
  }

  async updateUserSettings(
    userId: string,
    settings: { language?: string; guidedMode?: boolean }
  ): Promise<User> {
    if (!userId) {
      throw new Error("User ID is required");
    }
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }
    const currentSettings = user.settings ? JSON.parse(user.settings) : {};
    const updatedSettings = { ...currentSettings, ...settings };
    const updated: User = {
      ...user,
      settings: JSON.stringify(updatedSettings),
      updatedAt: new Date(),
    };
    this.users.set(userId, updated);
    return updated;
  }

  // Document methods
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date();
    const document: Document = {
      id,
      userId: insertDocument.userId,
      title: insertDocument.title,
      type: insertDocument.type,
      provider: insertDocument.provider ?? null,
      date: insertDocument.date ?? null,
      fileUrl: insertDocument.fileUrl,
      fileType: insertDocument.fileType ?? null,
      fileSize: insertDocument.fileSize ?? null,
      tags: insertDocument.tags ?? null,
      syncStatus: insertDocument.syncStatus ?? "synced",
      extractedText: insertDocument.extractedText ?? null,
      embedding: insertDocument.embedding ?? null,
      ocrProcessed: insertDocument.ocrProcessed ?? false,
      ocrProcessedAt: insertDocument.ocrProcessedAt ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByUserId(
    userId: string,
    filters?: { type?: string; search?: string }
  ): Promise<Document[]> {
    let docs = Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId
    );

    if (filters?.type && filters.type !== "all") {
      docs = docs.filter((doc) => doc.type === filters.type);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      docs = docs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchLower) ||
          (doc.provider && doc.provider.toLowerCase().includes(searchLower)) ||
          (doc.tags && doc.tags.toLowerCase().includes(searchLower))
      );
    }

    // Sort by date (newest first)
    return docs.sort((a, b) => {
      const dateA = a.date || a.createdAt;
      const dateB = b.date || b.createdAt;
      return dateB.getTime() - dateA.getTime();
    });
  }

  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    const document = await this.getDocument(id);
    if (!document) {
      throw new Error("Document not found");
    }
    const updated: Document = {
      ...document,
      ...data,
      updatedAt: new Date(),
    };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<void> {
    // Also delete all versions
    const versions = await this.getDocumentVersions(id);
    versions.forEach((version) => {
      this.documentVersions.delete(version.id);
    });
    this.documents.delete(id);
  }

  // Document version methods
  async createDocumentVersion(
    insertVersion: InsertDocumentVersion
  ): Promise<DocumentVersion> {
    const id = randomUUID();
    const now = new Date();
    const version: DocumentVersion = {
      id,
      documentId: insertVersion.documentId,
      version: insertVersion.version,
      fileUrl: insertVersion.fileUrl,
      note: insertVersion.note ?? null,
      createdAt: now,
    };
    this.documentVersions.set(id, version);
    return version;
  }

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    return Array.from(this.documentVersions.values())
      .filter((v) => v.documentId === documentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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

    const consent: Consent = {
      id,
      userId,
      recipientName: data.recipientName,
      recipientRole: data.recipientRole,
      scopes: JSON.stringify(data.scopes),
      durationType: data.durationType,
      customExpiryDate: data.customExpiryDate || null,
      purpose: data.purpose,
      status: 'active',
      shareableToken,
      createdAt: now,
      expiresAt,
      revokedAt: null,
    };

    this.consents.set(id, consent);
    return consent;
  }

  async getConsents(userId: string, filters?: { status?: string }): Promise<Consent[]> {
    let consents = Array.from(this.consents.values()).filter(
      (consent) => consent.userId === userId
    );

    // Update status based on expiry
    const now = new Date();
    consents = consents.map(consent => {
      if (consent.status === 'active' && now > consent.expiresAt) {
        return { ...consent, status: 'expired' };
      }
      return consent;
    });

    if (filters?.status) {
      consents = consents.filter((consent) => consent.status === filters.status);
    }

    return consents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getConsent(id: string): Promise<Consent | undefined> {
    const consent = this.consents.get(id);
    if (!consent) return undefined;
    
    // Check if expired
    const now = new Date();
    if (consent.status === 'active' && now > consent.expiresAt) {
      const updated = { ...consent, status: 'expired' };
      this.consents.set(id, updated);
      return updated;
    }
    
    return consent;
  }

  async getConsentByToken(token: string): Promise<Consent | undefined> {
    const consent = Array.from(this.consents.values()).find(
      (c) => c.shareableToken === token
    );
    
    if (!consent) return undefined;
    
    // Check if expired or revoked
    const now = new Date();
    if (consent.status === 'revoked') return consent;
    if (now > consent.expiresAt) {
      const updated = { ...consent, status: 'expired' };
      this.consents.set(consent.id, updated);
      return updated;
    }
    
    return consent;
  }

  async updateConsentStatus(id: string, status: 'active' | 'expired' | 'revoked'): Promise<Consent> {
    const consent = await this.getConsent(id);
    if (!consent) {
      throw new Error('Consent not found');
    }
    
    const updated: Consent = {
      ...consent,
      status,
      revokedAt: status === 'revoked' ? new Date() : consent.revokedAt,
    };
    
    this.consents.set(id, updated);
    return updated;
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
    
    const auditLog: ConsentAuditLog = {
      id,
      consentId,
      userId: details.userId || null,
      action,
      actorId: details.actorId || null,
      actorType: details.actorType || null,
      details: details.details ? JSON.stringify(details.details) : null,
      timestamp: now,
    };
    
    this.consentAuditLogs.set(id, auditLog);
    return auditLog;
  }

  async getAuditLogs(consentId: string): Promise<ConsentAuditLog[]> {
    return Array.from(this.consentAuditLogs.values())
      .filter((log) => log.consentId === consentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

// Export storage instance - use Supabase if configured, otherwise fallback to MemStorage
const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key for server-side operations to bypass RLS
// This is safe because we're on the server and validate all operations
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export const storage: IStorage = supabaseUrl && supabaseKey
  ? new SupabaseStorage(supabaseUrl, supabaseKey)
  : new MemStorage();
