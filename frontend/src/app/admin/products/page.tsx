'use client';

import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { formatCurrency } from '../../../lib/utils';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  RefreshCw,
  Sparkles,
  MapPin,
  CheckCircle2,
  X,
  Boxes,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';

export default function AdminProductsPage() {
  const { products, loadAdminData, handleCreateProduct, loading } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    unit: '1 kg pack',
    weightKg: '1.0',
    stock: '50',
    originVillage: 'Sonapur',
    originDistrict: 'Varanasi',
    isOrganic: true,
  });

  const filteredProducts = products.filter((p) => {
    const categoryName = typeof p.categoryId === 'object' && p.categoryId ? (p.categoryId as any).name : '';
    return (
      !searchTerm ||
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.originVillage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price) {
      alert('Title and Price are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await handleCreateProduct({
        title: form.title,
        description: form.description || 'Pure authentic rural produce sourced directly from farmers.',
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        unit: form.unit,
        weightKg: Number(form.weightKg) || 1.0,
        stock: Number(form.stock) || 50,
        originVillage: form.originVillage,
        originDistrict: form.originDistrict,
        isOrganic: form.isOrganic,
      });

      if (res.success) {
        alert('Product added to store catalog!');
        setShowAddModal(false);
        setForm({
          title: '',
          description: '',
          price: '',
          discountPrice: '',
          unit: '1 kg pack',
          weightKg: '1.0',
          stock: '50',
          originVillage: 'Sonapur',
          originDistrict: 'Varanasi',
          isOrganic: true,
        });
      }
    } catch (err: any) {
      alert(`Error creating product: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Single-Vendor Store Catalog Management
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            As LocalHaat operates a central retail commerce store, products and pricing are managed exclusively by the Platform Administrator.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => loadAdminData()}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Add Store Product
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <Input
            type="text"
            placeholder="Search products by title, category, village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
        <span className="text-xs text-gray-400 font-medium hidden sm:inline">
          Total Products: {products.length}
        </span>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p._id}
            className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs hover:shadow-sm transition space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{p.title}</h4>
                <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                  <span>{p.originVillage || 'Sonapur'}, {p.originDistrict || 'Varanasi'}</span>
                </div>
              </div>
              {p.isOrganic && (
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                  Organic
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
              <div>
                <span className="text-base font-extrabold text-gray-900 font-mono">
                  {formatCurrency(p.price)}
                </span>
                {p.discountPrice && (
                  <span className="text-[11px] text-gray-400 line-through ml-1.5 font-mono">
                    {formatCurrency(p.discountPrice)}
                  </span>
                )}
                <span className="text-[10px] text-gray-500 block">per {p.unit}</span>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-indigo-700 block font-mono">
                  {p.stock} in stock
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Store Live</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                Add Single-Vendor Store Product
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Product Title *</label>
                <Input
                  required
                  placeholder="e.g. Pure Desi Cow Ghee (A2 Bilona)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Description</label>
                <Input
                  placeholder="Freshly sourced and prepared in Sonapur..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Selling Price (₹) *</label>
                  <Input
                    required
                    type="number"
                    placeholder="450"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="rounded-xl h-10 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">MRP / Discount Price (₹)</label>
                  <Input
                    type="number"
                    placeholder="520"
                    value={form.discountPrice}
                    onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                    className="rounded-xl h-10 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Packaging Unit</label>
                  <Input
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="rounded-xl h-10 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Weight (kg)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.weightKg}
                    onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                    className="rounded-xl h-10 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Initial Stock</label>
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Origin Village</label>
                  <Input
                    value={form.originVillage}
                    onChange={(e) => setForm({ ...form, originVillage: e.target.value })}
                    className="rounded-xl h-10 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">District</label>
                  <Input
                    value={form.originDistrict}
                    onChange={(e) => setForm({ ...form, originDistrict: e.target.value })}
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-11 text-xs font-bold mt-2"
              >
                {submitting ? 'Adding Product...' : 'Publish Product to Store'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
