import { useLocation } from 'wouter';
import { ProfileSettingsScreen } from '@/components/ProfileSettingsScreen';

export default function ProfilePage() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/home');
  };

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
    alert('Edit profile feature coming soon!');
  };

  const handleLanguageChange = (lang: 'english' | 'hindi') => {
    console.log('Language changed to:', lang);
    // In a real app, this would update global language settings
  };

  const handleGuidedModeToggle = () => {
    console.log('Guided mode toggled');
    // In a real app, this would update accessibility settings
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
    console.log('Logout clicked');
    const confirmed = confirm('Are you sure you want to logout?');
    if (confirmed) {
      // In a real app, this would clear session and navigate to login
      setLocation('/');
    }
  };

  return (
    <ProfileSettingsScreen
      onBack={handleBack}
      onEditProfile={handleEditProfile}
      onLanguageChange={handleLanguageChange}
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
