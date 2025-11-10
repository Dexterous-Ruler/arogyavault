/**
 * Shared Document Viewer Component
 * Read-only document viewer with screenshot prevention
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Shield, AlertCircle } from 'lucide-react';

type SharedDocumentViewerProps = {
  documentId: string;
  token: string; // Share token for accessing files
  onBack: () => void;
};

export const SharedDocumentViewer = ({ documentId, token, onBack }: SharedDocumentViewerProps) => {
  const [document, setDocument] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent screenshots and right-click
    const preventScreenshot = (e: KeyboardEvent) => {
      // Block PrintScreen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
      // Block Alt+PrintScreen
      if (e.altKey && e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
    };

    const preventContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const preventSelect = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Prevent devtools (F12, Ctrl+Shift+I, etc.)
    const preventDevTools = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('keydown', preventScreenshot);
    window.addEventListener('keydown', preventDevTools);
    window.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('selectstart', preventSelect);
    document.addEventListener('dragstart', preventSelect);

    return () => {
      window.removeEventListener('keydown', preventScreenshot);
      window.removeEventListener('keydown', preventDevTools);
      window.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('selectstart', preventSelect);
      document.removeEventListener('dragstart', preventSelect);
    };
  }, []);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        // Fetch document metadata from shared endpoint
        const response = await fetch(`/api/consents/share/${token}/documents`);
        const data = await response.json();
        
        if (data.success && data.documents) {
          const doc = data.documents.find((d: any) => d.id === documentId);
          if (doc) {
            setDocument(doc);
            
            // Fetch file URL from shared endpoint
            const fileResponse = await fetch(`/api/consents/share/${token}/documents/${documentId}/file`);
            const fileData = await fileResponse.json();
            if (fileData.success && fileData.url) {
              setFileUrl(fileData.url);
            }
          } else {
            setError('Document not found');
          }
        } else {
          setError('Failed to load document');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, token]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-900 font-semibold mb-2">Error</p>
        <p className="text-gray-600">{error || 'Document not found'}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isImage = document.fileType === 'JPG' || document.fileType === 'PNG' || document.fileType === 'IMAGE';
  const isPDF = document.fileType === 'PDF';

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{document.title}</h2>
            <p className="text-sm text-gray-600 capitalize">{document.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">Read-Only</span>
        </div>
      </div>

      {/* Watermark Overlay */}
      <div className="relative">
        <div
          className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)',
          }}
        >
          <div className="text-gray-400 text-2xl font-bold opacity-20 transform -rotate-45">
            Shared Document - Arogya Vault
          </div>
        </div>

        {/* Document Content */}
        <div className="p-6" style={{ userSelect: 'none' }}>
          {isImage && fileUrl && (
            <div className="flex justify-center">
              <img
                src={fileUrl}
                alt={document.title}
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ pointerEvents: 'none' }}
                draggable={false}
              />
            </div>
          )}

          {isPDF && fileUrl && (
            <div className="w-full" style={{ height: '80vh' }}>
              <iframe
                src={fileUrl}
                className="w-full h-full border-0"
                title={document.title}
                style={{ pointerEvents: 'none' }}
              />
            </div>
          )}

          {!isImage && !isPDF && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Preview not available for this file type</p>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {document.provider && (
            <div>
              <p className="text-gray-600">Provider</p>
              <p className="font-medium text-gray-900">{document.provider}</p>
            </div>
          )}
          {document.date && (
            <div>
              <p className="text-gray-600">Date</p>
              <p className="font-medium text-gray-900">
                {new Date(document.date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
