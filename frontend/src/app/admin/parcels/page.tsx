'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { useSocket } from '../../../context/SocketContext';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Navigation,
  Layers,
  Store,
  Radio,
  XCircle,
  RotateCcw,
  Ban,
  ShieldAlert,
  CreditCard,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Download,
  ArrowRight,
  AlertTriangle,
  Building,
  UserCheck,
  Percent,
} from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export default function ParcelDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminParcelDashboardStats();
      if (res.success) {
        setStats(res.stats);
      } else {
        setError(res.message || 'Failed to fetch parcel statistics.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching parcel dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    if (socket) {
      socket.on('admin:parcel_update', () => {
        fetchStats();
      });
      socket.on('parcel:new_request', () => {
        fetchStats();
      });
    }

    return () => {
      if (socket) {
        socket.off('admin:parcel_update');
        socket.off('parcel:new_request');
      }
    };
  }, [socket]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Package className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Parcels & Logistics Operations Command Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time multi-leg parcel tracking, automated logistics partner matching, and village agent deliveries
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
            className="text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <a href={api.getAdminParcelsCsvUrl()} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Directory
            </Button>
          </a>
        </div>
      </div>

      {/* Critical Operational Alerts */}
      {stats?.alerts && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Operational Priority Alerts
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Alert 1: Unassigned Parcels */}
            <Link
              href="/admin/parcels/unbooked"
              className={`p-3.5 rounded-2xl border transition-all ${
                stats.alerts.unassignedOver30Mins > 0
                  ? 'bg-amber-500/10 border-amber-300 hover:bg-amber-500/15 ring-1 ring-amber-400/40'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Unassigned (&gt;30m)
                </span>
                <span
                  className={`text-base font-extrabold font-mono ${
                    stats.alerts.unassignedOver30Mins > 0 ? 'text-amber-700 animate-pulse' : 'text-gray-400'
                  }`}
                >
                  {stats.alerts.unassignedOver30Mins}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Parcels waiting for transporter assignment</p>
            </Link>

            {/* Alert 2: Delayed Pickups */}
            <Link
              href="/admin/parcels/pickup-pending"
              className={`p-3.5 rounded-2xl border transition-all ${
                stats.alerts.delayedPickupOver2Hrs > 0
                  ? 'bg-orange-500/10 border-orange-300 hover:bg-orange-500/15 ring-1 ring-orange-400/40'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  Delayed Pickups (&gt;2h)
                </span>
                <span
                  className={`text-base font-extrabold font-mono ${
                    stats.alerts.delayedPickupOver2Hrs > 0 ? 'text-orange-700' : 'text-gray-400'
                  }`}
                >
                  {stats.alerts.delayedPickupOver2Hrs}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Accepted parcels awaiting first-mile pickup</p>
            </Link>

            {/* Alert 3: High-Value in Transit */}
            <Link
              href="/admin/parcels/in-transit"
              className={`p-3.5 rounded-2xl border transition-all ${
                stats.alerts.highValueInTransit > 0
                  ? 'bg-blue-500/10 border-blue-300 hover:bg-blue-500/15'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  High-Value Shipments
                </span>
                <span
                  className={`text-base font-extrabold font-mono ${
                    stats.alerts.highValueInTransit > 0 ? 'text-blue-700 font-bold' : 'text-gray-400'
                  }`}
                >
                  {stats.alerts.highValueInTransit}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Parcels value exceeding ₹5,000 in transit</p>
            </Link>

            {/* Alert 4: Open Disputes */}
            <Link
              href="/admin/parcels/disputed"
              className={`p-3.5 rounded-2xl border transition-all ${
                stats.alerts.openDisputes > 0
                  ? 'bg-red-500/10 border-red-300 hover:bg-red-500/15 ring-1 ring-red-400/40'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Active Disputes
                </span>
                <span
                  className={`text-base font-extrabold font-mono ${
                    stats.alerts.openDisputes > 0 ? 'text-red-700 font-bold animate-pulse' : 'text-gray-400'
                  }`}
                >
                  {stats.alerts.openDisputes}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Customer damage / delay claims pending</p>
            </Link>
          </div>
        </div>
      )}

      {/* Financial Ledger Section */}
      {stats?.financials && (
        <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-blue-950 text-white p-5 rounded-2xl shadow-sm border border-gray-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                LocalHaat Financial Ledger
              </div>
              <div className="text-base font-bold text-white mt-0.5">Parcels Revenue & Commissions</div>
            </div>
            <Link href="/admin/parcels/payments">
              <Button size="sm" variant="outline" className="text-xs text-white border-gray-700 hover:bg-gray-800 h-8">
                Payments Ledger
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <div className="text-[10px] text-gray-400">Total Parcel Volume</div>
              <div className="text-lg font-extrabold text-white font-mono mt-0.5">
                ₹{stats.financials.totalRevenue.toLocaleString()}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">Customer Offers</div>
            </div>

            <div>
              <div className="text-[10px] text-gray-400">Delivery Charges</div>
              <div className="text-lg font-extrabold text-white font-mono mt-0.5">
                ₹{stats.financials.deliveryCharges.toLocaleString()}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">Base & Mileage</div>
            </div>

            <div>
              <div className="text-[10px] text-gray-400">Partner Earnings</div>
              <div className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5">
                ₹{stats.financials.partnerEarnings.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-500/80 mt-0.5">Transporter Payouts</div>
            </div>

            <div>
              <div className="text-[10px] text-gray-400">Agent Earnings</div>
              <div className="text-lg font-extrabold text-sky-400 font-mono mt-0.5">
                ₹{stats.financials.agentEarnings.toLocaleString()}
              </div>
              <div className="text-[10px] text-sky-500/80 mt-0.5">Village Hub Comm.</div>
            </div>

            <div>
              <div className="text-[10px] text-gray-400">Platform Revenue</div>
              <div className="text-lg font-extrabold text-amber-400 font-mono mt-0.5">
                ₹{stats.financials.platformRevenue.toLocaleString()}
              </div>
              <div className="text-[10px] text-amber-500/80 mt-0.5">LocalHaat Margin</div>
            </div>

            <div>
              <div className="text-[10px] text-gray-400">Pending Payments</div>
              <div className="text-lg font-extrabold text-gray-300 font-mono mt-0.5">
                ₹{stats.financials.pendingPayments.toLocaleString()}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">COD / In-Transit</div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Lifecycle Pipeline Queues Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Lifecycle Stage Queues
          </div>
          <Link href="/admin/parcels/all" className="text-xs font-bold text-blue-600 hover:underline">
            View All Parcels ({stats?.totalParcels || 0}) →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* 1. All Parcels */}
          <Link
            href="/admin/parcels/all"
            className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600">All Parcels</span>
              <Package className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
            </div>
            <div className="text-xl font-extrabold text-gray-900 font-mono mt-2">
              {stats?.totalParcels ?? 0}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Total registered</div>
          </Link>

          {/* 2. New / Unbooked */}
          <Link
            href="/admin/parcels/unbooked"
            className="p-3.5 bg-white rounded-2xl border border-amber-200 bg-amber-50/20 hover:border-amber-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950">New / Unbooked</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="text-xl font-extrabold text-amber-900 font-mono mt-2">
              {stats?.searchingCount ?? 0}
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5">Awaiting partner</div>
          </Link>

          {/* 3. Searching Partner */}
          <Link
            href="/admin/parcels/searching"
            className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600">Searching Partner</span>
              <Search className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
            </div>
            <div className="text-xl font-extrabold text-gray-900 font-mono mt-2">
              {stats?.searchingCount ?? 0}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Broadcasting route</div>
          </Link>

          {/* 4. Partner Accepted */}
          <Link
            href="/admin/parcels/accepted"
            className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-sky-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 group-hover:text-sky-600">Partner Accepted</span>
              <UserCheck className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-xl font-extrabold text-gray-900 font-mono mt-2">
              {stats?.acceptedCount ?? 0}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">En route to pickup</div>
          </Link>

          {/* 5. Pickup Pending */}
          <Link
            href="/admin/parcels/pickup-pending"
            className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-orange-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 group-hover:text-orange-600">Pickup Pending</span>
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-xl font-extrabold text-gray-900 font-mono mt-2">
              {stats?.pickupPendingCount ?? 0}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">At seller facility</div>
          </Link>

          {/* 6. Picked Up */}
          <Link
            href="/admin/parcels/picked-up"
            className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-indigo-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-600">Picked Up</span>
              <Truck className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl font-extrabold text-gray-900 font-mono mt-2">
              {stats?.pickedUpCount ?? 0}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Code verified</div>
          </Link>

          {/* 7. In Transit */}
          <Link
            href="/admin/parcels/in-transit"
            className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600">In Transit</span>
              <Navigation className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-extrabold text-gray-900 font-mono mt-2">
              {stats?.inTransitCount ?? 0}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">On corridor route</div>
          </Link>

          {/* 8. At Hub */}
          <Link
            href="/admin/parcels/at-hub"
            className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-purple-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 group-hover:text-purple-600">At Hub</span>
              <Layers className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-extrabold text-gray-900 font-mono mt-2">
              {stats?.atHubCount ?? 0}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Regional sorting</div>
          </Link>

          {/* 9. At Village Agent */}
          <Link
            href="/admin/parcels/at-agent"
            className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 group-hover:text-emerald-600">At Village Agent</span>
              <Store className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-extrabold text-gray-900 font-mono mt-2">
              {stats?.atAgentCount ?? 0}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Village hub ready</div>
          </Link>

          {/* 10. Out for Delivery */}
          <Link
            href="/admin/parcels/out-for-delivery"
            className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-teal-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 group-hover:text-teal-600">Out for Delivery</span>
              <Radio className="w-4 h-4 text-teal-500 animate-pulse" />
            </div>
            <div className="text-xl font-extrabold text-gray-900 font-mono mt-2">
              {stats?.outForDeliveryCount ?? 0}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Final doorstep leg</div>
          </Link>

          {/* 11. Delivered */}
          <Link
            href="/admin/parcels/delivered"
            className="p-3.5 bg-white rounded-2xl border border-green-200 bg-green-50/20 hover:border-green-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-green-950">Delivered</span>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-xl font-extrabold text-green-900 font-mono mt-2">
              {stats?.deliveredCount ?? 0}
            </div>
            <div className="text-[10px] text-green-700 mt-0.5">
              Today: {stats?.deliveredToday ?? 0}
            </div>
          </Link>

          {/* 12. Failed */}
          <Link
            href="/admin/parcels/failed"
            className="p-3.5 bg-white rounded-2xl border border-red-200 hover:border-red-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 group-hover:text-red-600">Failed</span>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-xl font-extrabold text-gray-900 font-mono mt-2">
              {stats?.failedCount ?? 0}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Customer unavailable</div>
          </Link>

          {/* 13. Returned */}
          <Link
            href="/admin/parcels/returned"
            className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-rose-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 group-hover:text-rose-600">Returned</span>
              <RotateCcw className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-extrabold text-gray-900 font-mono mt-2">
              {stats?.returnedCount ?? 0}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Back to origin</div>
          </Link>

          {/* 14. Cancelled */}
          <Link
            href="/admin/parcels/cancelled"
            className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-gray-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 group-hover:text-gray-600">Cancelled</span>
              <Ban className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xl font-extrabold text-gray-900 font-mono mt-2">
              {stats?.cancelledCount ?? 0}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Customer / Admin void</div>
          </Link>

          {/* 15. Disputed */}
          <Link
            href="/admin/parcels/disputed"
            className="p-3.5 bg-white rounded-2xl border border-red-200 hover:border-red-400 hover:shadow-xs transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-950">Disputed</span>
              <ShieldAlert className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-xl font-extrabold text-red-900 font-mono mt-2">
              {stats?.disputedCount ?? 0}
            </div>
            <div className="text-[10px] text-red-700 mt-0.5">Investigation active</div>
          </Link>
        </div>
      </div>

      {/* Quick Action Operations Links */}
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-700 font-bold">
          <Truck className="w-4 h-4 text-blue-600" />
          <span>Quick Logistics Operations:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/parcels/unbooked">
            <Button size="sm" variant="outline" className="text-xs font-bold bg-white">
              Unbooked Queue
            </Button>
          </Link>
          <Link href="/admin/parcels/in-transit">
            <Button size="sm" variant="outline" className="text-xs font-bold bg-white">
              Live Corridor In-Transit
            </Button>
          </Link>
          <Link href="/admin/parcels/payments">
            <Button size="sm" variant="outline" className="text-xs font-bold bg-white">
              Payments Ledger
            </Button>
          </Link>
          <Link href="/admin/parcels/partner-earnings">
            <Button size="sm" variant="outline" className="text-xs font-bold bg-white">
              Partner Earnings
            </Button>
          </Link>
          <Link href="/admin/parcels/analytics">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
              Parcel Analytics & Trends →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
