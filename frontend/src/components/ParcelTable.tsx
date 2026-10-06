'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  UserCheck,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Ban,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Radio,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ParcelTableProps {
  fixedStatus?: string;
  title?: string;
  subtitle?: string;
  isUnbookedQueue?: boolean;
}

export const ParcelTable: React.FC<ParcelTableProps> = ({
  fixedStatus,
  title = 'Parcels Operations Directory',
  subtitle = 'Monitor real-time shipments, verify handovers, and match logistics partners across Bihar & UP',
  isUnbookedQueue = false,
}) => {
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(fixedStatus || 'all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [logisticsTypeFilter, setLogisticsTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Action States
  const [assignModalParcel, setAssignModalParcel] = useState<any | null>(null);
  const [matchingPartners, setMatchingPartners] = useState<any[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Fetch Parcels
  const fetchParcels = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, any> = {
        page,
        limit,
        status: fixedStatus || (statusFilter !== 'all' ? statusFilter : undefined),
        search: search.trim() || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        logisticsType: logisticsTypeFilter !== 'all' ? logisticsTypeFilter : undefined,
      };

      const res = await api.getAdminParcels(params);
      if (res.success) {
        setParcels(res.parcels || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      } else {
        setError(res.message || 'Failed to fetch parcels.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to LocalHaat parcel API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, [page, limit, statusFilter, categoryFilter, logisticsTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchParcels();
  };

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedIds.length === parcels.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(parcels.map((p) => p._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Automated Matching & Assignment
  const handleOpenAssignModal = async (parcel: any) => {
    setAssignModalParcel(parcel);
    setSelectedPartnerId('');
    setMatchingLoading(true);
    try {
      const res = await api.findMatchingPartnersForParcel(parcel._id);
      if (res.success) {
        setMatchingPartners(res.matches || []);
        if (res.matches && res.matches.length > 0) {
          setSelectedPartnerId(res.matches[0].partnerId);
        }
      }
    } catch (err: any) {
      console.error('Error fetching partner matches:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleConfirmAssignment = async () => {
    if (!assignModalParcel || !selectedPartnerId) return;
    try {
      setAssigningLoading(true);
      const selectedMatch = matchingPartners.find((m) => m.partnerId === selectedPartnerId);
      const res = await api.assignAdminParcelPartner(assignModalParcel._id, {
        partnerId: selectedPartnerId,
        vehicleId: selectedMatch?.vehicle?._id,
        note: `Matched via Admin Operations Engine (${selectedMatch?.matchScore}% compatibility)`,
      });
      if (res.success) {
        setActionMessage(`Partner assigned successfully to parcel ${assignModalParcel.parcelId}!`);
        setAssignModalParcel(null);
        fetchParcels();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setAssigningLoading(false);
    }
  };

  // Bulk Actions: Cancel
  const handleBulkCancel = async () => {
    if (!confirm(`Are you sure you want to cancel ${selectedIds.length} parcels?`)) return;
    try {
      const res = await api.bulkAdminParcelActions({
        parcelIds: selectedIds,
        action: 'CANCEL',
        reason: 'Bulk cancellation by Admin operator',
      });
      if (res.success) {
        setActionMessage(res.message);
        setSelectedIds([]);
        fetchParcels();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err: any) {
      alert(`Bulk cancel failed: ${err.message}`);
    }
  };

  // Bulk Actions: Permanent Delete
  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to PERMANENTLY DELETE ${selectedIds.length} selected parcels from the database? This cannot be undone.`
      )
    )
      return;
    try {
      const res = await api.bulkDeleteAdminParcels(selectedIds, 'Bulk deletion by admin operator');
      if (res.success) {
        setActionMessage(res.message || `${selectedIds.length} parcels permanently deleted.`);
        setSelectedIds([]);
        fetchParcels();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err: any) {
      alert(`Bulk delete failed: ${err.message}`);
    }
  };

  // Single Row Delete
  const handleDeleteSingleParcel = async (p: any) => {
    if (
      !confirm(
        `Are you sure you want to PERMANENTLY DELETE parcel ${p.parcelId} (${p.whatIsInside})? All associated tracking events and legs will be removed.`
      )
    )
      return;
    try {
      const res = await api.deleteAdminParcel(p._id, 'Single delete by admin operator');
      if (res.success) {
        setActionMessage(`Parcel ${p.parcelId} was successfully deleted.`);
        fetchParcels();
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Status Badge Formatter
  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'SEARCHING_FOR_PARTNER':
      case 'CREATED':
        return (
          <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-semibold text-[11px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Searching Partner
          </Badge>
        );
      case 'PARTNER_ACCEPTED':
        return (
          <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-semibold text-[11px] flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-sky-700" />
            Partner Accepted
          </Badge>
        );
      case 'PICKUP_PENDING':
      case 'READY_FOR_PICKUP':
        return (
          <Badge className="bg-orange-100 text-orange-900 border-orange-300 font-semibold text-[11px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-orange-700" />
            Pickup Pending
          </Badge>
        );
      case 'PICKED_UP':
        return (
          <Badge className="bg-indigo-100 text-indigo-900 border-indigo-300 font-semibold text-[11px] flex items-center gap-1">
            <Truck className="w-3 h-3 text-indigo-700" />
            Picked Up
          </Badge>
        );
      case 'IN_TRANSIT':
        return (
          <Badge className="bg-blue-100 text-blue-900 border-blue-300 font-semibold text-[11px] flex items-center gap-1">
            <Radio className="w-3 h-3 text-blue-700 animate-pulse" />
            In Transit
          </Badge>
        );
      case 'HANDOVER_PENDING':
      case 'AT_HUB':
        return (
          <Badge className="bg-purple-100 text-purple-900 border-purple-300 font-semibold text-[11px] flex items-center gap-1">
            <Building className="w-3 h-3 text-purple-700" />
            At Hub
          </Badge>
        );
      case 'RECEIVED_BY_AGENT':
      case 'ARRIVED_AT_VILLAGE_HUB':
      case 'AT_VILLAGE_AGENT':
        return (
          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            At Village Agent
          </Badge>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <Badge className="bg-teal-100 text-teal-900 border-teal-300 font-semibold text-[11px] flex items-center gap-1">
            <Truck className="w-3 h-3 text-teal-700 animate-bounce" />
            Out for Delivery
          </Badge>
        );
      case 'DELIVERED':
        return (
          <Badge className="bg-green-100 text-green-900 border-green-300 font-semibold text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-700" />
            Delivered
          </Badge>
        );
      case 'FAILED_DELIVERY':
      case 'FAILED':
        return (
          <Badge className="bg-red-100 text-red-900 border-red-300 font-semibold text-[11px] flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-700" />
            Delivery Failed
          </Badge>
        );
      case 'RETURNED':
        return (
          <Badge className="bg-rose-100 text-rose-900 border-rose-300 font-semibold text-[11px] flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-rose-700" />
            Returned
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300 font-semibold text-[11px] flex items-center gap-1">
            <Ban className="w-3 h-3 text-gray-600" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 font-semibold text-[11px]">
            {status}
          </Badge>
        );
    }
  };

  // Calculate waiting time helper
  const getWaitingDurationText = (createdAt: string) => {
    const diffMins = Math.floor((Date.now() - new Date(createdAt).getTime()) / (60 * 1000));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const isOverdueWait = (createdAt: string) => {
    const diffMins = Math.floor((Date.now() - new Date(createdAt).getTime()) / (60 * 1000));
    return diffMins >= 30;
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Package className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchParcels}
            disabled={loading}
            className="text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <a
            href={api.getAdminParcelsCsvUrl(fixedStatus ? { status: fixedStatus } : undefined)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </Button>
          </a>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by Parcel ID, Tracking #, Sender, Receiver, Phone, Village / City..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9 bg-gray-50/70 border-gray-200 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!fixedStatus && (
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="searching">Searching Partner (Unbooked)</option>
                <option value="accepted">Partner Accepted</option>
                <option value="pickup_pending">Pickup Pending</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="at_hub">At Hub</option>
                <option value="at_agent">At Village Agent</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Delivery Failed</option>
                <option value="returned">Returned</option>
                <option value="cancelled">Cancelled</option>
              </select>
            )}

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Groceries & Staples">Groceries & Staples</option>
              <option value="Art & Handicrafts">Art & Handicrafts</option>
              <option value="Textiles & Apparel">Textiles & Apparel</option>
              <option value="Electronics & Appliances">Electronics & Appliances</option>
              <option value="Health & Wellness">Health & Wellness</option>
              <option value="Agriculture & Farm Inputs">Agriculture & Farm Inputs</option>
              <option value="Hardware & Tools">Hardware & Tools</option>
              <option value="Books & Stationery">Books & Stationery</option>
            </select>

            <select
              value={logisticsTypeFilter}
              onChange={(e) => {
                setLogisticsTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg border border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Any Transport</option>
              <option value="Bike">Bike / Two-Wheeler</option>
              <option value="Pickup Van">Pickup Van / Auto</option>
              <option value="Mini Truck">Mini Truck (Bolero/Tata Ace)</option>
            </select>

            <Button type="submit" size="sm" className="h-9 text-xs bg-gray-900 hover:bg-black text-white font-bold">
              Filter
            </Button>
          </div>
        </form>

        {/* Bulk Action Toolbar if items selected */}
        {selectedIds.length > 0 && (
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between bg-blue-50/60 p-2.5 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                {selectedIds.length}
              </span>
              <span>Parcels Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-8 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete Selected ({selectedIds.length})
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkCancel}
                className="text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50 h-8"
              >
                <Ban className="w-3.5 h-3.5 mr-1" />
                Cancel Selected
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Parcels Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {loading && parcels.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-gray-500">Loading parcels from MongoDB logistics database...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
            <div className="text-sm font-bold text-rose-950">{error}</div>
            <Button size="sm" onClick={fetchParcels} className="text-xs">
              Try Again
            </Button>
          </div>
        ) : parcels.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Package className="w-10 h-10 text-gray-300 mx-auto" />
            <div className="text-sm font-bold text-gray-800">No parcels match the current query</div>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {fixedStatus
                ? `Currently no parcels in "${fixedStatus}" stage. Check other queues or create a new parcel.`
                : 'Try adjusting your search criteria, status filter, or transport type filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-gray-400 hover:text-gray-900 focus:outline-none"
                    >
                      {selectedIds.length === parcels.length && parcels.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">Parcel & Tracking</th>
                  <th className="py-3 px-3">Sender / Origin</th>
                  <th className="py-3 px-3">Receiver / Destination</th>
                  <th className="py-3 px-3">Contents & Specs</th>
                  <th className="py-3 px-3">Financials</th>
                  <th className="py-3 px-3">Logistics Partner</th>
                  <th className="py-3 px-3">Village Agent</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parcels.map((p) => {
                  const isSelected = selectedIds.includes(p._id);
                  const isUnbooked = ['SEARCHING_FOR_PARTNER', 'created', 'CREATED'].includes(p.status);
                  const waitingText = getWaitingDurationText(p.createdAt);
                  const overdue = isUnbooked && isOverdueWait(p.createdAt);

                  return (
                    <tr
                      key={p._id}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        isSelected ? 'bg-blue-50/50' : overdue ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(p._id)}
                          className="text-gray-400 hover:text-gray-900 focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Parcel ID & Tracking */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Link
                          href={`/admin/parcels/${p._id}`}
                          className="font-bold text-blue-700 hover:text-blue-900 hover:underline font-mono text-xs block"
                        >
                          {p.parcelId}
                        </Link>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{p.parcelTrackingNumber}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-gray-400">{waitingText}</span>
                          {overdue && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-red-100 text-red-700 rounded-sm uppercase tracking-wider animate-pulse">
                              ALERT &gt;30m
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sender */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900 truncate max-w-[140px]">{p.senderName}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">{p.senderMobile}</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[140px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                          <span>{p.pickupLocation}</span>
                        </div>
                      </td>

                      {/* Receiver */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900 truncate max-w-[140px]">{p.receiverName}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">{p.receiverMobile}</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[140px] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                          <span>{p.deliveryLocation}</span>
                        </div>
                      </td>

                      {/* Contents & Specs */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-900 truncate max-w-[170px]" title={p.whatIsInside}>
                          {p.whatIsInside}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[170px] mt-0.5">
                          {p.parcelCategory || 'General'}
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono mt-0.5 flex items-center gap-2">
                          <span>{p.weightKg || 1} KG</span>
                          <span>•</span>
                          <span>{p.preferredLogisticsType || 'Bike'}</span>
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-extrabold text-gray-900 text-xs">₹{p.customerOfferPrice}</div>
                        <div className="text-[10px] text-emerald-700 mt-0.5">
                          Partner: ~₹{Math.round(p.customerOfferPrice * 0.6)}
                        </div>
                        <div className="text-[10px] text-blue-700">
                          Agent: ~₹{Math.max(30, Math.round(p.customerOfferPrice * 0.15))}
                        </div>
                      </td>

                      {/* Assigned Logistics Partner */}
                      <td className="py-3 px-3">
                        {p.currentPartnerId ? (
                          <div>
                            <div className="font-bold text-gray-900 truncate max-w-[130px]">
                              {p.currentPartnerId.businessName || 'Transporter'}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              {p.currentPartnerId.userId?.phone || ''}
                            </div>
                            {p.currentVehicleId && (
                              <div className="text-[9px] text-indigo-700 font-mono bg-indigo-50 px-1 py-0.2 rounded mt-0.5 inline-block">
                                {p.currentVehicleId.registrationNumber || p.currentVehicleId.vehicleType}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold border border-amber-200">
                              Unassigned
                            </span>
                            <button
                              onClick={() => handleOpenAssignModal(p)}
                              className="block text-[10px] text-blue-600 hover:text-blue-800 font-bold underline"
                            >
                              Auto-Match
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Assigned Village Agent */}
                      <td className="py-3 px-3">
                        {p.currentAgentId ? (
                          <div>
                            <div className="font-bold text-gray-900 truncate max-w-[130px]">
                              {p.currentAgentId.villageName}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              {p.currentAgentId.hubCode}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-mono">No Agent</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">{getStatusBadge(p.status)}</td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/parcels/${p._id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[11px] font-bold text-blue-700 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Dossier
                            </Button>
                          </Link>

                          {isUnbooked && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenAssignModal(p)}
                              className="h-7 px-2 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                            >
                              Match
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSingleParcel(p)}
                            title="Delete Parcel"
                            className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {parcels.length > 0 && (
          <div className="p-3 bg-gray-50/80 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>
              Showing <span className="font-bold text-gray-900">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-bold text-gray-900">{Math.min(page * limit, totalCount)}</span> of{' '}
              <span className="font-bold text-gray-900">{totalCount}</span> parcels
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-7 text-xs font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                Previous
              </Button>

              <span className="px-2 text-xs font-bold text-gray-800">
                Page {page} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-7 text-xs font-semibold"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* AUTOMATED PARTNER MATCHING MODAL */}
      {assignModalParcel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-200 shadow-xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/30">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Automated Partner Matching Algorithm
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Parcel: <span className="font-mono font-bold text-gray-800">{assignModalParcel.parcelId}</span> |{' '}
                  {assignModalParcel.weightKg} KG ({assignModalParcel.preferredLogisticsType})
                </p>
              </div>
              <button
                onClick={() => setAssignModalParcel(null)}
                className="text-gray-400 hover:text-gray-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-1 text-blue-950">
                <div className="font-bold flex items-center justify-between">
                  <span>Pickup: {assignModalParcel.pickupLocation}</span>
                  <span>Destination: {assignModalParcel.deliveryLocation}</span>
                </div>
                <div className="text-[11px] text-blue-800">
                  Customer Offer: <strong>₹{assignModalParcel.customerOfferPrice}</strong> (Est. Partner Earning:{' '}
                  <strong>₹{Math.round(assignModalParcel.customerOfferPrice * 0.6)}</strong>)
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Ranked Active Partners ({matchingPartners.length})
                </div>

                {matchingLoading ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-gray-500">Running proximity & capacity matching algorithm...</p>
                  </div>
                ) : matchingPartners.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl">
                    No online partners found matching this route. Admin can assign from all transporters.
                  </div>
                ) : (
                  matchingPartners.map((m) => {
                    const isSelected = selectedPartnerId === m.partnerId;
                    return (
                      <div
                        key={m.partnerId}
                        onClick={() => setSelectedPartnerId(m.partnerId)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-900">{m.businessName}</span>
                            <span className="text-[10px] font-mono text-gray-500">{m.user?.phone}</span>
                            {m.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online" />
                            )}
                          </div>

                          <div className="text-[11px] text-gray-600 flex items-center gap-2">
                            <span>Rating: ★{m.rating}</span>
                            <span>•</span>
                            <span>{m.totalTrips} Trips</span>
                            {m.vehicle && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-indigo-700">
                                  {m.vehicle.vehicleType} ({m.vehicle.maxCapacityKg}kg cap)
                                </span>
                              </>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1 mt-1">
                            {m.matchReasons?.map((r: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[9px] bg-white border border-gray-200 text-gray-600 px-1.5 py-0.2 rounded"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-right shrink-0 ml-3">
                          <div className="font-extrabold text-sm text-blue-700 font-mono">{m.matchScore}%</div>
                          <div className="text-[10px] text-gray-400 font-mono">Match Score</div>
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            ~{m.estimatedArrivalMins}m away
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setAssignModalParcel(null)} className="text-xs">
                Cancel
              </Button>

              <Button
                size="sm"
                disabled={!selectedPartnerId || assigningLoading}
                onClick={handleConfirmAssignment}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
              >
                {assigningLoading ? 'Assigning...' : 'Confirm Partner Assignment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
