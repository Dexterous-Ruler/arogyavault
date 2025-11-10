import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Plus, FileText, Pill, FlaskConical, Image as ImageIcon, FileCheck, Tag, Upload, QrCode, Scan, WifiOff, ChevronRight, Trash2 } from 'lucide-react';
import { getDocumentPreview } from '@/lib/api/documents';
import { useTranslation } from '@/i18n/useTranslation';

type DocumentType = 'prescription' | 'lab' | 'imaging' | 'billing' | 'all';

type Document = {
  id: string;
  title: string;
  provider?: string;
  date: string;
  type: DocumentType;
  tags: string[];
  thumbnail?: string;
  fileType?: string;
  isOffline?: boolean;
};

type VaultDocumentTimelineProps = {
  language?: 'en' | 'hi';
  documents?: Document[];
  isLoading?: boolean;
  onBack?: () => void;
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: DocumentType) => void;
  onDocumentClick?: (docId: string) => void;
  onAddFileUpload?: () => void;
  onAddScanQR?: () => void;
  onAddDicomImport?: () => void;
  onOfflineSyncClick?: () => void;
  onDocumentDelete?: (docId: string) => void;
};

const mockDocuments: Document[] = [{
  id: '1',
  title: 'Lab Report',
  provider: 'Apollo Hospital',
  date: '12 Jul 2025',
  type: 'lab',
  tags: ['Lab', 'Blood Test']
}, {
  id: '2',
  title: 'Prescription',
  provider: 'Dr. Sharma',
  date: '10 Jul 2025',
  type: 'prescription',
  tags: ['Prescription', 'Diabetes']
}, {
  id: '3',
  title: 'X-Ray Chest',
  provider: 'Max Healthcare',
  date: '05 Jul 2025',
  type: 'imaging',
  tags: ['Imaging', 'X-Ray']
}, {
  id: '4',
  title: 'Insurance Claim',
  provider: 'ICICI Lombard',
  date: '01 Jul 2025',
  type: 'billing',
  tags: ['Insurance', 'Billing']
}];

const translations = {
  en: {
    title: 'My Records',
    search: 'Search',
    all: 'All',
    prescriptions: 'Prescriptions',
    labReports: 'Lab Reports',
    imaging: 'Imaging',
    billing: 'Bills & Insurance',
    emptyState: 'No documents yet',
    emptyAction: 'Add your first record',
    pendingSync: 'documents pending sync',
    addDocument: 'Add Document',
    camera: 'Camera',
    fileUpload: 'File Upload',
    scanQR: 'Scan QR',
    dicomImport: 'DICOM Import'
  },
  hi: {
    title: 'मेरे रिकॉर्ड',
    search: 'खोजें',
    all: 'सभी',
    prescriptions: 'पर्चे',
    labReports: 'लैब रिपोर्ट',
    imaging: 'इमेजिंग',
    billing: 'बिल',
    emptyState: 'कोई दस्तावेज़ नहीं मिला',
    emptyAction: 'अपना पहला रिकॉर्ड जोड़ें',
    pendingSync: 'दस्तावेज़ सिंक होने बाकी हैं',
    addDocument: 'दस्तावेज़ जोड़ें',
    camera: 'कैमरा',
    fileUpload: 'फ़ाइल अपलोड',
    scanQR: 'QR स्कैन करें',
    dicomImport: 'DICOM आयात'
  }
};

const filterOptions: Array<{
  id: DocumentType;
  icon: React.ReactNode;
}> = [{
  id: 'all',
  icon: <FileText className="w-4 h-4" />
}, {
  id: 'prescription',
  icon: <Pill className="w-4 h-4" />
}, {
  id: 'lab',
  icon: <FlaskConical className="w-4 h-4" />
}, {
  id: 'imaging',
  icon: <ImageIcon className="w-4 h-4" />
}, {
  id: 'billing',
  icon: <FileCheck className="w-4 h-4" />
}];

const documentTypeIcons: Record<DocumentType, React.ReactNode> = {
  all: <FileText className="w-6 h-6 text-blue-600" />,
  prescription: <Pill className="w-6 h-6 text-purple-600" />,
  lab: <FlaskConical className="w-6 h-6 text-green-600" />,
  imaging: <ImageIcon className="w-6 h-6 text-orange-600" />,
  billing: <FileCheck className="w-6 h-6 text-indigo-600" />
};

