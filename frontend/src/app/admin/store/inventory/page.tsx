'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import {
  Boxes,
  Plus,
  Minus,
  Sliders,
  History,
  Search,
  RefreshCw,
  AlertTriangle,
  Ban,
  CheckCircle,
  X,
  Package,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'STOCK' | 'LOGS'>('STOCK');
  const [filter, setFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [search, setSearch] = useState('');

  // Stock Adjustment Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [adjustType, setAdjustType] = useState<'ADD' | 'REMOVE' | 'ADJUST'>('ADD');
  const [adjustQuantity, setAdjustQuantity] = useState(10);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [adjustReason, setAdjustReason] = useState('Stock Replenishment from Central Haat');
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter === 'LOW') params.filter = 'low';
      if (filter === 'OUT') params.filter = 'out';
      if (search) params.search = search;

      const [invRes, logsRes] = await Promise.all([
        api.getStoreInventory(params),
        api.getStoreInventoryLogs(),
      ]);

      if (invRes.success) setProducts(invRes.products || []);
      if (logsRes.success) setLogs(logsRes.logs || []);
    } catch (err: any) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const openAdjustModal = (product: any, type: 'ADD' | 'REMOVE' | 'ADJUST') => {
    setSelectedProduct(product);
    setAdjustType(type);
    setAdjustQuantity(type === 'ADJUST' ? product.stock : 10);
    setLowStockThreshold(product.lowStockThreshold || 5);
    setAdjustReason(
      type === 'ADD'
        ? 'Stock replenishment received from warehouse'
        : type === 'REMOVE'
        ? 'Stock damaged or written off'
        : 'Physical audit inventory reconciliation'
    );
    setModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSaving(true);

    try {
      const res = await api.adjustStoreStock({
        productId: selectedProduct._id,
        changeType: adjustType,
        quantity: Number(adjustQuantity),
        reason: adjustReason,
        lowStockThreshold: Number(lowStockThreshold),
      });

      if (res.success) {
        setModalOpen(false);
        fetchInventory();
      } else {
        alert(res.message || 'Stock adjustment failed');
      }
    } catch (err: any) {
      alert(`Error adjusting stock: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Warehouse Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Inventory Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit live stock, replenish inventory, configure low-stock alerts, and trace historical movements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Tab Selector */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center text-xs font-bold">
            <button
              onClick={() => setActiveTab('STOCK')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === 'STOCK' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Stock
            </button>
            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'LOGS' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Audit Logs ({logs.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'STOCK' ? (
        <>
          {/* Quick Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search SKU or product title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  filter === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setFilter('LOW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1 ${
                  filter === 'LOW'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Low Stock (≤ 5)
              </button>
              <button
                onClick={() => setFilter('OUT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1 ${
                  filter === 'OUT'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                Out of Stock (0)
              </button>
            </div>
          </div>

          {/* Stock Table */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
              Loading stock positions...
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Product & SKU</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Current Stock</th>
                      <th className="py-3 px-4">Low-Stock Trigger</th>
                      <th className="py-3 px-4">Inventory Health</th>
                      <th className="py-3 px-4 text-right">Quick Stock Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="truncate max-w-[240px]">{p.title}</div>
                          <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku || 'N/A'}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge className="bg-slate-100 text-slate-700 text-[10px]">
                            {p.categoryId?.name || 'Store'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-base font-black text-slate-900">
                            {p.stock} <span className="text-xs font-normal text-slate-400">{p.unit || 'units'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          ≤ {p.lowStockThreshold || 5} units
                        </td>
                        <td className="py-3.5 px-4">
                          {p.stock === 0 ? (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">
                              Out of Stock
                            </Badge>
                          ) : p.stock <= (p.lowStockThreshold || 5) ? (
                            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                              Low Stock Warning
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                              Adequate Stock
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openAdjustModal(p, 'ADD')}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition border border-emerald-200 flex items-center gap-1"
                              title="Add Stock"
                            >
                              <Plus className="w-3 h-3" />
                              Add
                            </button>
                            <button
                              onClick={() => openAdjustModal(p, 'REMOVE')}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition border border-rose-200 flex items-center gap-1"
                              title="Remove Stock"
                            >
                              <Minus className="w-3 h-3" />
                              Deduct
                            </button>
                            <button
                              onClick={() => openAdjustModal(p, 'ADJUST')}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition border"
                              title="Reconcile Exact Count"
                            >
                              <Sliders className="w-3.5 h-3.5" />
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
        </>
      ) : (
        /* Inventory Logs Table */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Recorded Inventory Telemetry</h3>
              <p className="text-xs text-slate-500">Immutable ledger of every stock modification in MongoDB</p>
            </div>
            <Badge className="bg-slate-100 text-slate-700 font-mono text-[10px]">
              {logs.length} Total Logs
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Change Quantity</th>
                  <th className="py-2.5 px-3">Stock Before → After</th>
                  <th className="py-2.5 px-3">Reason / Reference</th>
                  <th className="py-2.5 px-3">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 max-w-[200px] truncate">
                      {log.productTitle}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        className={
                          log.changeType === 'ADD'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                            : log.changeType === 'REMOVE'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 text-[10px]'
                            : 'bg-blue-50 text-blue-700 border-blue-200 text-[10px]'
                        }
                      >
                        {log.changeType}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-bold font-mono">
                      {log.changeType === 'ADD' ? `+${log.quantityChanged}` : `-${log.quantityChanged}`}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {log.previousStock} → <span className="font-bold text-slate-900">{log.newStock}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{log.reason}</td>
                    <td className="py-3 px-3 text-slate-500 font-semibold">{log.operatorName || 'Admin'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADJUST STOCK ================= */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {adjustType === 'ADD'
                    ? 'Add Inward Stock'
                    : adjustType === 'REMOVE'
                    ? 'Remove Outward Stock'
                    : 'Reconcile Stock Count'}
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{selectedProduct.title}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Position</span>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {selectedProduct.stock} {selectedProduct.unit || 'units'}
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-800 font-bold border-amber-200">
                  SKU: {selectedProduct.sku || 'N/A'}
                </Badge>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {adjustType === 'ADJUST' ? 'New Exact Stock Level *' : 'Quantity to Apply *'}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono text-base font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Low-Stock Alert Threshold</label>
                <input
                  type="number"
                  min="1"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Audit Reason / Note *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain reason for stock adjustment..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500"
                />
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
                  Commit Stock Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function handleSaveSubmit(e: React.FormEvent) {
    handleAdjustSubmit(e);
  }
}
