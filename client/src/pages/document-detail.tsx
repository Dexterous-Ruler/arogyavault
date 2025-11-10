import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { DocumentDetailScreen } from '@/components/DocumentDetailScreen';
import { getDocument, getDocumentFile } from '@/lib/api/documents';
import { ImagePreviewModal } from '@/components/ImagePreviewModal';
import { useDeleteDocument } from '@/hooks/useDocuments';
import { useDocumentInsights } from '@/hooks/useHealth';

type DocumentType = 'prescription' | 'lab' | 'imaging' | 'billing';
type FileType = 'PDF' | 'JPG' | 'PNG' | 'DICOM' | 'IMAGE';
type AIStatus = 'normal' | 'warning' | 'urgent' | 'none';
type SyncStatus = 'synced' | 'pending';

type DocumentMetadata = {
  title: string;
  type: 'Lab' | 'Prescription' | 'Imaging' | 'Bill';
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

type VaultDocument = {
  id: string;
  title: string;
  provider?: string;
  date: string;
  type: DocumentType;
  tags: string[];
};

const mockDocuments: VaultDocument[] = [
  {
    id: '1',
    title: 'Lab Report',
    provider: 'Apollo Hospital',
    date: '12 Jul 2025',
    type: 'lab',
    tags: ['Lab', 'Blood Test']
  },
  {
    id: '2',
    title: 'Prescription',
    provider: 'Dr. Sharma',
    date: '10 Jul 2025',
    type: 'prescription',
    tags: ['Prescription', 'Diabetes']
  },
  {
    id: '3',
    title: 'X-Ray Chest',
    provider: 'Max Healthcare',
    date: '05 Jul 2025',
    type: 'imaging',
    tags: ['Imaging', 'X-Ray']
  },
  {
    id: '4',
    title: 'Insurance Claim',
    provider: 'ICICI Lombard',
    date: '01 Jul 2025',
    type: 'billing',
    tags: ['Insurance', 'Billing']
  }
];

const getDocumentMetadata = (doc: VaultDocument): DocumentMetadata => {
  const typeMap: Record<DocumentType, 'Lab' | 'Prescription' | 'Imaging' | 'Bill'> = {
    'lab': 'Lab',
    'prescription': 'Prescription',
    'imaging': 'Imaging',
    'billing': 'Bill'
  };

  return {
    title: doc.title,
    type: typeMap[doc.type],
    provider: doc.provider || 'Unknown Provider',
    date: doc.date,
    tags: doc.tags,
    version: 'v1.0',
    lastUpdated: doc.date,
    syncStatus: 'synced'
  };
};

const getFileType = (docType: DocumentType): FileType => {
  if (docType === 'imaging') return 'DICOM';
  return 'PDF';
};

// Removed hardcoded getAIInsight - now using useDocumentInsights hook

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

export default function DocumentDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/document/:id');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [documentData, setDocumentData] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const deleteDocumentMutation = useDeleteDocument();

  const documentId = params?.id || '1';

  // Fetch document data from API
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const docResponse = await getDocument(documentId);
        if (docResponse.success && docResponse.document) {
          setDocumentData(docResponse.document);
          
          // Fetch file URL
          try {
            const fileResponse = await getDocumentFile(documentId);
            if (fileResponse.success && fileResponse.fileUrl) {
              setFileUrl(fileResponse.fileUrl);
            }
          } catch (error) {
            console.error('Failed to fetch file URL:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch document:', error);
        // Fallback to mock data
        const document = mockDocuments.find(doc => doc.id === documentId) || mockDocuments[0];
        setDocumentData({ ...document, fileType: 'PDF' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  // Use real data if available, otherwise fallback to mock
  const document = documentData || mockDocuments.find(doc => doc.id === documentId) || mockDocuments[0];
  const metadata: DocumentMetadata = documentData ? {
    title: documentData.title,
    type: (documentData.type === 'lab' ? 'Lab' : 
          documentData.type === 'prescription' ? 'Prescription' :
          documentData.type === 'imaging' ? 'Imaging' : 'Bill') as 'Lab' | 'Prescription' | 'Imaging' | 'Bill',
    provider: documentData.provider || 'Unknown Provider',
    date: documentData.date ? new Date(documentData.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : new Date(documentData.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    tags: documentData.tags || [],
    version: 'v1.0',
    lastUpdated: documentData.updatedAt ? new Date(documentData.updatedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : '',
    syncStatus: documentData.syncStatus || 'synced'
  } : getDocumentMetadata(document);
  
  const fileType = (documentData?.fileType || getFileType(document.type)) as FileType;
  
  // Fetch AI insights for this document
  const { data: insightsData, isLoading: insightsLoading } = useDocumentInsights(documentId);
  
  // Map API status to component status (API uses 'critical', component uses 'urgent')
  const mapStatus = (status: "normal" | "warning" | "critical" | "none"): AIStatus => {
    if (status === "critical") return "urgent";
    if (status === "normal" || status === "warning" || status === "none") return status;
    return "none";
  };
  
  const aiInsight: AIInsight = insightsData?.success && insightsData.insight
    ? {
        status: mapStatus(insightsData.insight.status),
        summary: insightsData.insight.summary,
        hasFullAnalysis: insightsData.insight.hasFullAnalysis
      }
    : {
        status: 'none',
        summary: insightsLoading ? 'Analyzing document...' : 'No insights available yet.',
        hasFullAnalysis: false
      };

  const handleBack = () => {
    console.log('⬅️ Back to vault');
    setLocation('/vault');
  };

  const handleShare = () => {
    console.log('📤 Share document');
    setLocation('/consent');
  };

  const [showImageModal, setShowImageModal] = useState(false);

  const handleViewFullscreen = () => {
    if (fileUrl && (fileType === 'JPG' || fileType === 'PNG' || fileType === 'IMAGE')) {
      setShowImageModal(true);
    } else {
      console.log('🔍 View fullscreen');
      alert('Fullscreen viewer coming soon!');
    }
  };

  const handleViewDICOM = () => {
    console.log('🏥 Open DICOM viewer');
    alert('DICOM viewer coming soon!');
  };

  const handleViewFullAnalysis = () => {
    console.log('📊 View full AI analysis');
    alert('AI analysis details coming soon!');
  };

  const handleManageAccess = () => {
    console.log('👥 Manage access');
    setLocation('/consent');
  };

  const handleVersionClick = (version: string) => {
    console.log(`📋 Preview version: ${version}`);
    alert(`Version ${version} preview coming soon!`);
  };

  const handleEditMetadata = () => {
    console.log('✏️ Edit metadata');
    alert('Metadata editor coming soon!');
  };

  const handleMoreOptions = () => {
    console.log('⋮ More options');
    // Menu is now handled in DocumentDetailScreen
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDocumentMutation.mutateAsync(documentId);
      setLocation('/vault');
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6 md:px-8 lg:px-10">
          <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 border-b-2 border-blue-600 mx-auto mb-4 md:mb-5 lg:mb-6"></div>
          <p className="text-gray-600 text-base md:text-lg lg:text-xl">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DocumentDetailScreen
        fileType={fileType}
        metadata={metadata}
        aiInsight={aiInsight}
        versionHistory={defaultVersionHistory}
        accessList={defaultAccessList}
        language={language}
        fileUrl={fileUrl || undefined}
        onBack={handleBack}
        onShare={handleShare}
        onViewFullscreen={handleViewFullscreen}
        onViewDICOM={handleViewDICOM}
        onViewFullAnalysis={handleViewFullAnalysis}
        onManageAccess={handleManageAccess}
        onVersionClick={handleVersionClick}
        onEditMetadata={handleEditMetadata}
        onMoreOptions={handleMoreOptions}
        onDelete={handleDelete}
      />
      {fileUrl && showImageModal && (
        <ImagePreviewModal
          imageUrl={fileUrl}
          alt={metadata.title}
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  );
}
