import { useLocation } from 'wouter';
import { NomineeManagementScreen } from '@/components/NomineeManagementScreen';

export default function NomineeManagementPage() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/emergency');
  };

  return <NomineeManagementScreen onBack={handleBack} />;
}
