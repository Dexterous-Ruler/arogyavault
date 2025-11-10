import { useState } from 'react';
import { VaultDocumentTimeline } from '@/components/VaultDocumentTimeline';
import { ArogyaVaultAddDocumentWizard } from '@/components/MediLockerAddDocumentWizard';
import { useLocation } from 'wouter';
import { useDocuments, useCreateDocument, useDeleteDocument } from '@/hooks/useDocuments';
import type { DocumentType } from '@/lib/api/documents';

type FilterType = DocumentType | 'all';

export default function VaultPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();

  // Fetch documents with filters
  const { data: documentsData, isLoading, refetch } = useDocuments({
    type: filter === 'all' ? undefined : filter,
    search: searchQuery || undefined,
  });

  const createDocumentMutation = useCreateDocument();
  const deleteDocumentMutation = useDeleteDocument();

  const handleBack = () => {
    console.log('⬅️ Back to home');
    setLocation('/home');
  };

  const handleSearch = (query: string) => {
    console.log(`🔍 Search query: "${query}"`);
    setSearchQuery(query);
  };

  const handleFilterChange = (filterType: FilterType) => {
    console.log(`🔀 Filter changed to: ${filterType}`);
    setFilter(filterType);
  };

  const handleDocumentClick = (docId: string) => {
    console.log(`📄 Document clicked: ${docId}`);
    setLocation(`/document/${docId}`);
  };

  const [uploadMethod, setUploadMethod] = useState<'upload' | 'qr' | 'dicom' | null>(null);

  const handleAddFileUpload = () => {
    console.log('📤 Add via file upload - Opening wizard');
    setUploadMethod('upload');
    setShowWizard(true);
  };

  const handleAddScanQR = () => {
    console.log('📱 Add via QR scan - Opening wizard');
    setUploadMethod('qr');
    setShowWizard(true);
  };

  const handleAddDicomImport = () => {
    console.log('🏥 Add via DICOM import - Opening wizard');
    setUploadMethod('dicom');
    setShowWizard(true);
  };

  const handleOfflineSyncClick = () => {
    console.log('🔄 Offline sync clicked');
    alert('Starting sync...\n\n(Sync functionality coming soon)');
  };

  const handleDocumentDelete = async (docId: string) => {
    try {
      await deleteDocumentMutation.mutateAsync(docId);
      // Documents will be refetched automatically via React Query
    } catch (error) {
      // Error is handled by mutation hook
      console.error('Failed to delete document:', error);
    }
  };

  const handleWizardComplete = async (data: any) => {
    console.log('✅ Document added:', data);
    
    try {
      // Extract document data from wizard
      // Get provider from ocrFields if available
      const providerField = data.ocrFields?.find((f: any) => f.key === 'provider');
      const dateField = data.ocrFields?.find((f: any) => f.key === 'date');
      const titleField = data.ocrFields?.find((f: any) => f.key === 'title');
      
      const documentData = {
        title: titleField?.value || data.fileName || 'Untitled Document',
        type: data.documentType || 'lab',
        provider: providerField?.value || undefined,
        date: dateField?.value ? new Date(dateField.value).toISOString() : undefined,
        tags: data.tags || [],
        fileUrl: data.preview || undefined,
        fileType: data.fileType || 'PDF',
        fileSize: data.fileSize ? parseInt(data.fileSize) : undefined,
      };

      // If there's a file, pass it to the mutation
      const file = data.file || null;
      await createDocumentMutation.mutateAsync({ data: documentData, file });
      setShowWizard(false);
      setUploadMethod(null);
      // Documents will be refetched automatically via React Query
    } catch (error) {
      // Error is handled by mutation hook
      console.error('Failed to create document:', error);
    }
  };

  const handleWizardCancel = () => {
    console.log('❌ Wizard cancelled');
    setShowWizard(false);
  };

  // Convert API documents to component format
  const documents = documentsData?.documents?.map((doc) => ({
    id: doc.id,
    title: doc.title,
    provider: doc.provider || undefined,
    date: doc.date ? new Date(doc.date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : new Date(doc.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    type: doc.type,
    tags: doc.tags || [],
    fileType: doc.fileType || undefined,
  })) || [];

  return (
    <>
      <VaultDocumentTimeline
        documents={documents}
        isLoading={isLoading}
        onBack={handleBack}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onDocumentClick={handleDocumentClick}
        onAddFileUpload={handleAddFileUpload}
        onAddScanQR={handleAddScanQR}
        onAddDicomImport={handleAddDicomImport}
        onOfflineSyncClick={handleOfflineSyncClick}
        onDocumentDelete={handleDocumentDelete}
      />

      {showWizard && (
        <div className="fixed inset-0 z-50 bg-white">
          <ArogyaVaultAddDocumentWizard
            initialMethod={uploadMethod}
            onComplete={handleWizardComplete}
            onCancel={() => {
              setShowWizard(false);
              setUploadMethod(null);
              handleWizardCancel();
            }}
          />
        </div>
      )}
    </>
  );
}
