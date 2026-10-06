'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { formatCurrency } from '../../lib/utils';
import {
  Building2,
  Package,
  Truck,
  Receipt,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  CalendarCheck,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function BusinessDashboardPage() {
  const { user } = useAuth();
  const {
    business,
    stats,
    recentShipments,
    pickupLocations,
    loading,
    loadBusinessDashboard,
  } = useBusiness();

  return (
    <div className="space-y-8">
      {/* Top Banner & Enterprise Status Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-indigo-100">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {business?.businessName || user?.name || 'Enterprise Logistics Client'}
              </h1>
              <Badge
                variant="outline"
                className={
                  business?.status === 'suspended'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 text-[10px] uppercase font-bold tracking-wider'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] uppercase font-bold tracking-wider'
                }
              >
                {business?.status === 'suspended' ? 'Suspended' : 'Enterprise Logistics Client'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Contact: <strong className="text-gray-800 font-semibold">{business?.contactPerson || 'Authorized Manager'}</strong> • Phone: <span className="font-mono text-gray-700">{business?.contactPhone || user?.phone}</span> {business?.gstin ? `• GSTIN: ${business.gstin}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => loadBusinessDashboard()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 rounded-xl border-gray-200 text-xs font-semibold text-gray-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link href="/business/shipments?action=new">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 rounded-xl shadow-xs text-xs font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Book Shipment
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/business/shipments"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Total Shipments
            </span>
            <Package className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 block font-mono">
            {stats.totalShipments}
          </span>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1 group-hover:underline">
            View All Shipments <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/business/shipments?status=active"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              In-Transit Cargo
            </span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 block font-mono">
            {stats.activeShipments}
          </span>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 flex items-center gap-1 group-hover:underline">
            Active Freight Track <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/business/shipments?status=delivered"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Delivered Orders
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 block font-mono">
            {stats.deliveredShipments}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1 group-hover:underline">
            Completed Consignments <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/business/invoices"
          className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-purple-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Logistics Spend
            </span>
            <Receipt className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-800 block font-mono">
            ₹{stats.totalSpend.toLocaleString()}
          </span>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 flex items-center gap-1 group-hover:underline">
            Billing & Invoices <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
          <span>⚡ B2B Operations Quick Actions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/business/shipments?action=new"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-indigo-700">
                Book Single Shipment
              </h4>
              <p className="text-[11px] text-gray-500">Fast delivery dispatch for single package</p>
            </div>
          </Link>

          <Link
            href="/business/shipments?action=bulk"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-700">
                Bulk Shipment Batch
              </h4>
              <p className="text-[11px] text-gray-500">Dispatch multiple orders simultaneously</p>
            </div>
          </Link>

          <Link
            href="/business/pickups"
            className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50/40 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 group-hover:text-amber-700">
                Schedule Transporter Pickup
              </h4>
              <p className="text-[11px] text-gray-500">Corridor fleet pickup at your warehouse</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Shipments Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-gray-900">Recent Logistics Consignments</h3>
          </div>
          <Link
            href="/business/shipments"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            All Shipments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentShipments.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No shipments registered yet</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Ready to send commercial cargo or consumer packages? Create your first dispatch request now.
            </p>
            <Link href="/business/shipments?action=new">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold mt-2">
                Book First Shipment
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Tracking Number</th>
                  <th className="py-3 px-4">Destination & Recipient</th>
                  <th className="py-3 px-4">Cargo Details</th>
                  <th className="py-3 px-4">Pickup Code</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentShipments.map((parcel) => (
                  <tr key={parcel._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-gray-900 block">
                        {parcel.parcelTrackingNumber}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {parcel.createdAt ? new Date(parcel.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">{parcel.receiverName || 'Client Recipient'}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{parcel.deliveryLocation}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-800 font-medium">{parcel.whatIsInside || 'Consignment'}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {parcel.weightKg} kg • ₹{parcel.customerOfferPrice || 60}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {parcel.pickupCode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={
                          ['DELIVERED', 'delivered'].includes(parcel.status)
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold'
                            : ['PICKED_UP', 'IN_TRANSIT', 'ready_for_pickup'].includes(parcel.status)
                            ? 'bg-blue-50 text-blue-800 border-blue-200 text-[10px] font-bold animate-pulse'
                            : 'bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold'
                        }
                      >
                        {parcel.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/track/${parcel.parcelTrackingNumber}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Warehouse Locations & Credit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Warehouse Pickup Points */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Registered Pickup Warehouses
            </h3>
            <Link
              href="/business/profile"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-2.5">
            {pickupLocations && pickupLocations.length > 0 ? (
              pickupLocations.map((loc: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-gray-200/80 bg-gray-50/50 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                      {loc.addressLine || 'Warehouse Facility'}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {loc.villageOrCity || 'Central Hub'} {loc.pincode ? `• ${loc.pincode}` : ''}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-white text-gray-600 font-semibold">
                    {idx === 0 ? 'Primary' : 'Secondary'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500">
                Primary facility: {business?.registeredAddress?.addressLine || 'Central Regional Warehouse'}
              </div>
            )}
          </div>
        </div>

        {/* B2B Logistics Credit Account */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              B2B Freight Account Standing
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
              Active Tier
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] text-gray-300 uppercase font-semibold block">Total Limit</span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                ₹{stats.creditLimit.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] text-emerald-300 uppercase font-semibold block">Available</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                ₹{stats.availableCredit.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-300 leading-relaxed">
            Consolidated invoicing is generated at the end of each billing cycle. Payments accepted via corporate NEFT/RTGS and net banking.
          </p>
        </div>
      </div>
    </div>
  );
}
