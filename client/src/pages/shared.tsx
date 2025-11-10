/**
 * Shared Access Page
 * Public page for accessing shared consents via token
 */

import { useState } from 'react';
import { useRoute } from 'wouter';
import { useSharedConsent, useSharedDocuments } from '@/hooks/useConsents';
import { SharedDocumentViewer } from '@/components/SharedDocumentViewer';
import { AlertCircle, Shield, Clock, UserCircle, FileText } from 'lucide-react';

export default function SharedPage() {
  const [, params] = useRoute('/share/:token');
  const token = params?.token || '';
  
  const { data: consentData, isLoading, error } = useSharedConsent(token);
  const { data: documentsData } = useSharedDocuments(token);
  
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared consent...</p>
        </div>
      </div>
    );
  }

  if (error || !consentData?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            {error instanceof Error 
              ? error.message 
              : consentData?.consent?.status === 'expired'
              ? 'This consent has expired.'
              : consentData?.consent?.status === 'revoked'
              ? 'This consent has been revoked.'
              : 'Invalid or expired share link.'}
          </p>
        </div>
      </div>
    );
  }

  const consent = consentData.consent;
  const scopes = consent.scopes || [];
  const documents = documentsData?.documents || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Shared Medical Records</h1>
          </div>
          
          {/* Consent Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <UserCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Recipient</p>
                <p className="text-base text-blue-800">{consent.recipientName}</p>
                <p className="text-xs text-blue-600 mt-1 capitalize">{consent.recipientRole}</p>
              </div>
            </div>
            
            {consent.purpose && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Purpose</p>
                  <p className="text-base text-blue-800">{consent.purpose}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Expires</p>
                <p className="text-base text-blue-800">
                  {new Date(consent.expiresAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {selectedDocumentId ? (
          <SharedDocumentViewer
            documentId={selectedDocumentId}
            token={token}
            onBack={() => setSelectedDocumentId(null)}
          />
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Accessible Documents</h2>
            
            {documents.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No documents available for this consent.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocumentId(doc.id)}
                    className="bg-white rounded-lg border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{doc.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 capitalize">{doc.type}</p>
                        {doc.provider && (
                          <p className="text-xs text-gray-500 mt-1">{doc.provider}</p>
                        )}
                        {doc.date && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(doc.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

