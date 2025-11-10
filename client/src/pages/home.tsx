import { useState } from 'react';
import { ArogyaVaultDashboard } from '@/components/MediLockerDashboard';
import { useLocation } from 'wouter';
import { useDocuments } from '@/hooks/useDocuments';
import { useUserProfile } from '@/hooks/useUser';
import { useHealthInsights } from '@/hooks/useHealth';
import { getDocumentPreview } from '@/lib/api/documents';
import { useQueries } from '@tanstack/react-query';

export default function HomePage() {
  const [guidedMode, setGuidedMode] = useState(false);
  const [, setLocation] = useLocation();

  // Fetch real documents data (limit to 3 most recent)
  const { data: documentsData, isLoading: documentsLoading } = useDocuments({});
  const { data: userProfile } = useUserProfile();
  
  // Fetch AI health insights
  const { data: healthInsightsData, isLoading: healthInsightsLoading } = useHealthInsights();
  const healthInsight = healthInsightsData?.success && healthInsightsData.insight
    ? {
        status: healthInsightsData.insight.status,
        message: healthInsightsData.insight.message
      }
    : healthInsightsLoading
    ? null // Show loading state
    : {
        status: 'good' as const,
        message: 'No documents available. Upload lab reports to get started with AI health insights.'
      };

  // Get recent documents (limit to 3)
  const recentDocIds = documentsData?.documents?.slice(0, 3).map(doc => doc.id) || [];
  
  // Fetch preview URLs for recent documents using useQueries
  const previewQueries = useQueries({
    queries: recentDocIds.map((docId) => ({
      queryKey: ['document-preview', docId],
      queryFn: () => getDocumentPreview(docId),
      enabled: !!docId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  // Map documents with preview URLs
  const recentDocuments = documentsData?.documents?.slice(0, 3).map((doc, index) => {
    const previewQuery = previewQueries[index];
    const previewUrl = previewQuery?.data?.success ? previewQuery.data.previewUrl : null;
    
    return {
      id: doc.id,
      type: doc.type === 'lab' ? 'Lab Report' : 
            doc.type === 'prescription' ? 'Prescription' :
            doc.type === 'imaging' ? 'X-Ray' : 'Document',
      date: doc.date ? new Date(doc.date).toISOString().split('T')[0] : 
            new Date(doc.createdAt).toISOString().split('T')[0],
      thumbnail: previewUrl || '/api/placeholder/80/100' // Use preview URL or placeholder
    };
  }) || [];

  // Language is now managed by LanguageContext

  const handleMicClick = () => {
    console.log('🎤 Voice assistant activated');
  };

  const handleNotificationsClick = () => {
    console.log('🔔 Notifications opened');
  };

  const handleSearchClick = () => {
    console.log('🔍 Search opened');
    // Could navigate to a search page or open search modal
  };

  const handleUploadRecordsClick = () => {
    console.log('📤 Upload records clicked');
    // Route to vault page
    setLocation('/vault');
  };

  const handleAiInsightsClick = () => {
    console.log('📊 AI Insights clicked');
    // For now, show alert. Later can route to insights page
    alert('AI Insights feature coming soon!');
  };

  const handleEmergencyCardClick = () => {
    console.log('🚨 Emergency Card clicked');
    setLocation('/emergency');
  };

  const handleMedicationsClick = () => {
    console.log('💊 Medications clicked');
    // For now, show alert. Later can route to medications page
    alert('Medications feature coming soon!');
  };

  const handleViewAllDocumentsClick = () => {
    console.log('📁 View all documents clicked');
    // Route to vault page
    setLocation('/vault');
  };

  const handleDocumentClick = (docId: string) => {
    console.log(`📄 Document ${docId} clicked`);
    // Route to document detail page
    setLocation(`/document/${docId}`);
  };

  const handleViewFullReportClick = () => {
    console.log('📈 View full report clicked');
    // For now, show alert. Later can route to full report page
    alert('Full health report coming soon!');
  };

  const handleDirectionsClick = (clinic: string) => {
    console.log(`🗺️ Directions to ${clinic}`);
    alert(`Directions to ${clinic} - Maps integration coming soon!`);
  };

  const handleBottomNavClick = (tabId: string) => {
    console.log(`🔀 Bottom nav tab clicked: ${tabId}`);
    
    if (tabId === 'vault') {
      setLocation('/vault');
    } else if (tabId === 'share') {
      setLocation('/consent');
    } else if (tabId === 'emergency') {
      setLocation('/emergency');
    } else if (tabId === 'profile') {
      setLocation('/profile');
    }
  };

  return (
    <ArogyaVaultDashboard
      guidedMode={guidedMode}
      isOffline={false}
      pendingActions={0}
      recentDocuments={recentDocuments}
      isLoadingDocuments={documentsLoading}
      healthInsight={healthInsight}
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
