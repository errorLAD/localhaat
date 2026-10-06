'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  Users,
  ArrowLeft,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ban,
  Eye,
  Trash2,
  Truck,
  DollarSign,
  Phone,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';

export default function LogisticsPartnersPage() {
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: 'password123',
    partnerCategory: 'PROFESSIONAL',
    primaryTransportType: 'Bike',
    vehicleNumber: '',
    capacityKg: 25,
    village: '',
    district: 'Darbhanga',
  });

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminLogisticsPartners({
        page: page.toString(),
        limit: '15',
        search,
        status: statusFilter,
        verification: verificationFilter,
      });
      if (res.success) {
        setPartners(res.partners || []);
        setTotal(res.total || 0);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [page, statusFilter, verificationFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPartners();
  };

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await api.createAdminLogisticsPartner(formData);
      if (res.success) {
        alert(res.message);
        setShowAddModal(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          password: 'password123',
          partnerCategory: 'PROFESSIONAL',
          primaryTransportType: 'Bike',
          vehicleNumber: '',
          capacityKg: 25,
          village: '',
          district: 'Darbhanga',
        });
        fetchPartners();
      }
    } catch (err: any) {
      alert(`Error creating partner: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePartner = async (partner: any) => {
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE partner ${partner.businessName}?`)) return;
    try {
      const res = await api.deleteAdminLogisticsPartner(partner._id);
      if (res.success) {
        alert(res.message);
        fetchPartners();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE ${selectedIds.length} partners?`)) return;
    try {
      const res = await api.bulkDeleteAdminLogisticsPartners(selectedIds);
      if (res.success) {
        alert(res.message);
        setSelectedIds([]);
        fetchPartners();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === partners.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(partners.map((p) => p._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <Link
            href="/admin/logistics"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Logistics Control Center
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Logistics Partners Directory
            </h1>
            <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-xs">
              {total} PARTNERS
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1" />
            Register Partner
          </Button>
          <Button size="sm" variant="outline" onClick={fetchPartners} className="text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <Input
            placeholder="Search by name, mobile, partner ID, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-2.5 text-xs font-semibold border border-gray-300 rounded-xl bg-white text-gray-700"
          >
            <option value="ALL">All Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending KYC</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-2.5 text-xs font-semibold border border-gray-300 rounded-xl bg-white text-gray-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="MOVING">Moving Now</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between animate-fadeIn">
          <span className="text-xs font-bold text-red-900">
            {selectedIds.length} partners selected
          </span>
          <Button
            size="sm"
            onClick={handleBulkDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete Selected ({selectedIds.length})
          </Button>
        </div>
      )}

      {/* Partners Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={partners.length > 0 && selectedIds.length === partners.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                </th>
                <th className="py-3 px-3">Partner ID</th>
                <th className="py-3 px-3">Partner Name / Fleet</th>
                <th className="py-3 px-3">Mobile & Address</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Transport</th>
                <th className="py-3 px-3">Operational Status</th>
                <th className="py-3 px-3">Verification</th>
                <th className="py-3 px-3 text-center">Active Parcels</th>
                <th className="py-3 px-3 text-right">Lifetime Earnings</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400">
                    No logistics partners found matching criteria.
                  </td>
                </tr>
              ) : (
                partners.map((partner) => {
                  const isSelected = selectedIds.includes(partner._id);

                  return (
                    <tr key={partner._id} className={`hover:bg-sky-50/40 transition ${isSelected ? 'bg-sky-50/60' : ''}`}>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(partner._id)}
                          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">
                        <Link href={`/admin/logistics/partners/${partner._id}`} className="hover:underline text-sky-700">
                          {partner.partnerCode || partner._id.slice(-6)}
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-gray-900">{partner.businessName}</div>
                        <div className="text-[11px] text-gray-500">{partner.userId?.name || 'Owner'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-gray-800">{partner.phone || partner.userId?.phone}</div>
                        <div className="text-[11px] text-gray-500 truncate max-w-[150px]">
                          {partner.address?.village || partner.address?.district || 'Darbhanga'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          className={`text-[10px] font-bold ${
                            partner.partnerCategory === 'TRAVELLING'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-blue-100 text-blue-900 border-blue-300'
                          }`}
                        >
                          {partner.partnerCategory || 'PROFESSIONAL'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-800">{partner.primaryTransportType || 'Bike'}</div>
                        {partner.vehicleNumber && (
                          <div className="text-[10px] font-mono text-gray-500">{partner.vehicleNumber}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          className={`text-[10px] font-bold ${
                            partner.partnerStatus === 'MOVING'
                              ? 'bg-emerald-500 text-white animate-pulse'
                              : partner.partnerStatus === 'AVAILABLE'
                              ? 'bg-sky-100 text-sky-900 border-sky-300'
                              : partner.partnerStatus === 'SUSPENDED' || partner.partnerStatus === 'BLOCKED'
                              ? 'bg-red-100 text-red-900 border-red-300'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {partner.partnerStatus || 'AVAILABLE'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          className={`text-[10px] font-bold ${
                            partner.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : partner.verificationStatus === 'PENDING'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-red-100 text-red-900 border-red-300'
                          }`}
                        >
                          {partner.verificationStatus || 'PENDING'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-gray-900">
                        {partner.activeParcelsCount || 0}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        ₹{(partner.totalEarnings || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/logistics/partners/${partner._id}`}>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-[11px] font-bold text-sky-700 border-sky-200">
                              <Eye className="w-3 h-3 mr-1" />
                              Profile
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePartner(partner)}
                            className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                Register New Logistics Partner
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Full Name *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Mobile Number *</label>
                  <Input
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9835012345"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Partner Type</label>
                  <select
                    value={formData.partnerCategory}
                    onChange={(e) => setFormData({ ...formData, partnerCategory: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs font-semibold border border-gray-300 rounded-xl bg-white"
                  >
                    <option value="PROFESSIONAL">Professional Logistics Partner</option>
                    <option value="TRAVELLING">Travelling Partner (Commuter)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Transport Type</label>
                  <select
                    value={formData.primaryTransportType}
                    onChange={(e) => setFormData({ ...formData, primaryTransportType: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs font-semibold border border-gray-300 rounded-xl bg-white"
                  >
                    {['Cycle', 'Bike', 'Auto', 'E-Rickshaw', 'Car', 'Van', 'Pickup', 'Truck', 'Bus', 'Approved Public Transport'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Vehicle Reg Number (Optional)</label>
                  <Input
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    placeholder="e.g. BR-07-AB-1234"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Capacity (KG) *</label>
                  <Input
                    type="number"
                    value={formData.capacityKg}
                    onChange={(e) => setFormData({ ...formData, capacityKg: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Village / Town</label>
                  <Input
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="e.g. Benipur / Gajahra"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">District</label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Darbhanga"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Login Password (Default: password123)</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating} className="bg-sky-600 hover:bg-sky-700 text-white font-bold">
                  {creating ? 'Registering...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
