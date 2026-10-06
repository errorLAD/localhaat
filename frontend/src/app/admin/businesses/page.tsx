'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdmin } from '../../../context/AdminContext';
import { api } from '../../../lib/api';
import { Parcel } from '../../../types';
import {
  Building2,
  PlusCircle,
  Search,
  KeyRound,
  Edit,
  Power,
  Package,
  MapPin,
  RefreshCw,
  X,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';

function AdminBusinessesContent() {
  const searchParams = useSearchParams();
  const { businesses, loadAdminData, handleCreateBusiness, handleUpdateBusiness, handleResetBusinessPassword } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    businessType: 'Logistics Enterprise',
    gstin: '',
    addressLine: '',
    villageOrCity: '',
    pincode: '',
    password: 'business123',
    creditLimit: 25000,
    status: 'active',
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Reset Password Modal
  const [resetModalBiz, setResetModalBiz] = useState<any>(null);
  const [newBizPassword, setNewBizPassword] = useState('Pass@2026');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  // Edit Modal
  const [editModalBiz, setEditModalBiz] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    creditLimit: 25000,
    status: 'active',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // View Shipments Modal
  const [shipmentsDrawerBiz, setShipmentsDrawerBiz] = useState<any>(null);
  const [bizShipments, setBizShipments] = useState<Parcel[]>([]);
  const [loadingBizShipments, setLoadingBizShipments] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  const filteredBusinesses = businesses.filter((b) => {
    const matchSearch =
      !searchTerm ||
      b.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.contactPhone?.includes(searchTerm);
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.businessName || !createForm.phone || !createForm.contactPerson) {
      alert('Business Name, Contact Person, and Mobile Phone are required.');
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await handleCreateBusiness({
        businessName: createForm.businessName,
        contactPerson: createForm.contactPerson,
        phone: createForm.phone,
        email: createForm.email,
        businessType: createForm.businessType,
        gstin: createForm.gstin,
        password: createForm.password,
        creditLimit: Number(createForm.creditLimit),
        status: createForm.status,
        address: {
          addressLine: createForm.addressLine || 'Warehouse Facility',
          villageOrCity: createForm.villageOrCity || 'Central Hub',
          pincode: createForm.pincode || '226001',
        },
        pickupLocations: [
          {
            addressLine: createForm.addressLine || 'Warehouse Facility',
            villageOrCity: createForm.villageOrCity || 'Central Hub',
            pincode: createForm.pincode || '226001',
          },
        ],
      });

      if (res.success) {
        alert(res.message || 'Business account provisioned successfully!');
        setShowCreateModal(false);
        setCreateForm({
          businessName: '',
          contactPerson: '',
          phone: '',
          email: '',
          businessType: 'Logistics Enterprise',
          gstin: '',
          addressLine: '',
          villageOrCity: '',
          pincode: '',
          password: 'business123',
          creditLimit: 25000,
          status: 'active',
        });
      }
    } catch (err: any) {
      alert(`Creation failed: ${err.message}`);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleToggleStatus = async (biz: any) => {
    const nextStatus = biz.status === 'active' ? 'suspended' : 'active';
    try {
      await handleUpdateBusiness(biz._id, { status: nextStatus });
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalBiz) return;
    setResetSubmitting(true);
    try {
      const res = await handleResetBusinessPassword(resetModalBiz._id, newBizPassword);
      alert(res.message || 'Password reset successfully!');
      setResetModalBiz(null);
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalBiz) return;
    setEditSubmitting(true);
    try {
      const res = await handleUpdateBusiness(editModalBiz._id, editForm);
      alert(res.message || 'Business updated!');
      setEditModalBiz(null);
    } catch (err: any) {
      alert(`Edit failed: ${err.message}`);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleOpenShipments = async (biz: any) => {
    setShipmentsDrawerBiz(biz);
    setLoadingBizShipments(true);
    try {
      const res = await api.getAdminBusinessShipments(biz._id);
      setBizShipments(res.shipments || []);
    } catch (err: any) {
      setBizShipments([]);
    } finally {
      setLoadingBizShipments(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              B2B Business Accounts Management
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Centrally provision contracted freight & logistics client credentials, configure credit lines, and manage facility points.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => loadAdminData()}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>

          <Button
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Create Business Account
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Accounts' },
            { id: 'active', label: 'Active' },
            { id: 'suspended', label: 'Suspended' },
            { id: 'inactive', label: 'Inactive' },
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
            placeholder="Search business, contact, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredBusinesses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">No Business Accounts Found</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No business accounts match this criteria. Click 'Create Business Account' to provision a new client.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Business Entity</th>
                  <th className="py-3 px-4">Contact Person & Username</th>
                  <th className="py-3 px-4">Approved Credit Line</th>
                  <th className="py-3 px-4">Consignments</th>
                  <th className="py-3 px-4">Logistics Spend</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBusinesses.map((biz) => (
                  <tr key={biz._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900 block">{biz.businessName}</span>
                      <span className="text-[11px] text-gray-500">
                        {biz.businessType || 'Commercial Client'} {biz.gstin ? `• GSTIN: ${biz.gstin}` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">{biz.contactPerson || 'Authorized Lead'}</div>
                      <div className="font-mono text-gray-500 text-[11px]">{biz.contactPhone}</div>
                      {biz.contactEmail && (
                        <div className="text-[10px] text-gray-400">{biz.contactEmail}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      ₹{(biz.creditLimit || 25000).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-700 block">
                        {biz.totalShipments || 0} total
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold">
                        {biz.activeShipments || 0} active
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      ₹{(biz.totalSpend || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={
                          biz.status === 'suspended'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold uppercase'
                            : biz.status === 'inactive'
                            ? 'bg-gray-100 text-gray-600 border-gray-200 text-[10px] font-bold uppercase'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold uppercase'
                        }
                      >
                        {biz.status || 'ACTIVE'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenShipments(biz)}
                          className="h-7 px-2 text-[11px] rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          title="View Shipments"
                        >
                          <Package className="w-3 h-3 mr-1" />
                          Shipments
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setResetModalBiz(biz);
                            setNewBizPassword('Pass@2026');
                          }}
                          className="h-7 px-2 text-[11px] rounded-lg border-gray-200 text-gray-700 hover:bg-gray-100"
                          title="Reset Password"
                        >
                          <KeyRound className="w-3 h-3 mr-1 text-amber-600" />
                          Reset
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditModalBiz(biz);
                            setEditForm({
                              businessName: biz.businessName,
                              contactPerson: biz.contactPerson || '',
                              email: biz.contactEmail || '',
                              creditLimit: biz.creditLimit || 25000,
                              status: biz.status || 'active',
                            });
                          }}
                          className="h-7 px-2 text-[11px] rounded-lg border-gray-200 text-gray-700 hover:bg-gray-100"
                          title="Edit Business"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(biz)}
                          className={`h-7 px-2 text-[11px] rounded-lg ${
                            biz.status === 'active'
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={biz.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                        >
                          <Power className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE BUSINESS MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Provision B2B Business Account</h3>
                  <p className="text-[11px] text-gray-500">Create client login credentials and warehouse pickup profile</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Business / Company Name *</label>
                  <Input
                    required
                    placeholder="e.g. Kisan Agro Mills Ltd."
                    value={createForm.businessName}
                    onChange={(e) => setCreateForm({ ...createForm, businessName: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Contact Person *</label>
                  <Input
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={createForm.contactPerson}
                    onChange={(e) => setCreateForm({ ...createForm, contactPerson: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Mobile Number (Login User ID) *</label>
                  <Input
                    required
                    type="tel"
                    placeholder="e.g. 9811223344"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Official Email</label>
                  <Input
                    type="email"
                    placeholder="e.g. logistics@kisanagro.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">GSTIN / Registration</label>
                  <Input
                    placeholder="09AAECR1234F1Z5"
                    value={createForm.gstin}
                    onChange={(e) => setCreateForm({ ...createForm, gstin: e.target.value })}
                    className="h-10 text-xs rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Business Sector</label>
                  <select
                    value={createForm.businessType}
                    onChange={(e) => setCreateForm({ ...createForm, businessType: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="Agro Enterprise">Agro Enterprise / Producer</option>
                    <option value="Logistics Enterprise">Logistics & Supply Chain</option>
                    <option value="Manufacturing & Tools">Manufacturing & Tools</option>
                    <option value="Wholesale Distributor">Wholesale Distributor</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Warehouse Address Line</label>
                <Input
                  placeholder="e.g. Plot 42, Agro Industrial Park"
                  value={createForm.addressLine}
                  onChange={(e) => setCreateForm({ ...createForm, addressLine: e.target.value })}
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">City / Village Hub</label>
                  <Input
                    placeholder="e.g. Varanasi Hub"
                    value={createForm.villageOrCity}
                    onChange={(e) => setCreateForm({ ...createForm, villageOrCity: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Postal Pincode</label>
                  <Input
                    placeholder="e.g. 221001"
                    value={createForm.pincode}
                    onChange={(e) => setCreateForm({ ...createForm, pincode: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Temporary Password</label>
                  <Input
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="h-10 text-xs rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Approved Credit Line (₹)</label>
                  <Input
                    type="number"
                    value={createForm.creditLimit}
                    onChange={(e) => setCreateForm({ ...createForm, creditLimit: Number(e.target.value) })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={createSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 text-xs"
              >
                {createSubmitting ? 'Provisioning Account...' : 'Provision Business Account'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetModalBiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Reset Password for {resetModalBiz.businessName}
              </h3>
              <button onClick={() => setResetModalBiz(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Set a new temporary password for login phone <strong className="font-mono text-gray-800">{resetModalBiz.contactPhone}</strong>.
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">New Password</label>
                <Input
                  required
                  value={newBizPassword}
                  onChange={(e) => setNewBizPassword(e.target.value)}
                  className="rounded-xl h-10 text-xs font-mono"
                />
              </div>

              <Button
                type="submit"
                disabled={resetSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-10 text-xs"
              >
                {resetSubmitting ? 'Updating...' : 'Set New Password'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalBiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-600" />
                Edit Account Details
              </h3>
              <button onClick={() => setEditModalBiz(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Business Name</label>
                <Input
                  value={editForm.businessName}
                  onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Contact Person</label>
                <Input
                  value={editForm.contactPerson}
                  onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Official Email</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Credit Limit (₹)</label>
                  <Input
                    type="number"
                    value={editForm.creditLimit}
                    onChange={(e) => setEditForm({ ...editForm, creditLimit: Number(e.target.value) })}
                    className="rounded-xl h-10 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={editSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 text-xs"
              >
                {editSubmitting ? 'Saving Changes...' : 'Save Business Changes'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW SHIPMENTS MODAL */}
      {shipmentsDrawerBiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Shipments: {shipmentsDrawerBiz.businessName}
                </h3>
                <p className="text-[11px] text-gray-500">
                  Total Dispatches: {bizShipments.length} consignments
                </p>
              </div>
              <button onClick={() => setShipmentsDrawerBiz(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingBizShipments ? (
              <div className="p-8 text-center text-gray-400 text-xs">Loading shipments...</div>
            ) : bizShipments.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No shipments registered yet for this client.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {bizShipments.map((s) => (
                  <div key={s._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-gray-900 block">
                        {s.parcelTrackingNumber}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        To: {s.receiverName} ({s.deliveryLocation})
                      </span>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {s.whatIsInside} • {s.weightKg} kg • ₹{s.customerOfferPrice}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        {s.status.replace(/_/g, ' ')}
                      </Badge>
                      <div className="text-[10px] text-gray-400 mt-1 font-mono">
                        Pickup Code: {s.pickupCode}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBusinessesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
          <span>Loading Businesses...</span>
        </div>
      }
    >
      <AdminBusinessesContent />
    </Suspense>
  );
}
