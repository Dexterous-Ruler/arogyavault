import { useState } from 'react';
import { useLocation } from 'wouter';
import { ConsentCenter } from '@/components/ConsentCenter';
import { GrantConsentFlow } from '@/components/GrantConsentFlow';

export default function ConsentPage() {
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [showGrantFlow, setShowGrantFlow] = useState(false);

  const handleBack = () => {
    setLocation('/home');
  };

  const handleGrantConsent = () => {
    console.log('Grant consent clicked - opening flow');
    setShowGrantFlow(true);
  };

  const handleRevokeConsent = (id: string) => {
    console.log('Revoke consent:', id);
  };

  const handleViewAudit = (id: string) => {
    console.log('View audit log for consent:', id);
  };

  const handleManageOfflineQueue = () => {
    console.log('Manage offline queue clicked');
  };

  const handleGrantFlowComplete = (data: any) => {
    console.log('Consent granted:', data);
  };

  const handleGrantFlowCancel = () => {
    console.log('Grant flow cancelled');
    setShowGrantFlow(false);
  };

  if (showGrantFlow) {
    return (
      <GrantConsentFlow
        language={language}
        isOffline={false}
        onComplete={handleGrantFlowComplete}
        onCancel={handleGrantFlowCancel}
      />
    );
  }

  return (
    <ConsentCenter
      onBack={handleBack}
      onGrantConsent={handleGrantConsent}
      onRevokeConsent={handleRevokeConsent}
      onViewAudit={handleViewAudit}
      onManageOfflineQueue={handleManageOfflineQueue}
      language={language}
    />
  );
}
