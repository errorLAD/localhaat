'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

export default function AgentPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page.toString(),
        limit: '15',
      };
      if (search.trim()) params.search = search.trim();
      if (status !== 'ALL') params.status = status;
      if (overdueOnly) params.overdueOnly = 'true';

      const res = await api.getAdminAgentPackages(params);
      if (res.success) {
        setPackages(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching agent packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [page, status, overdueOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPackages();
  };

  const getStatusBadge = (pkgStatus: string, updatedAt: string) => {
    const isOverdue =
      ['RECEIVED_BY_AGENT', 'arrived_at_village_hub'].includes(pkgStatus) &&
      new Date().getTime() - new Date(updatedAt).getTime() > 48 * 60 * 60 * 1000;

    switch (pkgStatus) {
      case 'RECEIVED_BY_AGENT':
      case 'arrived_at_village_hub':
        return (
          <div className="flex items-center gap-1.5">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">AT VILLAGE HUB</Badge>
            {isOverdue && (
              <Badge className="bg-rose-100 text-rose-800 border-rose-200 animate-pulse text-[9px]">
                OVERDUE (&gt;48H)
              </Badge>
            )}
          </div>
        );
      case 'OUT_FOR_DELIVERY':
      case 'out_for_delivery':
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse">OUT FOR DELIVERY</Badge>;
      case 'DELIVERED':
      case 'delivered':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">DELIVERED</Badge>;
      case 'FAILED_DELIVERY':
      case 'failed_delivery':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">DELIVERY FAILED</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{pkgStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hub Inventory Control</span>
            <span className="text-xs font-bold text-emerald-700 font-mono">({total} Parcels)</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Agent Packages & Hub Inventory</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track packages received at village hubs, monitor doorstep delivery attempts, and detect overdue storage bottlenecks.
          </p>
        </div>

        <Button onClick={fetchPackages} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Packages
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by Tracking Number (LH-TRK-...), Parcel ID, Receiver Name or Mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-10 rounded-xl"
            />
          </div>
          <Button type="submit" size="sm" className="w-full sm:w-auto h-10 px-5 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl">
            Filter Parcels
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-500">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs bg-white text-gray-800"
            >
              <option value="ALL">All Hub Stages</option>
              <option value="RECEIVED_BY_AGENT">Stored At Agent Hub</option>
              <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="FAILED_DELIVERY">Failed / Returned</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-700">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => {
                setOverdueOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded text-rose-600"
            />
            <span>Overdue Hub Storage Only (&gt;48 Hours)</span>
          </label>
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Tracking & Package</th>
                <th className="py-3 px-4">Assigned Agent</th>
                <th className="py-3 px-4">Receiver & Destination</th>
                <th className="py-3 px-4">Status & Overdue Flag</th>
                <th className="py-3 px-4 text-center">Handover / PIN</th>
                <th className="py-3 px-4 text-right">Value / Offer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && packages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                    Querying package inventory...
                  </td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No packages currently match the inventory filter.
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-emerald-800">{pkg.parcelTrackingNumber}</div>
                      <div className="text-[11px] text-gray-600 font-semibold">{pkg.whatIsInside || 'General Parcel'}</div>
                      <div className="text-[10px] text-gray-400">{pkg.parcelCategory} • {pkg.weightKg || 1} kg</div>
                    </td>

                    <td className="py-3 px-4">
                      {pkg.currentAgentId ? (
                        <div>
                          <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 text-[10px]">
                            {pkg.currentAgentId.hubCode}
                          </span>
                          <div className="text-[11px] text-gray-700 font-medium truncate max-w-[150px] mt-0.5">
                            {pkg.currentAgentId.villageName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned Hub</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{pkg.receiverName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{pkg.receiverMobile}</div>
                      <div className="text-[10px] text-gray-400 truncate max-w-[170px]">{pkg.deliveryLocation}</div>
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(pkg.status, pkg.updatedAt)}</td>

                    <td className="py-3 px-4 text-center font-mono">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-bold text-gray-800">
                        PIN: {pkg.deliveryPin || '****'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="font-black text-gray-900 font-mono">₹{pkg.customerOfferPrice || 0}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Prepaid/COD</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>Page {page} of {totalPages} ({total} parcels)</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)} className="text-xs h-8 px-3">
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="text-xs h-8 px-3">
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
