import { useState } from 'react';
import { VaultDocumentTimeline } from '@/components/VaultDocumentTimeline';
import { useLocation } from 'wouter';

type DocumentType = 'prescription' | 'lab' | 'imaging' | 'billing' | 'all';

export default function VaultPage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
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
    console.log('📷 Add via camera');
    alert('Camera capture coming soon!');
  };

  const handleAddFileUpload = () => {
    console.log('📤 Add via file upload');
    alert('File upload coming soon!');
  };

  const handleAddScanQR = () => {
    console.log('📱 Add via QR scan');
    alert('QR scanner coming soon!');
  };

  const handleAddDicomImport = () => {
    console.log('🏥 Add via DICOM import');
    alert('DICOM import coming soon!');
  };

  const handleOfflineSyncClick = () => {
    console.log('🔄 Offline sync clicked');
    alert('Starting sync...\n\n(Sync functionality coming soon)');
  };

  return (
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
  );
}
