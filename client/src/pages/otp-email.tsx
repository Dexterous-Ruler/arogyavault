import { ArogyaVaultOtpVerificationScreen } from '@/components/MediLockerOtpVerificationScreen';
import { useLocation } from 'wouter';
import { featureFlags } from '@/config/featureFlags';
import { useVerifyEmailOTP, useResendEmailOTP } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function OTPEmailPage() {
  const [location, setLocation] = useLocation();
  const [email, setEmail] = useState('');

  // Extract email from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email') || '';
    setEmail(emailParam);
    
    if (!emailParam) {
      // If no email, redirect to auth
      setLocation('/auth');
    }
  }, [location, setLocation]);
  
  const verifyEmailOTPMutation = useVerifyEmailOTP();
  const resendEmailOTPMutation = useResendEmailOTP();

  const handleVerify = async (otp: string) => {
    if (!email) {
      // If no email in URL, go back to auth
      setLocation('/auth');
      return;
    }

    try {
      await verifyEmailOTPMutation.mutateAsync({ email, otp });
      // Navigation handled in mutation success callback
    } catch (error: any) {
      // Error handled by mutation hook (toast notification)
      console.error('Email OTP verification failed:', error);
      // Re-throw so component can show error state
      throw error;
    }
  };

  const handleChangeEmail = () => {
    console.log('🔄 Change email requested');
    // Navigate back to auth screen
    setLocation('/auth');
  };

  const handleResendOtp = async () => {
    if (!email) {
      setLocation('/auth');
      return;
    }

    try {
      await resendEmailOTPMutation.mutateAsync(email);
      // Success handled by mutation hook (toast notification)
    } catch (error) {
      // Error handled by mutation hook (toast notification)
      console.error('Resend email OTP failed:', error);
    }
  };

  const handleGetCall = () => {
    console.log('📞 Get call with OTP requested');
    alert('Call OTP\n\n(Call OTP functionality coming soon)');
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  // Mask email for display (e.g., "user@example.com" -> "u***@example.com")
  const maskEmail = (email: string): string => {
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = localPart.length > 2 
      ? `${localPart[0]}${'*'.repeat(Math.min(localPart.length - 2, 3))}${localPart[localPart.length - 1]}`
      : localPart[0] + '*'.repeat(localPart.length - 1);
    return `${maskedLocal}@${domain}`;
  };

  return (
    <ArogyaVaultOtpVerificationScreen
      phoneNumber={maskEmail(email)}
      isEmail={true}
      onVerify={handleVerify}
      onResendOtp={handleResendOtp}
      onChangeNumber={handleChangeEmail}
      onGetCall={featureFlags.auth.callOTP ? handleGetCall : undefined}
    />
  );
}

