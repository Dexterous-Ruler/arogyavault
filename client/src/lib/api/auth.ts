/**
 * Authentication API Client
 * Functions for making authentication API calls
 */

import { apiRequest } from "../queryClient";

export interface RequestOTPResponse {
  success: boolean;
  message: string;
  otp?: string; // Only in development
  devMode?: boolean;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    phoneNumber: string;
    isGuest: boolean;
  };
}

export interface AuthStatusResponse {
  authenticated: boolean;
  message?: string;
  user?: {
    id: string;
    phoneNumber: string;
    isGuest: boolean;
    onboardingCompleted?: boolean;
  };
}

/**
 * Request OTP for phone number
 */
export async function requestOTP(phoneNumber: string): Promise<RequestOTPResponse> {
  const res = await apiRequest("POST", "/api/auth/otp/request", {
    phoneNumber,
  });
  return res.json();
}

/**
 * Verify OTP and create session
 */
export async function verifyOTP(
  phoneNumber: string,
  otp: string
): Promise<VerifyOTPResponse> {
  const res = await apiRequest("POST", "/api/auth/otp/verify", {
    phoneNumber,
    otp,
  });
  return res.json();
}

/**
 * Resend OTP
 */
export async function resendOTP(phoneNumber: string): Promise<RequestOTPResponse> {
  const res = await apiRequest("POST", "/api/auth/otp/resend", {
    phoneNumber,
  });
  return res.json();
}

/**
 * Check authentication status
 */
export async function getAuthStatus(): Promise<AuthStatusResponse> {
  const res = await apiRequest("GET", "/api/auth/status", undefined);
  return res.json();
}

/**
 * Logout and destroy session
 */
export async function logout(): Promise<{ success: boolean; message: string }> {
  const res = await apiRequest("POST", "/api/auth/logout", undefined);
  return res.json();
}

/**
 * Request email OTP
 */
export async function requestEmailOTP(email: string): Promise<RequestOTPResponse> {
  const res = await apiRequest("POST", "/api/auth/email/request", {
    email,
  });
  return res.json();
}

/**
 * Verify email OTP and create session
 */
export async function verifyEmailOTP(
  email: string,
  otp: string
): Promise<VerifyOTPResponse> {
  const res = await apiRequest("POST", "/api/auth/email/verify", {
    email,
    otp,
  });
  return res.json();
}

/**
 * Resend email OTP
 */
export async function resendEmailOTP(email: string): Promise<RequestOTPResponse> {
  const res = await apiRequest("POST", "/api/auth/email/resend", {
    email,
  });
  return res.json();
}

