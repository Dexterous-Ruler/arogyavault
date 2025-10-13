import { useState } from 'react';
import { VaultDocumentTimeline } from '@/components/VaultDocumentTimeline';
import { MediLockerAddDocumentWizard } from '@/components/MediLockerAddDocumentWizard';
import { useLocation } from 'wouter';

type DocumentType = 'prescription' | 'lab' | 'imaging' | 'billing' | 'all';

export default function VaultPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [showWizard, setShowWizard] = useState(false);
  const [, setLocation] = useLocation();

  const handleBack = () => {
    console.log('⬅️ Back to home');
    setLocation('/home');
  };

  const handleSearch = (query: string) => {
    console.log(`🔍 Search query: "${query}"`);
  };

  const handleFilterChange = (filter: DocumentType) => {
    console.log(`🔀 Filter changed to: ${filter}`);
  };

  const handleDocumentClick = (docId: string) => {
    console.log(`📄 Document clicked: ${docId}`);
    alert(`Document viewer for ID: ${docId}\n\n(Document viewer coming soon)`);
  };

  const handleAddCamera = () => {
    console.log('📷 Add via camera - Opening wizard');
    setShowWizard(true);
  };

  const handleAddFileUpload = () => {
    console.log('📤 Add via file upload - Opening wizard');
    setShowWizard(true);
  };

  const handleAddScanQR = () => {
    console.log('📱 Add via QR scan - Opening wizard');
    setShowWizard(true);
  };

  const handleAddDicomImport = () => {
    console.log('🏥 Add via DICOM import - Opening wizard');
    setShowWizard(true);
  };

  const handleOfflineSyncClick = () => {
    console.log('🔄 Offline sync clicked');
    alert('Starting sync...\n\n(Sync functionality coming soon)');
  };

  const handleWizardComplete = (data: any) => {
    console.log('✅ Document added:', data);
    setShowWizard(false);
  };

  const handleWizardCancel = () => {
    console.log('❌ Wizard cancelled');
    setShowWizard(false);
  };

  return (
    <>
      <VaultDocumentTimeline
        language={language}
        onBack={handleBack}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onDocumentClick={handleDocumentClick}
        onAddCamera={handleAddCamera}
        onAddFileUpload={handleAddFileUpload}
        onAddScanQR={handleAddScanQR}
        onAddDicomImport={handleAddDicomImport}
        onOfflineSyncClick={handleOfflineSyncClick}
      />

      {showWizard && (
        <div className="fixed inset-0 z-50 bg-white">
          <MediLockerAddDocumentWizard
            language={language}
            onComplete={handleWizardComplete}
            onCancel={handleWizardCancel}
          />
        </div>
      )}
    </>
  );
}
