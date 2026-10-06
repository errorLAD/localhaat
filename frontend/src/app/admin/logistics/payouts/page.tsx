'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  DollarSign,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

export default function LogisticsPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<any[]>([]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminLogisticsPayouts();
      if (res.success) {
        setPayouts(res.payouts || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleProcess = async (id: string, action: string) => {
    const paymentRef = prompt(`Enter payment transaction reference (e.g. UTR / IMPS / UPI ref):`);
    if (paymentRef === null) return;
    try {
      const res = await api.processAdminLogisticsPayout(id, {
        action,
        paymentReference: paymentRef,
      });
      if (res.success) {
        alert(res.message);
        fetchPayouts();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <Link
            href="/admin/logistics"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Logistics Control Center
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Partner Payout Disbursals
            </h1>
            <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-xs">
              {payouts.length} REQUESTS
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Process bank transfers, UPI disbursals, and payment verification for logistics partners.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchPayouts} className="text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden p-4 space-y-4">
        {payouts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No partner payout requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Partner</th>
                  <th className="py-2.5 px-3">Bank / UPI</th>
                  <th className="py-2.5 px-3 font-mono">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Transaction Ref</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {payouts.map((p) => (
                  <tr key={p._id} className="hover:bg-sky-50/40 transition">
                    <td className="py-2.5 px-3 text-gray-500 font-mono">
                      {new Date(p.createdAt || p.requestedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {p.actorId?.name || 'Partner'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      {p.beneficiaryDetails?.upiId || p.beneficiaryDetails?.accountNumber || 'UPI Disbursal'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900 text-sm">
                      ₹{p.amount}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        className={`text-[10px] font-bold uppercase ${
                          p.status === 'processed' || p.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : p.status === 'pending'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-red-100 text-red-900 border-red-300'
                        }`}
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500">
                      {p.transactionRef || 'Pending'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {p.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleProcess(p._id, 'APPROVE')}
                          className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                          Disburse Payout
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
