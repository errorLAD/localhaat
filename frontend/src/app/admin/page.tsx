'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  FileText,
  DollarSign,
  Truck,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const {
    stats,
    users,
    businesses,
    kycDocs,
    payouts,
    shipments,
    products,
    loading,
    loadAdminData,
    handleVerifyKyc,
    handleProcessPayout,
  } = useAdmin();

  const pendingKyc = kycDocs.filter((d) => d.verificationStatus === 'PENDING');
  const pendingPayouts = payouts.filter((p) => p.status === 'pending');
  const activeShipments = shipments.filter((s) =>
    ['CREATED', 'PARTNER_ACCEPTED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'ready_for_pickup'].includes(s.status)
  );

  return (
    <div className="space-y-8">
      {/* Top Banner & Platform Master Status Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 text-white flex items-center justify-center shadow-md shadow-purple-100">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                Platform Administrative Control
              </h1>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] uppercase font-bold tracking-wider">
                ROOT SUPERADMIN
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Single-vendor store governance • B2B logistics accounts • Compliance KYC oversight • Financial settlements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => loadAdminData()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-xl border-gray-200 text-xs font-semibold text-gray-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link href="/admin/businesses?action=new">
            <Button
              size="sm"
              className="bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-1.5 rounded-xl shadow-xs text-xs font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Provision Business
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/admin/businesses"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              B2B Business Accounts
            </span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700 block font-mono">
            {businesses.length}
          </span>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1 group-hover:underline">
            Manage Accounts <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/admin/users"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Platform Users
            </span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 block font-mono">
            {users.length}
          </span>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1 group-hover:underline">
            Users Directory <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/admin/kyc"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-amber-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Pending KYC Docs
            </span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 block font-mono">
            {pendingKyc.length}
          </span>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1 group-hover:underline">
            Review Queue <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/admin/shipments"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-sky-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Active Shipments
            </span>
            <Truck className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-sky-700 block font-mono">
            {activeShipments.length}
          </span>
          <span className="text-[11px] text-sky-600 font-semibold mt-1 flex items-center gap-1 group-hover:underline">
            Corridor Tracking <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <span>⚡ Platform Administrator Quick Actions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/businesses?action=new"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-indigo-700">
                + Provision Business
              </h4>
              <p className="text-[11px] text-gray-500">Create client logistics credentials</p>
            </div>
          </Link>

          <Link
            href="/admin/kyc"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-amber-700">
                Verify KYC Queue
              </h4>
              <p className="text-[11px] text-gray-500">{pendingKyc.length} pending review</p>
            </div>
          </Link>

          <Link
            href="/admin/payouts"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-emerald-700">
                Disburse Payouts
              </h4>
              <p className="text-[11px] text-gray-500">{pendingPayouts.length} pending requests</p>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-purple-700">
                Manage Store Catalog
              </h4>
              <p className="text-[11px] text-gray-500">Single-vendor store products</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Grid: Pending KYC Queue & Pending Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending KYC Documents Review */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm text-gray-900">Pending KYC Verification</h3>
            </div>
            <Link href="/admin/kyc" className="text-xs font-bold text-amber-700 hover:underline">
              View All ({pendingKyc.length})
            </Link>
          </div>

          {pendingKyc.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              All partner and agent KYC documents verified!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingKyc.slice(0, 3).map((doc) => (
                <div key={doc._id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-gray-900">{doc.documentType}</div>
                    <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                      Doc #: {doc.documentNumber}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleVerifyKyc(doc._id, 'VERIFIED')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-7 px-2.5 rounded-lg"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleVerifyKyc(doc._id, 'REJECTED')}
                      className="text-xs h-7 px-2.5 rounded-lg"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Payout Disbursements */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-gray-900">Pending Payout Disbursements</h3>
            </div>
            <Link href="/admin/payouts" className="text-xs font-bold text-emerald-700 hover:underline">
              View All ({pendingPayouts.length})
            </Link>
          </div>

          {pendingPayouts.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              All transporter and agent payouts settled!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingPayouts.slice(0, 3).map((payout) => (
                <div key={payout._id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-extrabold text-gray-900 font-mono">
                      {formatCurrency(payout.amount)}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Mode: {payout.paymentMode} • {formatDate(payout.requestedAt)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleProcessPayout(payout._id)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-7 px-2.5 rounded-lg font-bold"
                  >
                    Disburse UPI
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
