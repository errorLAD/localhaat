'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  Layers,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Package,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

export default function LogisticsHandoversPage() {
  const [loading, setLoading] = useState(true);
  const [handovers, setHandovers] = useState<any[]>([]);
  const [legs, setLegs] = useState<any[]>([]);

  const fetchHandovers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminLogisticsHandovers();
      if (res.success) {
        setHandovers(res.handovers || []);
        setLegs(res.legs || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandovers();
  }, []);

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
              Multi-Leg Chains & Custody Handover Verification
            </h1>
            <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-xs">
              {handovers.length} CUSTODY EVENTS
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Real-time custody tracking: Customer → Logistics Partner → Hub / Partner B → Village Agent → Customer
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchHandovers} className="text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh Chains
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden p-4 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Verified Handover Records ({handovers.length})
        </h2>

        {handovers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No custody handover records logged yet. As packages transfer custody between partners and village agents, records will stream here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Parcel ID</th>
                  <th className="py-2.5 px-3">Transfer Flow</th>
                  <th className="py-2.5 px-3">From Party</th>
                  <th className="py-2.5 px-3">To Party</th>
                  <th className="py-2.5 px-3">Handover Code</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {handovers.map((h) => (
                  <tr key={h._id} className="hover:bg-sky-50/40 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-700">
                      {h.parcelId?.parcelId || h.parcelId?._id || 'Parcel'}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge className="bg-purple-100 text-purple-900 border-purple-200 text-[10px] font-bold">
                        {h.fromActorType} → {h.toActorType}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">
                      {h.fromActorId?.name || 'Party A'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">
                      {h.toActorId?.name || 'Party B'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                      {h.handoverCodeUsed || 'VERIFIED'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-500 font-mono">
                      {new Date(h.verifiedAt).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
