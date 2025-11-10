/**
 * User Profile API Client
 * Functions for making user profile API calls
 */

import { apiRequest } from "../queryClient";

export interface UserProfile {
  id: string;
  phoneNumber: string;
  name?: string | null;
  email?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  bloodGroup?: string | null;
  address?: string | null;
  settings?: {
    language?: string;
    guidedMode?: boolean;
  };
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  dateOfBirth?: string; // ISO date string
  gender?: "male" | "female" | "other";
  bloodGroup?: string;
  address?: string;
}

export interface OnboardingData {
  language?: "en" | "hi";
  guidedMode?: boolean;
  name?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  bloodGroup?: string;
  address?: string;
}

export interface UserSettings {
  language?: "en" | "hi";
  guidedMode?: boolean;
}

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<{ success: boolean; user: UserProfile }> {
  const res = await apiRequest("GET", "/api/user/profile", undefined);
  return res.json();
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  data: UpdateProfileData
): Promise<{ success: boolean; message: string; user: Partial<UserProfile> }> {
  const res = await apiRequest("PUT", "/api/user/profile", data);
  return res.json();
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(
  data: OnboardingData
): Promise<{ success: boolean; message: string; user: { id: string; onboardingCompleted: boolean } }> {
  const res = await apiRequest("POST", "/api/user/onboarding", data);
  return res.json();
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  settings: UserSettings
): Promise<{ success: boolean; message: string; settings: UserSettings }> {
  const res = await apiRequest("PUT", "/api/user/settings", settings);
  return res.json();
}

