import { useLocation } from 'wouter';
import { EmergencyCardScreen } from '@/components/EmergencyCardScreen';

export default function EmergencyPage() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/home');
  };

  const handleEdit = () => {
    console.log('Edit emergency card');
    alert('Edit emergency card feature coming soon!');
  };

  const handlePrintShare = () => {
    console.log('Print/Share emergency card');
    alert('Print/Share feature coming soon!');
  };

  const handleManageNominee = () => {
    setLocation('/nominee-management');
  };

  const handleQRTap = () => {
    console.log('QR code tapped');
    alert('QR code expanded view coming soon!');
  };

  return (
    <EmergencyCardScreen
      onBack={handleBack}
      onEdit={handleEdit}
      onPrintShare={handlePrintShare}
      onManageNominee={handleManageNominee}
      onQRTap={handleQRTap}
    />
  );
}
