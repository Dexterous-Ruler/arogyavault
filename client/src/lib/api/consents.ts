/**
 * Consents API Client
 * Functions for making consent API calls
 */

import { apiRequest } from "../queryClient";

export type ConsentStatus = "active" | "pending" | "expired" | "revoked";
export type ConsentRole = "doctor" | "lab" | "insurance" | "family" | "other";
export type ConsentScope = "documents" | "emergency" | "insights" | "timeline";
export type DurationType = "24h" | "7d" | "custom";

export interface Consent {
  id: string;
  userId: string;
  recipientName: string;
  recipientRole: ConsentRole;
  scopes: string; // JSON string, needs parsing
  durationType: DurationType;
  customExpiryDate?: Date | null;
  purpose: string;
  status: ConsentStatus;
  shareableToken: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date | null;
}

export interface ConsentAuditLog {
  id: string;
  consentId: string;
  userId?: string | null;
  action: string;
  actorId?: string | null;
  actorType?: string | null;
  details?: string | null;
  timestamp: Date;
}

export interface CreateConsentData {
  recipientName: string;
  recipientRole: ConsentRole;
  scopes: ConsentScope[];
  durationType: DurationType;
  customExpiryDate?: string; // ISO date string
  purpose: string;
}

export interface ConsentResponse {
  success: boolean;
  consent: Consent;
}

export interface ConsentsResponse {
  success: boolean;
  consents: Consent[];
}

export interface AuditLogsResponse {
  success: boolean;
  logs: ConsentAuditLog[];
}

export interface QRCodeResponse {
  success: boolean;
  qrCode: string; // Data URL
  shareableUrl: string;
}

/**
 * Create a new consent
 */
export async function createConsent(data: CreateConsentData): Promise<ConsentResponse> {
  const res = await apiRequest("POST", "/api/consents", data);
  return res.json();
}

/**
 * Get all consents for the current user
 */
export async function getConsents(status?: ConsentStatus): Promise<ConsentsResponse> {
  const url = status ? `/api/consents?status=${status}` : "/api/consents";
  const res = await apiRequest("GET", url, undefined);
  return res.json();
}

/**
 * Get a specific consent by ID
 */
export async function getConsent(id: string): Promise<ConsentResponse> {
  const res = await apiRequest("GET", `/api/consents/${id}`, undefined);
  return res.json();
}

/**
 * Revoke a consent
 */
export async function revokeConsent(id: string): Promise<ConsentResponse> {
  const res = await apiRequest("DELETE", `/api/consents/${id}`, undefined);
  return res.json();
}

/**
 * Get audit logs for a consent
 */
export async function getAuditLogs(consentId: string): Promise<AuditLogsResponse> {
  const res = await apiRequest("GET", `/api/consents/${consentId}/audit`, undefined);
  return res.json();
}

/**
 * Get shared consent by token (public endpoint)
 */
export async function getSharedConsent(token: string): Promise<ConsentResponse> {
  const res = await apiRequest("GET", `/api/consents/share/${token}`, undefined);
  return res.json();
}

/**
 * Get QR code for a consent
 */
export async function getQRCode(consentId: string): Promise<QRCodeResponse> {
  const res = await apiRequest("GET", `/api/consents/${consentId}/qr`, undefined);
  return res.json();
}

/**
 * Get documents for a shared consent (public endpoint)
 */
export async function getSharedDocuments(token: string): Promise<{ success: boolean; documents: any[] }> {
  const res = await apiRequest("GET", `/api/consents/share/${token}/documents`, undefined);
  return res.json();
}

