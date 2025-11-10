/**
 * Authentication React Query Hooks
 * Hooks for managing authentication state and API calls
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { requestOTP, verifyOTP, resendOTP, getAuthStatus, logout, requestEmailOTP, verifyEmailOTP, resendEmailOTP } from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to request OTP
 */
export function useRequestOTP() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: requestOTP,
    onSuccess: (data) => {
      toast({
        title: "OTP Sent",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to verify OTP
 */
export function useVerifyOTP() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) =>
      verifyOTP(phoneNumber, otp),
    onSuccess: async (data) => {
      if (data.success && data.token) {
        // Store token in localStorage for reference (session is in cookie)
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }

        // Invalidate queries to refresh user data
        queryClient.invalidateQueries({ queryKey: ["auth", "status"] });

        toast({
          title: "Success",
          description: "OTP verified successfully",
        });

        // Fetch user profile to check onboarding status
        const authStatus = await getAuthStatus();
        if (authStatus.authenticated && authStatus.user?.onboardingCompleted) {
          // User has completed onboarding, go to home
          setLocation("/home");
        } else {
          // User hasn't completed onboarding, go to onboarding
          setLocation("/onboarding");
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to resend OTP
 */
export function useResendOTP() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: resendOTP,
    onSuccess: (data) => {
      toast({
        title: "OTP Resent",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to check authentication status
 */
export function useAuthStatus() {
  return useQuery({
    queryKey: ["auth", "status"],
    queryFn: getAuthStatus,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to logout
 */
export function useLogout() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear local storage
      localStorage.removeItem("auth_token");

      // Invalidate all queries
      queryClient.clear();

      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });

      // Navigate to auth page
      setLocation("/auth");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to request email OTP
 */
export function useRequestEmailOTP() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: requestEmailOTP,
    onSuccess: (data) => {
      toast({
        title: "OTP Sent",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to verify email OTP
 */
export function useVerifyEmailOTP() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      verifyEmailOTP(email, otp),
    onSuccess: async (data) => {
      if (data.success && data.token) {
        // Store token in localStorage for reference (session is in cookie)
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }

        // Invalidate queries to refresh user data
        queryClient.invalidateQueries({ queryKey: ["auth", "status"] });

        toast({
          title: "Success",
          description: "Email verified successfully",
        });

        // Fetch user profile to check onboarding status
        const authStatus = await getAuthStatus();
        if (authStatus.authenticated && authStatus.user?.onboardingCompleted) {
          // User has completed onboarding, go to home
          setLocation("/home");
        } else {
          // User hasn't completed onboarding, go to onboarding
          setLocation("/onboarding");
        }
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to resend email OTP
 */
export function useResendEmailOTP() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: resendEmailOTP,
    onSuccess: (data) => {
      toast({
        title: "OTP Resent",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

