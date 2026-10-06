'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdmin } from '../../../context/AdminContext';
import {
  Truck,
  Package,
  Search,
  RefreshCw,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Clock,
  Copy,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';

export default function AdminShipmentsPage() {
  const { shipments, loadAdminData, loading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredShipments = shipments.filter((s) => {
    const matchSearch =
      !searchTerm ||
      s.parcelTrackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.deliveryLocation?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchSearch;
    if (statusFilter === 'active') {
      return (
        matchSearch &&
        ['CREATED', 'PARTNER_ACCEPTED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'ready_for_pickup'].includes(s.status)
      );
    }
    if (statusFilter === 'delivered') {
      return matchSearch && ['DELIVERED', 'delivered'].includes(s.status);
    }
    return matchSearch && s.status === statusFilter;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Corridor Freight & Parcel Shipments
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time platform-wide logistics monitor: Track consignments, driver dispatches, and multi-leg handovers.
          </p>
        </div>

        <Button
          onClick={() => loadAdminData()}
          variant="outline"
          size="sm"
          className="rounded-xl text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: `All (${shipments.length})` },
            {
              id: 'active',
              label: `In-Transit (${
                shipments.filter((s) =>
                  ['CREATED', 'PARTNER_ACCEPTED', 'PICKUP_PENDING', 'PICKED_UP', 'IN_TRANSIT', 'ready_for_pickup'].includes(s.status)
                ).length
              })`,
            },
            {
              id: 'delivered',
              label: `Delivered (${shipments.filter((s) => ['DELIVERED', 'delivered'].includes(s.status)).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <Input
            type="text"
            placeholder="Search tracking, sender, destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredShipments.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No corridor shipments found matching this criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Sender / Origin</th>
                  <th className="py-3 px-4">Receiver / Destination</th>
                  <th className="py-3 px-4">Cargo / Weight</th>
                  <th className="py-3 px-4">Pickup Code</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Track</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredShipments.map((parcel) => (
                  <tr key={parcel._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-gray-900">
                          {parcel.parcelTrackingNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(parcel.parcelTrackingNumber)}
                          className="text-gray-400 hover:text-gray-700"
                          title="Copy tracking number"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      {copiedId === parcel.parcelTrackingNumber && (
                        <span className="text-[10px] text-emerald-600 font-bold block">Copied!</span>
                      )}
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {parcel.createdAt ? new Date(parcel.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{parcel.senderName || 'Sender'}</div>
                      <div className="text-[11px] text-gray-500 truncate max-w-[140px]">
                        {parcel.pickupLocation || 'Warehouse Hub'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{parcel.receiverName || 'Recipient'}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{parcel.deliveryLocation}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900 font-medium">{parcel.whatIsInside || 'Commercial Cargo'}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {parcel.weightKg} kg • {parcel.preferredLogisticsType || 'Tata Ace'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {parcel.pickupCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      ₹{parcel.customerOfferPrice || 60}
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-700 hover:text-sky-900 hover:bg-sky-50 transition"
                      >
                        <span>Live</span>
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
    </div>
  );
}
