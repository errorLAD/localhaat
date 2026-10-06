'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import {
  ClipboardList,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  User,
  ShieldCheck,
  ChevronRight,
  X,
  CreditCard,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const orderStatuses = [
    'PENDING',
    'CONFIRMED',
    'PACKED',
    'READY_FOR_PICKUP',
    'LOGISTICS_ASSIGNED',
    'SHIPPED',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'REFUNDED',
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (paymentFilter !== 'ALL') params.paymentStatus = paymentFilter;
      if (search) params.search = search;

      const res = await api.getStoreOrders(params);
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err: any) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter]);

  const openOrderDetail = async (order: any) => {
    setSelectedOrder(order);
    setNewStatus((order.orderStatus || 'pending').toUpperCase());
    setStatusNote('');
    setModalOpen(true);

    try {
      const res = await api.getStoreOrderDetail(order._id);
      if (res.success) {
        setSelectedOrder(res.order);
      }
    } catch (err: any) {
      console.error('Error fetching order detail', err);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;
    setStatusUpdating(true);

    try {
      const res = await api.updateStoreOrderStatus(selectedOrder._id, {
        status: newStatus.toLowerCase(),
        note: statusNote || `Status updated to ${newStatus} by admin`,
      });

      if (res.success) {
        setSelectedOrder(res.order);
        fetchOrders();
        setStatusNote('');
        alert(`Order status updated to ${newStatus}`);
      } else {
        alert(res.message || 'Status update failed');
      }
    } catch (err: any) {
      alert(`Error updating order status: ${err.message}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  const filtered = orders.filter((o) => {
    const term = search.toLowerCase();
    return (
      !search ||
      o.orderNumber?.toLowerCase().includes(term) ||
      o.customerId?.name?.toLowerCase().includes(term) ||
      o.customerId?.phone?.includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Fulfilment Desk</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">E-Commerce Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end order processing, packaging dispatch, courier handover tracking, and timeline audit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 w-full">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID (LH-...), customer name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Order Statuses</option>
              {orderStatuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <Badge className="bg-slate-100 text-slate-700 font-mono text-[10px]">
              {filtered.length} Orders
            </Badge>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Loading orders from MongoDB...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-500">Orders placed by customers in the store will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Items / Qty</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ord) => {
                  const statusUpper = (ord.orderStatus || 'pending').toUpperCase();
                  const isPaid = (ord.paymentStatus || '').toLowerCase() === 'paid';

                  return (
                    <tr key={ord._id} className="hover:bg-slate-50/70 transition">
                      {/* Order Number & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 font-mono text-xs">
                          {ord.orderNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(ord.createdAt || ord.placedAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          {ord.customerId?.name || 'Customer'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {ord.customerId?.phone || 'N/A'}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-amber-600" />
                          <span>{ord.items?.length || 1} Product(s)</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          PIN: <span className="font-mono font-bold text-slate-700">{ord.deliveryPin || '••••'}</span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-black text-slate-900 text-sm">
                          ₹{ord.totalAmount?.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ord.paymentMethod === 'cod' ? 'COD' : 'Online / UPI'}
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          className={
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold'
                              : (ord.paymentStatus || '').toLowerCase() === 'failed'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold'
                              : (ord.paymentStatus || '').toLowerCase() === 'refunded'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold'
                              : 'bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold'
                          }
                        >
                          {(ord.paymentStatus || 'pending').toUpperCase()}
                        </Badge>
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          className={
                            ['DELIVERED'].includes(statusUpper)
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold'
                              : ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(statusUpper)
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold'
                              : ['CANCELLED', 'REFUNDED'].includes(statusUpper)
                              ? 'bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold'
                              : 'bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold'
                          }
                        >
                          {statusUpper}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openOrderDetail(ord)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORDER DETAILS & TIMELINE ================= */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-6 my-8 animate-in fade-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-slate-900">
                    Order #{selectedOrder.orderNumber}
                  </span>
                  <Badge className="bg-amber-100 text-amber-800 font-bold border-amber-200 text-[10px]">
                    {(selectedOrder.orderStatus || 'pending').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt || selectedOrder.placedAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Address Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border space-y-1.5">
                <span className="font-extrabold uppercase text-[10px] text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3" /> Customer Information
                </span>
                <div className="font-bold text-slate-900">{selectedOrder.customerId?.name || 'Customer'}</div>
                <div className="text-slate-600 font-mono">{selectedOrder.customerId?.phone || 'No phone'}</div>
                <div className="text-slate-500">{selectedOrder.customerId?.email || 'No email registered'}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border space-y-1.5">
                <span className="font-extrabold uppercase text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Shipping Address & PIN
                </span>
                <div className="font-semibold text-slate-800">
                  {selectedOrder.deliveryAddress?.addressLine || 'Direct Village Address'}
                </div>
                <div className="text-slate-600">
                  {selectedOrder.deliveryAddress?.villageOrCity}, {selectedOrder.deliveryAddress?.district},{' '}
                  {selectedOrder.deliveryAddress?.state} - {selectedOrder.deliveryAddress?.pincode}
                </div>
                <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Handover Verification PIN: <span className="font-mono text-sm">{selectedOrder.deliveryPin}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400">
                Purchased Products ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-slate-100 border rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      {item.productImage || item.productId?.images?.[0] ? (
                        <img
                          src={item.productImage || item.productId?.images?.[0]}
                          alt="Thumb"
                          className="w-10 h-10 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <Package className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900">{item.productTitle || item.productId?.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Qty: {item.quantity} × ₹{item.unitPrice || item.price}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      ₹{(item.subtotal || item.quantity * item.unitPrice).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/60 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium">₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-mono font-medium">₹{selectedOrder.deliveryFee || 0}</span>
              </div>
              {selectedOrder.discountAmount ? (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({selectedOrder.couponCode})</span>
                  <span className="font-mono">-₹{selectedOrder.discountAmount}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-amber-200">
                <span>Total Amount</span>
                <span className="font-mono text-base">₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Timeline Audit */}
            <div className="space-y-3">
              <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400">
                Fulfilment Timeline & Milestones
              </h4>
              <div className="space-y-2 border-l-2 border-amber-400 pl-4 ml-2">
                <div className="text-xs">
                  <span className="font-bold text-slate-900">Order Placed</span>
                  <span className="text-[10px] text-slate-400 ml-2 font-mono">
                    {new Date(selectedOrder.createdAt || selectedOrder.placedAt).toLocaleString('en-IN')}
                  </span>
                  <p className="text-[11px] text-slate-500">Customer checked out successfully.</p>
                </div>

                {selectedOrder.timeline?.map((evt: any, i: number) => (
                  <div key={i} className="text-xs pt-1">
                    <span className="font-bold text-slate-900 uppercase text-[11px]">{evt.status}</span>
                    <span className="text-[10px] text-slate-400 ml-2 font-mono">
                      {new Date(evt.timestamp).toLocaleString('en-IN')}
                    </span>
                    <p className="text-[11px] text-slate-500">
                      {evt.note} ({evt.updatedBy})
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Change Status Action Form */}
            <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <h4 className="font-extrabold uppercase tracking-wider text-[10px] text-slate-800">
                Update Order & Fulfillment Status
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-bold text-slate-800 bg-white"
                  >
                    {orderStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatched to Balwant delivery bike"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={statusUpdating}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black shadow-md transition flex items-center gap-2"
                >
                  {statusUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save New Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
