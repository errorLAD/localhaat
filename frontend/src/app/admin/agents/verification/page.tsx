'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  AlertTriangle,
  User,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function AgentVerificationPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [rejectingDoc, setRejectingDoc] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAgentDocuments({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.success) {
        setDocuments(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching KYC documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [statusFilter]);

  const handleVerify = async (docId: string, status: 'VERIFIED' | 'REJECTED', reason?: string) => {
    try {
      setActionLoading(true);
      setFeedback(null);
      const res = await api.verifyAdminAgentDocument(docId, status, reason);
      if (res.success) {
        setFeedback(`Document successfully marked as ${status}`);
        setRejectingDoc(null);
        setRejectionReason('');
        setTimeout(() => setFeedback(null), 3000);
        fetchDocuments();
      }
    } catch (err: any) {
      setFeedback(err.message || 'Verification update failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Identity Verification Desk
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Agent KYC & Hub Accreditation</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit government IDs (Aadhaar, PAN, License) and approve rural village agents for package handling.
          </p>
        </div>

        <Button
          onClick={fetchDocuments}
          size="sm"
          variant="outline"
          className="text-xs border-gray-200 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </Button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'ALL'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === s
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {loading && documents.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-amber-600 animate-spin mx-auto" />
          <p className="text-xs text-gray-500 font-semibold">Retrieving KYC dossier records from MongoDB...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-2">
          <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-gray-900">Queue is Clear</h3>
          <p className="text-xs text-gray-500">No agent documents currently waiting under &quot;{statusFilter}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                      {doc.documentType?.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-black text-gray-900 block">{doc.documentType}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{doc.documentNumber}</span>
                    </div>
                  </div>

                  <Badge
                    className={
                      doc.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : doc.verificationStatus === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                    }
                  >
                    {doc.verificationStatus}
                  </Badge>
                </div>

                {/* Agent Info */}
                <div className="mt-3 p-2.5 bg-gray-50 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-gray-900">{doc.userId?.name || 'Village Agent'}</div>
                  <div className="text-[11px] text-gray-500 font-mono">{doc.userId?.phone}</div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {doc.userId?.defaultLocation?.villageOrCity}, {doc.userId?.defaultLocation?.district}
                  </div>
                </div>

                {/* Rejection Note if present */}
                {doc.rejectionReason && (
                  <div className="mt-2 p-2 bg-rose-50 text-rose-800 rounded-lg text-[10px] font-semibold border border-rose-100">
                    Reason: {doc.rejectionReason}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewDoc(doc)}
                  className="text-xs h-8 px-2.5 text-gray-700 border-gray-200 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview Doc
                </Button>

                {doc.verificationStatus === 'PENDING' && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      onClick={() => handleVerify(doc._id, 'VERIFIED')}
                      disabled={actionLoading}
                      className="text-xs h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setRejectingDoc(doc)}
                      disabled={actionLoading}
                      className="text-xs h-8 px-2 text-rose-700 hover:bg-rose-50 font-bold"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Image Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{previewDoc.documentType} Document Dossier</h3>
                <span className="text-[11px] text-gray-500 font-mono">Number: {previewDoc.documentNumber}</span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200">
              {previewDoc.documentUrl ? (
                <img
                  src={previewDoc.documentUrl}
                  alt={previewDoc.documentType}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400">Document image scan unavailable</span>
              )}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Agent: <strong>{previewDoc.userId?.name}</strong></span>
              <Button size="sm" onClick={() => setPreviewDoc(null)} className="text-xs">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with mandatory reason */}
      {rejectingDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-gray-900">Reject KYC Document</h3>
            </div>

            <p className="text-xs text-gray-600">
              State the reason why <strong>{rejectingDoc.documentType}</strong> for{' '}
              <strong>{rejectingDoc.userId?.name}</strong> is being rejected. This notification will be communicated to the agent.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Document image blurry, name mismatch with bank records, or expired identity card..."
              className="w-full border border-gray-200 rounded-xl p-2.5 text-xs min-h-[90px]"
              required
            />

            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setRejectingDoc(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleVerify(rejectingDoc._id, 'REJECTED', rejectionReason)}
                disabled={!rejectionReason.trim() || actionLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
