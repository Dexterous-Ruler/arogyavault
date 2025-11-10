import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, MoreVertical, FileText, Image as ImageIcon, Scan, ChevronDown, ChevronUp, Volume2, ExternalLink, CheckCircle2, AlertCircle, AlertTriangle, Clock, Edit2, Users, Trash2 } from 'lucide-react';

type DocumentType = 'Lab' | 'Prescription' | 'Imaging' | 'Bill';
type FileType = 'PDF' | 'JPG' | 'PNG' | 'DICOM' | 'IMAGE';
type AIStatus = 'normal' | 'warning' | 'urgent' | 'none';
type SyncStatus = 'synced' | 'pending';

type DocumentMetadata = {
  title: string;
  type: DocumentType;
  provider: string;
  date: string;
  tags: string[];
  version: string;
  lastUpdated: string;
  syncStatus: SyncStatus;
};

type AIInsight = {
  status: AIStatus;
  summary: string;
  hasFullAnalysis: boolean;
};

type VersionHistoryItem = {
  version: string;
  timestamp: string;
  note: string;
};

type AccessItem = {
  name: string;
  role: string;
  expiry: string;
};

type DocumentDetailScreenProps = {
  fileType?: FileType;
  metadata?: DocumentMetadata;
  aiInsight?: AIInsight;
  versionHistory?: VersionHistoryItem[];
  accessList?: AccessItem[];
  language?: 'en' | 'hi';
  fileUrl?: string;
  onBack?: () => void;
  onShare?: () => void;
  onViewFullscreen?: () => void;
  onViewDICOM?: () => void;
  onViewFullAnalysis?: () => void;
  onManageAccess?: () => void;
  onVersionClick?: (version: string) => void;
  onEditMetadata?: () => void;
  onMoreOptions?: () => void;
  onDelete?: () => void;
};

const defaultMetadata: DocumentMetadata = {
  title: 'Blood Test Report - Complete Panel',
  type: 'Lab',
  provider: 'Apollo Diagnostics',
  date: '15 Jan 2024',
  tags: ['Blood Test', 'Routine Checkup', 'Diabetes'],
  version: 'v1.0',
  lastUpdated: '15 Jan 2024',
  syncStatus: 'synced'
};

const defaultAIInsight: AIInsight = {
  status: 'warning',
  summary: 'Your sugar level is slightly higher than normal. Consider consulting your doctor within 48 hours.',
  hasFullAnalysis: true
};

const defaultVersionHistory: VersionHistoryItem[] = [
  {
    version: 'v1.0',
    timestamp: '15 Jan 2024, 10:30 AM',
    note: 'Initial upload'
  },
  {
    version: 'v0.9',
    timestamp: '14 Jan 2024, 3:45 PM',
    note: 'Re-uploaded with updated report'
  }
];

const defaultAccessList: AccessItem[] = [
  {
    name: 'Dr. Sharma',
    role: 'General Physician',
    expiry: 'Expires in 7 days'
  },
  {
    name: 'Apollo Diagnostics',
    role: 'Lab Partner',
    expiry: 'Expires in 30 days'
  }
];

const translations = {
  en: {
    back: 'Back',
    share: 'Share',
    viewFullscreen: 'View Fullscreen',
    viewInViewer: 'View in DICOM Viewer',
    documentTitle: 'Document Title',
    type: 'Type',
    provider: 'Provider',
    date: 'Date',
    tags: 'Tags',
    version: 'Version',
    lastUpdated: 'Last updated',
    synced: 'Synced just now',
    pending: 'Pending upload',
    aiHealthSummary: 'AI Health Summary',
    allNormal: 'All values normal',
    someValuesWarning: 'Some values flagged',
    urgent: 'See doctor immediately',
    viewFullAnalysis: 'View Full Analysis',
    disclaimer: 'This is not a medical diagnosis.',
    noSummary: 'No summary available. This document may not contain lab data.',
    versionHistory: 'Version History',
    showHistory: 'Show Version History',
    hideHistory: 'Hide Version History',
    consentAccess: 'Current Access',
    manageAccess: 'Manage Access',
    edit: 'Edit'
  },
  hi: {
    back: 'वापस',
    share: 'साझा करें',
    viewFullscreen: 'पूर्ण स्क्रीन देखें',
    viewInViewer: 'DICOM व्यूअर में देखें',
    documentTitle: 'दस्तावेज़ शीर्षक',
    type: 'प्रकार',
    provider: 'प्रदाता',
    date: 'तारीख',
    tags: 'टैग',
    version: 'संस्करण',
    lastUpdated: 'अंतिम अपडेट',
    synced: 'अभी सिंक किया गया',
    pending: 'लंबित अपलोड',
    aiHealthSummary: 'एआई स्वास्थ्य सारांश',
    allNormal: 'सभी मान सामान्य हैं',
    someValuesWarning: 'कुछ मानों पर ध्यान दें',
    urgent: 'तुरंत डॉक्टर से परामर्श करें',
    viewFullAnalysis: 'पूर्ण विश्लेषण देखें',
    disclaimer: 'यह चिकित्सीय निदान नहीं है।',
    noSummary: 'कोई सारांश उपलब्ध नहीं है। इस दस्तावेज़ में लैब डेटा नहीं हो सकता है।',
    versionHistory: 'संस्करण इतिहास',
    showHistory: 'संस्करण इतिहास दिखाएं',
    hideHistory: 'संस्करण इतिहास छुपाएं',
    consentAccess: 'वर्तमान पहुंच',
    manageAccess: 'पहुंच प्रबंधित करें',
    edit: 'संपादित करें'
  }
};

