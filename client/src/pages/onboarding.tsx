import { ArogyaVaultOnboarding } from '@/components/MediLockerOnboarding';
import { useLocation } from 'wouter';
import { featureFlags } from '@/config/featureFlags';
import { useCompleteOnboarding } from '@/hooks/useUser';
import { useAuthStatus } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const completeOnboardingMutation = useCompleteOnboarding();
  const { data: authStatus, isLoading: authLoading } = useAuthStatus();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [guidedMode, setGuidedMode] = useState(false);

  // Check if user has already completed onboarding
  useEffect(() => {
    if (!authLoading && authStatus?.authenticated) {
      if (authStatus.user?.onboardingCompleted) {
        // User has already completed onboarding, redirect to home
        console.log('[Onboarding] User has already completed onboarding, redirecting to home');
        setLocation('/home');
      }
    } else if (!authLoading && !authStatus?.authenticated) {
      // User is not authenticated, redirect to auth
      console.log('[Onboarding] User not authenticated, redirecting to auth');
      setLocation('/auth');
    }
  }, [authStatus, authLoading, setLocation]);

  const handleComplete = async () => {
    try {
      // Save onboarding preferences
      await completeOnboardingMutation.mutateAsync({
        language,
        guidedMode,
      });
      
      if (featureFlags.screens.home) {
        // Navigate to home dashboard
        setLocation('/home');
      } else {
        // Home screen not yet implemented
        alert('Onboarding complete!\n\nWelcome to Arogya Vault!\n\n(Home dashboard coming soon)');
      }
    } catch (error) {
      // Error is handled by the mutation hook (toast notification)
      console.error('Onboarding completion failed:', error);
    }
  };

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking onboarding status...</p>
        </div>
      </div>
    );
  }

  // Don't render onboarding if user has already completed it (will redirect)
  if (authStatus?.authenticated && authStatus.user?.onboardingCompleted) {
    return null;
  }

  // Don't render onboarding if user is not authenticated (will redirect)
  if (!authStatus?.authenticated) {
    return null;
  }

  // We need to pass language and guidedMode to the component
  // Since the component manages its own state, we'll need to modify it
  // For now, we'll handle it in the completion handler
  return (
    <ArogyaVaultOnboarding
      onComplete={handleComplete}
    />
  );
}
