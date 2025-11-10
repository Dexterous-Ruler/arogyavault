/**
 * Documents API Client
 * Functions for making document API calls
 */

import { apiRequest } from "../queryClient";

export type DocumentType = "prescription" | "lab" | "imaging" | "billing";

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  provider?: string | null;
  date?: Date | null;
  fileType?: string | null;
  fileSize?: number | null;
  tags: string[];
  syncStatus: "synced" | "pending";
  extractedText?: string | null;
  embedding?: string | null;
  ocrProcessed?: boolean;
  ocrProcessedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentDetail extends Document {
  fileUrl: string;
  versions: Array<{
    id: string;
    version: string;
    note?: string | null;
    createdAt: Date;
  }>;
}

export interface CreateDocumentData {
  title: string;
  type: DocumentType;
  provider?: string;
  date?: string; // ISO date string
  tags?: string[];
  fileUrl?: string; // For now, we'll handle file upload separately
  fileType?: string;
  fileSize?: number;
}

export interface UpdateDocumentData {
  title?: string;
  provider?: string;
  date?: string; // ISO date string
  tags?: string[];
}

export interface DocumentsResponse {
  success: boolean;
  documents: Document[];
  total: number;
}

export interface DocumentResponse {
  success: boolean;
  document: DocumentDetail;
}

/**
 * Get all documents for current user
 */
export async function getDocuments(filters?: {
  type?: string;
  search?: string;
}): Promise<DocumentsResponse> {
  const params = new URLSearchParams();
  if (filters?.type) params.append("type", filters.type);
  if (filters?.search) params.append("search", filters.search);

  const query = params.toString();
  const url = `/api/documents${query ? `?${query}` : ""}`;
  const res = await apiRequest("GET", url, undefined);
  return res.json();
}

/**
 * Get a specific document
 */
export async function getDocument(id: string): Promise<DocumentResponse> {
  const res = await apiRequest("GET", `/api/documents/${id}`, undefined);
  return res.json();
}

/**
 * Create a new document (with optional file upload)
 */
export async function createDocument(
  data: CreateDocumentData,
  file?: File
): Promise<{ success: boolean; message: string; document: Document }> {
  if (file) {
    // Use FormData for file upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", data.title);
    formData.append("type", data.type);
    if (data.provider) formData.append("provider", data.provider);
    if (data.date) formData.append("date", data.date);
    if (data.tags) formData.append("tags", JSON.stringify(data.tags));
    if (data.fileType) formData.append("fileType", data.fileType);
    if (data.fileSize) formData.append("fileSize", data.fileSize.toString());
    
    const res = await fetch("/api/documents", {
      method: "POST",
      body: formData,
      credentials: "include", // Include cookies for authentication
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create document");
    }
    
    return res.json();
  } else {
    // Use JSON for data without file
    const res = await apiRequest("POST", "/api/documents", data);
    return res.json();
  }
}

/**
 * Update a document
 */
export async function updateDocument(
  id: string,
  data: UpdateDocumentData
): Promise<{ success: boolean; message: string; document: Partial<Document> }> {
  const res = await apiRequest("PUT", `/api/documents/${id}`, data);
  return res.json();
}

/**
 * Delete a document
 */
export async function deleteDocument(
  id: string
): Promise<{ success: boolean; message: string }> {
  const res = await apiRequest("DELETE", `/api/documents/${id}`, undefined);
  return res.json();
}

/**
 * Get document file URL
 */
export async function getDocumentFile(
  id: string
): Promise<{ success: boolean; fileUrl: string; fileType?: string; expiresIn?: number }> {
  const res = await apiRequest("GET", `/api/documents/${id}/file`, undefined);
  return res.json();
}

/**
 * Get document preview/thumbnail URL
 */
export async function getDocumentPreview(
  id: string
): Promise<{ success: boolean; previewUrl: string; fileType?: string; expiresIn?: number }> {
  const res = await apiRequest("GET", `/api/documents/${id}/preview`, undefined);
  return res.json();
}