const getFileIcon = (fileType: FileType) => {
  switch (fileType) {
    case 'PDF':
      return FileText;
    case 'JPG':
    case 'PNG':
      return ImageIcon;
    case 'DICOM':
      return Scan;
    default:
      return FileText;
  }
};

const getAIStatusIcon = (status: AIStatus) => {
  switch (status) {
    case 'normal':
      return CheckCircle2;
    case 'warning':
      return AlertTriangle;
    case 'urgent':
      return AlertCircle;
    default:
      return null;
  }
};

const getAIStatusColor = (status: AIStatus) => {
  switch (status) {
    case 'normal':
      return 'text-green-600 bg-green-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'urgent':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getAIStatusText = (status: AIStatus, lang: 'en' | 'hi') => {
  const t = translations[lang];
  switch (status) {
    case 'normal':
      return t.allNormal;
    case 'warning':
      return t.someValuesWarning;
    case 'urgent':
      return t.urgent;
    default:
      return '';
  }
};

export const DocumentDetailScreen = (props: DocumentDetailScreenProps) => {
  const {
    fileType = 'PDF',
    metadata = defaultMetadata,
    aiInsight = defaultAIInsight,
    versionHistory = defaultVersionHistory,
    accessList = defaultAccessList,
    language = 'en',
    fileUrl,
    onBack,
    onShare,
    onViewFullscreen,
    onViewDICOM,
    onViewFullAnalysis,
    onManageAccess,
    onVersionClick,
    onEditMetadata,
    onMoreOptions,
    onDelete
  } = props;

  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  const t = translations[language];
  const FileIcon = getFileIcon(fileType);
  const AIStatusIcon = aiInsight.status !== 'none' ? getAIStatusIcon(aiInsight.status) : null;

  return (
    <div className="h-screen w-full max-w-[390px] md:max-w-[448px] lg:max-w-[512px] xl:max-w-[576px] mx-auto bg-white flex flex-col overflow-hidden">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 md:py-4">
          <button 
            onClick={onBack} 
            className="p-2 md:p-3 -ml-2 hover:bg-gray-100 rounded-full transition-colors" 
            aria-label={t.back}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-700" />
          </button>

          <h1 className="flex-1 text-base md:text-lg lg:text-xl font-semibold text-gray-900 truncate mx-3 text-center" data-testid="text-document-title">
            {metadata.title}
          </h1>

          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={onShare} 
              className="p-2 md:p-3 hover:bg-gray-100 rounded-full transition-colors" 
              aria-label={t.share}
              data-testid="button-share"
            >
              <Share2 className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-700" />
            </button>
            <button 
              onClick={() => setShowDeleteMenu(!showDeleteMenu)}
              className="p-2 md:p-3 hover:bg-gray-100 rounded-full transition-colors relative" 
              aria-label="More options"
              data-testid="button-more-options"
            >
              <MoreVertical className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-700" />
              {showDeleteMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteMenu(false);
                      onDelete?.();
                    }}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Document
                  </button>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showDeleteMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDeleteMenu(false)}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.3 }}
        >
          <div className="relative h-[280px] md:h-[400px] lg:h-[500px] bg-gray-100 border-b border-gray-200">
            {(fileType === 'JPG' || fileType === 'PNG' || fileType === 'IMAGE') && fileUrl ? (
              <div className="h-full w-full relative">
                <img 
                  src={fileUrl} 
                  alt={metadata.title}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={onViewFullscreen}
                  onError={(e) => {
                    console.error('Failed to load document image');
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <button
                  onClick={onViewFullscreen}
                  className="absolute bottom-4 md:bottom-6 lg:bottom-8 right-4 md:right-6 lg:right-8 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 lg:py-3 bg-black/50 hover:bg-black/70 text-white text-sm md:text-base lg:text-lg font-medium rounded-lg flex items-center gap-2 transition-colors"
                  data-testid="button-view-fullscreen"
                >
                  <ExternalLink className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  {t.viewFullscreen}
                </button>
              </div>
            ) : (fileType === 'PDF' || fileType === 'JPG' || fileType === 'PNG') ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileIcon className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-gray-400 mx-auto mb-4 md:mb-5 lg:mb-6" />
                  <button 
                    onClick={onViewFullscreen} 
                    className="text-sm md:text-base lg:text-lg text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 md:gap-2 mx-auto"
                    data-testid="button-view-fullscreen"
                  >
                    <ExternalLink className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                    {t.viewFullscreen}
                  </button>
                </div>
              </div>
            ) : null}

            {fileType === 'DICOM' && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Scan className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <button 
                    onClick={onViewDICOM} 
                    className="px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 bg-blue-600 text-white text-sm md:text-base lg:text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                    data-testid="button-view-dicom"
                  >
                    <ExternalLink className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                    {t.viewInViewer}
                  </button>
                </div>
              </div>
            )}

            <div className="absolute top-3 right-3">
              <span 
                className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full shadow-sm border border-gray-200"
                data-testid="text-file-type"
              >
                {fileType}
              </span>
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-5 lg:space-y-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.1 }} 
              className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 lg:p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900" data-testid="text-metadata-title">{metadata.title}</h2>
                    <button 
                      onClick={onEditMetadata}
                      className="p-1 md:p-1.5 lg:p-2 hover:bg-gray-100 rounded transition-colors"
                      data-testid="button-edit-metadata"
                    >
                      <Edit2 className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-400" />
                    </button>
                  </div>
                  <span 
                    className="inline-block px-2 md:px-3 lg:px-4 py-1 md:py-1.5 text-xs md:text-sm lg:text-base font-medium text-blue-700 bg-blue-50 rounded"
                    data-testid="text-document-type"
                  >
                    {metadata.type}
                  </span>
                </div>
              </div>

              <div className="space-y-2 md:space-y-3 text-sm md:text-base lg:text-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t.provider}</span>
                  <span className="font-medium text-gray-900" data-testid="text-provider">{metadata.provider}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t.date}</span>
                  <span className="font-medium text-gray-900" data-testid="text-date">{metadata.date}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {metadata.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full"
                      data-testid={`tag-${index}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span data-testid="text-version">{metadata.version} • {t.lastUpdated}: {metadata.lastUpdated}</span>
                <span className="flex items-center gap-1">
                  {metadata.syncStatus === 'synced' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span className="text-green-600" data-testid="text-sync-status">{t.synced}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-yellow-600" />
                      <span className="text-yellow-600" data-testid="text-sync-status">{t.pending}</span>
                    </>
                  )}
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.2 }} 
              className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 lg:p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900" data-testid="text-ai-summary-title">{t.aiHealthSummary}</h3>
                <button className="p-1 md:p-1.5 lg:p-2 hover:bg-gray-100 rounded transition-colors" data-testid="button-tts">
                  <Volume2 className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-gray-400" />
                </button>
              </div>

              {aiInsight.status !== 'none' ? (
                <>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 ${getAIStatusColor(aiInsight.status)}`}>
                    {AIStatusIcon && <AIStatusIcon className="w-5 h-5 flex-shrink-0" />}
                    <span className="text-sm font-medium" data-testid="text-ai-status">
                      {getAIStatusText(aiInsight.status, language)}
                    </span>
                  </div>

                  <p className="text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed mb-3 md:mb-4" data-testid="text-ai-summary">
                    {aiInsight.summary}
                  </p>

                  {aiInsight.hasFullAnalysis && (
                    <button 
                      onClick={onViewFullAnalysis} 
                      className="w-full px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 bg-blue-600 text-white text-sm md:text-base lg:text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      data-testid="button-view-full-analysis"
                    >
                      {t.viewFullAnalysis}
                    </button>
                  )}

                  <p className="text-xs md:text-sm lg:text-base text-gray-500 mt-3 md:mt-4 italic" data-testid="text-disclaimer">
                    {t.disclaimer}
                  </p>
                </>
              ) : (
                <p className="text-sm md:text-base lg:text-lg text-gray-600" data-testid="text-no-summary">
                  {t.noSummary}
                </p>
              )}
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.3 }} 
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
            >
              <button 
                onClick={() => setShowVersionHistory(!showVersionHistory)} 
                className="w-full flex items-center justify-between p-4 md:p-5 lg:p-6 hover:bg-gray-50 transition-colors"
                data-testid="button-toggle-version-history"
              >
                <span className="text-base md:text-lg lg:text-xl font-semibold text-gray-900">{t.versionHistory}</span>
                {showVersionHistory ? (
                  <ChevronUp className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-600" />
                )}
              </button>

              {showVersionHistory && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }} 
                  className="border-t border-gray-200"
                >
                  <div className="p-4 space-y-3">
                    {versionHistory.map((item, index) => (
                      <button 
                        key={index} 
                        onClick={() => onVersionClick?.(item.version)} 
                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        data-testid={`button-version-${index}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{item.version}</span>
                          <span className="text-xs text-gray-600">{item.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-600">{item.note}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.4 }} 
              className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 lg:p-6 shadow-sm mb-6 md:mb-8"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900" data-testid="text-access-title">{t.consentAccess}</h3>
                <Users className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-400" />
              </div>

              <div className="space-y-2 mb-3">
                {accessList.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    data-testid={`access-item-${index}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.role}</p>
                    </div>
                    <span className="text-xs text-gray-600">{item.expiry}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={onManageAccess} 
                className="w-full px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 border border-gray-300 text-gray-700 text-sm md:text-base lg:text-lg font-medium rounded-lg hover:bg-gray-50 transition-colors"
                data-testid="button-manage-access"
              >
                {t.manageAccess}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
