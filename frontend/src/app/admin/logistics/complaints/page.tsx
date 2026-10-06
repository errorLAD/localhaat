'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  MessageSquareWarning,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

export default function LogisticsComplaintsPage() {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminLogisticsComplaints({ status: statusFilter });
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleResolve = async (id: string) => {
    const resolution = prompt('Enter resolution summary / action taken:');
    if (!resolution) return;
    try {
      const res = await api.resolveAdminLogisticsComplaint(id, {
        status: 'RESOLVED',
        resolution,
        adminNotes: 'Resolved by Admin Operations Console',
      });
      if (res.success) {
        alert(res.message);
        fetchComplaints();
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
              Logistics Complaints & Issue Resolution
            </h1>
            <Badge className="bg-rose-100 text-rose-900 border-rose-300 font-bold text-xs">
              {complaints.length} CASES
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Investigate delivery delays, damage claims, wrong handovers, and partner conduct disputes.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchComplaints} className="text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED', 'REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === s ? 'bg-sky-600 text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {complaints.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white rounded-2xl border border-dashed border-gray-200 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-gray-700">No complaints matching filter.</p>
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c._id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-xs text-gray-900">{c.complaintId}</span>
                <Badge
                  className={`text-[10px] font-bold ${
                    c.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border-rose-300'
                  }`}
                >
                  {c.status}
                </Badge>
              </div>

              <div>
                <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-[10px] font-semibold mb-1">
                  {c.category?.replace(/_/g, ' ')}
                </Badge>
                <p className="text-xs text-gray-700 font-medium">{c.description}</p>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px] space-y-1">
                <div className="text-gray-500">Partner: <span className="font-bold text-gray-900">{c.partnerId?.businessName}</span></div>
                <div className="text-gray-500">Customer: <span className="font-bold text-gray-900">{c.customerName || 'Customer'}</span></div>
                {c.resolution && (
                  <div className="text-emerald-800 font-semibold pt-1 border-t border-gray-200/40">
                    Resolution: {c.resolution}
                  </div>
                )}
              </div>

              {c.status !== 'RESOLVED' && (
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleResolve(c._id)}
                    className="h-7 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Resolve Complaint
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
