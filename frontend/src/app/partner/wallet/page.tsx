'use client';

import React, { useState } from 'react';
import { usePartner } from '../../../context/PartnerContext';
import {
  DollarSign,
  ArrowRight,
  TrendingUp,
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';

export default function ProfitAndWalletPage() {
  const {
    partner,
    stats,
    recentCompletedParcels,
    loading,
    loadDashboard,
    handleRequestPayout,
  } = usePartner();

  const totalEarnings =
    stats?.totalEarnings ?? partner?.walletBalance ?? 0;

  const [payoutAmount, setPayoutAmount] = useState('');
  const [upiId, setUpiId] = useState(partner?.bankDetails?.upiId || '');
  const [requesting, setRequesting] = useState(false);

  const onRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }
    if (amount > totalEarnings) {
      alert(`Requested amount (₹${amount}) exceeds available balance (₹${totalEarnings}).`);
      return;
    }

    setRequesting(true);
    const ok = await handleRequestPayout(amount, 'UPI');
    setRequesting(false);
    if (ok) {
      alert(`Payout request of ₹${amount} submitted to admin! Funds will transfer to ${upiId}.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Transporter Profit & Wallet</h1>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                LIVE BALANCE: ₹{totalEarnings}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Live delivery earnings, corridor commission ledger, and instant UPI payouts
            </p>
          </div>
        </div>

        <Button
          onClick={() => loadDashboard()}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Balance
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-white shadow-xs">
          <CardContent className="p-5">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
              Withdrawable Wallet Balance
            </span>
            <div className="text-3xl font-extrabold text-emerald-800 font-mono mt-1">
              ₹{totalEarnings}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for instant payout
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-xs">
          <CardContent className="p-5">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Lifetime Completed Hauls
            </span>
            <div className="text-3xl font-extrabold text-gray-900 font-mono mt-1">
              {stats?.completedTrips ?? stats?.completedCount ?? partner?.totalParcelsDelivered ?? recentCompletedParcels.length ?? 0}
            </div>
            <span className="text-[11px] text-gray-500 font-medium mt-1 block">
              Consignments safely delivered
            </span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-xs">
          <CardContent className="p-5">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Commission Payout Speed
            </span>
            <div className="text-xl font-extrabold text-blue-700 mt-1 flex items-center gap-1">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Same Day UPI</span>
            </div>
            <span className="text-[11px] text-gray-500 font-medium mt-1 block">
              Direct to verified UPI / Bank
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Payout Request Card */}
      <Card className="rounded-2xl border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/70 border-b border-gray-100 py-4">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-700" />
            Request Instant Payout Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={onRequestPayout} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Withdrawal Amount (₹)
                </label>
                <Input
                  type="number"
                  min="50"
                  max={totalEarnings > 0 ? totalEarnings : 0}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="e.g. 100"
                  required
                  className="text-xs h-9 font-mono"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Available: ₹{totalEarnings} (Min withdrawal ₹50)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Beneficiary UPI ID / VPA
                </label>
                <Input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi"
                  required
                  className="text-xs h-9 font-mono"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Supported: Google Pay, PhonePe, Paytm, BHIM UPI
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={requesting || totalEarnings <= 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs px-5"
              >
                {requesting ? 'Submitting Request...' : 'Submit Payout Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Completed Hauls & Earnings Ledger */}
      <Card className="rounded-2xl border-gray-200 overflow-hidden">
        <CardHeader className="bg-gray-50/70 border-b border-gray-100 flex flex-row items-center justify-between py-4">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Delivery Commission Ledger & Hauls
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified deliveries with earnings credited directly to your wallet
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-gray-100">
          {recentCompletedParcels.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No completed hauls yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Verified deliveries with earnings credited directly to your wallet will appear here.
              </p>
            </div>
          ) : (
            recentCompletedParcels.map((parcel: any) => (
              <div key={parcel._id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50 transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">
                      {parcel.parcelTrackingNumber}
                    </span>
                    <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                      DELIVERED & PAID
                    </Badge>
                  </div>
                  <div className="text-gray-500">
                    {parcel.pickupLocation} → {parcel.deliveryLocation}
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    +₹{parcel.customerOfferPrice ?? 0}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-mono">
                    {parcel.weightKg ? `${parcel.weightKg} kg • ` : ''}Wallet Credit
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
