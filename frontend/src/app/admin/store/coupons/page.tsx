'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import {
  Percent,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  Calendar,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

export default function StoreCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);

  // Form State
  const initialForm = {
    code: '',
    description: '',
    discountType: 'PERCENTAGE', // 'PERCENTAGE' | 'FIXED'
    discountValue: 10,
    minOrderValue: 499,
    maxDiscount: 200,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 200,
    customerUsageLimit: 1,
    isActive: true,
  };

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.getStoreCoupons();
      if (res.success) {
        setCoupons(res.coupons || []);
      }
    } catch (err: any) {
      console.error('Failed to load coupons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData(initialForm);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType || 'PERCENTAGE',
      discountValue: c.discountValue || 10,
      minOrderValue: c.minOrderValue || 0,
      maxDiscount: c.maxDiscount || 0,
      startDate: new Date(c.startDate).toISOString().split('T')[0],
      expiryDate: new Date(c.expiryDate).toISOString().split('T')[0],
      usageLimit: c.usageLimit || 100,
      customerUsageLimit: c.customerUsageLimit || 1,
      isActive: c.isActive ?? true,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.discountValue || !formData.expiryDate) {
      setErrorMsg('Code, discount value, and expiry date are required');
      return;
    }
    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingCoupon) {
        const res = await api.updateStoreCoupon(editingCoupon._id, formData);
        if (res.success) {
          setModalOpen(false);
          fetchCoupons();
        } else {
          setErrorMsg(res.message || 'Update failed');
        }
      } else {
        const res = await api.createStoreCoupon(formData);
        if (res.success) {
          setModalOpen(false);
          fetchCoupons();
        } else {
          setErrorMsg(res.message || 'Create failed');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: any) => {
    if (!confirm(`Are you sure you want to delete coupon '${c.code}'?`)) return;

    try {
      const res = await api.deleteStoreCoupon(c._id);
      if (res.success) {
        fetchCoupons();
      } else {
        alert(res.message || 'Delete failed');
      }
    } catch (err: any) {
      alert(`Error deleting coupon: ${err.message}`);
    }
  };

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Marketing & Promotions</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Coupons & Discounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure percentage/fixed promo vouchers, minimum cart thresholds, and expiry limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by coupon code (e.g. MAX500, VILLAGE50)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800 placeholder-slate-400"
        />
        <Badge className="bg-slate-100 text-slate-600 font-mono text-[10px]">
          {filtered.length} Coupons
        </Badge>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Loading coupons from MongoDB...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Percent className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No coupons active</h3>
          <p className="text-xs text-slate-500">Create promotion codes to incentivize customer checkout.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            + Create First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge className="bg-amber-100 text-amber-950 font-black font-mono text-sm tracking-wider px-2.5 py-1 border-amber-300">
                    {c.code}
                  </Badge>
                  <Badge
                    className={
                      c.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                        : 'bg-slate-100 text-slate-500 text-[10px]'
                    }
                  >
                    {c.isActive ? 'Active' : 'Expired / Off'}
                  </Badge>
                </div>

                <div className="mt-3">
                  <div className="text-lg font-black text-slate-900">
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {c.description || 'Valid across eligible marketplace categories.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Min Order:</span>
                    <span className="font-mono font-bold text-slate-800">₹{c.minOrderValue}</span>
                  </div>
                  {c.discountType === 'PERCENTAGE' && c.maxDiscount > 0 && (
                    <div className="flex justify-between">
                      <span>Max Cap:</span>
                      <span className="font-mono font-bold text-slate-800">₹{c.maxDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Redemptions:</span>
                    <span className="font-mono text-slate-700">
                      {c.usedCount || 0} / {c.usageLimit} uses
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Expires:</span>
                    <span className="font-mono">{new Date(c.expiryDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                <button
                  onClick={() => openEditModal(c)}
                  className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT COUPON ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingCoupon ? 'Edit Coupon Code' : 'Create New Promotional Coupon'}
                </h3>
                <p className="text-xs text-slate-400">Configure discount parameters and cart rules</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-mono font-black uppercase text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden bg-white font-medium"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Cap (₹, 0=unlimited)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Flat ₹150 OFF on orders above ₹999"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Uses / Customer</label>
                  <input
                    type="number"
                    value={formData.customerUsageLimit}
                    onChange={(e) => setFormData({ ...formData, customerUsageLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black shadow-md shadow-rose-500/20 transition flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {editingCoupon ? 'Update Coupon' : 'Publish Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
