'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Package,
  ArrowUpDown,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
    displayOrder: 0,
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getStoreCategories();
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err: any) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      isActive: true,
      displayOrder: categories.length + 1,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive ?? true,
      displayOrder: cat.displayOrder ?? 0,
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Category name is required');
      return;
    }
    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingCategory) {
        const res = await api.updateStoreCategory(editingCategory._id, formData);
        if (res.success) {
          setModalOpen(false);
          fetchCategories();
        } else {
          setErrorMsg(res.message || 'Failed to update category');
        }
      } else {
        const res = await api.createStoreCategory(formData);
        if (res.success) {
          setModalOpen(false);
          fetchCategories();
        } else {
          setErrorMsg(res.message || 'Failed to create category');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: any) => {
    if (cat.productCount > 0) {
      alert(`Cannot delete '${cat.name}'. It contains ${cat.productCount} active products.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete category '${cat.name}'?`)) return;

    try {
      const res = await api.deleteStoreCategory(cat._id);
      if (res.success) {
        fetchCategories();
      } else {
        alert(res.message || 'Delete failed');
      }
    } catch (err: any) {
      alert(`Error deleting category: ${err.message}`);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Catalog</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Categories Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize root store departments (Rice, Daal, Aata, FMCG, Household, Personal Care).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
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
            Add Category
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search categories by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800 placeholder-slate-400"
        />
        <Badge className="bg-slate-100 text-slate-600 font-mono text-[10px]">{filtered.length} Categories</Badge>
      </div>

      {/* Categories Grid / Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Loading categories from MongoDB...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No categories found</h3>
          <p className="text-xs text-slate-500">Create your first category or adjust your search filter.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            + Create First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-2xs flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-100">
                    <Layers className="w-6 h-6" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 justify-between">
                    <h3 className="font-extrabold text-slate-900 text-sm truncate">{cat.name}</h3>
                    <Badge
                      className={
                        cat.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                          : 'bg-slate-100 text-slate-500 text-[10px]'
                      }
                    >
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    {cat.productCount} Products
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Order: #{cat.displayOrder ?? 0}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT CATEGORY ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-xs text-slate-400">Direct MongoDB Store Collection</p>
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
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rice, Daal, Aata, Household, FMCG"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono text-[11px]"
                />
                {formData.image && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border">
                    <img src={formData.image} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
                    <span className="text-[11px] text-slate-500">Image Preview</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of items in this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-normal"
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
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
