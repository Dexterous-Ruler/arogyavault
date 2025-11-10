import { ArogyaVaultOtpVerificationScreen } from '@/components/MediLockerOtpVerificationScreen';
import { useLocation } from 'wouter';
import { featureFlags } from '@/config/featureFlags';
import { useVerifyOTP, useResendOTP } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function OTPPage() {
  const [location, setLocation] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');

  // Extract phone number from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phone = params.get('phone') || '';
    setPhoneNumber(phone);
    
    if (!phone) {
      // If no phone number, redirect to auth
      setLocation('/auth');
    }
  }, [location, setLocation]);
  
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();

  const handleVerify = async (otp: string) => {
    if (!phoneNumber) {
      // If no phone number in URL, go back to auth
      setLocation('/auth');
      return;
    }

    try {
      await verifyOTPMutation.mutateAsync({ phoneNumber, otp });
      // Navigation handled in mutation success callback
    } catch (error: any) {
      // Error handled by mutation hook (toast notification)
      console.error('OTP verification failed:', error);
      // Re-throw so component can show error state
      throw error;
    }
  };

  const handleChangeNumber = () => {
    console.log('🔄 Change phone number requested');
    // Navigate back to auth screen
    setLocation('/auth');
  };

  const handleResendOtp = async () => {
    if (!phoneNumber) {
      setLocation('/auth');
      return;
    }

    try {
      await resendOTPMutation.mutateAsync(phoneNumber);
      // Success handled by mutation hook (toast notification)
    } catch (error) {
      // Error handled by mutation hook (toast notification)
      console.error('Resend OTP failed:', error);
    }
  };

  const handleGetCall = () => {
    console.log('📞 Get call requested');
    alert('You will receive a verification call shortly');
  };

  const handleBack = () => {
    console.log('⬅️ Back to auth screen');
    setLocation('/auth');
  };

  const handlePrivacyClick = () => {
    console.log('🔒 Privacy policy clicked');
    alert('Privacy Policy\n\n(Privacy screen coming soon)');
  };

  const handleTermsClick = () => {
    console.log('📜 Terms clicked');
    alert('Terms of Service\n\n(Terms screen coming soon)');
  };

  const handleHelpClick = () => {
    console.log('❓ Help clicked');
    alert('Help & Support\n\n(Help screen coming soon)');
  };

  // Show loading while extracting phone number
  if (!phoneNumber) {
    return null;
  }

  return (
    <ArogyaVaultOtpVerificationScreen
      phoneNumber={`+91 ${phoneNumber.slice(0, 5)}xxx${phoneNumber.slice(-2)}`}
      onVerify={handleVerify}
      onChangeNumber={handleChangeNumber}
      onResendOtp={handleResendOtp}
      onGetCall={handleGetCall}
      onBack={handleBack}
      onPrivacyClick={handlePrivacyClick}
      onTermsClick={handleTermsClick}
      onHelpClick={handleHelpClick}
    />
  );
}
