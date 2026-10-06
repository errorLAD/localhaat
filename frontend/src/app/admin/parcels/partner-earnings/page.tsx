'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  DollarSign,
  Truck,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function PartnerEarningsPage() {
  const [parcels, setParcels] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.all([
        api.getAdminParcelDashboardStats(),
        api.getAdminParcels({ limit: 50 }),
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (listRes.success) setParcels(listRes.parcels || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Logistics Partner Earnings & Haul Payouts
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Transporter mileage compensations, base haul fees, and completed leg settlements
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchData} className="text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Aggregate Cards */}
      {stats?.financials && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <div className="text-[11px] text-gray-400 font-semibold uppercase">Total Transporter Payouts</div>
            <div className="text-2xl font-extrabold text-emerald-700 font-mono">
              ₹{stats.financials.partnerEarnings.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500">Credited to partner wallets</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <div className="text-[11px] text-gray-400 font-semibold uppercase">Active In-Transit Hauls</div>
            <div className="text-2xl font-extrabold text-blue-700 font-mono">
              {stats.inTransitCount || 0}
            </div>
            <div className="text-[10px] text-gray-500">Corridor shipments in progress</div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <div className="text-[11px] text-gray-400 font-semibold uppercase">Delivered Shipments</div>
            <div className="text-2xl font-extrabold text-green-700 font-mono">
              {stats.deliveredCount || 0}
            </div>
            <div className="text-[10px] text-gray-500">Successfully completed trips</div>
          </div>
        </div>
      )}

      {/* Assigned Parcels Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wider">
            Haul Earnings by Assigned Parcel
          </h3>
          <span className="text-xs text-gray-400 font-mono">{parcels.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                <th className="py-3 px-3">Parcel ID</th>
                <th className="py-3 px-3">Assigned Partner</th>
                <th className="py-3 px-3">Corridor Route</th>
                <th className="py-3 px-3">Weight</th>
                <th className="py-3 px-3">Transporter Earning</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {parcels.map((p) => {
                const partnerShare = Math.round(p.customerOfferPrice * 0.6);
                return (
                  <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      <Link href={`/admin/parcels/${p._id}`} className="hover:underline">
                        {p.parcelId}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">
                        {p.currentPartnerId?.businessName || (
                          <span className="text-gray-400 italic font-normal">Unassigned</span>
                        )}
                      </div>
                      {p.currentPartnerId?.userId?.phone && (
                        <div className="text-[10px] text-gray-500 font-mono">
                          {p.currentPartnerId.userId.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-gray-700">
                      {p.pickupLocation} → {p.deliveryLocation}
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-600">
                      {p.weightKg || 1} KG
                    </td>
                    <td className="py-3 px-3 font-mono font-extrabold text-emerald-700">
                      ₹{partnerShare}
                    </td>
                    <td className="py-3 px-3">
                      <Badge className="bg-gray-100 text-gray-800 text-[10px] uppercase font-bold">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link href={`/admin/parcels/${p._id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-[11px] font-bold">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
