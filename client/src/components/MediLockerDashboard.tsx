import { motion } from 'framer-motion';
import { Plus, Heart, FileText, BarChart3, Bell, Search, Globe, Mic, ChevronRight, Calendar, Pill, MapPin, WifiOff, Home, FolderOpen, Share2, AlertCircle, User, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { LanguageSelector } from '@/i18n/LanguageSelector';
import { useTranslation } from '@/i18n/useTranslation';

type ArogyaVaultDashboardProps = {
  language?: 'en' | 'hi';
  guidedMode?: boolean;
  isOffline?: boolean;
  pendingActions?: number;
  recentDocuments?: Array<{
    id: string;
    type: string;
    date?: string; // Report date
    uploadDate?: string; // Upload date
    uploadTime?: string; // Upload time
    thumbnail?: string;
  }>;
  isLoadingDocuments?: boolean;
  healthInsight?: HealthInsight | null; // Add healthInsight prop
  nearbyClinics?: Array<{
    id: string;
    name: string;
    address: string;
    distance: number;
    latitude?: number;
    longitude?: number;
  }>;
  isLoadingClinics?: boolean;
  clinicsError?: string | null;
  onRequestLocation?: () => void;
  onLanguageToggle?: () => void;
  onMicClick?: () => void;
  onNotificationsClick?: () => void;
  onSearchClick?: () => void;
  onUploadRecordsClick?: () => void;
  onAiInsightsClick?: () => void;
  onEmergencyCardClick?: () => void;
  onMedicationsClick?: () => void;
  onViewAllDocumentsClick?: () => void;
  onDocumentClick?: (docId: string) => void;
  onViewFullReportClick?: () => void;
  onDirectionsClick?: (clinic: { name: string; latitude?: number; longitude?: number; address?: string }) => void;
  onBottomNavClick?: (tabId: string) => void;
  onChatbotClick?: () => void;
};

type DocumentPreview = {
  id: string;
  type: string;
  date: string;
  thumbnail: string;
};

type HealthInsight = {
  status: 'good' | 'warning' | 'critical';
  message: string;
};

const recentDocuments: DocumentPreview[] = [{
  id: '1',
  type: 'Lab Report',
  date: '2024-01-15',
  thumbnail: '/api/placeholder/80/100'
}, {
  id: '2',
  type: 'Prescription',
  date: '2024-01-10',
  thumbnail: '/api/placeholder/80/100'
}, {
  id: '3',
  type: 'X-Ray',
  date: '2024-01-05',
  thumbnail: '/api/placeholder/80/100'
}];

const healthInsight: HealthInsight = {
  status: 'good',
  message: 'Based on your latest reports, all values are within normal range. Keep up the healthy lifestyle!'
};

const translations = {
  en: {
    appName: 'Arogya Vault',
    quickActions: 'Quick Actions',
    quickActionsSubtitle: 'Manage your health records',
    uploadRecords: 'Upload Records',
    uploadRecordsDesc: 'Add lab reports, prescriptions & more',
    aiInsights: 'AI Insights',
    aiInsightsDesc: 'Smart health analysis & trends',
    emergencyCardTitle: 'Emergency Card',
    emergencyCardDesc: 'Critical info & quick access',
    medicationsTitle: 'Medications',
    medicationsDesc: 'Track & manage your doses',
    addDocument: 'Add Document',
    emergencyCard: 'Emergency Card',
    myInsights: 'My Insights',
    recentDocuments: 'Recent Documents',
    recentDocsSubtitle: 'Your most recent uploads',
    viewAll: 'View All',
    noDocuments: 'No documents yet. Add your first record!',
    aiHealthInsights: 'AI Health Insights',
    insightsSubtitle: 'Based on your latest reports',
    viewFullReport: 'View Full Report',
    noInsights: 'No insights yet. Upload lab reports to get started.',
    medications: 'Medications',
    nearbyClinics: 'Nearby Clinics & Labs',
    directions: 'Directions',
    offline: 'Offline',
    actionsPending: 'actions pending',
    syncedNow: 'Synced just now',
    home: 'Home',
    vault: 'Vault',
    share: 'Share',
    emergency: 'Emergency',
    profile: 'Profile'
  },
  hi: {
    appName: 'आरोग्य वॉल्ट',
    quickActions: 'त्वरित कार्रवाई',
    quickActionsSubtitle: 'अपने स्वास्थ्य रिकॉर्ड प्रबंधित करें',
    uploadRecords: 'रिकॉर्ड अपलोड करें',
    uploadRecordsDesc: 'लैब रिपोर्ट, प्रिस्क्रिप्शन और अधिक जोड़ें',
    aiInsights: 'एआई इनसाइट्स',
    aiInsightsDesc: 'स्मार्ट स्वास्थ्य विश्लेषण और रुझान',
    emergencyCardTitle: 'आपातकालीन कार्ड',
    emergencyCardDesc: 'महत्वपूर्ण जानकारी और त्वरित पहुंच',
    medicationsTitle: 'दवाइयाँ',
    medicationsDesc: 'अपनी खुराक को ट्रैक और प्रबंधित करें',
    addDocument: 'दस्तावेज़ जोड़ें',
    emergencyCard: 'आपातकालीन कार्ड',
    myInsights: 'मेरी इनसाइट्स',
    recentDocuments: 'हाल ही में जोड़े गए दस्तावेज़',
    recentDocsSubtitle: 'आपके सबसे हाल के अपलोड',
    viewAll: 'सभी देखें',
    noDocuments: 'अभी तक कोई दस्तावेज़ नहीं। अपना पहला रिकॉर्ड जोड़ें!',
    aiHealthInsights: 'एआई स्वास्थ्य इनसाइट्स',
    insightsSubtitle: 'आपकी नवीनतम रिपोर्ट के आधार पर',
    viewFullReport: 'पूरी रिपोर्ट देखें',
    noInsights: 'अभी तक कोई इनसाइट नहीं। शुरू करने के लिए लैब रिपोर्ट अपलोड करें।',
    medications: 'दवाइयाँ',
    nearbyClinics: 'आस-पास के क्लिनिक और लैब',
    directions: 'दिशा-निर्देश',
    offline: 'ऑफ़लाइन',
    actionsPending: 'कार्रवाई लंबित',
    syncedNow: 'अभी सिंक किया गया',
    home: 'होम',
    vault: 'वॉल्ट',
    share: 'शेयर',
    emergency: 'आपातकाल',
    profile: 'प्रोफ़ाइल'
  }
};

export const ArogyaVaultDashboard = (props: ArogyaVaultDashboardProps) => {
  const {
    guidedMode = false,
    isOffline = false,
    pendingActions = 0,
    recentDocuments: propRecentDocuments,
    isLoadingDocuments = false,
    healthInsight: propHealthInsight, // Use prop instead of hardcoded
    nearbyClinics = [],
    isLoadingClinics = false,
    clinicsError = null,
    onRequestLocation,
    onLanguageToggle,
    onMicClick,
    onNotificationsClick,
    onSearchClick,
    onUploadRecordsClick,
    onAiInsightsClick,
    onEmergencyCardClick,
    onMedicationsClick,
    onViewAllDocumentsClick,
    onDocumentClick,
    onViewFullReportClick,
    onDirectionsClick,
    onBottomNavClick,
    onChatbotClick
  } = props;
  
  // Use centralized translations
  const { translations: t } = useTranslation();
  
  // Use provided documents or empty array
  const recentDocuments = propRecentDocuments || [];
  
  // Use provided health insight or null
  const healthInsight: HealthInsight | null = propHealthInsight || null;
  
  const [activeTab, setActiveTab] = useState('home');
  
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onBottomNavClick?.(tabId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-amber-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-[390px] md:max-w-[448px] lg:max-w-[512px] xl:max-w-[576px] mx-auto bg-white" data-testid="dashboard-container">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6 flex items-center justify-between" data-testid="header">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative flex items-center justify-center" style={{ width: '2.5rem', height: '2.5rem' }}>
            {/* Animated glow effect behind heart - using CSS animation for reliability */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none animate-heartbeat-glow rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, rgba(239, 68, 68, 0.4) 30%, rgba(239, 68, 68, 0.2) 60%, transparent 80%)',
                filter: 'blur(14px)',
                width: '100%',
                height: '100%',
              }}
            />
            {/* Heart icon with heartbeat animation - using CSS animation */}
            <div 
              className="relative z-10 flex items-center justify-center animate-heartbeat"
              style={{
                transformOrigin: 'center center',
              }}
            >
              <Heart 
                className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-red-500" 
                data-testid="icon-app-logo"
                fill="#ef4444"
                stroke="#dc2626"
                strokeWidth={1.5}
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.7))',
                }}
              />
            </div>
          </div>
          <span className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900" data-testid="text-app-name">{t.common.appName}</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Voice/Chatbot button - always visible */}
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            className="p-2 md:p-2.5 lg:p-3 hover:bg-gray-100 rounded-lg"
            onClick={() => {
              if (onMicClick) {
                onMicClick();
              } else if (onChatbotClick) {
                onChatbotClick();
              }
            }}
            data-testid="button-voice-chatbot"
            title="Voice Assistant & Chatbot"
          >
            <Mic className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-blue-600" />
          </motion.button>
          <LanguageSelector variant="compact" className="w-auto" />
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            className="p-2 md:p-2.5 lg:p-3 hover:bg-gray-100 rounded-lg"
            onClick={onNotificationsClick}
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-700" />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            className="p-2 md:p-2.5 lg:p-3 hover:bg-gray-100 rounded-lg"
            onClick={onSearchClick}
            data-testid="button-search"
          >
            <Search className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-700" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 md:pb-24 lg:pb-28">
        <div className="px-6 md:px-8 lg:px-10 pt-6 md:pt-8 lg:pt-10 space-y-6 md:space-y-8 lg:space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-4 md:space-y-5 lg:space-y-6"
          >
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 md:mb-2" data-testid="text-quick-actions-title">
                {t.dashboard.quickActions}
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-gray-500" data-testid="text-quick-actions-subtitle">
                {t.dashboard.quickActionsSubtitle}
              </p>
            </div>
            
            <div className="flex gap-4 md:gap-5 lg:gap-6 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory" data-testid="quick-actions-container">
              <motion.button 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.97 }} 
                className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl p-8 md:p-10 lg:p-12 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-500 snap-center relative overflow-hidden group"
                onClick={onUploadRecordsClick}
                data-testid="button-upload-records"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 md:mb-7 lg:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Plus className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3">
                      {t.dashboard.uploadRecords}
                    </h3>
                    <p className="text-sm md:text-base lg:text-lg text-blue-100">
                      {t.dashboard.uploadRecordsDesc}
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.97 }} 
                className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-3xl p-8 md:p-10 lg:p-12 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-500 snap-center relative overflow-hidden group"
                onClick={onAiInsightsClick}
                data-testid="button-ai-insights"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 md:mb-7 lg:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <BarChart3 className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3">
                      {t.dashboard.aiInsights}
                    </h3>
                    <p className="text-sm md:text-base lg:text-lg text-purple-100">
                      {t.dashboard.aiInsightsDesc}
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.97 }} 
                className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl p-8 md:p-10 lg:p-12 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-500 snap-center relative overflow-hidden group"
                onClick={onEmergencyCardClick}
                data-testid="button-emergency-card"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 md:mb-7 lg:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <AlertCircle className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3">
                      {t.dashboard.emergencyCardTitle}
                    </h3>
                    <p className="text-sm md:text-base lg:text-lg text-red-100">
                      {t.dashboard.emergencyCardDesc}
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.97 }} 
                className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[360px] bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-3xl p-8 md:p-10 lg:p-12 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-500 snap-center relative overflow-hidden group"
                onClick={onMedicationsClick}
                data-testid="button-medications"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 md:mb-7 lg:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Pill className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3">
                      {t.dashboard.medicationsTitle}
                    </h3>
                    <p className="text-sm md:text-base lg:text-lg text-green-100">
                      {t.dashboard.medicationsDesc}
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900" data-testid="text-recent-documents-title">{t.dashboard.recentDocuments}</h2>
                <p className="text-sm text-gray-500" data-testid="text-recent-documents-subtitle">{t.dashboard.recentDocsSubtitle}</p>
              </div>
              <button 
                className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"
                onClick={onViewAllDocumentsClick}
                data-testid="button-view-all-documents"
              >
                {t.dashboard.viewAll}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {isLoadingDocuments ? (
              <div className="bg-gray-50 rounded-xl p-6 text-center" data-testid="loading-documents">
                <p className="text-sm text-gray-500">Loading documents...</p>
              </div>
            ) : recentDocuments.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" data-testid="recent-documents-list">
                {recentDocuments.map((doc, index) => (
                  <motion.div 
                    key={doc.id} 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.1 * index }} 
                    whileTap={{ scale: 0.95 }} 
                    className="flex-shrink-0 bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onDocumentClick?.(doc.id)}
                    data-testid={`card-document-${doc.id}`}
                  >
                    <div className="w-20 h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-900 truncate w-20" data-testid={`text-document-type-${doc.id}`}>{doc.type}</p>
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      {doc.date && (
                        <p className="flex items-center gap-1" data-testid={`text-document-report-date-${doc.id}`}>
                          <Calendar className="w-3 h-3" />
                          <span className="truncate">{doc.date}</span>
                        </p>
                      )}
                      {doc.uploadDate && (
                        <p className={`flex items-center gap-1 ${doc.date ? 'text-gray-400 text-[10px]' : ''}`} data-testid={`text-document-upload-date-${doc.id}`}>
                          {!doc.date && <Calendar className="w-3 h-3" />}
                          <span className="truncate">
                            {doc.uploadDate}
                            {doc.uploadTime && <span className="ml-1">• {doc.uploadTime}</span>}
                          </span>
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center" data-testid="empty-documents">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t.dashboard.noDocuments}</p>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900" data-testid="text-ai-insights-title">{t.dashboard.aiHealthInsights}</h2>
                <p className="text-sm text-gray-500" data-testid="text-ai-insights-subtitle">{t.dashboard.insightsSubtitle}</p>
              </div>
              {onChatbotClick && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onChatbotClick}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Open chatbot"
                  data-testid="button-chatbot"
                >
                  <MessageCircle className="w-5 h-5 text-gray-700" />
                </motion.button>
              )}
            </div>

            {healthInsight ? (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm" data-testid="card-health-insight">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(healthInsight.status)} mt-1`} data-testid="indicator-health-status" />
                  <p className="text-sm text-gray-700 flex-1" data-testid="text-health-insight-message">{healthInsight.message}</p>
                </div>
                <button 
                  className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"
                  onClick={onViewFullReportClick}
                  data-testid="button-view-full-report"
                >
                  {t.dashboard.viewFullReport}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center" data-testid="empty-insights">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t.dashboard.noInsights}</p>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-gray-900" data-testid="text-nearby-clinics-title">{t.dashboard.nearbyClinics}</h2>
            {isLoadingClinics ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : clinicsError ? (
              <div className="bg-white rounded-xl border border-amber-200 p-4 text-center bg-amber-50">
                <MapPin className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-amber-900 mb-1">Location access required</p>
                <p className="text-xs text-amber-700 mb-3">{clinicsError}</p>
                {onRequestLocation && (
                  <button
                    onClick={onRequestLocation}
                    className="text-sm px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Enable Location
                  </button>
                )}
              </div>
            ) : nearbyClinics.length > 0 ? (
              <div className="space-y-3" data-testid="nearby-clinics-list">
                {nearbyClinics.map((clinic, index) => (
                  <motion.div 
                    key={clinic.id} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.1 * index }} 
                    className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                    data-testid={`card-clinic-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900" data-testid={`text-clinic-name-${index}`}>{clinic.name}</p>
                        <p className="text-xs text-gray-500" data-testid={`text-clinic-distance-${index}`}>
                          {clinic.distance.toFixed(1)} km away
                        </p>
                        {clinic.address && (
                          <p className="text-xs text-gray-400 mt-0.5">{clinic.address}</p>
                        )}
                      </div>
                    </div>
                    <button 
                      className="text-blue-600 text-xs font-medium hover:underline"
                      onClick={() => onDirectionsClick?.({ 
                        name: clinic.name, 
                        latitude: clinic.latitude, 
                        longitude: clinic.longitude,
                        address: clinic.address 
                      })}
                      data-testid={`button-directions-${index}`}
                    >
                      {t.dashboard.directions}
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  {isLoadingClinics 
                    ? "Searching for nearby clinics..." 
                    : "No clinics found nearby"}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  {isLoadingClinics 
                    ? "Please wait while we search..." 
                    : clinicsError 
                      ? `Error: ${clinicsError}. Please check browser console for details.`
                      : "Try enabling location access or check if there are clinics in your area"}
                </p>
                {onRequestLocation && (
                  <button
                    onClick={() => {
                      console.log('[Dashboard] Manual location request clicked');
                      console.log('[Dashboard] Current state:', { isLoadingClinics, clinicsError });
                      onRequestLocation();
                    }}
                    className="text-xs px-3 py-1.5 text-blue-600 hover:text-blue-700 underline"
                  >
                    {isLoadingClinics ? "Searching..." : "Try refreshing location"}
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  💡 Open browser console (F12) to see detailed logs
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {(isOffline || pendingActions > 0) && (
        <motion.div 
          initial={{ y: 100 }} 
          animate={{ y: 0 }} 
          className="fixed bottom-20 left-0 right-0 mx-6 bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-lg"
          data-testid="offline-indicator"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-amber-900" data-testid="text-offline-status">
              {isOffline && `${t.common.offline} — `}
              {pendingActions > 0 && `${pendingActions} ${t.dashboard.actionsPending}`}
            </span>
          </div>
        </motion.div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 md:px-8 lg:px-10 py-3 md:py-4 lg:py-5 flex items-center justify-around shadow-lg max-w-[390px] md:max-w-[448px] lg:max-w-[512px] xl:max-w-[576px] mx-auto" data-testid="bottom-nav">
        {[
          { id: 'home', icon: Home, label: t.dashboard.home },
          { id: 'vault', icon: FolderOpen, label: t.dashboard.vault },
          { id: 'share', icon: Share2, label: t.common.share },
          { id: 'emergency', icon: AlertCircle, label: t.dashboard.emergency },
          { id: 'profile', icon: User, label: t.dashboard.profile }
        ].map(({ id, icon: Icon, label }) => (
          <motion.button 
            key={id} 
            whileTap={{ scale: 0.9 }} 
            onClick={() => handleTabClick(id)} 
            className={`flex flex-col items-center gap-1 md:gap-1.5 lg:gap-2 py-2 md:py-2.5 lg:py-3 px-3 md:px-4 lg:px-5 rounded-lg transition-colors ${
              activeTab === id ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'
            }`}
            data-testid={`button-nav-${id}`}
          >
            <Icon className={guidedMode ? 'w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9' : 'w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8'} />
            <span className={guidedMode ? 'text-xs md:text-sm lg:text-base font-medium' : 'text-[10px] md:text-xs lg:text-sm font-medium'} data-testid={`text-nav-${id}`}>
              {label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
