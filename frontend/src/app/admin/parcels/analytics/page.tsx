'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  BarChart3,
  TrendingUp,
  Package,
  Truck,
  RefreshCw,
  PieChart,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function ParcelAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, statsRes] = await Promise.all([
        api.getAdminParcelAnalytics(),
        api.getAdminParcelDashboardStats(),
      ]);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Parcels Analytics & Performance Insights
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Corridor shipment volumes, category breakdowns, and transporter reliability metrics
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchAnalytics} className="text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-gray-400 font-semibold uppercase">Total Parcels Ingested</div>
          <div className="text-2xl font-extrabold text-gray-900 font-mono">
            {stats?.totalParcels ?? 0}
          </div>
          <div className="text-[10px] text-gray-500">Across all corridors</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-gray-400 font-semibold uppercase">Gross Parcel Volume</div>
          <div className="text-2xl font-extrabold text-blue-700 font-mono">
            ₹{stats?.financials?.totalRevenue.toLocaleString() ?? 0}
          </div>
          <div className="text-[10px] text-gray-500">Total customer offer value</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-gray-400 font-semibold uppercase">Delivered Shipments</div>
          <div className="text-2xl font-extrabold text-green-700 font-mono">
            {stats?.deliveredCount ?? 0}
          </div>
          <div className="text-[10px] text-gray-500">Doorstep completions</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <div className="text-[11px] text-gray-400 font-semibold uppercase">Average Offer / Parcel</div>
          <div className="text-2xl font-extrabold text-indigo-700 font-mono">
            ₹{stats?.totalParcels ? Math.round(stats.financials.totalRevenue / stats.totalParcels) : 0}
          </div>
          <div className="text-[10px] text-gray-500">Per shipment realization</div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              Status Pipeline Distribution
            </h3>
            <span className="text-xs text-gray-400">{analytics?.statusBreakdown?.length || 0} Stages</span>
          </div>

          <div className="space-y-2.5">
            {analytics?.statusBreakdown?.map((item: any) => {
              const count = item.count;
              const pct = stats?.totalParcels ? Math.round((count / stats.totalParcels) * 100) : 0;
              return (
                <div key={item._id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                    <span className="font-mono">{item._id}</span>
                    <span className="font-mono text-gray-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Category Cargo Breakdown
            </h3>
            <span className="text-xs text-gray-400">{analytics?.categoryBreakdown?.length || 0} Categories</span>
          </div>

          <div className="space-y-2.5">
            {analytics?.categoryBreakdown?.map((cat: any) => {
              const count = cat.count;
              const pct = stats?.totalParcels ? Math.round((count / stats.totalParcels) * 100) : 0;
              return (
                <div key={cat._id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                    <span>{cat._id || 'General Goods'}</span>
                    <span className="font-mono text-gray-500">
                      {count} parcels ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performing Transporters */}
      {analytics?.topPartners && analytics.topPartners.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-gray-700 tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              Top Transporters by Assigned Volume
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {analytics.topPartners.map((tp: any, idx: number) => (
              <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900">{tp.businessName}</span>
                  <Badge className="bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                    ★{tp.rating || 4.9}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  Total Assigned: <strong className="text-gray-900 font-mono">{tp.assignedCount}</strong> Parcels
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
