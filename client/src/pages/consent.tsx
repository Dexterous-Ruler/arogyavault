import { useState } from 'react';
import { useLocation } from 'wouter';
import { ConsentCenter } from '@/components/ConsentCenter';

export default function ConsentPage() {
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const handleBack = () => {
    setLocation('/home');
  };

  const handleGrantConsent = () => {
    console.log('Grant consent clicked - functionality to be implemented');
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
