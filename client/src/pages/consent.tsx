import { useState } from 'react';
import { useLocation } from 'wouter';
import { ConsentCenter } from '@/components/ConsentCenter';
import { GrantConsentFlow } from '@/components/GrantConsentFlow';
import { useToast } from '@/hooks/use-toast';

export default function ConsentPage() {
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [showGrantFlow, setShowGrantFlow] = useState(false);
  const { toast } = useToast();

  const handleBack = () => {
    setLocation('/home');
  };

  const handleGrantConsent = () => {
    console.log('Grant consent clicked - opening flow');
    setShowGrantFlow(true);
  };

  const handleViewAudit = (id: string) => {
    console.log('View audit log for consent:', id);
    // TODO: Implement audit log viewer modal/page
    toast({
      title: 'Audit Log',
      description: 'Audit log viewer coming soon',
    });
  };

  const handleGrantFlowComplete = (data: any) => {
    console.log('Consent granted:', data);
    // Flow will handle showing success, we just need to close it after a delay
    setTimeout(() => {
      setShowGrantFlow(false);
    }, 3000);
  };

  const handleGrantFlowCancel = () => {
    console.log('Grant flow cancelled');
    setShowGrantFlow(false);
  };

  if (showGrantFlow) {
    return (
      <GrantConsentFlow
        language={language}
        onComplete={handleGrantFlowComplete}
        onCancel={handleGrantFlowCancel}
      />
    );
  }

  return (
    <ConsentCenter
      onBack={handleBack}
      onGrantConsent={handleGrantConsent}
      onViewAudit={handleViewAudit}
      language={language}
    />
  );
}
