'use client';

import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  DollarSign,
  CheckCircle2,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';

export default function AdminPayoutsPage() {
  const { payouts, loadAdminData, handleProcessPayout, loading } = useAdmin();
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed'>('all');

  const [disburseModalPayout, setDisburseModalPayout] = useState<any>(null);
  const [txnRef, setTxnRef] = useState('');
  const [disbursing, setDisbursing] = useState(false);

  const filteredPayouts = payouts.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const handleOpenDisburse = (payout: any) => {
    setDisburseModalPayout(payout);
    setTxnRef(`TXN-UPI-${Date.now().toString().slice(-6)}`);
  };

  const handleConfirmDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disburseModalPayout) return;
    setDisbursing(true);
    try {
      const ok = await handleProcessPayout(disburseModalPayout._id, 'processed', txnRef);
      if (ok) {
        setDisburseModalPayout(null);
      }
    } finally {
      setDisbursing(false);
    }
  };

  const totalPendingAmount = payouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Payout Disbursements & Settlements
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Authorize and settle earnings withdrawal requests for corridor transporters and village hub agents.
          </p>
        </div>

        <Button
          onClick={() => loadAdminData()}
          variant="outline"
          size="sm"
          className="rounded-xl text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Pending Disbursal Amount
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 block mt-1 font-mono">
            {formatCurrency(totalPendingAmount)}
          </span>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
            Awaiting admin bank/UPI transfer
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Pending Requests Count
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 block mt-1 font-mono">
            {payouts.filter((p) => p.status === 'pending').length}
          </span>
          <span className="text-[11px] text-gray-500 font-medium mt-1 block">
            Transporters & Hub Agents
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Settled Disbursements
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 block mt-1 font-mono">
            {payouts.filter((p) => p.status === 'processed').length}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Completed transactions
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-fit overflow-x-auto">
        {[
          { id: 'all', label: `All Requests (${payouts.length})` },
          { id: 'pending', label: `Pending (${payouts.filter((p) => p.status === 'pending').length})` },
          { id: 'processed', label: `Processed (${payouts.filter((p) => p.status === 'processed').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              filter === tab.id
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payouts List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredPayouts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No payout disbursement records in this view.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPayouts.map((payout) => (
              <div
                key={payout._id}
                className="p-5 hover:bg-gray-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-base text-gray-900 font-mono">
                      {formatCurrency(payout.amount)}
                    </span>
                    <Badge
                      variant={payout.status === 'processed' ? 'success' : 'warning'}
                      className="text-[10px] font-bold"
                    >
                      {payout.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    Mode: <strong>{payout.paymentMode}</strong> • Ref: <span className="font-mono">{payout.transactionRef || 'Pending Disbursal'}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Requested on: {formatDate(payout.requestedAt)}
                  </div>
                </div>

                <div>
                  {payout.status === 'pending' ? (
                    <Button
                      size="sm"
                      onClick={() => handleOpenDisburse(payout)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 px-4 rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Approve & Disburse
                    </Button>
                  ) : (
                    <span className="text-emerald-700 font-bold text-xs flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      Disbursed Successfully
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disburse Modal */}
      {disburseModalPayout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Authorize Bank / UPI Transfer
              </h3>
              <button onClick={() => setDisburseModalPayout(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
              Amount to transfer: <strong className="text-base font-mono block text-emerald-950 mt-0.5">{formatCurrency(disburseModalPayout.amount)}</strong>
              Mode: {disburseModalPayout.paymentMode}
            </div>

            <form onSubmit={handleConfirmDisburse} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Banking / UPI Transaction Reference</label>
                <Input
                  required
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  className="rounded-xl h-10 text-xs font-mono"
                />
              </div>

              <Button
                type="submit"
                disabled={disbursing}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl h-10 text-xs font-bold"
              >
                {disbursing ? 'Processing...' : 'Confirm Disbursal & Mark Settled'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
