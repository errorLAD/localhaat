'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import {
  GitBranch,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  Layers,
  Package,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    image: '',
    isActive: true,
    displayOrder: 0,
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, catsRes] = await Promise.all([
        api.getStoreSubcategories(),
        api.getStoreCategories(),
      ]);
      if (subsRes.success) setSubcategories(subsRes.subcategories || []);
      if (catsRes.success) setCategories(catsRes.categories || []);
    } catch (err: any) {
      console.error('Failed to load subcategories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingSubcategory(null);
    setFormData({
      name: '',
      categoryId: categories[0]?._id || '',
      description: '',
      image: '',
      isActive: true,
      displayOrder: subcategories.length + 1,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (sub: any) => {
    setEditingSubcategory(sub);
    setFormData({
      name: sub.name,
      categoryId: sub.categoryId?._id || sub.categoryId || '',
      description: sub.description || '',
      image: sub.image || '',
      isActive: sub.isActive ?? true,
      displayOrder: sub.displayOrder ?? 0,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId) {
      setErrorMsg('Subcategory name and parent category are required');
      return;
    }
    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingSubcategory) {
        const res = await api.updateStoreSubcategory(editingSubcategory._id, formData);
        if (res.success) {
          setModalOpen(false);
          fetchData();
        } else {
          setErrorMsg(res.message || 'Failed to update subcategory');
        }
      } else {
        const res = await api.createStoreSubcategory(formData);
        if (res.success) {
          setModalOpen(false);
          fetchData();
        } else {
          setErrorMsg(res.message || 'Failed to create subcategory');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving subcategory');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sub: any) => {
    if (!confirm(`Are you sure you want to delete subcategory '${sub.name}'?`)) return;

    try {
      const res = await api.deleteStoreSubcategory(sub._id);
      if (res.success) {
        fetchData();
      } else {
        alert(res.message || 'Delete failed');
      }
    } catch (err: any) {
      alert(`Error deleting subcategory: ${err.message}`);
    }
  };

  const filtered = subcategories.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.categoryId?.name && s.categoryId.name.toLowerCase().includes(search.toLowerCase()));
    const matchesCat =
      categoryFilter === 'ALL' ||
      s.categoryId?._id === categoryFilter ||
      s.categoryId === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Store Taxonomy</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Subcategories Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Secondary product classification hierarchy under each primary department.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Add Subcategory
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex-1 flex items-center gap-3 px-2 w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subcategory by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Parent Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <Badge className="bg-slate-100 text-slate-600 font-mono text-[10px] whitespace-nowrap">
            {filtered.length} Items
          </Badge>
        </div>
      </div>

      {/* Subcategories Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Loading subcategories from MongoDB...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <GitBranch className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No subcategories found</h3>
          <p className="text-xs text-slate-500">Create subcategories like FMCG → Rice, Daal, Aata, Oil.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            + Create Subcategory
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Subcategory Name</th>
                  <th className="py-3 px-4">Parent Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Catalog Products</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                      {sub.image ? (
                        <img src={sub.image} alt={sub.name} className="w-8 h-8 rounded-lg object-cover border" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                          <GitBranch className="w-4 h-4" />
                        </div>
                      )}
                      <span>{sub.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-bold text-[10px]">
                        <Layers className="w-3 h-3 mr-1" />
                        {sub.categoryId?.name || 'Unassigned'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {sub.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {sub.productCount || 0} Products
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        className={
                          sub.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                            : 'bg-slate-100 text-slate-500 text-[10px]'
                        }
                      >
                        {sub.isActive ? 'Active' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT SUBCATEGORY ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                </h3>
                <p className="text-xs text-slate-400">Classify products under a parent category</p>
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
              <div>
                <label className="block font-bold text-slate-700 mb-1">Parent Category *</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-white font-medium"
                >
                  <option value="">Select Parent Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basmati Rice, Mustard Oil, Stone-ground Aata"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details about items in this subcategory..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-white"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
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
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black shadow-md shadow-amber-500/20 transition flex items-center gap-2"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
