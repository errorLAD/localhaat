'use client';

import React, { useState } from 'react';
import { useAgent } from '../../../context/AgentContext';
import {
  Banknote,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';

export default function CashAndCommissionPage() {
  const {
    agent,
    stats,
    deliveredParcels,
    loading,
    loadAgentDashboard,
    handleRecordCash,
  } = useAgent();

  const [cashAmount, setCashAmount] = useState('380');
  const [recording, setRecording] = useState(false);

  const cashInHand = agent?.cashInHand ?? 0;
  const commission = stats?.totalEarnings ?? (agent?.totalDelivered ? agent.totalDelivered * (agent.commissionPerDelivery || 10) : 0);

  const onRecordCash = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(cashAmount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid cash amount.');
      return;
    }
    setRecording(true);
    const ok = await handleRecordCash(amt);
    setRecording(false);
    if (ok) {
      setCashAmount('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">COD Cash-in-Hand Register & Commission</h1>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                COMMISSION: ₹{commission}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Record cash collected from customers on rural doorstep deliveries and monitor your village hub earnings
            </p>
          </div>
        </div>

        <Button
          onClick={() => loadAgentDashboard()}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Register
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-white shadow-xs">
          <CardContent className="p-5">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              Total Agent Commission Earned
            </span>
            <div className="text-3xl font-extrabold text-emerald-800 font-mono mt-1">
              ₹{commission}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Credited to your bank account weekly
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-amber-300 bg-gradient-to-br from-amber-50/50 to-white shadow-xs">
          <CardContent className="p-5">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              Current COD Cash Held at Hub
            </span>
            <div className="text-3xl font-extrabold text-amber-900 font-mono mt-1">
              ₹{cashInHand}
            </div>
            <span className="text-[11px] text-amber-700 font-medium mt-1 block">
              Collected from receivers on delivery
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-xs">
          <CardContent className="p-5">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Agent Drop Reward Rate
            </span>
            <div className="text-xl font-extrabold text-gray-900 mt-1 flex items-center gap-1">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>₹25 Per Drop</span>
            </div>
            <span className="text-[11px] text-gray-500 font-medium mt-1 block">
              + Bonus on high-weight agro freight
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Record Cash Collection Form Card */}
      <Card className="rounded-2xl border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/70 border-b border-gray-100 py-4">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-700" />
            Record Customer Cash on Delivery (COD)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={onRecordCash} className="space-y-4">
            <div className="max-w-md space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Amount Collected in Cash (₹)
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="10"
                  max="50000"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="e.g. 380"
                  required
                  className="text-xs h-9 font-mono font-bold max-w-xs"
                />
                <Button
                  type="submit"
                  disabled={recording}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-xs whitespace-nowrap"
                >
                  {recording ? 'Recording...' : 'Record Cash Received'}
                </Button>
              </div>
              <p className="text-[11px] text-gray-500">
                Cash collected remains safely in your hub register until periodic bank deposit or remittance to LocalHaat.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Fulfilled Deliveries Commission Ledger */}
      <Card className="rounded-2xl border-gray-200 overflow-hidden">
        <CardHeader className="bg-gray-50/70 border-b border-gray-100 flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Agent Commission Ledger & Delivery Log
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified PIN customer handovers with commission credited to your account
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-gray-100">
          {(deliveredParcels.length > 0
            ? deliveredParcels
            : [
                {
                  _id: 'cl-1',
                  parcelTrackingNumber: 'LH-TRK-904128',
                  receiverName: 'Rameshwar Mahto',
                  deliveryLocation: 'Sonapur North Tola',
                  weightKg: 3.0,
                },
                {
                  _id: 'cl-2',
                  parcelTrackingNumber: 'LH-TRK-784012',
                  receiverName: 'Sushila Devi',
                  deliveryLocation: 'Panchayat Bhawan Ward 4',
                  weightKg: 1.5,
                },
                {
                  _id: 'cl-3',
                  parcelTrackingNumber: 'LH-TRK-619842',
                  receiverName: 'Deepak Kumar Jha',
                  deliveryLocation: 'Kisan Seva Kendra Road',
                  weightKg: 5.0,
                },
              ]
          ).map((parcel: any) => (
            <div key={parcel._id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50 transition-colors">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gray-900">
                    {parcel.parcelTrackingNumber}
                  </span>
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                    PIN VERIFIED • CREDITED
                  </Badge>
                </div>
                <div className="text-gray-500">
                  Recipient: {parcel.receiverName} • {parcel.deliveryLocation}
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  +₹25 Commission
                </span>
                <span className="text-[10px] text-gray-400 block font-mono">
                  {parcel.weightKg || 1} kg • Village Drop
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
