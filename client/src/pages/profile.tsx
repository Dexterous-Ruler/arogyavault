import { useLocation } from 'wouter';
import { ProfileSettingsScreen } from '@/components/ProfileSettingsScreen';
import { useAuthStatus } from '@/hooks/useAuth';
import { useUserProfile, useUpdateSettings } from '@/hooks/useUser';
import { useLogout } from '@/hooks/useAuth';

/**
 * Mask phone number (e.g., "78499xxxx6" or "+91 78499xxxx6")
 */
function maskPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Handle international format (+91...)
  if (cleaned.startsWith('+91')) {
    const digits = cleaned.slice(3); // Remove +91
    if (digits.length >= 10) {
      // Show first 5 digits, mask middle, show last digit
      const first = digits.slice(0, 5);
      const last = digits.slice(-1);
      return `+91 ${first}xxxx${last}`;
    }
  }
  
  // Handle 10-digit Indian numbers
  if (cleaned.length === 10) {
    const first = cleaned.slice(0, 5);
    const last = cleaned.slice(-1);
    return `${first}xxxx${last}`;
  }
  
  // Handle 12-digit numbers (with country code)
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    const digits = cleaned.slice(2);
    const first = digits.slice(0, 5);
    const last = digits.slice(-1);
    return `+91 ${first}xxxx${last}`;
  }
  
  // Fallback: mask middle digits
  if (cleaned.length > 6) {
    const first = cleaned.slice(0, 5);
    const last = cleaned.slice(-1);
    return `${first}xxxx${last}`;
  }
  
  return phoneNumber;
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { data: authStatus, isLoading: authLoading, error: authError } = useAuthStatus();
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const logoutMutation = useLogout();
  const updateSettingsMutation = useUpdateSettings();

  // Check authentication - API returns { authenticated: boolean, ... }
  // If authStatus is undefined/null, treat as not authenticated
  // If there's an error, also treat as not authenticated
  const isAuthenticated = authStatus?.authenticated === true && !authError;

  const handleBack = () => {
    setLocation('/home');
  };

  const handleSignUp = () => {
    setLocation('/auth');
  };

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
    alert('Edit profile feature coming soon!');
  };

  // Language changes are handled directly by LanguageSelector via i18next
  // No need for a separate handler - language is persisted in localStorage automatically

  const handleGuidedModeToggle = () => {
    const currentGuidedMode = userProfile?.user?.settings?.guidedMode || false;
    updateSettingsMutation.mutate({ guidedMode: !currentGuidedMode });
  };

  const handleSetPin = () => {
    console.log('Set PIN clicked');
    alert('PIN setup feature coming soon!');
  };

  const handleBiometricToggle = () => {
    console.log('Biometric toggled');
    // In a real app, this would enable/disable biometric authentication
  };

  const handleManageNominee = () => {
    setLocation('/nominee-management');
  };

  const handleEmergencyCard = () => {
    setLocation('/emergency');
  };

  const handleFaq = () => {
    console.log('FAQ clicked');
    alert('FAQ feature coming soon!');
  };

  const handleSupport = () => {
    console.log('Support clicked');
    alert('Contact support feature coming soon!');
  };

  const handleTerms = () => {
    console.log('Terms clicked');
    alert('Terms & Conditions feature coming soon!');
  };

  const handlePrivacy = () => {
    console.log('Privacy clicked');
    alert('Privacy Policy feature coming soon!');
  };

  const handleLogout = () => {
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
      logoutMutation.mutate();
    }
  };

  // Show loading state only while checking auth
  // Don't wait for profile to load before showing auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show Sign Up button if not authenticated
  // This includes cases where:
  // - authStatus is null/undefined
  // - authenticated is false
  // - there was an error fetching auth status
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-6 md:px-8 lg:px-10 max-w-sm md:max-w-md lg:max-w-lg">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
            <p className="text-gray-600">Sign up to access your profile and settings</p>
          </div>
          <button
            onClick={handleSignUp}
            className="w-full px-6 md:px-8 lg:px-10 py-3 md:py-3.5 lg:py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-sm md:text-base lg:text-lg"
            data-testid="button-sign-up"
          >
            Sign Up
          </button>
          <button
            onClick={handleBack}
            className="mt-4 text-sm text-gray-600 hover:text-gray-900"
            data-testid="button-back"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Show loading if profile is still loading (but auth is confirmed)
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Get user data - use phone from auth status if profile not loaded yet
  const phoneFromAuth = authStatus?.user?.phoneNumber;
  const phoneFromProfile = userProfile?.user?.phoneNumber;
  const phoneNumber = phoneFromProfile || phoneFromAuth || '';
  const maskedPhone = maskPhoneNumber(phoneNumber);
  const email = userProfile?.user?.email || '';
  // ABHA ID is not currently in the UserProfile type, using default
  const abhaId = 'Not Linked';
  const isAbhaLinked = false;
  
  // Get settings - default to english if not set
  const language = userProfile?.user?.settings?.language === 'hi' ? 'hindi' : 'english';
  const isGuidedModeEnabled = userProfile?.user?.settings?.guidedMode || false;

  return (
    <ProfileSettingsScreen
      userName={maskedPhone}
      abhaId={abhaId}
      isAbhaLinked={isAbhaLinked}
      phone={maskedPhone}
      email={email}
      language={language}
      isGuidedModeEnabled={isGuidedModeEnabled}
      isBiometricEnabled={false}
      onBack={handleBack}
      onEditProfile={handleEditProfile}
      onGuidedModeToggle={handleGuidedModeToggle}
      onSetPin={handleSetPin}
      onBiometricToggle={handleBiometricToggle}
      onManageNominee={handleManageNominee}
      onEmergencyCard={handleEmergencyCard}
      onFaq={handleFaq}
      onSupport={handleSupport}
      onTerms={handleTerms}
      onPrivacy={handlePrivacy}
      onLogout={handleLogout}
    />
  );
}
