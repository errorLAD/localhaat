'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  ShoppingBag,
  Package,
  KeyRound,
  Download,
  Printer,
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import InvoiceModal, { printOrderInvoice } from '../../components/InvoiceModal';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [copiedPinMap, setCopiedPinMap] = useState<Record<string, boolean>>({});

  // Invoice modal state
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOrders();
      if (res.orders) {
        setOrders(res.orders);
      }
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const copyPin = (orderId: string, pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPinMap((prev) => ({ ...prev, [orderId]: true }));
    setTimeout(() => {
      setCopiedPinMap((prev) => ({ ...prev, [orderId]: false }));
    }, 2000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Status tab
      const st = (ord.orderStatus || '').toLowerCase();
      if (statusFilter === 'active') {
        if (['delivered', 'cancelled', 'refunded'].includes(st)) return false;
      } else if (statusFilter === 'delivered') {
        if (st !== 'delivered') return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const numMatch = (ord.orderNumber || '').toLowerCase().includes(q);
        const pinMatch = (ord.deliveryPin || '').includes(q);
        const itemMatch = (ord.items || []).some((i: any) =>
          (i.productTitle || i.productId?.title || '').toLowerCase().includes(q)
        );
        if (!numMatch && !pinMatch && !itemMatch) return false;
      }

      return true;
    });
  }, [orders, statusFilter, search]);

  const getStatusBadge = (status: string) => {
    const st = (status || 'placed').toLowerCase();
    switch (st) {
      case 'placed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" /> Placed
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Package className="w-3 h-3" /> Packed
          </span>
        );
      case 'in_transit':
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Truck className="w-3 h-3 animate-pulse" /> In Transit
          </span>
        );
      case 'arrived_at_hub':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <MapPin className="w-3 h-3" /> At Village Hub
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans pb-24">
      {/* Top Header Banner */}
      <section className="bg-white border-b border-slate-200/80 py-8 px-4 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Customer Consignment Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-emerald-700" />
              My Orders & Delivery PINs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View your active shipments, retrieve your 4-digit security Delivery PINs, and download official tax invoices.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={fetchOrders}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </Button>
            <Button
              onClick={() => router.push('/marketplace')}
              size="sm"
              className="bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Browse Store</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filter Bar & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'active'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active / In-Transit ({orders.filter((o) => !['delivered', 'cancelled'].includes((o.orderStatus || '').toLowerCase())).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('delivered')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'delivered'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Delivered ({orders.filter((o) => (o.orderStatus || '').toLowerCase() === 'delivered').length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Order #, PIN, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 h-9 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse space-y-4">
                <div className="h-5 bg-slate-100 rounded w-1/4" />
                <div className="h-16 bg-slate-100 rounded" />
                <div className="h-6 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No orders found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {search
                  ? `No orders match "${search}". Try searching another keyword.`
                  : 'You have not placed any orders yet. Discover our fresh village staples and direct catalog.'}
              </p>
            </div>
            <Button
              onClick={() => router.push('/marketplace')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-xs font-bold px-6 shadow-sm"
            >
              Start Shopping Now
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const deliveryPin = order.deliveryPin || order.parcelId?.deliveryPin || '4826';
              const isCopied = Boolean(copiedPinMap[order._id]);
              const items = order.items || [];
              const trackingCode = order.parcelId?.parcelTrackingNumber || order.orderNumber;
              const dateStr = formatDate(order.createdAt || order.placedAt || new Date());
              const paymentMethod = (order.paymentMethod || 'cod').toUpperCase() === 'COD' ? 'Cash on Delivery' : 'Prepaid Online';

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Order Card Top Bar */}
                  <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                          Order Number
                        </span>
                        <span className="font-mono font-black text-slate-900 text-sm">
                          #{order.orderNumber}
                        </span>
                      </div>
                      <div className="hidden sm:block w-px h-6 bg-slate-200" />
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                          Order Date
                        </span>
                        <span className="text-slate-700 font-medium">{dateStr}</span>
                      </div>
                      <div className="hidden sm:block w-px h-6 bg-slate-200" />
                      <div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                          Payment Mode
                        </span>
                        <span className="text-slate-700 font-semibold">{paymentMethod}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.orderStatus)}
                      <span className="font-mono font-black text-slate-900 text-base ml-2">
                        {formatCurrency(order.totalAmount || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* 🔑 PROMINENT 4-DIGIT DELIVERY PIN CONTAINER */}
                    <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-amber-700" />
                          <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                            Your 4-Digit Delivery Verification PIN
                          </span>
                        </div>
                        <p className="text-xs text-amber-800 leading-snug">
                          Keep this secret code confidential. Share it with your LocalHaat delivery agent only upon physical inspection of package.
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-slate-950 bg-white px-5 py-2 rounded-xl border border-amber-300 shadow-2xs select-all">
                          {deliveryPin}
                        </div>
                        <button
                          type="button"
                          onClick={() => copyPin(order._id, deliveryPin)}
                          title="Copy Delivery PIN"
                          className="px-3 py-2.5 rounded-xl bg-white hover:bg-amber-200/70 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Purchased Items ({items.length})
                      </span>
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                        {items.length === 0 ? (
                          <div className="p-4 text-xs text-slate-400 italic">
                            Items packed and fulfilled by LocalHaat Store Command.
                          </div>
                        ) : (
                          items.map((item: any, idx: number) => {
                            const title = item.productTitle || item.productId?.title || 'LocalHaat Product';
                            const image =
                              item.productImage ||
                              item.productId?.images?.[0] ||
                              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
                            const price = item.unitPrice || item.productId?.price || 0;
                            const qty = item.quantity || 1;
                            const sub = item.subtotal || price * qty;

                            return (
                              <div
                                key={idx}
                                className="p-3 sm:p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                                    <img
                                      src={image}
                                      alt={title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                                      {title}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                      Qty: <strong>{qty}</strong> &times; {formatCurrency(price)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                                    {formatCurrency(sub)}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Address & Actions Footer */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-2 text-xs text-slate-600 max-w-md">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-800">Delivering to: </span>
                          <span>
                            {order.deliveryAddress?.addressLine || 'Address on record'},{' '}
                            {order.deliveryAddress?.villageOrCity || 'Central Hub'},{' '}
                            {order.deliveryAddress?.district || 'Varanasi'} (
                            {order.deliveryAddress?.pincode || '221008'})
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Invoice & Track */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        {/* 🖨️ DOWNLOAD INVOICE (WITH PIN) */}
                        <Button
                          type="button"
                          onClick={() => setSelectedInvoiceOrder(order)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs font-bold border-slate-300 text-slate-900 hover:bg-slate-100 gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Download Invoice</span>
                        </Button>

                        {/* 🚛 TRACK ORDER */}
                        <Button
                          type="button"
                          onClick={() => router.push(`/track/${trackingCode}`)}
                          size="sm"
                          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Track Order</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Invoice Modal for Screen View & PDF Download */}
      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
        customer={user}
      />
    </div>
  );
}
