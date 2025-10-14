import { MediLockerOnboarding } from '@/components/MediLockerOnboarding';
import { useLocation } from 'wouter';
import { featureFlags } from '@/config/featureFlags';

export default function OnboardingPage() {
  const [, setLocation] = useLocation();

  const handleComplete = () => {
    console.log('✅ Onboarding completed');
    
    if (featureFlags.screens.home) {
      // Navigate to home dashboard when implemented
      setLocation('/home');
    } else {
      // Home screen not yet implemented
      alert('Onboarding complete!\n\nWelcome to Arogya Vault!\n\n(Home dashboard coming soon)');
    }
  };

  return (
    <MediLockerOnboarding
      onComplete={handleComplete}
    />
  );
}
