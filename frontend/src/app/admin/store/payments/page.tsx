'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import {
  CreditCard,
  Search,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign,
  User,
  Calendar,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

export default function StorePaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Refund Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState('Customer Return / Quality Defect');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refunding, setRefunding] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.getStorePayments();
      if (res.success) {
        setPayments(res.payments || []);
      }
    } catch (err: any) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const openRefundModal = (p: any) => {
    setSelectedPayment(p);
    setRefundAmount(p.amount || 0);
    setRefundReason('Customer requested refund / order cancellation');
    setModalOpen(true);
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setRefunding(true);

    try {
      const res = await api.processStoreRefund(selectedPayment._id, {
        reason: refundReason,
        amount: Number(refundAmount),
      });

      if (res.success) {
        alert('Refund processed successfully');
        setModalOpen(false);
        fetchPayments();
      } else {
        alert(res.message || 'Refund failed');
      }
    } catch (err: any) {
      alert(`Error processing refund: ${err.message}`);
    } finally {
      setRefunding(false);
    }
  };

  const filtered = payments.filter((p) => {
    const term = search.toLowerCase();
    const orderNo = p.orderId?.orderNumber?.toLowerCase() || '';
    const custName = p.customerId?.name?.toLowerCase() || '';
    const txnId = p.providerPaymentId?.toLowerCase() || '';
    const matchesSearch = !search || orderNo.includes(term) || custName.includes(term) || txnId.includes(term);

    const st = (p.status || '').toUpperCase();
    const matchesStatus = statusFilter === 'ALL' || st === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Gateway & Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Payments & Transactions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit Razorpay signatures, COD collections, transaction IDs, and automated refund processing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
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
              placeholder="Search by Order ID, Transaction ID, or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="SUCCESS">SUCCESS / PAID</option>
              <option value="INITIATED">INITIATED / PENDING</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>

            <Badge className="bg-slate-100 text-slate-700 font-mono text-[10px]">
              {filtered.length} Transactions
            </Badge>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Loading transactions from MongoDB...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No payment records found</h3>
          <p className="text-xs text-slate-500">Payments made via Razorpay or COD will be listed here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Payment & Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Provider / Method</th>
                  <th className="py-3 px-4">Transaction / Gateway ID</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const st = (p.status || 'INITIATED').toUpperCase();
                  const isPaid = st === 'SUCCESS' || st === 'PAID';

                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition">
                      {/* Payment ID & Order */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 font-mono text-xs">
                          {p.orderId?.orderNumber || 'Order Direct'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {p._id?.toString().slice(-8)}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          {p.customerId?.name || 'Customer'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {p.customerId?.phone || 'N/A'}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                        ₹{p.amount?.toLocaleString('en-IN')}
                      </td>

                      {/* Provider */}
                      <td className="py-3.5 px-4 font-medium">
                        <Badge className="bg-slate-100 text-slate-800 text-[10px] font-bold">
                          {p.provider || 'RAZORPAY'}
                        </Badge>
                      </td>

                      {/* Transaction ID */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {p.providerPaymentId || (
                          <span className="text-slate-400 italic">Pending Handover</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge
                          className={
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold'
                              : st === 'FAILED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold'
                              : st === 'REFUNDED'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold'
                              : 'bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold'
                          }
                        >
                          {st === 'SUCCESS' ? 'PAID' : st}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isPaid && (
                          <button
                            onClick={() => openRefundModal(p)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg transition border border-purple-200 text-xs flex items-center gap-1 ml-auto"
                            title="Process Refund"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: PROCESS REFUND ================= */}
      {modalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Process Customer Refund</h3>
                <p className="text-xs text-slate-400">Order #{selectedPayment.orderId?.orderNumber}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-800">Paid Amount</span>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    ₹{selectedPayment.amount?.toLocaleString('en-IN')}
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-800 font-bold border-purple-200">
                  {selectedPayment.provider || 'RAZORPAY'}
                </Badge>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Refund Amount (₹) *</label>
                <input
                  type="number"
                  required
                  max={selectedPayment.amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Refund Justification / Reason *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Reason for approving return/refund..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-normal"
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
                  disabled={refunding}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black shadow-md shadow-purple-600/20 transition flex items-center gap-2"
                >
                  {refunding && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Confirm & Reverse Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
