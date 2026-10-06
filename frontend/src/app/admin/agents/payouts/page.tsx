'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Building,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

export default function AgentPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal actions
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'PROCESS' | 'REJECT' | null>(null);
  const [txnRef, setTxnRef] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page.toString(),
        limit: '15',
      };
      if (status !== 'ALL') params.status = status;

      const res = await api.getAdminAgentPayouts(params);
      if (res.success) {
        setPayouts(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching agent payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [page, status]);

  const handleExecutePayout = async () => {
    if (!selectedPayout || !actionType) return;

    try {
      setActionLoading(true);
      setFeedback(null);

      const res = await api.processAdminAgentPayout(
        selectedPayout._id,
        actionType,
        txnRef || undefined,
        rejectReason || undefined
      );

      if (res.success) {
        setFeedback(res.message);
        setTimeout(() => {
          setSelectedPayout(null);
          setActionType(null);
          setTxnRef('');
          setRejectReason('');
          setFeedback(null);
          fetchPayouts();
        }, 1200);
      } else {
        setFeedback(res.message || 'Operation failed');
      }
    } catch (err: any) {
      setFeedback(err.message || 'Network error processing payout');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (pStatus: string) => {
    switch (pStatus) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 animate-pulse">PENDING APPROVAL</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">APPROVED (READY TO PAY)</Badge>;
      case 'processed':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">DISBURSED / PAID</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">REJECTED</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{pStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Disbursement Desk</span>
            <span className="text-xs font-bold text-emerald-700 font-mono">({total} Records)</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Agent Payout Requests</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Approve withdrawal requests, disburse via UPI or NEFT/IMPS, and track platform payment settlement references.
          </p>
        </div>

        <Button onClick={fetchPayouts} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
          {feedback}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['pending', 'approved', 'processed', 'rejected', 'ALL'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap uppercase ${
              status === s
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Agent Beneficiary</th>
                <th className="py-3 px-4">Account / UPI Details</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Txn Ref / Details</th>
                <th className="py-3 px-4">Requested Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                    Querying payout queue...
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No payouts matching &quot;{status}&quot;.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{p.actorId?.name || 'Village Agent'}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{p.actorId?.phone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-emerald-800">
                        {p.beneficiaryDetails?.upiId || 'Bank Transfer'}
                      </div>
                      {p.beneficiaryDetails?.accountNumber && (
                        <div className="text-[10px] text-gray-400 font-mono">
                          A/C: {p.beneficiaryDetails.accountNumber} ({p.beneficiaryDetails.ifscCode})
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-gray-900 text-sm font-mono">
                      ₹{p.amount?.toLocaleString()}
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(p.status)}</td>

                    <td className="py-3 px-4">
                      {p.transactionRef && (
                        <div className="font-mono text-purple-700 font-bold text-[11px]">{p.transactionRef}</div>
                      )}
                      {p.rejectionReason && (
                        <div className="text-rose-700 font-semibold text-[11px]">{p.rejectionReason}</div>
                      )}
                      {!p.transactionRef && !p.rejectionReason && <span className="text-gray-400 italic">None</span>}
                    </td>

                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                      {new Date(p.requestedAt || p.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedPayout(p);
                                setActionType('PROCESS');
                                setTxnRef(`TXN-LH-${Date.now().toString(36).toUpperCase()}`);
                              }}
                              className="text-[11px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                              Disburse
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedPayout(p);
                                setActionType('REJECT');
                              }}
                              className="text-[11px] h-7 px-2 text-rose-700 hover:bg-rose-50 font-bold"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {p.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPayout(p);
                              setActionType('PROCESS');
                              setTxnRef(`TXN-LH-${Date.now().toString(36).toUpperCase()}`);
                            }}
                            className="text-[11px] h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>Page {page} of {totalPages} ({total} payouts)</div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)} className="text-xs h-8 px-3">
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="text-xs h-8 px-3">
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Disburse or Reject Modal */}
      {selectedPayout && actionType && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${actionType === 'PROCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {actionType === 'PROCESS' ? <CreditCard className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">
                  {actionType === 'PROCESS' ? 'Disburse Payout Settlement' : 'Reject Payout Request'}
                </h3>
                <span className="text-xs text-gray-500">
                  {selectedPayout.actorId?.name} • ₹{selectedPayout.amount}
                </span>
              </div>
            </div>

            {actionType === 'PROCESS' && (
              <div className="space-y-2 text-xs">
                <label className="font-bold text-gray-700 block">Bank / UPI Settlement Reference (UTR / Txn ID):</label>
                <Input
                  type="text"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  placeholder="e.g. UTR192837465910 or TXN-LH-..."
                  className="text-xs font-mono"
                  required
                />
                <p className="text-[10px] text-gray-400">
                  Confirming this will mark all accrued earnings under this request as PAID in the ledger.
                </p>
              </div>
            )}

            {actionType === 'REJECT' && (
              <div className="space-y-2 text-xs">
                <label className="font-bold text-gray-700 block">Mandatory Rejection Explanation:</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Bank IFSC invalid, discrepancy in COD cash collection..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-xs min-h-[90px]"
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPayout(null);
                  setActionType(null);
                }}
                disabled={actionLoading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecutePayout}
                disabled={actionLoading || (actionType === 'REJECT' && !rejectReason.trim())}
                className={`text-xs font-bold text-white ${
                  actionType === 'PROCESS' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${actionType}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
