'use client';

import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { formatDate } from '../../../lib/utils';
import {
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';

export default function AdminKycPage() {
  const { kycDocs, loadAdminData, handleVerifyKyc, loading } = useAdmin();
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('all');
  const [rejectModalDoc, setRejectModalDoc] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('Document blurry or invalid number');

  const filteredDocs = kycDocs.filter((d) => {
    if (filter === 'all') return true;
    return d.verificationStatus === filter;
  });

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalDoc) return;
    const ok = await handleVerifyKyc(rejectModalDoc._id, 'REJECTED', rejectReason);
    if (ok) {
      setRejectModalDoc(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              KYC Document Compliance Verification
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Review identity proofs, driving licenses, and commercial vehicle registrations submitted by transporters and village agents.
          </p>
        </div>

        <Button
          onClick={() => loadAdminData()}
          variant="outline"
          size="sm"
          className="rounded-xl text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-fit overflow-x-auto">
        {[
          { id: 'all', label: `All (${kycDocs.length})` },
          { id: 'PENDING', label: `Pending (${kycDocs.filter((d) => d.verificationStatus === 'PENDING').length})` },
          { id: 'VERIFIED', label: `Approved (${kycDocs.filter((d) => d.verificationStatus === 'VERIFIED').length})` },
          { id: 'REJECTED', label: `Rejected (${kycDocs.filter((d) => d.verificationStatus === 'REJECTED').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              filter === tab.id
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No KYC verification documents in this queue.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDocs.map((doc) => (
              <div
                key={doc._id}
                className="p-5 hover:bg-gray-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">{doc.documentType}</span>
                    <Badge
                      variant={doc.verificationStatus === 'VERIFIED' ? 'success' : doc.verificationStatus === 'REJECTED' ? 'destructive' : 'warning'}
                      className="text-[10px] font-bold"
                    >
                      {doc.verificationStatus}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 font-mono">
                    Document Number: <strong>{doc.documentNumber}</strong>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Submitted: {formatDate(doc.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {doc.verificationStatus === 'PENDING' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleVerifyKyc(doc._id, 'VERIFIED')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 px-3 rounded-xl font-bold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Document
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setRejectModalDoc(doc);
                          setRejectReason('Document unclear or invalid number');
                        }}
                        className="text-xs h-8 px-3 rounded-xl font-bold flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <span className="text-emerald-700 font-bold text-xs flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      Compliance Approved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Reject KYC Document
              </h3>
              <button onClick={() => setRejectModalDoc(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectConfirm} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Rejection Reason</label>
                <Input
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <Button
                type="submit"
                variant="destructive"
                className="w-full rounded-xl h-10 text-xs font-bold"
              >
                Confirm Rejection
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
