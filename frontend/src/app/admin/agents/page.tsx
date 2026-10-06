'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { useSocket } from '../../../context/SocketContext';
import {
  Users,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Package,
  DollarSign,
  CreditCard,
  Star,
  MessageSquareWarning,
  FileText,
  History,
  Sliders,
  TrendingUp,
  MapPin,
  RefreshCw,
  Download,
  ArrowRight,
  ShieldAlert,
  Building,
  CheckCircle,
  UserPlus,
} from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export default function AgentDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, subscribeToAgents } = useSocket();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminAgentDashboardStats();
      if (res.success) {
        setStats(res.data);
      } else {
        setError(res.message || 'Failed to load stats');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching agent dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    subscribeToAgents();

    if (socket) {
      socket.on('admin:agent_update', () => {
        fetchStats();
      });
      socket.on('admin:agent_status_update', () => {
        fetchStats();
      });
    }

    return () => {
      if (socket) {
        socket.off('admin:agent_update');
        socket.off('admin:agent_status_update');
      }
    };
  }, [socket]);

  const handleDownloadCsv = () => {
    const csvUrl = api.getAdminAgentsCsvUrl();
    window.open(csvUrl, '_blank');
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-gray-600">Gathering Village Agents Intelligence & Metrics...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-red-900">Dashboard Synchronization Failed</h3>
        <p className="text-xs text-red-600 max-w-md mx-auto">{error}</p>
        <Button onClick={fetchStats} className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold">
          Retry Aggregation
        </Button>
      </div>
    );
  }

  const agents = stats?.agents || {};
  const packages = stats?.packages || {};
  const finances = stats?.finances || {};
  const moderation = stats?.moderation || {};
  const charts = stats?.charts || {};

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Haat Last-Mile Operations
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">Village Agents Command Center</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time MongoDB telemetry, KYC verification pipelines, financial payouts, and village inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/admin/agents/all?action=new">
            <Button
              size="sm"
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add New Agent
            </Button>
          </Link>
          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </Button>
          <Button
            onClick={handleDownloadCsv}
            size="sm"
            className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Directory CSV
          </Button>
          <Link href="/admin/agents/live">
            <Button
              size="sm"
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
              Live Radar Map
            </Button>
          </Link>
        </div>
      </div>

      {/* Urgent Attention Alerts Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {moderation.pendingKycDocs > 0 && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                {moderation.pendingKycDocs}
              </div>
              <div>
                <div className="text-xs font-bold text-amber-950">Pending KYC Audits</div>
                <div className="text-[11px] text-amber-700">Agents awaiting identity & hub check</div>
              </div>
            </div>
            <Link href="/admin/agents/verification">
              <Button size="sm" variant="ghost" className="text-xs text-amber-900 hover:bg-amber-100 font-bold p-1">
                Inspect <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
              </Button>
            </Link>
          </div>
        )}

        {moderation.pendingComplaints > 0 && (
          <div className="bg-rose-50/90 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                {moderation.pendingComplaints}
              </div>
              <div>
                <div className="text-xs font-bold text-rose-950">Active Customer Grievances</div>
                <div className="text-[11px] text-rose-700">Open delivery & behavior tickets</div>
              </div>
            </div>
            <Link href="/admin/agents/complaints">
              <Button size="sm" variant="ghost" className="text-xs text-rose-900 hover:bg-rose-100 font-bold p-1">
                Resolve <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
              </Button>
            </Link>
          </div>
        )}

        {finances.pendingPayoutsCount > 0 && (
          <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                ₹{finances.pendingPayoutsAmount}
              </div>
              <div>
                <div className="text-xs font-bold text-blue-950">Pending Payout Requests</div>
                <div className="text-[11px] text-blue-700">{finances.pendingPayoutsCount} withdrawal requests</div>
              </div>
            </div>
            <Link href="/admin/agents/payouts">
              <Button size="sm" variant="ghost" className="text-xs text-blue-900 hover:bg-blue-100 font-bold p-1">
                Disburse <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* CORE KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Agents */}
        <Link href="/admin/agents/all" className="block group">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs hover:border-emerald-500 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Agents</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-gray-900">{agents.total || 0}</div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500 font-medium">
              <span className="text-emerald-700 font-bold">{agents.active || 0} Active</span>
              <span>•</span>
              <span className="text-amber-700 font-bold">{agents.pendingVerification || 0} Pending</span>
            </div>
          </div>
        </Link>

        {/* Live Online */}
        <Link href="/admin/agents/live" className="block group">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs hover:border-emerald-500 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Online Right Now</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-teal-900">{agents.liveOnline || 0}</div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500 font-medium">
              <span className="text-indigo-600 font-bold">{agents.onDelivery || 0} On Delivery</span>
              <span>•</span>
              <span className="text-gray-500">{agents.offline || 0} Offline</span>
            </div>
          </div>
        </Link>

        {/* Suspended & Blocked */}
        <Link href="/admin/agents/suspended" className="block group">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs hover:border-amber-500 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Restricted / Blocked</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-rose-900">
              {(agents.suspended || 0) + (agents.blocked || 0)}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500 font-medium">
              <span className="text-amber-700 font-bold">{agents.suspended || 0} Suspended</span>
              <span>•</span>
              <span className="text-rose-700 font-bold">{agents.blocked || 0} Blocked</span>
            </div>
          </div>
        </Link>

        {/* Cash in Hand */}
        <Link href="/admin/agents/packages" className="block group">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs hover:border-emerald-500 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agent Cash In Hand</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-gray-900">₹{finances.totalCashInHand?.toLocaleString() || 0}</div>
            <div className="mt-1 text-[11px] text-emerald-700 font-semibold">
              Collected from COD rural parcels
            </div>
          </div>
        </Link>
      </div>

      {/* OPERATIONS PIPELINE & FINANCIAL METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Package Pipeline */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                Village Hub Parcel Throughput
              </h2>
              <p className="text-[11px] text-gray-400">Current state of parcels assigned to village agents</p>
            </div>
            <Link href="/admin/agents/packages">
              <Button size="sm" variant="ghost" className="text-xs text-emerald-700 hover:text-emerald-900 font-bold">
                View All Parcels
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
              <span className="text-[10px] font-bold text-amber-800 uppercase">At Village Hub</span>
              <div className="text-xl font-black text-amber-950 mt-1">{packages.stored || 0}</div>
              <span className="text-[10px] text-amber-700">Awaiting customer</span>
            </div>

            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
              <span className="text-[10px] font-bold text-blue-800 uppercase">Out for Delivery</span>
              <div className="text-xl font-black text-blue-950 mt-1">{packages.outForDelivery || 0}</div>
              <span className="text-[10px] text-blue-700">With agent now</span>
            </div>

            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Delivered</span>
              <div className="text-xl font-black text-emerald-950 mt-1">{packages.delivered || 0}</div>
              <span className="text-[10px] text-emerald-700">OTP verified</span>
            </div>

            <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100">
              <span className="text-[10px] font-bold text-rose-800 uppercase">Overdue (&gt;48h)</span>
              <div className="text-xl font-black text-rose-950 mt-1">{packages.overdue || 0}</div>
              <span className="text-[10px] text-rose-700">Hub holding alert</span>
            </div>
          </div>
        </div>

        {/* Financial Ledger */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                Village Financial Balance Sheet
              </h2>
              <p className="text-[11px] text-gray-400">Total commissions earned, disbursed, and awaiting payout</p>
            </div>
            <Link href="/admin/agents/payouts">
              <Button size="sm" variant="ghost" className="text-xs text-emerald-700 hover:text-emerald-900 font-bold">
                Payout Requests
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/80">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Total Earned</span>
              <div className="text-xl font-black text-emerald-950 mt-1">₹{finances.totalEarnings || 0}</div>
              <span className="text-[10px] text-emerald-700">Accrued commissions</span>
            </div>

            <div className="bg-teal-50/50 p-3.5 rounded-xl border border-teal-100/80">
              <span className="text-[10px] font-bold text-teal-800 uppercase">Paid Out</span>
              <div className="text-xl font-black text-teal-950 mt-1">₹{finances.totalPayoutsDisbursed || 0}</div>
              <span className="text-[10px] text-teal-700">Bank / UPI settled</span>
            </div>

            <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/80">
              <span className="text-[10px] font-bold text-indigo-800 uppercase">Pending Payout</span>
              <div className="text-xl font-black text-indigo-950 mt-1">₹{finances.pendingPayoutsAmount || 0}</div>
              <span className="text-[10px] text-indigo-700">{finances.pendingPayoutsCount || 0} requests</span>
            </div>
          </div>
        </div>
      </div>

      {/* DISTRICT COVERAGE & REGIONAL REACH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* District Breakdown */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-700" />
                Regional Coverage by District
              </h2>
              <p className="text-[11px] text-gray-400">Distribution of active hub nodes and rural parcels handled</p>
            </div>
            <span className="text-xs font-bold text-gray-500 font-mono">
              Avg Rating: <span className="text-amber-600">★ {agents.avgRating || 4.8}</span>
            </span>
          </div>

          <div className="space-y-3">
            {(charts.districtCoverage || []).map((dist: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 font-extrabold flex items-center justify-center text-xs">
                    {dist.district?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">{dist.district}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{dist.state}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-xs font-extrabold text-gray-900">{dist.agentsCount} Hubs</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">{dist.totalDelivered} Delivered</div>
                  </div>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                    Coverage Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operations Quick Links Panel */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs space-y-3">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              Operations Shortcuts
            </h2>
            <p className="text-[11px] text-gray-400">Direct access to administrative workflows</p>
          </div>

          <div className="space-y-2">
            <Link
              href="/admin/agents/verification"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition text-xs font-medium text-gray-700"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>KYC Identity Verification</span>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
                {moderation.pendingKycDocs || 0} Pending
              </Badge>
            </Link>

            <Link
              href="/admin/agents/suspended"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200 transition text-xs font-medium text-gray-700"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Suspended Hubs & Appeals</span>
              </div>
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                {agents.suspended || 0}
              </Badge>
            </Link>

            <Link
              href="/admin/agents/complaints"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-50/70 border border-transparent hover:border-rose-200 transition text-xs font-medium text-gray-700"
            >
              <div className="flex items-center gap-2">
                <MessageSquareWarning className="w-4 h-4 text-rose-600" />
                <span>Grievance Tickets</span>
              </div>
              <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px]">
                {moderation.pendingComplaints || 0} Open
              </Badge>
            </Link>

            <Link
              href="/admin/agents/reviews"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50/70 border border-transparent hover:border-purple-200 transition text-xs font-medium text-gray-700"
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-600" />
                <span>Customer Reviews Moderation</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono font-bold">
                {moderation.totalReviews || 0} Reviews
              </span>
            </Link>

            <Link
              href="/admin/agents/settings"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100/70 border border-transparent hover:border-gray-200 transition text-xs font-medium text-gray-700"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gray-600" />
                <span>Operations Configuration</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
