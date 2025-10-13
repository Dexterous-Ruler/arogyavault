import { useState } from 'react';
import { MediLockerDashboard } from '@/components/MediLockerDashboard';
import { useLocation } from 'wouter';

export default function HomePage() {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [guidedMode, setGuidedMode] = useState(false);
  const [, setLocation] = useLocation();

  const handleLanguageToggle = () => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
    console.log(`🌐 Language switched to ${language === 'en' ? 'Hindi' : 'English'}`);
  };

  const handleMicClick = () => {
    console.log('🎤 Voice assistant activated');
  };

  const handleNotificationsClick = () => {
    console.log('🔔 Notifications opened');
  };

  const handleSearchClick = () => {
    console.log('🔍 Search opened');
  };

  const handleUploadRecordsClick = () => {
    console.log('📤 Upload records clicked');
    alert('Upload Records feature coming soon!');
  };

  const handleAiInsightsClick = () => {
    console.log('📊 AI Insights clicked');
    alert('AI Insights feature coming soon!');
  };

  const handleEmergencyCardClick = () => {
    console.log('🚨 Emergency Card clicked');
    alert('Emergency Card feature coming soon!');
  };

  const handleMedicationsClick = () => {
    console.log('💊 Medications clicked');
    alert('Medications feature coming soon!');
  };

  const handleViewAllDocumentsClick = () => {
    console.log('📁 View all documents clicked');
    alert('Documents vault coming soon!');
  };

  const handleDocumentClick = (docId: string) => {
    console.log(`📄 Document ${docId} clicked`);
    alert(`Document ${docId} viewer coming soon!`);
  };

  const handleViewFullReportClick = () => {
    console.log('📈 View full report clicked');
    alert('Full health report coming soon!');
  };

  const handleDirectionsClick = (clinic: string) => {
    console.log(`🗺️ Directions to ${clinic}`);
    alert(`Directions to ${clinic} - Maps integration coming soon!`);
  };

  const handleBottomNavClick = (tabId: string) => {
    console.log(`🔀 Bottom nav tab clicked: ${tabId}`);
    
    if (tabId === 'vault') {
      alert('Vault feature coming soon!');
    } else if (tabId === 'share') {
      alert('Share feature coming soon!');
    } else if (tabId === 'emergency') {
      alert('Emergency features coming soon!');
    } else if (tabId === 'profile') {
      alert('Profile settings coming soon!');
    }
  };

  return (
    <MediLockerDashboard
      language={language}
      guidedMode={guidedMode}
      isOffline={false}
      pendingActions={0}
      onLanguageToggle={handleLanguageToggle}
      onMicClick={handleMicClick}
      onNotificationsClick={handleNotificationsClick}
      onSearchClick={handleSearchClick}
      onUploadRecordsClick={handleUploadRecordsClick}
      onAiInsightsClick={handleAiInsightsClick}
      onEmergencyCardClick={handleEmergencyCardClick}
      onMedicationsClick={handleMedicationsClick}
      onViewAllDocumentsClick={handleViewAllDocumentsClick}
      onDocumentClick={handleDocumentClick}
      onViewFullReportClick={handleViewFullReportClick}
      onDirectionsClick={handleDirectionsClick}
      onBottomNavClick={handleBottomNavClick}
    />
  );
}
