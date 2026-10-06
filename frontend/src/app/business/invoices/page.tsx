'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../../context/BusinessContext';
import { api } from '../../../lib/api';
import {
  Receipt,
  Download,
  CreditCard,
  ShieldCheck,
  Calendar,
  Package,
  CheckCircle2,
  FileText,
  Building2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

export default function BusinessInvoicesPage() {
  const { business, stats } = useBusiness();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.getBusinessInvoices();
      if (res.success) {
        setInvoices(res.invoices || []);
        setSummary(res.summary || null);
      }
    } catch (err: any) {
      console.error('Error fetching invoices:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownloadInvoice = (invNum: string) => {
    alert(`Downloading invoice ${invNum} as official B2B PDF statement...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Invoices & Billing Statements
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Access monthly freight billing statements, consolidated charges, and corporate credit account standing.
          </p>
        </div>

        <Button
          onClick={() => fetchInvoices()}
          variant="outline"
          size="sm"
          className="rounded-xl text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Credit Standing & Financial KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Incurred Spend
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 block mt-1 font-mono">
            ₹{stats.totalSpend.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-500 font-medium mt-1 block">
            Across {stats.totalShipments} consignments
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Approved Credit Line
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700 block mt-1 font-mono">
            ₹{stats.creditLimit.toLocaleString()}
          </span>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
            Admin approved corporate tier
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Remaining Credit Balance
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 block mt-1 font-mono">
            ₹{stats.availableCredit.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Available for next dispatches
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Account Status
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-lg font-bold text-emerald-800">
              Good Standing
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-medium mt-1 block">
            Net-30 Corporate Billing
          </span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-gray-900">Monthly Consolidated Invoices</h3>
          </div>
          <span className="text-xs text-gray-400 font-medium">Billed To: {business?.businessName}</span>
        </div>

        <div className="divide-y divide-gray-100">
          {invoices.map((inv, idx) => (
            <div key={idx} className="p-5 hover:bg-gray-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-gray-900">
                      {inv.invoiceNumber}
                    </span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                      {inv.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {inv.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-gray-400" />
                      {inv.shipmentCount} Consignments
                    </span>
                    <span>•</span>
                    <span>Method: <strong>{inv.paymentMethod}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Invoice Amount</span>
                  <span className="font-mono font-extrabold text-lg text-gray-900">
                    ₹{inv.amount.toLocaleString()}
                  </span>
                </div>

                <Button
                  onClick={() => handleDownloadInvoice(inv.invoiceNumber)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF Statement
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Rate Card Information */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-600" />
          Standard B2B Rural Corridor Freight Tariff Card
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
            <span className="font-bold text-gray-900 block mb-1">Base Freight Rate</span>
            <p className="text-gray-500">₹60 flat booking fee covering the first 1.0 kg consignment across village & city corridor routes.</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
            <span className="font-bold text-gray-900 block mb-1">Surplus Weight Rate</span>
            <p className="text-gray-500">₹15 per incremental kilogram beyond the base 1kg weight threshold.</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100">
            <span className="font-bold text-gray-900 block mb-1">Security & OTP Handoff</span>
            <p className="text-gray-500">3-tier cryptographic OTP verification (Warehouse handoff, corridor transporter, customer delivery).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
