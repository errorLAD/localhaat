'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  Layers,
  Image as ImageIcon,
  Tag,
  Star,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

export default function StoreProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const initialForm = {
    title: '',
    sku: '',
    categoryId: '',
    subcategoryId: '',
    brand: 'LocalHaat Select',
    shortDescription: '',
    description: '',
    images: [''],
    thumbnail: '',
    videoUrl: '',
    mrp: 0,
    price: 0,
    discountPrice: 0,
    taxPercent: 5,
    stock: 20,
    lowStockThreshold: 5,
    unit: 'kg',
    weightKg: 1,
    lengthCm: 15,
    widthCm: 15,
    heightCm: 15,
    availableLocations: 'Varanasi, Sonapur, Mirzapur, Chandauli',
    status: 'active',
    isFeatured: false,
    isOrganic: true,
    tags: 'fresh, village, haat',
    seoTitle: '',
    seoDescription: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (stockFilter) params.stockFilter = stockFilter;

      const [prodRes, catRes, subRes] = await Promise.all([
        api.getStoreProducts(params),
        api.getStoreCategories(),
        api.getStoreSubcategories(),
      ]);

      if (prodRes.success) setProducts(prodRes.products || []);
      if (catRes.success) setCategories(catRes.categories || []);
      if (subRes.success) setSubcategories(subRes.subcategories || []);
    } catch (err: any) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, statusFilter, stockFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      ...initialForm,
      sku: `LH-${Date.now().toString().slice(-6)}`,
      categoryId: categories[0]?._id || '',
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setFormData({
      title: p.title || '',
      sku: p.sku || '',
      categoryId: p.categoryId?._id || p.categoryId || '',
      subcategoryId: p.subcategoryId?._id || p.subcategoryId || '',
      brand: p.brand || 'LocalHaat Select',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      images: p.images?.length ? p.images : [''],
      thumbnail: p.thumbnail || p.images?.[0] || '',
      videoUrl: p.videoUrl || '',
      mrp: p.mrp || p.price || 0,
      price: p.price || 0,
      discountPrice: p.discountPrice || 0,
      taxPercent: p.taxPercent || 5,
      stock: p.stock ?? 0,
      lowStockThreshold: p.lowStockThreshold || 5,
      unit: p.unit || 'kg',
      weightKg: p.weightKg || 1,
      lengthCm: p.dimensions?.lengthCm || 15,
      widthCm: p.dimensions?.widthCm || 15,
      heightCm: p.dimensions?.heightCm || 15,
      availableLocations: Array.isArray(p.availableLocations)
        ? p.availableLocations.join(', ')
        : p.availableLocations || 'All Rural Hubs',
      status: p.status || 'active',
      isFeatured: !!p.isFeatured,
      isOrganic: !!p.isOrganic,
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '',
      seoTitle: p.seoTitle || p.title || '',
      seoDescription: p.seoDescription || p.shortDescription || '',
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleImageChange = (index: number, val: string) => {
    const updated = [...formData.images];
    updated[index] = val;
    setFormData({
      ...formData,
      images: updated,
      thumbnail: index === 0 ? val : formData.thumbnail || val,
    });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index: number) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: updated.length ? updated : [''],
      thumbnail: updated[0] || '',
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const updated = [...formData.images];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setFormData({
      ...formData,
      images: updated,
      thumbnail: updated[0] || '',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.categoryId || formData.price <= 0) {
      setErrorMsg('Product name, category, and selling price (> 0) are required');
      return;
    }
    setSaving(true);
    setErrorMsg(null);

    const validImages = formData.images.filter((img) => img.trim().length > 0);

    const payload = {
      ...formData,
      images: validImages.length
        ? validImages
        : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80'],
      thumbnail: formData.thumbnail || validImages[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
      dimensions: {
        lengthCm: Number(formData.lengthCm) || 15,
        widthCm: Number(formData.widthCm) || 15,
        heightCm: Number(formData.heightCm) || 15,
      },
      availableLocations: formData.availableLocations
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      price: Number(formData.price),
      mrp: Number(formData.mrp) || Number(formData.price),
      discountPrice: Number(formData.discountPrice) || undefined,
      taxPercent: Number(formData.taxPercent) || 5,
      stock: Number(formData.stock),
      lowStockThreshold: Number(formData.lowStockThreshold) || 5,
      weightKg: Number(formData.weightKg) || 1,
    };

    try {
      if (editingProduct) {
        const res = await api.updateStoreProduct(editingProduct._id, payload);
        if (res.success) {
          setModalOpen(false);
          fetchProducts();
        } else {
          setErrorMsg(res.message || 'Update failed');
        }
      } else {
        const res = await api.createStoreProduct(payload);
        if (res.success) {
          setModalOpen(false);
          fetchProducts();
        } else {
          setErrorMsg(res.message || 'Create failed');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: any) => {
    if (!confirm(`Are you sure you want to permanently delete '${p.title}' from the store catalog?`)) return;

    try {
      const res = await api.deleteStoreProduct(p._id);
      if (res.success) {
        fetchProducts();
      } else {
        alert(res.message || 'Delete failed');
      }
    } catch (err: any) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Store Catalog</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Products Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single-vendor company owned inventory, pricing, SKU codes, units, and rich descriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
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
            Add Product
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 w-full">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="">All Stock</option>
              <option value="in">In Stock (&gt; 5)</option>
              <option value="low">Low Stock (≤ 5)</option>
              <option value="out">Out of Stock (0)</option>
            </select>

            <button
              type="submit"
              className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Loading products from MongoDB...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500">Create your first product or adjust your active filters.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            + Create First Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Product & SKU</th>
                  <th className="py-3 px-4">Department / Subcat</th>
                  <th className="py-3 px-4">Selling Price / MRP</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Weight / Unit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition">
                    {/* Title & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.thumbnail || p.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80'}
                          alt={p.title}
                          className="w-10 h-10 rounded-xl object-cover border flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 truncate max-w-[200px] flex items-center gap-1.5">
                            {p.title}
                            {p.isFeatured && (
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span>SKU: {p.sku || 'N/A'}</span>
                            <span>•</span>
                            <span>{p.brand || 'LocalHaat'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department / Subcategory */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <Badge className="bg-slate-100 text-slate-800 text-[10px] font-bold">
                          {p.categoryId?.name || 'Category'}
                        </Badge>
                        {p.subcategoryId?.name && (
                          <div className="text-[10px] text-slate-400 font-medium pl-1">
                            ↳ {p.subcategoryId.name}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-black text-slate-900 text-sm">₹{p.price}</div>
                      {p.mrp && p.mrp > p.price && (
                        <div className="text-[10px] text-slate-400 line-through">MRP: ₹{p.mrp}</div>
                      )}
                    </td>

                    {/* Stock Level */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black font-mono text-sm ${
                            p.stock === 0
                              ? 'text-rose-600'
                              : p.stock <= (p.lowStockThreshold || 5)
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {p.stock}
                        </span>
                        <span className="text-[10px] text-slate-400">units</span>
                      </div>
                      {p.stock <= (p.lowStockThreshold || 5) && p.stock > 0 && (
                        <span className="text-[9px] font-bold text-amber-600 block">Low Stock Alert</span>
                      )}
                      {p.stock === 0 && (
                        <span className="text-[9px] font-bold text-rose-600 block">Out of Stock</span>
                      )}
                    </td>

                    {/* Unit / Weight */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div>
                        {p.weightKg || 1} kg / {p.unit || 'unit'}
                      </div>
                      <div className="text-[10px] text-slate-400">GST: {p.taxPercent || 5}%</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge
                        className={
                          p.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                            : p.status === 'draft'
                            ? 'bg-slate-100 text-slate-600 text-[10px]'
                            : 'bg-rose-50 text-rose-700 border-rose-200 text-[10px]'
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                          title="Delete Product"
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

      {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-6 my-8 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Product to Store'}
                </h3>
                <p className="text-xs text-slate-400">Single-vendor company owned inventory record</p>
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

            <form onSubmit={handleSave} className="space-y-5 text-xs">
              {/* Basic Details */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800 border-b pb-1">
                  1. Basic Identification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Sharbati Wheat Aata"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">SKU Code</label>
                    <input
                      type="text"
                      placeholder="LH-SKU-10293"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-white font-medium"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subcategory</label>
                    <select
                      value={formData.subcategoryId}
                      onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-white font-medium"
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories
                        .filter((s) => !formData.categoryId || s.categoryId?._id === formData.categoryId || s.categoryId === formData.categoryId)
                        .map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800 border-b pb-1">
                  2. Pricing, Tax & Inventory Control
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Discount Price (₹)</label>
                    <input
                      type="number"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">GST Tax (%)</label>
                    <input
                      type="number"
                      value={formData.taxPercent}
                      onChange={(e) => setFormData({ ...formData, taxPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Low-Stock Alert</label>
                    <input
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 bg-white"
                    >
                      <option value="kg">kg</option>
                      <option value="gram">gram</option>
                      <option value="litre">litre</option>
                      <option value="piece">piece</option>
                      <option value="pack">pack</option>
                      <option value="bundle">bundle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Multiple Images & Reordering */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800">
                    3. Images & Media (Multiple, Preview & Reorder)
                  </h4>
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Another Image
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.images.map((imgUrl, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 font-mono text-[10px]">
                        {index + 1}
                      </div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={imgUrl}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono text-[11px]"
                      />
                      {imgUrl && (
                        <img src={imgUrl} alt="Thumb" className="w-9 h-9 rounded-lg object-cover border" />
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveImage(index, 'up')}
                          className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === formData.images.length - 1}
                          onClick={() => moveImage(index, 'down')}
                          className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="p-1 hover:bg-red-50 text-red-500 rounded"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product Video URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Descriptions & SEO */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800 border-b pb-1">
                  4. Descriptions & Search Optimization
                </h4>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="Catchy single line summary..."
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Rich origin details, farm source, ingredients, storage..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-normal"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Search Tags (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="organic, wheat, chakki, fresh"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Available Delivery Locations</label>
                    <input
                      type="text"
                      placeholder="Varanasi, Sonapur, All Haats"
                      value={formData.availableLocations}
                      onChange={(e) => setFormData({ ...formData, availableLocations: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Catalog Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isFeatured" className="font-bold text-slate-700">
                      Featured Star
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isOrganic"
                      checked={formData.isOrganic}
                      onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="isOrganic" className="font-bold text-slate-700">
                      Organic Seal
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
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
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
