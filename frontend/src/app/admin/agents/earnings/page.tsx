'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { DollarSign, RefreshCw, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function AgentEarningsPage() {
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page.toString(),
        limit: '15',
      };
      if (status !== 'ALL') params.status = status;

      const res = await api.getAdminAgentEarnings(params);
      if (res.success) {
        setEarnings(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching agent earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [page, status]);

  const getStatusBadge = (earningStatus: string) => {
    switch (earningStatus) {
      case 'available':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">AVAILABLE FOR PAYOUT</Badge>;
      case 'paid':
        return <Badge className="bg-teal-100 text-teal-800 border-teal-200">PAID & SETTLED</Badge>;
      case 'requested':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 animate-pulse">REQUESTED</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">HOLD / PENDING</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{earningStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Financial Operations</span>
            <span className="text-xs font-bold text-emerald-700 font-mono">({total} Transactions)</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Agent Earnings Ledger</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit rural delivery payouts, bonus accruals, deductions, and clearing timelines for all village hubs.
          </p>
        </div>

        <Button onClick={fetchEarnings} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Ledger
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'available', 'paid', 'requested', 'pending'].map((s) => (
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
                <th className="py-3 px-4">Reference & Reason</th>
                <th className="py-3 px-4 text-right">Base Fee</th>
                <th className="py-3 px-4 text-right">Bonus / Ded.</th>
                <th className="py-3 px-4 text-right">Net Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Accrued Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && earnings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                    Querying ledger entries...
                  </td>
                </tr>
              ) : earnings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No earning records found matching the status filter.
                  </td>
                </tr>
              ) : (
                earnings.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{entry.actorId?.name || 'Village Agent'}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{entry.actorId?.phone}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-purple-700 font-bold">{entry.referenceId}</div>
                      <div className="text-[11px] text-gray-500">{entry.remarks || 'Standard commission'}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-700">
                      ₹{entry.baseAmount}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[11px]">
                      {entry.bonus > 0 && <span className="text-emerald-700 font-bold">+{entry.bonus} </span>}
                      {entry.deduction > 0 && <span className="text-rose-700 font-bold">-{entry.deduction}</span>}
                      {entry.bonus === 0 && entry.deduction === 0 && <span className="text-gray-400">₹0</span>}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-black text-gray-900 text-sm">
                      ₹{entry.netAmount}
                    </td>

                    <td className="py-3 px-4">{getStatusBadge(entry.status)}</td>

                    <td className="py-3 px-4 text-gray-500 text-[11px] font-mono">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>Page {page} of {totalPages} ({total} earnings records)</div>
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
    </div>
  );
}
