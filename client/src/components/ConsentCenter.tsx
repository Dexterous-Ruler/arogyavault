import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  FileText, 
  AlertCircle, 
  History, 
  X, 
  RefreshCw, 
  WifiOff, 
  Shield, 
  Stethoscope, 
  Building2, 
  Users, 
  Briefcase 
} from 'lucide-react';

type ConsentStatus = 'active' | 'pending' | 'expired';
type ConsentRole = 'doctor' | 'lab' | 'family' | 'insurer';
type ConsentScope = 'docs' | 'emergency' | 'timebound';

type Consent = {
  id: string;
  granteeName: string;
  role: ConsentRole;
  expiryDate: string;
  scopes: ConsentScope[];
  purpose: string;
  status: ConsentStatus;
  isOffline?: boolean;
};

type ConsentCenterProps = {
  initialConsents?: Consent[];
  onBack?: () => void;
  onGrantConsent?: () => void;
  onRevokeConsent?: (id: string) => void;
  onViewAudit?: (id: string) => void;
  onManageOfflineQueue?: () => void;
  language?: 'en' | 'hi';
};

const mockConsents: Consent[] = [
  {
    id: '1',
    granteeName: 'Dr. Sharma',
    role: 'doctor',
    expiryDate: '14 Oct 2025',
    scopes: ['docs', 'emergency', 'timebound'],
    purpose: 'Treatment',
    status: 'active'
  },
  {
    id: '2',
    granteeName: 'Apollo Lab',
    role: 'lab',
    expiryDate: '20 Dec 2024',
    scopes: ['docs'],
    purpose: 'Lab Results Sharing',
    status: 'active'
  },
  {
    id: '3',
    granteeName: 'Family Member',
    role: 'family',
    expiryDate: 'Syncing...',
    scopes: ['docs', 'emergency'],
    purpose: 'Emergency Access',
    status: 'pending',
    isOffline: true
  },
  {
    id: '4',
    granteeName: 'Star Health Insurance',
    role: 'insurer',
    expiryDate: '01 Jan 2024',
    scopes: ['docs'],
    purpose: 'Insurance Claim',
    status: 'expired'
  }
];

const translations = {
  en: {
    title: 'Consent Center',
    tabActive: 'Active',
    tabPending: 'Pending',
    tabExpired: 'Expired',
    expires: 'Expires',
    expired: 'Expired on',
    scopeDocs: 'Docs',
    scopeEmergency: 'Emergency Card',
    scopeTimebound: 'Time-bound',
    revoke: 'Revoke',
    renew: 'Renew',
    auditLog: 'Audit Log',
    offlineBanner: 'consents waiting to sync. Tap to manage.',
    emptyActive: 'No active consents',
    emptyActiveDesc: 'Grant access to doctors, labs, or family members.',
    emptyPending: 'No offline consents queued',
    emptyExpired: 'No expired consents',
    grantConsent: 'Grant Consent',
    roleDoctor: 'Doctor',
    roleLab: 'Lab',
    roleFamily: 'Family',
    roleInsurer: 'Insurer',
    revokeTitle: 'Revoke Consent?',
    revokeDesc: 'This will immediately revoke access for',
    revokeConfirm: 'Yes, Revoke',
    revokeCancel: 'Cancel'
  },
  hi: {
    title: 'सहमति केंद्र',
    tabActive: 'सक्रिय',
    tabPending: 'लंबित',
    tabExpired: 'समाप्त',
    expires: 'समाप्त होगा',
    expired: 'समाप्त हुआ',
    scopeDocs: 'दस्तावेज़',
    scopeEmergency: 'आपातकालीन कार्ड',
    scopeTimebound: 'समयबद्ध',
    revoke: 'रद्द करें',
    renew: 'नवीनीकृत करें',
    auditLog: 'ऑडिट लॉग',
    offlineBanner: 'सहमतियाँ सिंक होने की प्रतीक्षा में। प्रबंधित करने के लिए टैप करें।',
    emptyActive: 'कोई सक्रिय सहमति नहीं है',
    emptyActiveDesc: 'डॉक्टरों, प्रयोगशालाओं या परिवार के सदस्यों को पहुँच प्रदान करें।',
    emptyPending: 'कोई लंबित ऑफ़लाइन सहमति नहीं',
    emptyExpired: 'कोई समाप्त सहमति नहीं',
    grantConsent: 'नई सहमति दें',
    roleDoctor: 'डॉक्टर',
    roleLab: 'प्रयोगशाला',
    roleFamily: 'परिवार',
    roleInsurer: 'बीमा',
    revokeTitle: 'सहमति रद्द करें?',
    revokeDesc: 'यह तुरंत पहुँच रद्द कर देगा',
    revokeConfirm: 'हां, रद्द करें',
    revokeCancel: 'रद्द करें'
  }
};

