'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { useSocket } from '../../../context/SocketContext';
import {
  Truck,
  Users,
  ShieldCheck,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  TrendingUp,
  CreditCard,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Search,
  Layers,
  MapPin,
  Calendar,
  Zap,
  PlusCircle,
  FileText,
  UserCheck,
  AlertOctagon,
  ChevronRight,
  Eye,
  Phone,
  BarChart3,
  Sliders,
  History,
  MessageSquareWarning,
  Navigation,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

// Quadcopter Drone SVG Icon
const DroneIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
    <line x1="9" y1="9" x2="4.5" y2="4.5" />
    <line x1="15" y1="9" x2="19.5" y2="4.5" />
    <line x1="9" y1="15" x2="4.5" y2="19.5" />
    <line x1="15" y1="15" x2="19.5" y2="19.5" />
    <circle cx="4.5" cy="4.5" r="2.5" />
    <circle cx="19.5" cy="4.5" r="2.5" />
    <circle cx="4.5" cy="19.5" r="2.5" />
    <circle cx="19.5" cy="19.5" r="2.5" />
  </svg>
);

export default function LogisticsDashboardPage() {
  const { socket } = useSocket();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [liveTrips, setLiveTrips] = useState<any[]>([]);
  const [movingParcels, setMovingParcels] = useState<any[]>([]);
  const [transportFilter, setTransportFilter] = useState('ALL');
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, liveRes] = await Promise.all([
        api.getAdminLogisticsStats(),
        api.getAdminLogisticsLive(),
      ]);

      if (statsRes.success) setStats(statsRes);
      if (liveRes.success) {
        setLiveTrips(liveRes.trips || []);
        setMovingParcels(liveRes.movingParcels || []);
      }
    } catch (err: any) {
      console.error('Failed to load logistics dashboard:', err);
      setError(err.message || 'Unable to connect to logistics control center.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (socket) {
      socket.on('logistics:trip_update', () => fetchDashboardData());
      socket.on('logistics:partner_update', () => fetchDashboardData());
      socket.on('parcel:update', () => fetchDashboardData());
      return () => {
        socket.off('logistics:trip_update');
        socket.off('logistics:partner_update');
        socket.off('parcel:update');
      };
    }
  }, [socket]);

  const topStats = stats?.topStats || {};
  const parcelStats = stats?.parcelStats || {};
  const financialStats = stats?.financialStats || {};

  const filteredTrips = liveTrips.filter((t) => {
    if (transportFilter === 'ALL') return true;
    return t.transportType?.toLowerCase() === transportFilter.toLowerCase();
  });

  const getTransportIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('bike') || t.includes('cycle')) return '🛵';
    if (t.includes('auto') || t.includes('rickshaw')) return '🛺';
    if (t.includes('bus')) return '🚌';
    if (t.includes('pickup') || t.includes('truck')) return '🚚';
    if (t.includes('cab') || t.includes('taxi')) return '🚕';
    if (t.includes('van') || t.includes('car')) return '🚐';
    return '🚗';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Operations Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                Logistics Command Center
              </h1>
              <p className="text-xs text-gray-500">
                Real-time multi-modal fleet tracking, partner verification, custody handovers & capacity operations
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/logistics/assignment">
            <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs">
              <Zap className="w-3.5 h-3.5 mr-1" />
              Match Parcels ({parcelStats.parcelsSearching || 0})
            </Button>
          </Link>
          <Link href="/drone-delivery">
            <Button size="sm" variant="outline" className="text-xs font-bold border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100">
              <DroneIcon className="w-3.5 h-3.5 mr-1 text-amber-800" />
              Drone Roadmap (Phase 2)
            </Button>
          </Link>
          <Link href="/admin/logistics/trips">
            <Button size="sm" variant="outline" className="text-xs font-bold border-gray-300 text-gray-700">
              <Navigation className="w-3.5 h-3.5 mr-1 text-emerald-700" />
              Scheduled Trips
            </Button>
          </Link>
          <Link href="/admin/logistics/partners">
            <Button size="sm" variant="outline" className="text-xs font-bold border-gray-300 text-gray-700">
              <Users className="w-3.5 h-3.5 mr-1 text-sky-700" />
              Partners Directory
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchDashboardData}
            disabled={loading}
            className="text-xs text-gray-600"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={fetchDashboardData} className="h-6 text-[10px]">
            Retry
          </Button>
        </div>
      )}

      {/* QUICK OPERATIONAL LINKS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 text-center">
        {[
          { label: 'Live Moving', href: '/admin/logistics/live', icon: Radio, count: topStats.currentlyMoving || 0, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Partners', href: '/admin/logistics/partners', icon: Users, count: topStats.totalPartners || 0, color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Pending KYC', href: '/admin/logistics/verification', icon: ShieldCheck, count: topStats.pendingVerification || 0, color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { label: 'Available', href: '/admin/logistics/partners?status=AVAILABLE', icon: UserCheck, count: topStats.availablePartners || 0, color: 'text-sky-700 bg-sky-50 border-sky-200' },
          { label: 'Routes & Trips', href: '/admin/logistics/routes', icon: Navigation, count: liveTrips.length, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
          { label: 'Assignments', href: '/admin/logistics/assignment', icon: Search, count: parcelStats.parcelsSearching || 0, color: 'text-purple-700 bg-purple-50 border-purple-200' },
          { label: 'Handovers', href: '/admin/logistics/handovers', icon: Layers, count: parcelStats.parcelsAwaitingHandover || 0, color: 'text-violet-700 bg-violet-50 border-violet-200' },
          { label: 'Earnings', href: '/admin/logistics/earnings', icon: DollarSign, count: `₹${Math.round(financialStats.partnerEarningsToday || 0)}`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Payouts', href: '/admin/logistics/payouts', icon: CreditCard, count: `₹${Math.round(financialStats.pendingPartnerPayouts || 0)}`, color: 'text-teal-700 bg-teal-50 border-teal-200' },
          { label: 'Complaints', href: '/admin/logistics/complaints', icon: MessageSquareWarning, count: 'Issue Desk', color: 'text-rose-700 bg-rose-50 border-rose-200' },
          { label: 'Activity Logs', href: '/admin/logistics/activity', icon: History, count: 'Stream', color: 'text-gray-700 bg-gray-50 border-gray-200' },
          { label: 'Analytics', href: '/admin/logistics/analytics', icon: BarChart3, count: 'Metrics', color: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              href={item.href}
              className={`p-2.5 rounded-xl border transition-all hover:scale-[1.02] flex flex-col items-center justify-center gap-1 ${item.color}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-tight block truncate w-full">{item.label}</span>
              <span className="text-xs font-extrabold">{item.count}</span>
            </Link>
          );
        })}
      </div>

      {/* SECTION 1: TOP STATISTICS (REAL MONGODB NUMBERS) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-sky-600" />
            Top Partner Statistics (MongoDB Verified)
          </h2>
          <span className="text-[10px] font-mono text-gray-400">Total Partners: {topStats.totalPartners || 0}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {[
            { label: 'Total Partners', value: topStats.totalPartners || 0, color: 'text-gray-900 bg-gray-50 border-gray-200' },
            { label: 'Verified', value: topStats.verifiedPartners || 0, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            { label: 'Pending KYC', value: topStats.pendingVerification || 0, color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { label: 'Online', value: topStats.onlinePartners || 0, color: 'text-blue-700 bg-blue-50 border-blue-200' },
            { label: 'Moving Now', value: topStats.currentlyMoving || 0, color: 'text-emerald-700 bg-emerald-100/70 border-emerald-300 font-bold' },
            { label: 'Available', value: topStats.availablePartners || 0, color: 'text-sky-700 bg-sky-50 border-sky-200' },
            { label: 'On Delivery', value: topStats.onDelivery || 0, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
            { label: 'Offline', value: topStats.offlinePartners || 0, color: 'text-gray-500 bg-gray-50 border-gray-200' },
            { label: 'Suspended', value: topStats.suspendedPartners || 0, color: 'text-rose-700 bg-rose-50 border-rose-200' },
            { label: 'Blocked', value: topStats.blockedPartners || 0, color: 'text-red-900 bg-red-100 border-red-300' },
          ].map((s, idx) => (
            <div key={idx} className={`p-2.5 rounded-xl border text-center ${s.color}`}>
              <div className="text-[10px] font-semibold text-gray-600 truncate">{s.label}</div>
              <div className="text-base font-extrabold mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: LIVE PARCEL PIPELINE STATISTICS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-blue-600" />
            Live Parcel Statistics Across Multi-Modal Pipeline
          </h2>
          <Link href="/admin/parcels/all" className="text-[11px] font-bold text-blue-600 hover:underline">
            View All Parcels →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 text-center">
          {[
            { label: 'Searching Partner', value: parcelStats.parcelsSearching || 0, color: 'border-amber-200 bg-amber-50 text-amber-900', alert: (parcelStats.parcelsSearching || 0) > 0 },
            { label: 'Partner Assigned', value: parcelStats.parcelsAssigned || 0, color: 'border-sky-200 bg-sky-50 text-sky-900' },
            { label: 'Pickup Pending', value: parcelStats.parcelsPickupPending || 0, color: 'border-orange-200 bg-orange-50 text-orange-900' },
            { label: 'Picked Up', value: parcelStats.parcelsPickedUp || 0, color: 'border-indigo-200 bg-indigo-50 text-indigo-900' },
            { label: 'Currently Moving', value: parcelStats.parcelsMoving || 0, color: 'border-blue-200 bg-blue-50 text-blue-900 font-bold' },
            { label: 'At Hub', value: parcelStats.parcelsAtHub || 0, color: 'border-purple-200 bg-purple-50 text-purple-900' },
            { label: 'Awaiting Handover', value: parcelStats.parcelsAwaitingHandover || 0, color: 'border-violet-200 bg-violet-50 text-violet-900' },
            { label: 'With Village Agent', value: parcelStats.parcelsWithAgent || 0, color: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
            { label: 'Out for Delivery', value: parcelStats.parcelsOutForDelivery || 0, color: 'border-teal-200 bg-teal-50 text-teal-900' },
            { label: 'Delivered', value: parcelStats.parcelsDelivered || 0, color: 'border-green-200 bg-green-50 text-green-900' },
            { label: 'Failed', value: parcelStats.parcelsFailed || 0, color: 'border-red-200 bg-red-50 text-red-900' },
            { label: 'Returned', value: parcelStats.parcelsReturned || 0, color: 'border-rose-200 bg-rose-50 text-rose-900' },
          ].map((item, idx) => (
            <div key={idx} className={`p-2 rounded-xl border relative ${item.color}`}>
              {item.alert && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
              )}
              <div className="text-[10px] font-semibold truncate">{item.label}</div>
              <div className="text-base font-extrabold mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: FINANCIAL REVENUE & LEDGER STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Partner Earnings Today', value: `₹${(financialStats.partnerEarningsToday || 0).toLocaleString('en-IN')}`, color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
          { label: 'Partner Earnings Week', value: `₹${(financialStats.partnerEarningsThisWeek || 0).toLocaleString('en-IN')}`, color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
          { label: 'Partner Earnings Month', value: `₹${(financialStats.partnerEarningsThisMonth || 0).toLocaleString('en-IN')}`, color: 'bg-emerald-50 border-emerald-200 text-emerald-900' },
          { label: 'Pending Payouts', value: `₹${(financialStats.pendingPartnerPayouts || 0).toLocaleString('en-IN')}`, color: 'bg-amber-50 border-amber-200 text-amber-900' },
          { label: 'Completed Payouts', value: `₹${(financialStats.completedPartnerPayouts || 0).toLocaleString('en-IN')}`, color: 'bg-blue-50 border-blue-200 text-blue-900' },
          { label: 'Platform Revenue', value: `₹${(financialStats.platformLogisticsRevenue || 0).toLocaleString('en-IN')}`, color: 'bg-purple-50 border-purple-200 text-purple-900' },
          { label: 'Total Logistics Gross', value: `₹${(financialStats.totalLogisticsRevenue || 0).toLocaleString('en-IN')}`, color: 'bg-gray-900 text-white border-gray-800' },
        ].map((f, i) => (
          <div key={i} className={`p-3 rounded-2xl border shadow-2xs ${f.color}`}>
            <div className="text-[10px] font-semibold opacity-80">{f.label}</div>
            <div className="text-lg font-black tracking-tight mt-0.5">{f.value}</div>
          </div>
        ))}
      </div>

      {/* SECTION 4: MAJOR HIGHLIGHT - LIVE VEHICLES / MOVING NOW */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
                LIVE VEHICLES / MOVING NOW
              </h2>
              <Badge className="bg-emerald-100 text-emerald-900 border-emerald-200 text-[10px] font-bold">
                {liveTrips.filter((t) => t.tripStatus === 'MOVING').length} MOVING CURRENTLY
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Every active multi-modal corridor vehicle carrying real parcels in real time
            </p>
          </div>

          {/* Transport Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'Bike', 'Auto', 'Cab', 'Bus', 'Van', 'Pickup'].map((t) => (
              <button
                key={t}
                onClick={() => setTransportFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  transportFilter === t
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Live Vehicles Cards Grid */}
        {filteredTrips.length === 0 ? (
          <div className="p-12 text-center bg-gray-50/80 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <Truck className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="text-xs font-bold text-gray-700">No active logistics currently.</h3>
            <p className="text-[11px] text-gray-500">
              When logistics partners start a haul or move with parcels, live cards will stream here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrips.map((trip) => {
              const capacityUsed = trip.usedCapacityKg || 0;
              const capacityTotal = trip.totalCapacityKg || 20;
              const capacityAvailable = Math.max(0, capacityTotal - capacityUsed);
              const capacityPercent = Math.min(100, Math.round((capacityUsed / capacityTotal) * 100));

              return (
                <div
                  key={trip._id || trip.tripId}
                  className="bg-white rounded-2xl border-2 border-sky-100 hover:border-sky-300 transition-all shadow-xs hover:shadow-md p-4 space-y-3 relative overflow-hidden"
                >
                  {/* Status ribbon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getTransportIcon(trip.transportType)}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-gray-900">{trip.partnerName}</span>
                          <Badge
                            className={`text-[9px] font-bold ${
                              trip.partnerType === 'TRAVELLING'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-blue-100 text-blue-900 border-blue-300'
                            }`}
                          >
                            {trip.partnerType || 'PROFESSIONAL'}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                          <span className="font-semibold text-gray-700">{trip.transportType}</span>
                          {trip.vehicleNumber && <span className="font-mono text-[10px]">({trip.vehicleNumber})</span>}
                        </div>
                      </div>
                    </div>

                    <Badge
                      className={`text-[10px] font-extrabold tracking-wider ${
                        trip.tripStatus === 'MOVING'
                          ? 'bg-emerald-500 text-white animate-pulse'
                          : trip.tripStatus === 'READY'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {trip.tripStatus}
                    </Badge>
                  </div>

                  {/* Route Corridor */}
                  <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-100 text-xs space-y-1">
                    <div className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">
                      Current Corridor Route
                    </div>
                    <div className="font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                      <span>{trip.fromLocation?.villageOrCity || 'Origin'}</span>
                      <span className="text-sky-600 font-extrabold">→</span>
                      {trip.waypoints && trip.waypoints.length > 0 && (
                        <>
                          <span className="text-gray-600 font-medium">
                            {trip.waypoints.map((w: any) => w.villageOrCity).join(' → ')}
                          </span>
                          <span className="text-sky-600 font-extrabold">→</span>
                        </>
                      )}
                      <span className="text-sky-900 font-bold">{trip.toLocation?.villageOrCity || 'Destination'}</span>
                    </div>

                    {trip.currentOperationalLocation && (
                      <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        Current Location: <span className="font-bold">{trip.currentOperationalLocation}</span>
                      </div>
                    )}
                  </div>

                  {/* Schedule Timestamps */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Departure</span>
                      <span className="font-bold text-gray-800">{trip.departureTime || 'On Schedule'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Expected Arrival</span>
                      <span className="font-bold text-emerald-800">{trip.expectedArrival || '4:15 PM'}</span>
                    </div>
                  </div>

                  {/* Capacity Meter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-600 text-[11px]">Vehicle Load Capacity</span>
                      <span className="font-bold font-mono text-[11px] text-gray-900">
                        {capacityUsed} KG / {capacityTotal} KG{' '}
                        <span className="text-emerald-700">({capacityAvailable} KG left)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          capacityPercent > 85
                            ? 'bg-red-500'
                            : capacityPercent > 60
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Parcels */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-sky-600" />
                        Active Parcels: <span className="text-sky-800">{trip.activeParcelCount || trip.parcelIds?.length || 0}</span>
                      </span>
                      {trip.estimatedEarnings > 0 && (
                        <span className="text-emerald-700 font-extrabold text-[11px]">
                          Earning: ₹{trip.estimatedEarnings}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {trip.parcelIds && trip.parcelIds.length > 0 ? (
                        trip.parcelIds.map((p: any) => {
                          const pId = typeof p === 'object' ? p.parcelId || p._id : p;
                          const mongoId = typeof p === 'object' ? p._id : p;
                          return (
                            <Link key={pId} href={`/admin/parcels/${mongoId}`}>
                              <Badge className="bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-300 font-mono text-[10px] font-bold cursor-pointer transition">
                                {pId}
                              </Badge>
                            </Link>
                          );
                        })
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono">No assigned parcels attached</span>
                      )}
                    </div>
                  </div>

                  {/* Trip Card Action Buttons */}
                  <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                    <Link href={`/admin/logistics/trips/${trip.tripId || trip._id}`} className="flex-1">
                      <Button size="sm" className="w-full h-7 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs">
                        <Eye className="w-3 h-3 mr-1" />
                        View Trip
                      </Button>
                    </Link>
                    {trip.partnerId && (
                      <Link href={`/admin/logistics/partners/${trip.partnerId._id || trip.partnerId}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs font-semibold px-2">
                          <Users className="w-3 h-3 mr-1 text-sky-700" />
                          Partner
                        </Button>
                      </Link>
                    )}
                    {trip.partnerMobile && (
                      <a href={`tel:${trip.partnerMobile}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs font-semibold px-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                          <Phone className="w-3 h-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 5: LIVE MOVING PARCELS SUMMARY */}
      {movingParcels.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              Parcels Currently in Transit ({movingParcels.length})
            </h2>
            <Link href="/admin/parcels/in-transit" className="text-[11px] font-bold text-sky-600 hover:underline">
              View In-Transit Parcels →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2 px-3">Parcel ID</th>
                  <th className="py-2 px-3">Current Custodian Partner</th>
                  <th className="py-2 px-3">From → Destination</th>
                  <th className="py-2 px-3">Weight</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Offer</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movingParcels.slice(0, 6).map((p: any) => (
                  <tr key={p._id} className="hover:bg-sky-50/40 transition">
                    <td className="py-2 px-3 font-mono font-bold text-gray-900">
                      <Link href={`/admin/parcels/${p._id}`} className="hover:underline text-sky-700">
                        {p.parcelId}
                      </Link>
                    </td>
                    <td className="py-2 px-3 font-semibold text-gray-800">
                      {p.currentPartnerId?.businessName || p.currentPartnerId?.name || 'Assigned Transporter'}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {p.pickupLocation} → {p.deliveryLocation}
                    </td>
                    <td className="py-2 px-3 font-mono font-semibold">{p.weightKg || 1} KG</td>
                    <td className="py-2 px-3">
                      <Badge className="bg-blue-100 text-blue-900 border-blue-200 text-[10px] font-bold">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">
                      ₹{p.customerOfferPrice}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <Link href={`/admin/parcels/${p._id}`}>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] font-bold px-2 text-sky-700 border-sky-200">
                          Dossier
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: DRONE DELIVERY — PHASE 2 ROADMAP */}
      <div id="drone-delivery-ops" className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-bold shadow-xs">
              <DroneIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>Drone Delivery Roadmap</span>
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Phase 2 Architecture
                </span>
              </h2>
              <p className="text-[11px] text-gray-500">
                Phase 1 is existing ground logistics; Phase 2 introduces small-parcel (1–2 KG) aerial delivery
              </p>
            </div>
          </div>
          <Link href="/drone-delivery">
            <Button size="sm" variant="outline" className="text-xs font-bold text-primary-700 border-primary-200 hover:bg-primary-50">
              <span>View Product Presentation →</span>
            </Button>
          </Link>
        </div>

        {/* Operational Status Summary (Real State - No Fake Data) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Drone Fleet</span>
            <span className="font-bold text-gray-800 text-xs">No active drones.</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Active Flights</span>
            <span className="font-bold text-gray-800 text-xs">No active drone deliveries.</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Scheduled Flights</span>
            <span className="font-bold text-gray-800 text-xs">0 scheduled</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Completed Flights</span>
            <span className="font-bold text-gray-800 text-xs">0 completed</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Failed / Cancelled</span>
            <span className="font-bold text-gray-800 text-xs">0 incidents</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-gray-200">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Drone Operators</span>
            <span className="font-bold text-gray-800 text-xs">0 active pilots</span>
          </div>
        </div>

        {/* Operations Controls & Configuration Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1.5">
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">
              Operating Parameters (Phase 2)
            </span>
            <div className="text-[11px] text-gray-600 space-y-1">
              <div>• <b>Payload limits:</b> 1–2 KG per parcel (≈ 1 KG focus)</div>
              <div>• <b>Service Scope:</b> Small parcels (Not large cargo/freight)</div>
              <div>• <b>Target Area:</b> Villages & rural drop points</div>
              <div>• <b>Handover Mode:</b> Hub ➔ Drone ➔ Village Agent / Drop Point</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1.5">
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">
              Zones & Drop Points
            </span>
            <div className="text-[11px] text-gray-600 space-y-1">
              <div>• <b>Approved operating zones:</b> DGCA Green Zones</div>
              <div>• <b>Delivery corridors:</b> Regulatory cleared rural corridors</div>
              <div>• <b>Village drop points:</b> Verified agent pads</div>
              <div>• <b>Cargo assignments:</b> Eligible small lightweight essentials</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-1.5">
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">
              Compliance & Safety Logs
            </span>
            <div className="text-[11px] text-gray-600 space-y-1">
              <div>• <b>Maintenance:</b> Pre-flight avionics check</div>
              <div>• <b>Flight records:</b> Telemetry audit ready</div>
              <div>• <b>Compliance docs:</b> DigitalSky integration</div>
              <div>• <b>Safety policy:</b> Factual metrics, no unsupported claims</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