export const VaultDocumentTimeline = ({
  documents: propDocuments,
  isLoading = false,
  onBack,
  onSearch,
  onFilterChange,
  onDocumentClick,
  onAddFileUpload,
  onAddScanQR,
  onAddDicomImport,
  onOfflineSyncClick,
  onDocumentDelete
}: VaultDocumentTimelineProps) => {
  const { translations: t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<DocumentType>('all');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [offlineCount] = useState(3);
  const [documentThumbnails, setDocumentThumbnails] = useState<Record<string, string>>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState<Set<string>>(new Set());

  // Load thumbnails for image documents
  useEffect(() => {
    const loadThumbnails = async () => {
      if (!propDocuments) return;
      
      const imageDocs = propDocuments.filter(doc => 
        doc.fileType && (doc.fileType === 'IMAGE' || doc.fileType === 'JPG' || doc.fileType === 'PNG')
      );
      
      for (const doc of imageDocs) {
        if (documentThumbnails[doc.id] || loadingThumbnails.has(doc.id)) continue;
        
        setLoadingThumbnails(prev => new Set(prev).add(doc.id));
        try {
          const result = await getDocumentPreview(doc.id);
          if (result.success && result.previewUrl) {
            setDocumentThumbnails(prev => ({ ...prev, [doc.id]: result.previewUrl }));
          }
        } catch (error) {
          console.error(`Failed to load thumbnail for document ${doc.id}:`, error);
        } finally {
          setLoadingThumbnails(prev => {
            const next = new Set(prev);
            next.delete(doc.id);
            return next;
          });
        }
      }
    };
    
    loadThumbnails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propDocuments]);

  // Use provided documents or fallback to mock data
  const displayDocuments = propDocuments || mockDocuments;

  const handleFilterChange = (filter: DocumentType) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Filtering is now handled by the backend, but we can still filter locally for search
  const filteredDocuments = displayDocuments.filter(doc => {
    if (activeFilter !== 'all' && doc.type !== activeFilter) return false;
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const addMenuOptions = [{
    icon: <Upload className="w-5 h-5" />,
    label: t.vault.fileUpload,
    onClick: onAddFileUpload
  }, {
    icon: <QrCode className="w-5 h-5" />,
    label: t.vault.scanQR,
    onClick: onAddScanQR
  }, {
    icon: <Scan className="w-5 h-5" />,
    label: t.vault.dicomImport,
    onClick: onAddDicomImport
  }];

  return (
    <div 
      className="h-screen w-full max-w-[390px] md:max-w-[448px] lg:max-w-[512px] xl:max-w-[576px] mx-auto bg-white flex flex-col" 
      data-testid="vault-container"
    >
      <div className="flex flex-col bg-white border-b border-gray-200 sticky top-0 z-20" data-testid="vault-header">
        <div className="flex items-center justify-between px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6">
          <button 
            className="p-2 md:p-3 -ml-2 hover:bg-gray-100 rounded-full transition-colors" 
            aria-label="Back"
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-gray-700" />
          </button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900" data-testid="text-vault-title">{t.vault.title}</h1>
          <button 
            className="p-2 md:p-3 -mr-2 hover:bg-gray-100 rounded-full transition-colors" 
            aria-label={t.common.search} 
            onClick={() => setShowSearch(!showSearch)}
            data-testid="button-search-toggle"
          >
            <Search className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-gray-700" />
          </button>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              transition={{ duration: 0.2 }} 
              className="overflow-hidden px-6 md:px-8 lg:px-10 pb-4 md:pb-5 lg:pb-6"
              data-testid="search-input-container"
            >
              <input 
                type="text" 
                placeholder={`${t.common.search}...`} 
                value={searchQuery} 
                onChange={e => handleSearchChange(e.target.value)} 
                className="w-full px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base lg:text-lg" 
                autoFocus 
                data-testid="input-search"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto scrollbar-hide px-6 md:px-8 lg:px-10 pb-4 md:pb-5 lg:pb-6" data-testid="filter-container">
          <div className="flex gap-2 md:gap-3 min-w-max">
            {filterOptions.map(option => (
              <button 
                key={option.id} 
                onClick={() => handleFilterChange(option.id)} 
                className={`flex items-center gap-2 md:gap-3 px-4 md:px-5 lg:px-6 py-2 md:py-2.5 lg:py-3 rounded-full whitespace-nowrap transition-all ${
                  activeFilter === option.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`button-filter-${option.id}`}
              >
                <span className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6">{option.icon}</span>
                <span className="text-sm md:text-base lg:text-lg font-medium">
                  {option.id === 'all' ? t.vault.all : 
                   option.id === 'prescription' ? t.vault.prescriptions : 
                   option.id === 'lab' ? t.vault.labReports : 
                   option.id === 'imaging' ? t.vault.imaging : 
                   t.vault.billing}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6" data-testid="documents-container">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-12 md:py-16 lg:py-20" data-testid="loading-state">
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 md:mb-5 lg:mb-6"></div>
            <p className="text-gray-600 text-base md:text-lg lg:text-xl">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 md:py-16 lg:py-20" data-testid="empty-state">
            <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 mb-6 md:mb-8 lg:mb-10 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-gray-400" />
            </div>
            <p className="text-lg md:text-xl lg:text-2xl font-medium text-gray-900 mb-2 md:mb-3 lg:mb-4" data-testid="text-empty-state">{t.vault.emptyState}</p>
            <button 
              className="mt-4 md:mt-5 lg:mt-6 px-6 md:px-8 lg:px-10 py-3 md:py-3.5 lg:py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm md:text-base lg:text-lg"
              onClick={() => setShowAddMenu(true)}
              data-testid="button-add-first-record"
            >
              {t.vault.emptyAction}
            </button>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 lg:space-y-5" data-testid="documents-list">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="group relative"
              >
                <motion.button 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 md:p-5 lg:p-6 hover:shadow-md transition-all text-left"
                  onClick={() => onDocumentClick?.(doc.id)}
                  data-testid={`card-document-${doc.id}`}
                >
                  <div className="flex gap-3 md:gap-4 lg:gap-5">
                    <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden" data-testid={`icon-document-${doc.id}`}>
                      {documentThumbnails[doc.id] && (doc.fileType === 'IMAGE' || doc.fileType === 'JPG' || doc.fileType === 'PNG') ? (
                        <img 
                          src={documentThumbnails[doc.id]} 
                          alt={doc.title}
                          className="w-full h-full object-cover"
                          onError={() => {
                            // Fallback to icon if image fails to load
                            setDocumentThumbnails(prev => {
                              const next = { ...prev };
                              delete next[doc.id];
                              return next;
                            });
                          }}
                        />
                      ) : (
                        <span className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8">{documentTypeIcons[doc.type]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 md:gap-3 mb-1 md:mb-2">
                        <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base lg:text-lg" data-testid={`text-document-title-${doc.id}`}>
                          {doc.title}
                          {doc.provider && <span className="text-gray-500 font-normal"> – {doc.provider}</span>}
                        </h3>
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-gray-400 flex-shrink-0" />
                      </div>
                      <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-2 md:mb-3" data-testid={`text-document-date-${doc.id}`}>{doc.date}</p>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {doc.tags.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-0.5 md:py-1 bg-blue-50 text-blue-700 text-xs md:text-sm lg:text-base font-medium rounded-full"
                            data-testid={`tag-${doc.id}-${idx}`}
                          >
                            <Tag className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                            {tag}
                          </span>
                        ))}
                        {doc.isOffline && (
                          <span className="inline-flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-0.5 md:py-1 bg-orange-50 text-orange-700 text-xs md:text-sm lg:text-base font-medium rounded-full">
                            <WifiOff className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                            Offline
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
                {onDocumentDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete "${doc.title}"? This action cannot be undone.`)) {
                        onDocumentDelete(doc.id);
                      }
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete document"
                    data-testid={`button-delete-${doc.id}`}
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {offlineCount > 0 && (
        <motion.button 
          initial={{ y: 100 }} 
          animate={{ y: 0 }} 
          className="mx-6 md:mx-8 lg:mx-10 mb-20 md:mb-24 lg:mb-28 py-3 md:py-3.5 lg:py-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center gap-2 md:gap-3 hover:bg-orange-100 transition-colors"
          onClick={onOfflineSyncClick}
          data-testid="button-offline-sync"
        >
          <WifiOff className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-orange-600" />
          <span className="text-sm md:text-base lg:text-lg font-medium text-orange-900" data-testid="text-offline-count">
            {offlineCount} {t.vault.pendingSync}
          </span>
        </motion.button>
      )}

      <button 
        onClick={() => setShowAddMenu(!showAddMenu)} 
        className="fixed bottom-6 md:bottom-8 lg:bottom-10 right-1/2 translate-x-[calc(50vw-min(50vw,195px)-24px)] md:translate-x-[calc(50vw-min(50vw,224px)-32px)] lg:translate-x-[calc(50vw-min(50vw,256px)-40px)] xl:translate-x-[calc(50vw-min(50vw,288px)-48px)] w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-105 z-30" 
        aria-label={t.dashboard.addDocument}
        data-testid="button-add-document"
      >
        <Plus className={`w-6 h-6 md:w-7 md:h-7 lg:w-9 lg:h-9 text-white transition-transform ${showAddMenu ? 'rotate-45' : ''}`} />
      </button>

      <AnimatePresence>
        {showAddMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/20 z-40" 
              onClick={() => setShowAddMenu(false)}
              data-testid="overlay-add-menu"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="fixed bottom-24 md:bottom-28 lg:bottom-32 right-1/2 translate-x-[calc(50vw-min(50vw,195px)-24px)] md:translate-x-[calc(50vw-min(50vw,224px)-32px)] lg:translate-x-[calc(50vw-min(50vw,256px)-40px)] xl:translate-x-[calc(50vw-min(50vw,288px)-48px)] bg-white rounded-xl shadow-2xl overflow-hidden z-50 min-w-[200px] md:min-w-[240px] lg:min-w-[280px]" 
              data-testid="menu-add-options"
            >
              {addMenuOptions.map((option, idx) => (
                <button 
                  key={idx} 
                  onClick={() => {
                    setShowAddMenu(false);
                    option.onClick?.();
                  }} 
                  className="w-full px-5 md:px-6 lg:px-8 py-4 md:py-4.5 lg:py-5 flex items-center gap-3 md:gap-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                  data-testid={`button-add-${idx === 0 ? 'upload' : idx === 1 ? 'qr' : 'dicom'}`}
                >
                  <div className="text-blue-600 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7">{option.icon}</div>
                  <span className="font-medium text-gray-900 text-sm md:text-base lg:text-lg">{option.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
