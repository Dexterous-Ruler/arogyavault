/**
 * Health Insights Hooks
 * React Query hooks for health insights
 */

import { useQuery } from "@tanstack/react-query";
import { getDocumentInsights, getHealthInsights, type DocumentInsight, type HealthInsight } from "@/lib/api/health";

/**
 * Hook to fetch AI insights for a specific document
 */
export function useDocumentInsights(documentId: string | null) {
  return useQuery({
    queryKey: ["document-insights", documentId],
    queryFn: () => getDocumentInsights(documentId!),
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch overall health summary
 */
export function useHealthInsights() {
  return useQuery({
    queryKey: ["health-insights"],
    queryFn: getHealthInsights,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

