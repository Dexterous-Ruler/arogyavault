import { ArogyaVaultAuthPage } from '@/components/MediLockerAuthPage';
import { useLocation } from 'wouter';
import { featureFlags } from '@/config/featureFlags';
import { useRequestOTP, useRequestEmailOTP } from '@/hooks/useAuth';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const requestOTPMutation = useRequestOTP();
  const requestEmailOTPMutation = useRequestEmailOTP();

  const handleContinueWithOTP = async (phoneNumber: string) => {
    if (!featureFlags.auth.phoneOTP) {
      alert('Phone OTP authentication is currently disabled');
      return;
    }
    
    try {
      // Call API to request OTP
      const response = await requestOTPMutation.mutateAsync(phoneNumber);
      
      if (response.success) {
        // Navigate to OTP screen with phone number
        setLocation(`/otp?phone=${phoneNumber}`);
      }
    } catch (error) {
      // Error handled by mutation hook (toast notification)
      console.error('OTP request failed:', error);
    }
  };

  const handleContinueWithABHA = () => {
    if (!featureFlags.auth.abhaId) {
      alert('ABHA ID authentication is currently disabled');
      return;
    }
    
    console.log('🏥 Continue with ABHA ID');
    alert('ABHA ID authentication\n\n(ABHA screen coming soon)');
  };

  const handleContinueAsGuest = () => {
    if (!featureFlags.auth.guest) {
      alert('Guest mode is currently disabled');
      return;
    }
    
    console.log('👤 Continue as guest');
    
    if (featureFlags.screens.home) {
      // Navigate directly to home when implemented
      setLocation('/home');
    } else {
      alert('Guest mode\n\n(Guest flow coming soon)');
    }
  };

  const handleContinueWithEmail = async (email: string) => {
    if (!featureFlags.auth.email) {
      alert('Email authentication is currently disabled');
      return;
    }
    
    try {
      // Call API to request email OTP
      const response = await requestEmailOTPMutation.mutateAsync(email);
      
      if (response.success) {
        // Navigate to email OTP screen with email
        setLocation(`/otp-email?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      // Error handled by mutation hook (toast notification)
      console.error('Email OTP request failed:', error);
    }
  };

  return (
    <ArogyaVaultAuthPage
      onContinueWithOTP={featureFlags.auth.phoneOTP ? handleContinueWithOTP : undefined}
      onContinueWithABHA={featureFlags.auth.abhaId ? handleContinueWithABHA : undefined}
      onContinueAsGuest={featureFlags.auth.guest ? handleContinueAsGuest : undefined}
      onContinueWithEmail={featureFlags.auth.email ? handleContinueWithEmail : undefined}
    />
  );
}
