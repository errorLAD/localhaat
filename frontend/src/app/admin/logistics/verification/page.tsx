'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

export default function PartnerVerificationPage() {
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminLogisticsPartners({
        verification: statusFilter,
        limit: '50',
      });
      if (res.success) {
        setPartners(res.partners || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const handleAction = async (partnerId: string, action: string) => {
    const reason = prompt(`Enter notes or reason for ${action}:`);
    if (reason === null) return;
    try {
      const res = await api.updateAdminLogisticsPartnerStatus(partnerId, { action, reason });
      if (res.success) {
        alert(res.message);
        fetchQueue();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <Link
            href="/admin/logistics"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Logistics Control Center
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Partner Verification & KYC Center
            </h1>
            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs">
              {partners.length} IN QUEUE
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Verify Driving License, Vehicle RC, Commercial Permits and Identity before allowing parcel acceptance.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchQueue} className="text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'BLOCKED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === st ? 'bg-sky-600 text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Queue List */}
      {partners.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 space-y-2">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-xs font-bold text-gray-700">No partners in {statusFilter} verification queue.</h3>
          <p className="text-[11px] text-gray-400">All submissions have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-xs text-gray-900">{p.partnerCode || p._id.slice(-6)}</span>
                <Badge
                  className={`text-[10px] font-bold ${
                    p.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  {p.verificationStatus}
                </Badge>
              </div>

              <div>
                <div className="font-extrabold text-sm text-gray-900">{p.businessName}</div>
                <div className="text-xs text-gray-500 font-medium">Owner: {p.userId?.name || 'Partner'}</div>
                <div className="text-xs font-mono text-gray-600 mt-0.5">{p.phone || p.userId?.phone}</div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Transport:</span>
                  <span className="font-bold text-gray-800">{p.primaryTransportType || 'Bike'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle Number:</span>
                  <span className="font-mono font-bold text-gray-800">{p.vehicleNumber || 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Documents Attached:</span>
                  <span className="font-bold text-sky-700">{p.documents?.length || 0}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <Link href={`/admin/logistics/partners/${p._id}`}>
                  <Button size="sm" variant="outline" className="h-7 text-xs font-bold text-sky-700">
                    <Eye className="w-3 h-3 mr-1" /> Dossier
                  </Button>
                </Link>

                <div className="flex items-center gap-1.5">
                  {p.verificationStatus !== 'VERIFIED' && (
                    <Button
                      size="sm"
                      onClick={() => handleAction(p._id, 'VERIFY')}
                      className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Verify
                    </Button>
                  )}
                  {p.verificationStatus !== 'REJECTED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction(p._id, 'REJECT')}
                      className="h-7 text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold"
                    >
                      <XCircle className="w-3 h-3 mr-1" /> Reject
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
