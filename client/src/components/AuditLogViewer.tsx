/**
 * Audit Log Viewer Component
 * Displays full activity timeline for a consent
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, Shield, Eye, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useConsents';

type AuditLogViewerProps = {
  consentId: string;
  onClose: () => void;
  language?: 'en' | 'hi';
};

const translations = {
  en: {
    title: 'Audit Log',
    subtitle: 'Full activity timeline',
    actionGrant: 'Granted',
    actionRevoke: 'Revoked',
    actionView: 'Viewed',
    actionAccess: 'Accessed',
    actorUser: 'User',
    actorRecipient: 'Recipient',
    actorSystem: 'System',
    noLogs: 'No activity recorded yet',
    timestamp: 'Timestamp',
    actor: 'Actor',
    action: 'Action',
    details: 'Details',
  },
  hi: {
    title: 'ऑडिट लॉग',
    subtitle: 'पूर्ण गतिविधि समयरेखा',
    actionGrant: 'दी गई',
    actionRevoke: 'रद्द की गई',
    actionView: 'देखा गया',
    actionAccess: 'एक्सेस किया गया',
    actorUser: 'उपयोगकर्ता',
    actorRecipient: 'प्राप्तकर्ता',
    actorSystem: 'सिस्टम',
    noLogs: 'अभी तक कोई गतिविधि दर्ज नहीं की गई',
    timestamp: 'समय',
    actor: 'अभिनेता',
    action: 'कार्रवाई',
    details: 'विवरण',
  },
};

const getActionIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case 'grant':
      return CheckCircle;
    case 'revoke':
      return XCircle;
    case 'view':
      return Eye;
    case 'access':
      return Shield;
    default:
      return Clock;
  }
};

const getActionColor = (action: string) => {
  switch (action.toLowerCase()) {
    case 'grant':
      return 'text-green-600 bg-green-50';
    case 'revoke':
      return 'text-red-600 bg-red-50';
    case 'view':
      return 'text-blue-600 bg-blue-50';
    case 'access':
      return 'text-purple-600 bg-purple-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const AuditLogViewer = ({ consentId, onClose, language = 'en' }: AuditLogViewerProps) => {
  const { data: auditData, isLoading, error } = useAuditLogs(consentId);
  const t = translations[language];

  const logs = auditData?.logs || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">{error instanceof Error ? error.message : 'Failed to load audit logs'}</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t.noLogs}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log, index) => {
                  const ActionIcon = getActionIcon(log.action);
                  const actionColor = getActionColor(log.action);
                  const details = log.details ? (typeof log.details === 'string' ? JSON.parse(log.details) : log.details) : null;

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {/* Timeline line */}
                      {index < logs.length - 1 && (
                        <div className="absolute left-8 top-12 w-0.5 h-full bg-gray-300" />
                      )}

                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${actionColor}`}>
                        <ActionIcon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 capitalize">
                                {log.action === 'grant' && t.actionGrant}
                                {log.action === 'revoke' && t.actionRevoke}
                                {log.action === 'view' && t.actionView}
                                {log.action === 'access' && t.actionAccess}
                                {!['grant', 'revoke', 'view', 'access'].includes(log.action.toLowerCase()) && log.action}
                              </span>
                              {log.actorType && (
                                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full capitalize">
                                  {log.actorType === 'user' && t.actorUser}
                                  {log.actorType === 'recipient' && t.actorRecipient}
                                  {log.actorType === 'system' && t.actorSystem}
                                  {!['user', 'recipient', 'system'].includes(log.actorType) && log.actorType}
                                </span>
                              )}
                            </div>
                            {log.actorId && log.actorId !== 'unknown' && (
                              <p className="text-sm text-gray-600">
                                {t.actor}: {log.actorId}
                              </p>
                            )}
                            {details && (
                              <div className="mt-2 text-sm text-gray-600">
                                {details.ip && (
                                  <p className="text-xs">IP: {details.ip}</p>
                                )}
                                {details.userAgent && (
                                  <p className="text-xs truncate">Device: {details.userAgent}</p>
                                )}
                                {details.reason && (
                                  <p className="text-xs">Reason: {details.reason}</p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

