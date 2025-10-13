import { motion } from 'framer-motion';
import { Plus, Heart, FileText, BarChart3, Bell, Search, Globe, Mic, ChevronRight, Calendar, Pill, MapPin, WifiOff, Home, FolderOpen, Share2, AlertCircle, User } from 'lucide-react';
import { useState } from 'react';

type MediLockerDashboardProps = {
  language?: 'en' | 'hi';
  guidedMode?: boolean;
  isOffline?: boolean;
  pendingActions?: number;
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
  onDirectionsClick?: (clinic: string) => void;
  onBottomNavClick?: (tabId: string) => void;
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
    appName: 'MediLocker',
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
    appName: 'मेडीलॉकर',
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

export const MediLockerDashboard = (props: MediLockerDashboardProps) => {
  const {
    language = 'en',
    guidedMode = false,
    isOffline = false,
    pendingActions = 0,
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
    onBottomNavClick
  } = props;
  
  const t = translations[language];
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
    <div className="flex flex-col h-screen w-full max-w-[390px] mx-auto bg-white" data-testid="dashboard-container">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between" data-testid="header">
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-blue-600" data-testid="icon-app-logo" />
          <span className="text-xl font-bold text-gray-900" data-testid="text-app-name">{t.appName}</span>
        </div>
        <div className="flex items-center gap-3">
          {guidedMode && (
            <motion.button 
              whileTap={{ scale: 0.95 }} 
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={onMicClick}
              data-testid="button-mic"
            >
              <Mic className="w-5 h-5 text-gray-700" />
            </motion.button>
          )}
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={onLanguageToggle}
            data-testid="button-language-toggle"
          >
            <Globe className="w-5 h-5 text-gray-700" />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={onNotificationsClick}
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5 text-gray-700" />
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={onSearchClick}
            data-testid="button-search"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-6 pt-6 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-4"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1" data-testid="text-quick-actions-title">
                {t.quickActions}
              </h2>
              <p className="text-sm text-gray-500" data-testid="text-quick-actions-subtitle">
                {t.quickActionsSubtitle}
              </p>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory" data-testid="quick-actions-container">
              <motion.button 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.97 }} 
                className="flex-shrink-0 w-[280px] bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-500 snap-center relative overflow-hidden group"
                onClick={onUploadRecordsClick}
                data-testid="button-upload-records"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Plus className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {t.uploadRecords}
                    </h3>
                    <p className="text-sm text-blue-100">
                      {t.uploadRecordsDesc}
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.97 }} 
                className="flex-shrink-0 w-[280px] bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-3xl p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-500 snap-center relative overflow-hidden group"
                onClick={onAiInsightsClick}
                data-testid="button-ai-insights"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {t.aiInsights}
                    </h3>
                    <p className="text-sm text-purple-100">
                      {t.aiInsightsDesc}
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.97 }} 
                className="flex-shrink-0 w-[280px] bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-500 snap-center relative overflow-hidden group"
                onClick={onEmergencyCardClick}
                data-testid="button-emergency-card"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <AlertCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {t.emergencyCardTitle}
                    </h3>
                    <p className="text-sm text-red-100">
                      {t.emergencyCardDesc}
                    </p>
                  </div>
                </div>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.97 }} 
                className="flex-shrink-0 w-[280px] bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-3xl p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-500 snap-center relative overflow-hidden group"
                onClick={onMedicationsClick}
                data-testid="button-medications"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Pill className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {t.medicationsTitle}
                    </h3>
                    <p className="text-sm text-green-100">
                      {t.medicationsDesc}
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
                <h2 className="text-lg font-bold text-gray-900" data-testid="text-recent-documents-title">{t.recentDocuments}</h2>
                <p className="text-sm text-gray-500" data-testid="text-recent-documents-subtitle">{t.recentDocsSubtitle}</p>
              </div>
              <button 
                className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"
                onClick={onViewAllDocumentsClick}
                data-testid="button-view-all-documents"
              >
                {t.viewAll}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {recentDocuments.length > 0 ? (
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
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1" data-testid={`text-document-date-${doc.id}`}>
                      <Calendar className="w-3 h-3" />
                      {doc.date}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center" data-testid="empty-documents">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t.noDocuments}</p>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }} 
            className="space-y-4"
          >
            <div>
              <h2 className="text-lg font-bold text-gray-900" data-testid="text-ai-insights-title">{t.aiHealthInsights}</h2>
              <p className="text-sm text-gray-500" data-testid="text-ai-insights-subtitle">{t.insightsSubtitle}</p>
            </div>

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
                {t.viewFullReport}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-gray-900" data-testid="text-nearby-clinics-title">{t.nearbyClinics}</h2>
            <div className="space-y-3" data-testid="nearby-clinics-list">
              {['City Hospital', 'DiagnoLab', 'HealthCare Clinic'].map((clinic, index) => (
                <motion.div 
                  key={clinic} 
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
                      <p className="text-sm font-medium text-gray-900" data-testid={`text-clinic-name-${index}`}>{clinic}</p>
                      <p className="text-xs text-gray-500" data-testid={`text-clinic-distance-${index}`}>{(index + 1) * 0.5} km away</p>
                    </div>
                  </div>
                  <button 
                    className="text-blue-600 text-xs font-medium hover:underline"
                    onClick={() => onDirectionsClick?.(clinic)}
                    data-testid={`button-directions-${index}`}
                  >
                    {t.directions}
                  </button>
                </motion.div>
              ))}
            </div>
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
              {isOffline && `${t.offline} — `}
              {pendingActions > 0 && `${pendingActions} ${t.actionsPending}`}
            </span>
          </div>
        </motion.div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-around shadow-lg" data-testid="bottom-nav">
        {[
          { id: 'home', icon: Home, label: t.home },
          { id: 'vault', icon: FolderOpen, label: t.vault },
          { id: 'share', icon: Share2, label: t.share },
          { id: 'emergency', icon: AlertCircle, label: t.emergency },
          { id: 'profile', icon: User, label: t.profile }
        ].map(({ id, icon: Icon, label }) => (
          <motion.button 
            key={id} 
            whileTap={{ scale: 0.9 }} 
            onClick={() => handleTabClick(id)} 
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              activeTab === id ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'
            }`}
            data-testid={`button-nav-${id}`}
          >
            <Icon className={guidedMode ? 'w-7 h-7' : 'w-6 h-6'} />
            <span className={guidedMode ? 'text-xs font-medium' : 'text-[10px] font-medium'} data-testid={`text-nav-${id}`}>
              {label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
