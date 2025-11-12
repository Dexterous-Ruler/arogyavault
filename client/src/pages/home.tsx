import { useState, useEffect } from 'react';
import { ArogyaVaultDashboard } from '@/components/MediLockerDashboard';
import { useLocation } from 'wouter';
import { useDocuments } from '@/hooks/useDocuments';
import { useUserProfile } from '@/hooks/useUser';
import { useHealthInsights } from '@/hooks/useHealth';
import { useNearbyClinics } from '@/hooks/useClinics';
import { getDocumentPreview } from '@/lib/api/documents';
import { useQueries } from '@tanstack/react-query';
import { useAuthStatus } from '@/hooks/useAuth';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { useLocation as useGeolocation } from '@/hooks/useLocation';

export default function HomePage() {
  const [guidedMode, setGuidedMode] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [autoStartVoice, setAutoStartVoice] = useState(false);
  const [, setLocation] = useLocation();
  const { data: authStatus } = useAuthStatus();
  const isAuthenticated = authStatus?.authenticated === true;

  // Request location for clinics when page loads
  const { requestLocation, location: userLocation, loading: locationLoading, error: locationError } = useGeolocation();
  
  useEffect(() => {
    // Request location when authenticated user visits home page
    // Only request if we don't have location and we're not currently loading
    if (isAuthenticated && !userLocation && !locationLoading) {
      console.log('[Home] Requesting user location for nearby clinics', {
        hasLocation: !!userLocation,
        loading: locationLoading,
        error: locationError,
        isAuthenticated
      });
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        requestLocation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, userLocation, locationLoading, requestLocation]);

  // Fetch real documents data (limit to 3 most recent)
  const { data: documentsData, isLoading: documentsLoading } = useDocuments({});
  const { data: userProfile } = useUserProfile();
  
  // Push notifications setup
  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    isSubscribed,
    subscribe,
    requestPermission,
    registration,
  } = usePushNotifications();

  // Auto-register push notifications when user is logged in and permission is granted
  useEffect(() => {
    if (!isAuthenticated || !isPushSupported) {
      return;
    }

    // Only auto-subscribe if permission is already granted and not yet subscribed
    if (pushPermission === 'granted' && !isSubscribed && registration) {
      console.log('[Home] Auto-subscribing to push notifications');
      subscribe().catch((error) => {
        console.error('[Home] Failed to auto-subscribe to push notifications:', error);
        // Don't show error to user - they can enable manually in settings
      });
    }
  }, [isAuthenticated, isPushSupported, pushPermission, isSubscribed, registration, subscribe]);
  
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

  // Fetch nearby hospitals (100km radius)
  // Pass the location from home page to avoid duplicate useLocation hooks
  const { data: clinicsData, isLoading: clinicsLoading, error: clinicsError } = useNearbyClinics(100000, userLocation); // 100km radius
  
  // Process clinics data
  const nearbyClinics = clinicsData?.success && clinicsData.clinics 
    ? clinicsData.clinics
        .filter(clinic => clinic.distance <= 100) // Only show hospitals within 100km
        .slice(0, 10) // Show up to 10 hospitals
        .map(clinic => ({
          id: clinic.id,
          name: clinic.name,
          address: clinic.address,
          distance: clinic.distance,
          latitude: clinic.latitude,
          longitude: clinic.longitude,
        }))
    : [];
  
  // Log if we have data but no clinics after filtering
  useEffect(() => {
    if (clinicsData?.success && clinicsData.clinics) {
      const filtered = clinicsData.clinics.filter(c => c.distance <= 100);
      if (clinicsData.clinics.length > 0 && filtered.length === 0) {
        console.warn('[Home] Clinics found but all filtered out (distance > 100km):', clinicsData.clinics.map(c => ({ name: c.name, distance: c.distance })));
      }
    }
  }, [clinicsData]);

  // Debug logging for clinics (moved after declarations)
  useEffect(() => {
    console.log('[Home] Clinics Debug:', {
      hasLocation: !!userLocation,
      location: userLocation,
      locationLoading,
      locationError,
      clinicsData,
      clinicsLoading,
      clinicsError,
      nearbyClinicsCount: nearbyClinics.length,
      nearbyClinics
    });
    
    if (clinicsData) {
      console.log('[Home] Clinics data:', clinicsData);
      console.log('[Home] Nearby clinics count:', nearbyClinics.length);
      if (clinicsData.clinics && clinicsData.clinics.length > 0) {
        console.log('[Home] First clinic:', clinicsData.clinics[0]);
      }
    }
    if (clinicsError) {
      console.error('[Home] Clinics error:', clinicsError);
    }
    if (locationError) {
      console.error('[Home] Location error:', locationError);
    }
  }, [userLocation, locationLoading, locationError, clinicsData, clinicsLoading, clinicsError, nearbyClinics]);

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
    const createdAt = new Date(doc.createdAt);
    
    return {
      id: doc.id,
      type: doc.type === 'lab' ? 'Lab Report' : 
            doc.type === 'prescription' ? 'Prescription' :
            doc.type === 'imaging' ? 'X-Ray' : 'Document',
      date: doc.date ? new Date(doc.date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) : undefined, // Report date
      uploadDate: createdAt.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }), // Upload date
      uploadTime: createdAt.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }), // Upload time
      thumbnail: previewUrl || '/api/placeholder/80/100' // Use preview URL or placeholder
    };
  }) || [];

  // Language is now managed by LanguageContext

  const handleMicClick = () => {
    console.log('🎤 Voice assistant activated');
    // Open chatbot and auto-start voice input
    setAutoStartVoice(true);
    setIsChatbotOpen(true);
  };

  // Reset auto-start voice when chatbot closes
  useEffect(() => {
    if (!isChatbotOpen) {
      setAutoStartVoice(false);
    }
  }, [isChatbotOpen]);

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
    setLocation('/ai-insights');
  };

  const handleEmergencyCardClick = () => {
    console.log('🚨 Emergency Card clicked');
    setLocation('/emergency');
  };

  const handleMedicationsClick = () => {
    console.log('💊 Medications clicked');
    setLocation('/medications');
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

  const handleDirectionsClick = (clinic: { name: string; latitude?: number; longitude?: number; address?: string }) => {
    console.log(`🗺️ Directions to ${clinic.name}`, clinic);
    
    if (clinic.latitude && clinic.longitude && !isNaN(clinic.latitude) && !isNaN(clinic.longitude)) {
      // Open Google Maps with directions using exact coordinates
      const url = `https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`;
      window.open(url, '_blank');
    } else if (clinic.address) {
      // Fallback: search by address
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`;
      window.open(url, '_blank');
    } else {
      // Last resort: search by name
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name)}`;
      window.open(url, '_blank');
    }
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

  const handleChatbotClick = () => {
    console.log('💬 Chatbot clicked');
    setIsChatbotOpen(true);
  };

  return (
    <>
      <ArogyaVaultDashboard
        guidedMode={guidedMode}
        isOffline={false}
        pendingActions={0}
        recentDocuments={recentDocuments}
        isLoadingDocuments={documentsLoading}
        healthInsight={healthInsight}
        nearbyClinics={nearbyClinics}
        isLoadingClinics={clinicsLoading || locationLoading}
        clinicsError={locationError || (clinicsError instanceof Error ? clinicsError.message : clinicsError)}
        onRequestLocation={requestLocation}
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
        onChatbotClick={handleChatbotClick}
      />
      <ChatbotWidget isOpen={isChatbotOpen} onOpenChange={setIsChatbotOpen} autoStartVoice={autoStartVoice} />
    </>
  );
}
