/**
 * Consents Hooks
 * React Query hooks for consent operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  createConsent,
  getConsents,
  getConsent,
  revokeConsent,
  getAuditLogs,
  getSharedConsent,
  getQRCode,
  getSharedDocuments,
  type CreateConsentData,
  type ConsentStatus,
} from "@/lib/api/consents";

/**
 * Hook to fetch all consents
 */
export function useConsents(status?: ConsentStatus) {
  return useQuery({
    queryKey: ["consents", status],
    queryFn: () => getConsents(status),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a specific consent
 */
export function useConsent(id: string | null) {
  return useQuery({
    queryKey: ["consents", id],
    queryFn: () => getConsent(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a consent
 */
export function useCreateConsent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConsentData) => createConsent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consents"] });
      toast({
        title: "Success",
        description: "Consent granted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create consent",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to revoke a consent
 */
export function useRevokeConsent() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revokeConsent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consents"] });
      toast({
        title: "Success",
        description: "Consent revoked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke consent",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to fetch audit logs for a consent
 */
export function useAuditLogs(consentId: string | null) {
  return useQuery({
    queryKey: ["consents", consentId, "audit"],
    queryFn: () => getAuditLogs(consentId!),
    enabled: !!consentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch shared consent by token (public)
 */
export function useSharedConsent(token: string | null) {
  return useQuery({
    queryKey: ["shared-consent", token],
    queryFn: () => getSharedConsent(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch QR code for a consent
 */
export function useQRCode(consentId: string | null) {
  return useQuery({
    queryKey: ["consents", consentId, "qr"],
    queryFn: () => getQRCode(consentId!),
    enabled: !!consentId,
    staleTime: 10 * 60 * 1000, // 10 minutes (QR codes don't change)
  });
}

/**
 * Hook to fetch shared documents by token (public)
 */
export function useSharedDocuments(token: string | null) {
  return useQuery({
    queryKey: ["shared-documents", token],
    queryFn: () => getSharedDocuments(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

