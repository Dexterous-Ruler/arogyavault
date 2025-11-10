/**
 * Health Insights API Client
 * Functions for fetching AI-powered health insights
 */

import { apiRequest } from "../queryClient";

export interface DocumentInsight {
  status: "normal" | "warning" | "critical" | "none";
  summary: string;
  hasFullAnalysis: boolean;
}

export interface HealthInsight {
  status: "good" | "warning" | "critical";
  message: string;
}

export interface DocumentInsightResponse {
  success: boolean;
  insight: DocumentInsight;
}

export interface HealthInsightResponse {
  success: boolean;
  insight: HealthInsight;
}

/**
 * Get AI insights for a specific document
 */
export async function getDocumentInsights(documentId: string): Promise<DocumentInsightResponse> {
  const res = await apiRequest("GET", `/api/documents/${documentId}/insights`, undefined);
  return res.json();
}

/**
 * Get overall health summary based on all user documents
 */
export async function getHealthInsights(): Promise<HealthInsightResponse> {
  const res = await apiRequest("GET", "/api/health/insights", undefined);
  return res.json();
}

