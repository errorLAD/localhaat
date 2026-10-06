'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { FileText, Eye, CheckCircle, RefreshCw, XCircle, Search, ShieldCheck } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function AgentDocumentsRepositoryPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAgentDocuments({
        status: status !== 'ALL' ? status : undefined,
      });
      if (res.success) {
        setDocuments(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Compliance Archive</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Agent Documents Repository</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Central repository of all Aadhaar cards, PAN cards, driving licenses, and trade papers submitted by village agents.
          </p>
        </div>

        <Button onClick={fetchDocs} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Archive
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'VERIFIED', 'PENDING', 'REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap uppercase ${
              status === s
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Identifier / Number</th>
                <th className="py-3 px-4">Agent Name & Contact</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Uploaded Date</th>
                <th className="py-3 px-4 text-right">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">Querying compliance records...</td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">No documents found.</td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-700" />
                        <span className="font-extrabold text-gray-900">{doc.documentType}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-gray-700">{doc.documentNumber}</td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{doc.userId?.name || 'Village Agent'}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{doc.userId?.phone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge className={
                        doc.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : doc.verificationStatus === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                      }>
                        {doc.verificationStatus}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewDoc(doc)}
                        className="text-xs h-7 px-2.5 text-gray-700 border-gray-200 flex items-center gap-1 inline-flex"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{previewDoc.documentType} Scan</h3>
                <span className="text-[11px] text-gray-500 font-mono">{previewDoc.documentNumber}</span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">✕</button>
            </div>
            <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
              <img src={previewDoc.documentUrl} alt="Doc preview" className="w-full h-full object-cover" />
            </div>
            <div className="text-right">
              <Button size="sm" onClick={() => setPreviewDoc(null)} className="text-xs">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