const getRoleIcon = (role: ConsentRole) => {
  switch (role) {
    case 'doctor':
      return Stethoscope;
    case 'lab':
      return Building2;
    case 'family':
      return Users;
    case 'insurer':
      return Briefcase;
  }
};

const getRoleBadgeColor = (role: ConsentRole) => {
  switch (role) {
    case 'doctor':
      return 'bg-blue-100 text-blue-700';
    case 'lab':
      return 'bg-purple-100 text-purple-700';
    case 'family':
      return 'bg-green-100 text-green-700';
    case 'insurer':
      return 'bg-orange-100 text-orange-700';
  }
};

const getScopeIcon = (scope: ConsentScope) => {
  switch (scope) {
    case 'docs':
      return FileText;
    case 'emergency':
      return AlertCircle;
    case 'timebound':
      return Clock;
  }
};

export const ConsentCenter = ({
  initialConsents = mockConsents,
  onBack,
  onGrantConsent,
  onRevokeConsent,
  onViewAudit,
  onManageOfflineQueue,
  language = 'en'
}: ConsentCenterProps) => {
  const [activeTab, setActiveTab] = useState<ConsentStatus>('active');
  const [consents, setConsents] = useState<Consent[]>(initialConsents);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null);

  const t = translations[language];
  const filteredConsents = consents.filter(c => c.status === activeTab);
  const pendingCount = consents.filter(c => c.status === 'pending' && c.isOffline).length;

  const handleRevoke = (consent: Consent) => {
    setSelectedConsent(consent);
    setRevokeModalOpen(true);
  };

  const confirmRevoke = () => {
    if (selectedConsent) {
      setConsents(consents.filter(c => c.id !== selectedConsent.id));
      onRevokeConsent?.(selectedConsent.id);
      setRevokeModalOpen(false);
      setSelectedConsent(null);
    }
  };

  const handleRenew = (consent: Consent) => {
    onGrantConsent?.();
  };

  return (
    <div className="h-screen w-full max-w-[390px] mx-auto bg-white flex flex-col overflow-hidden" data-testid="consent-center-container">
      {/* Header */}
      <div className="flex-shrink-0 sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" 
            aria-label="Go back"
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-900" data-testid="text-page-title">{t.title}</h1>
          
          <button 
            className="p-2 -mr-2 hover:bg-blue-50 rounded-full transition-colors" 
            onClick={onGrantConsent} 
            aria-label="Add consent"
            data-testid="button-add-consent-header"
          >
            <Plus className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1" data-testid="tabs-container">
            <button 
              onClick={() => setActiveTab('active')} 
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-active"
            >
              {t.tabActive}
            </button>
            <button 
              onClick={() => setActiveTab('pending')} 
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-pending"
            >
              {t.tabPending}
            </button>
            <button 
              onClick={() => setActiveTab('expired')} 
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'expired' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-expired"
            >
              {t.tabExpired}
            </button>
          </div>
        </div>
      </div>

      {/* Offline Banner */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 bg-amber-50 border-b border-amber-100 px-4 py-3"
          data-testid="offline-banner"
        >
          <button 
            onClick={onManageOfflineQueue} 
            className="w-full flex items-center gap-3 text-left"
            data-testid="button-offline-queue"
          >
            <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span className="text-sm text-amber-800">
              <strong>{pendingCount}</strong> {t.offlineBanner}
            </span>
          </button>
        </motion.div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          {filteredConsents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center px-6 py-16 text-center"
              data-testid="empty-state"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid="text-empty-title">
                {activeTab === 'active' && t.emptyActive}
                {activeTab === 'pending' && t.emptyPending}
                {activeTab === 'expired' && t.emptyExpired}
              </h3>
              {activeTab === 'active' && (
                <p className="text-sm text-gray-600 mb-6 max-w-xs" data-testid="text-empty-desc">
                  {t.emptyActiveDesc}
                </p>
              )}
              <button 
                onClick={onGrantConsent} 
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                data-testid="button-grant-consent-empty"
              >
                {t.grantConsent}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-4 space-y-3"
              data-testid="consent-list"
            >
              {filteredConsents.map((consent, index) => {
                const RoleIcon = getRoleIcon(consent.role);
                return (
                  <motion.div
                    key={consent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white border rounded-xl p-4 shadow-sm ${
                      consent.status === 'expired' ? 'border-gray-200 bg-gray-50' : 'border-gray-200'
                    } ${consent.isOffline ? 'opacity-70' : ''}`}
                    data-testid={`consent-card-${consent.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleBadgeColor(consent.role)}`}>
                          <RoleIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base" data-testid={`text-grantee-${consent.id}`}>
                            {consent.granteeName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(consent.role)}`} data-testid={`badge-role-${consent.id}`}>
                              {t[`role${consent.role.charAt(0).toUpperCase() + consent.role.slice(1)}` as keyof typeof t]}
                            </span>
                            {consent.isOffline && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1" data-testid={`badge-offline-${consent.id}`}>
                                <WifiOff className="w-3 h-3" />
                                Offline
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500" data-testid={`text-expiry-label-${consent.id}`}>
                          {consent.status === 'expired' ? t.expired : t.expires}
                        </div>
                        <div className="text-sm font-medium text-gray-700" data-testid={`text-expiry-date-${consent.id}`}>
                          {consent.expiryDate}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2" data-testid={`scopes-${consent.id}`}>
                        {consent.scopes.map(scope => {
                          const ScopeIcon = getScopeIcon(scope);
                          return (
                            <div 
                              key={scope} 
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
                              data-testid={`scope-${scope}-${consent.id}`}
                            >
                              <ScopeIcon className="w-3.5 h-3.5" />
                              {t[`scope${scope.charAt(0).toUpperCase() + scope.slice(1)}` as keyof typeof t]}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-sm text-gray-600 mt-2" data-testid={`text-purpose-${consent.id}`}>
                        Purpose: {consent.purpose}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {consent.status === 'expired' ? (
                        <button 
                          onClick={() => handleRenew(consent)} 
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          data-testid={`button-renew-${consent.id}`}
                        >
                          <RefreshCw className="w-4 h-4" />
                          {t.renew}
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleRevoke(consent)} 
                            className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                            data-testid={`button-revoke-${consent.id}`}
                          >
                            {t.revoke}
                          </button>
                          <button 
                            onClick={() => onViewAudit?.(consent.id)} 
                            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                            data-testid={`button-audit-${consent.id}`}
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onGrantConsent}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors z-20"
        aria-label="Grant new consent"
        data-testid="button-fab-grant"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Revoke Modal */}
      <AnimatePresence>
        {revokeModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setRevokeModalOpen(false)}
              data-testid="revoke-modal-backdrop"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 z-50 max-w-[390px] mx-auto"
              data-testid="revoke-modal"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1" data-testid="text-revoke-title">
                    {t.revokeTitle}
                  </h3>
                  <p className="text-sm text-gray-600" data-testid="text-revoke-desc">
                    {t.revokeDesc} <strong>{selectedConsent?.granteeName}</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setRevokeModalOpen(false)} 
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  data-testid="button-close-revoke-modal"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setRevokeModalOpen(false)} 
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  data-testid="button-cancel-revoke"
                >
                  {t.revokeCancel}
                </button>
                <button 
                  onClick={confirmRevoke} 
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                  data-testid="button-confirm-revoke"
                >
                  {t.revokeConfirm}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
