'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  DollarSign,
  ArrowLeft,
  CreditCard,
  TrendingUp,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

export default function LogisticsEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [totalGross, setTotalGross] = useState(0);
  const [totalPlatformFee, setTotalPlatformFee] = useState(0);
  const [totalNetPartner, setTotalNetPartner] = useState(0);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminLogisticsEarnings();
      if (res.success) {
        setEarnings(res.earnings || []);
        setTotalGross(res.totalGross || 0);
        setTotalPlatformFee(res.totalPlatformFee || 0);
        setTotalNetPartner(res.totalNetPartner || 0);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
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
              Partner Earnings Financial Ledger
            </h1>
            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold text-xs">
              {earnings.length} SETTLEMENTS
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Per-shipment delivery credits, platform commissions, deductions, and partner payouts.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchEarnings} className="text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gross Delivery Value</span>
          <span className="text-2xl font-black text-gray-900 block mt-1">₹{totalGross.toLocaleString('en-IN')}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Platform Logistics Commission</span>
          <span className="text-2xl font-black text-purple-700 block mt-1">₹{totalPlatformFee.toLocaleString('en-IN')}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Net Partner Disbursals</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">₹{totalNetPartner.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden p-4 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Earnings Settlement Transactions ({earnings.length})
        </h2>

        {earnings.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No partner earnings recorded yet. When deliveries complete, automated backend events credit partner balances.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Partner</th>
                  <th className="py-2.5 px-3">Reference / Parcel</th>
                  <th className="py-2.5 px-3">Route Corridor</th>
                  <th className="py-2.5 px-3">Gross</th>
                  <th className="py-2.5 px-3">Platform Fee</th>
                  <th className="py-2.5 px-3 text-right">Net Partner Earning</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {earnings.map((e) => (
                  <tr key={e._id} className="hover:bg-emerald-50/30 transition">
                    <td className="py-2.5 px-3 text-gray-500 font-mono">
                      {new Date(e.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {e.actorId?.name || 'Partner'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-sky-700 font-bold">
                      {e.parcelId?.parcelId || e.referenceId}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {e.parcelId?.pickupLocation && e.parcelId?.deliveryLocation
                        ? `${e.parcelId.pickupLocation} → ${e.parcelId.deliveryLocation}`
                        : 'Local Corridor'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900">₹{e.baseAmount}</td>
                    <td className="py-2.5 px-3 font-mono text-red-600">-₹{e.deduction}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                      ₹{e.netAmount}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px] uppercase font-bold">
                        {e.status}
                      </Badge>
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
