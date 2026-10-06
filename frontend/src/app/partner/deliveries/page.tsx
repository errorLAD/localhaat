'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePartner } from '../../../context/PartnerContext';
import {
  Package,
  MapPin,
  ArrowRight,
  Phone,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Truck,
  ExternalLink,
  Store,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { formatDate } from '../../../lib/utils';
import { api } from '../../../lib/api';

export default function ActiveDeliveriesPage() {
  const {
    activeParcels,
    recentCompletedParcels,
    loading,
    loadDashboard,
    handleVerifyPickupCode,
    handleVerifyAgentCode,
    handleVerifyDeliveryPin,
  } = usePartner();

  const [pickupCodeInput, setPickupCodeInput] = useState<{ [id: string]: string }>({});
  const [agentCodeInput, setAgentCodeInput] = useState<{ [id: string]: string }>({});
  const [deliveryPinInput, setDeliveryPinInput] = useState<{ [id: string]: string }>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyingAgentId, setVerifyingAgentId] = useState<string | null>(null);
  const [verifyingDeliveryId, setVerifyingDeliveryId] = useState<string | null>(null);
  const [confirmingCashId, setConfirmingCashId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'in_transit' | 'completed'>('all');

  const isPickupVerified = (p: any): boolean => {
    return (
      p.verificationCodes?.pickup?.status === 'VERIFIED' ||
      ['IN_TRANSIT', 'PICKED_UP', 'RECEIVED_BY_AGENT', 'AT_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(
        (p.status || '').toUpperCase()
      )
    );
  };

  const isAgentHandoverVerified = (p: any): boolean => {
    return (
      p.verificationCodes?.agent?.status === 'VERIFIED' ||
      p.verificationCodes?.agentHandover?.status === 'VERIFIED' ||
      ['RECEIVED_BY_AGENT', 'AT_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(
        (p.status || '').toUpperCase()
      )
    );
  };

  const isDeliveryVerified = (p: any): boolean => {
    return (
      p.verificationCodes?.delivery?.status === 'VERIFIED' ||
      (p.status || '').toUpperCase() === 'DELIVERED'
    );
  };

  const onVerifyCode = async (parcel: any) => {
    const parcelKey = parcel._id;
    const code = pickupCodeInput[parcelKey];
    if (!code || code.trim().length === 0) {
      alert("Please enter the 4-digit Secure Pickup Code provided by sender.");
      return;
    }
    setVerifyingId(parcelKey);
    const lookupId = parcel.parcelTrackingNumber || parcel.parcelId || parcel._id;
    const ok = await handleVerifyPickupCode(lookupId, code.trim());
    setVerifyingId(null);
    if (ok) {
      setPickupCodeInput((prev) => ({ ...prev, [parcelKey]: '' }));
    }
  };

  const onVerifyAgentCode = async (parcel: any) => {
    const parcelKey = parcel._id;
    const code = agentCodeInput[parcelKey];
    if (!code || code.trim().length === 0) {
      alert("Please enter the 4-digit Agent Code provided by the village agent.");
      return;
    }
    setVerifyingAgentId(parcelKey);
    const lookupId = parcel.parcelTrackingNumber || parcel.parcelId || parcel._id;
    const ok = await handleVerifyAgentCode(lookupId, code.trim());
    setVerifyingAgentId(null);
    if (ok) {
      setAgentCodeInput((prev) => ({ ...prev, [parcelKey]: '' }));
    }
  };

  const onVerifyDeliveryPin = async (parcel: any) => {
    const parcelKey = parcel._id;
    const pin = deliveryPinInput[parcelKey];
    if (!pin || pin.trim().length === 0) {
      alert("Please enter the 4-digit Delivery PIN provided by receiver.");
      return;
    }
    setVerifyingDeliveryId(parcelKey);
    const lookupId = parcel.parcelTrackingNumber || parcel.parcelId || parcel._id;
    const ok = await handleVerifyDeliveryPin(lookupId, pin.trim());
    setVerifyingDeliveryId(null);
    if (ok) {
      setDeliveryPinInput((prev) => ({ ...prev, [parcelKey]: '' }));
    }
  };

  const onConfirmCash = async (parcel: any) => {
    const parcelKey = parcel._id;
    const lookupId = parcel.parcelTrackingNumber || parcel.parcelId || parcel._id;
    try {
      setConfirmingCashId(parcelKey);
      await api.confirmCashPayment(lookupId);
      alert('Cash payment confirmed successfully!');
      await loadDashboard();
    } catch (err: any) {
      alert(`Failed to confirm cash: ${err.message}`);
    } finally {
      setConfirmingCashId(null);
    }
  };

  const allParcels = [...activeParcels, ...(recentCompletedParcels || [])];
  const uniqueParcels = Array.from(new Map(allParcels.map((p) => [p._id, p])).values());

  const filteredList = uniqueParcels.filter((p) => {
    const pickupDone = isPickupVerified(p);
    const agentDone = isAgentHandoverVerified(p);
    const deliveryDone = isDeliveryVerified(p);
    const isCompleted = p.agentSelected ? agentDone : deliveryDone;

    if (filterStatus === 'assigned') {
      return !pickupDone && !isCompleted;
    }
    if (filterStatus === 'in_transit') {
      return pickupDone && !isCompleted;
    }
    if (filterStatus === 'completed') {
      return isCompleted;
    }
    return !isCompleted || activeParcels.length === 0;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Active Consignments & In-Transit Hauls</h1>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-bold">
                {activeParcels.length} ACTIVE
              </Badge>
              {recentCompletedParcels && recentCompletedParcels.length > 0 && (
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold">
                  {recentCompletedParcels.length} COMPLETED
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Pickup verification, transport execution, and delivery handovers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => loadDashboard()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            filterStatus === 'all'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          All Active ({activeParcels.length})
        </button>
        <button
          onClick={() => setFilterStatus('assigned')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            filterStatus === 'assigned'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Pickup Verification Pending
        </button>
        <button
          onClick={() => setFilterStatus('in_transit')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            filterStatus === 'in_transit'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          Loaded / In-Transit
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            filterStatus === 'completed'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          ✓ Completed & Delivered ({recentCompletedParcels?.length || 0})
        </button>
      </div>

      {/* Parcels List */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-gray-900">
              No Deliveries in this Category
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Accept incoming corridor broadcasts to schedule pickups and earn transport commission.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Link
              href="/partner/requests"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs"
            >
              <span>View Available Broadcasts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((parcel) => {
            const pickupDone = isPickupVerified(parcel);
            const agentDone = isAgentHandoverVerified(parcel);
            const deliveryDone = isDeliveryVerified(parcel);
            const isCompleted = parcel.agentSelected ? agentDone : deliveryDone;
            const isInTransit = pickupDone && !isCompleted;

            return (
              <Card
                key={parcel._id}
                className="rounded-2xl border-gray-200 hover:border-indigo-300 transition-all overflow-hidden shadow-xs"
              >
                <div className="p-5 space-y-4">
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {parcel.parcelTrackingNumber}
                      </span>
                      <Badge className={`text-[10px] font-bold ${
                        !pickupDone
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : isInTransit
                          ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isCompleted
                          ? 'DELIVERED & VERIFIED'
                          : isInTransit
                          ? (parcel.agentSelected ? 'IN TRANSIT TO AGENT' : 'IN TRANSIT TO RECEIVER')
                          : 'PICKUP VERIFICATION PENDING'}
                      </Badge>
                      {parcel.agentSelected && (
                        <Badge className="bg-orange-50 text-orange-800 border-orange-200 text-[10px] font-bold flex items-center gap-1">
                          <Store className="w-3 h-3 text-orange-600" />
                          Village Agent Route
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400 font-mono">
                        Weight: <strong className="text-gray-700">{parcel.weightKg || 1} kg</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Prominent Payment Status Badge */}
                      {parcel.paymentMethod === 'CASH_TO_PARTNER' ? (
                        parcel.paymentStatus === 'PAID' ? (
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-300 font-bold text-xs py-1 px-2.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Cash Received (₹{parcel.customerOfferPrice ?? 0})
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-950 border-amber-300 font-extrabold text-xs py-1 px-2.5 animate-pulse flex items-center gap-1">
                            <span>💵</span>
                            <span>Collect ₹{parcel.customerOfferPrice ?? 0} Cash</span>
                          </Badge>
                        )
                      ) : (parcel.paymentMethod === 'ONLINE_RAZORPAY' || parcel.paymentStatus === 'PAID') && parcel.paymentMethod !== 'NOT_SELECTED' ? (
                        <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold text-xs py-1 px-2.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>PAID ONLINE (Zero Cash)</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-950 border-yellow-300 font-bold text-xs py-1 px-2.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-yellow-700" />
                          <span>PAYMENT PENDING (Awaiting Choice)</span>
                        </Badge>
                      )}

                      <div className="flex items-center gap-1.5 font-mono text-xs bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                        <span className="text-gray-500">Earnings:</span>
                        <span className="text-sm font-extrabold text-emerald-700">
                          ₹{parcel.customerOfferPrice ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dedicated Payment Guidance Banner (Paid Before vs Cash to Collect vs Pending Selection) */}
                  {parcel.paymentMethod === 'CASH_TO_PARTNER' ? (
                    <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      parcel.paymentStatus === 'PAID'
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-amber-50/90 border-2 border-amber-300 text-amber-950 shadow-2xs'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">💵</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm">
                              {parcel.paymentStatus === 'PAID'
                                ? `Cash Settled: ₹${parcel.customerOfferPrice ?? 0}`
                                : `PAYMENT: CASH TO PARTNER (Collect ₹${parcel.customerOfferPrice ?? 0} from customer)`}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              parcel.paymentStatus === 'PAID'
                                ? 'bg-emerald-200 text-emerald-900'
                                : 'bg-amber-200 text-amber-950 font-black'
                            }`}>
                              {parcel.paymentStatus === 'PAID' ? '✓ CASH RECEIVED' : 'CASH PENDING'}
                            </span>
                          </div>
                          <p className="text-[11px] mt-0.5 text-gray-700">
                            {parcel.paymentStatus === 'PAID'
                              ? `Customer cash payment of ₹${parcel.customerOfferPrice ?? 0} was confirmed and settled.`
                              : `Customer chose cash payment. Please collect ₹${parcel.customerOfferPrice ?? 0} in cash upon pickup or delivery.`}
                          </p>
                        </div>
                      </div>

                      {parcel.paymentStatus !== 'PAID' && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onConfirmCash(parcel)}
                          disabled={confirmingCashId === parcel._id}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs h-8 px-4 rounded-lg shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
                        >
                          {confirmingCashId === parcel._id ? 'Saving...' : '✓ Mark Cash Received'}
                        </Button>
                      )}
                    </div>
                  ) : (parcel.paymentMethod === 'ONLINE_RAZORPAY' || parcel.paymentStatus === 'PAID') && parcel.paymentMethod !== 'NOT_SELECTED' ? (
                    <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-300 flex items-center justify-between text-xs text-emerald-950">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">💳</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-emerald-950">
                              PAID BEFORE (PREPAID ONLINE): ₹{parcel.customerOfferPrice ?? 0}
                            </span>
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                              DO NOT COLLECT CASH
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            Customer already paid in advance online. <strong>Do NOT ask sender or receiver for cash.</strong> Your fare is credited directly to your partner wallet.
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 shrink-0 hidden sm:inline-flex">
                        ZERO CASH TO COLLECT
                      </Badge>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-950">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">⏳</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-amber-950">
                              PAYMENT PENDING: ₹{parcel.customerOfferPrice ?? 0} (Awaiting Customer Selection)
                            </span>
                            <span className="text-[10px] bg-amber-200 text-amber-950 font-extrabold px-2 py-0.5 rounded-full">
                              AWAITING CHOICE
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            Customer has not completed payment yet. Once they choose "Cash to Partner" or "Pay Online", this status will update immediately. Do not collect cash until verified.
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-amber-600 text-white font-black text-[10px] px-2.5 py-1 shrink-0 hidden sm:inline-flex">
                        AWAITING PAYMENT
                      </Badge>
                    </div>
                  )}

                  {/* Route & Contacts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Origin */}
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        Step 1: Sender Pickup Origin
                      </span>
                      <p className="font-bold text-gray-900">
                        {parcel.pickupLocation || parcel.pickupAddress || 'Rural Corridor Point'}
                      </p>
                      <div className="flex items-center justify-between text-gray-600 pt-1">
                        <span>Sender: <strong>{parcel.senderName || 'Merchant'}</strong></span>
                        {parcel.senderMobile && (
                          <a
                            href={`tel:${parcel.senderMobile}`}
                            className="inline-flex items-center gap-1 font-mono text-blue-600 hover:underline font-bold"
                          >
                            <Phone className="w-3 h-3" />
                            {parcel.senderMobile}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-indigo-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-600" />
                        {parcel.agentSelected ? 'Step 2: Village Agent Drop Hub' : 'Step 2: Receiver Doorstep'}
                      </span>
                      <p className="font-bold text-gray-900">
                        {parcel.deliveryLocation || parcel.deliveryAddress || 'Destination Drop Point'}
                      </p>
                      <div className="flex items-center justify-between text-gray-600 pt-1">
                        <span>Receiver: <strong>{parcel.receiverName || 'Recipient'}</strong></span>
                        {parcel.receiverMobile && (
                          <a
                            href={`tel:${parcel.receiverMobile}`}
                            className="inline-flex items-center gap-1 font-mono text-blue-600 hover:underline font-bold"
                          >
                            <Phone className="w-3 h-3" />
                            {parcel.receiverMobile}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ================================================== */}
                  {/* STEP 1: PICKUP VERIFICATION (ONE-TIME STATE) */}
                  {/* ================================================== */}
                  {pickupDone ? (
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-950">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-emerald-950 text-sm">✅ Pickup Verified</span>
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                              One-Time Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            Parcel loaded & custody transferred from sender <strong>{parcel.senderName || 'Sender'}</strong>.
                            {parcel.verificationCodes?.pickup?.verifiedAt && (
                              <span className="ml-1 text-emerald-900 font-mono font-semibold">
                                ({formatDate(parcel.verificationCodes.pickup.verifiedAt)})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-600 text-white font-bold text-xs py-1 px-3 shadow-2xs shrink-0">
                        ✓ PICKED UP
                      </Badge>
                    </div>
                  ) : (
                    <div className="p-4.5 bg-amber-50/80 border-2 border-amber-300 rounded-xl space-y-3.5 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5">
                            <KeyRound className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-extrabold text-amber-950 uppercase tracking-wide">
                                Enter Sender's 4-Digit Pickup Code
                              </h4>
                              <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                                Required for Custody Transfer
                              </span>
                            </div>
                            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                              Ask sender <strong>{parcel.senderName || 'Sender'}</strong> ({parcel.senderMobile || 'Customer'}) for the 4-digit Secure Pickup Code shown on their screen.
                            </p>
                          </div>
                        </div>

                        {/* Cash Collection or Prepaid Status */}
                        {parcel.paymentMethod === 'CASH_TO_PARTNER' ? (
                          <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                            {parcel.paymentStatus === 'PAID' ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Cash Received (₹{parcel.customerOfferPrice ?? 0})
                              </Badge>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-orange-100 text-orange-950 border-orange-300 font-extrabold text-xs px-2.5 py-1">
                                  💵 Collect ₹{parcel.customerOfferPrice ?? 0} Cash
                                </Badge>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onConfirmCash(parcel)}
                                  disabled={confirmingCashId === parcel._id}
                                  className="text-[11px] h-7 border-orange-300 text-orange-900 hover:bg-orange-100 font-bold cursor-pointer"
                                >
                                  {confirmingCashId === parcel._id ? 'Saving...' : 'Mark Received'}
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (parcel.paymentMethod === 'ONLINE_RAZORPAY' || parcel.paymentStatus === 'PAID') && parcel.paymentMethod !== 'NOT_SELECTED' ? (
                          <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Prepaid Online (₹{parcel.customerOfferPrice ?? 0})
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
                            <Badge className="bg-yellow-100 text-yellow-900 border-yellow-300 font-bold text-xs flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-yellow-700" />
                              Awaiting Payment Choice (₹{parcel.customerOfferPrice ?? 0})
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Pickup Code Input Form */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                        <div className="relative w-full sm:max-w-xs">
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Enter 4-digit Pickup Code"
                            value={pickupCodeInput[parcel._id] || ''}
                            onChange={(e) =>
                              setPickupCodeInput((prev) => ({
                                ...prev,
                                [parcel._id]: e.target.value.replace(/\D/g, '').slice(0, 4),
                              }))
                            }
                            className="bg-white border-2 border-amber-300 focus:border-amber-600 text-base font-mono font-extrabold tracking-widest text-center h-11 w-full rounded-xl shadow-xs"
                            maxLength={4}
                          />
                        </div>
                        <Button
                          onClick={() => onVerifyCode(parcel)}
                          disabled={verifyingId === parcel._id}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs h-11 px-6 rounded-xl shadow-sm whitespace-nowrap w-full sm:w-auto"
                        >
                          {verifyingId === parcel._id ? (
                            <span className="animate-pulse">Verifying Code...</span>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              VERIFY PICKUP CODE & LOAD PARCEL
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ================================================== */}
                  {/* STEP 2: DESTINATION CUSTODY HANDOVER */}
                  {/* (Only visible/active once pickup is verified) */}
                  {/* ================================================== */}
                  {pickupDone && (
                    <>
                      {parcel.agentSelected ? (
                        /* CASE B: With Village Agent Middle Point -> AGENT CODE FLOW */
                        agentDone ? (
                          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-extrabold text-emerald-950 text-sm">
                                  ✅ Agent Handover Verified!
                                </p>
                                <p className="text-xs text-emerald-800 mt-0.5">
                                  Parcel custody safely transferred to Village Agent at {parcel.deliveryLocation || 'Village Hub'}. Carrier commission (₹{parcel.customerOfferPrice ?? 0}) settled.
                                  {parcel.verificationCodes?.agent?.verifiedAt && (
                                    <span className="ml-1 text-emerald-900 font-mono font-semibold">
                                      ({formatDate(parcel.verificationCodes.agent.verifiedAt)})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge className="bg-emerald-600 text-white font-bold text-xs py-1.5 px-3 shadow-xs">
                                AT VILLAGE AGENT
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4.5 bg-linear-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl space-y-3.5 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5">
                                  <Store className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-extrabold text-orange-950 uppercase tracking-wide">
                                      Enter 4-Digit Agent Code
                                    </h4>
                                    <span className="text-[10px] bg-orange-200 text-orange-950 font-bold px-2 py-0.5 rounded-full">
                                      Village Hub Handover
                                    </span>
                                  </div>
                                  <p className="text-xs text-orange-800 mt-1 leading-relaxed">
                                    Upon reaching destination hub, ask the assigned Village Agent for their <strong>4-digit Agent Code</strong> shown in their Agent Portal to complete handover.
                                  </p>
                                </div>
                              </div>

                              <span className="font-mono text-orange-800 font-bold bg-white px-3 py-1 rounded-lg border border-orange-200 shadow-2xs self-start sm:self-auto text-xs shrink-0">
                                In Transit • Delivering to Village Hub
                              </span>
                            </div>

                            {/* 4-Digit Agent Code Input Field */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                              <div className="relative w-full sm:max-w-xs">
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  placeholder="Enter 4-digit Agent Code"
                                  value={agentCodeInput[parcel._id] || ''}
                                  onChange={(e) =>
                                    setAgentCodeInput((prev) => ({
                                      ...prev,
                                      [parcel._id]: e.target.value.replace(/\D/g, '').slice(0, 4),
                                    }))
                                  }
                                  className="bg-white border-2 border-orange-300 focus:border-orange-600 text-base font-mono font-extrabold tracking-widest text-center h-11 w-full rounded-xl shadow-xs"
                                  maxLength={4}
                                />
                              </div>
                              <Button
                                onClick={() => onVerifyAgentCode(parcel)}
                                disabled={verifyingAgentId === parcel._id}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs h-11 px-6 rounded-xl shadow-sm whitespace-nowrap w-full sm:w-auto"
                              >
                                {verifyingAgentId === parcel._id ? (
                                  <span className="animate-pulse">Verifying Handover...</span>
                                ) : (
                                  <>
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                    VERIFY AGENT CODE & COMPLETE HANDOVER
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )
                      ) : (
                        /* CASE A: No Agent -> DIRECT DELIVERY PIN FLOW */
                        deliveryDone ? (
                          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-extrabold text-emerald-950 text-sm">
                                  ✅ Delivery Completed & Verified with 4-Digit PIN!
                                </p>
                                <p className="text-xs text-emerald-800 mt-0.5">
                                  Handover verified to {parcel.receiverName || 'Recipient'}. Payment settled (₹{parcel.customerOfferPrice ?? 0}) and credited to your partner wallet.
                                  {parcel.verificationCodes?.delivery?.verifiedAt && (
                                    <span className="ml-1 text-emerald-900 font-mono font-semibold">
                                      ({formatDate(parcel.verificationCodes.delivery.verifiedAt)})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge className="bg-emerald-600 text-white font-bold text-xs py-1.5 px-3 shadow-xs">
                                PAID & DELIVERED
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4.5 bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-indigo-300 rounded-xl space-y-3.5 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5">
                                  <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-extrabold text-indigo-950 uppercase tracking-wide">
                                      Enter Receiver's 4-Digit Delivery PIN
                                    </h4>
                                    <span className="text-[10px] bg-indigo-200 text-indigo-950 font-bold px-2 py-0.5 rounded-full">
                                      Complete Delivery
                                    </span>
                                  </div>
                                  <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
                                    Upon reaching destination, ask receiver <strong>{parcel.receiverName || 'Receiver'}</strong> ({parcel.receiverMobile || 'Recipient'}) for the 4-digit Delivery PIN shown on their screen to complete handover.
                                  </p>
                                </div>
                              </div>

                              <span className="font-mono text-emerald-800 font-bold bg-white px-3 py-1 rounded-lg border border-indigo-200 shadow-2xs self-start sm:self-auto text-xs shrink-0">
                                In Transit • Direct to Receiver
                              </span>
                            </div>

                            {/* 4-Digit Delivery PIN Input Field */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                              <div className="relative w-full sm:max-w-xs">
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  placeholder="Enter 4-digit Delivery PIN"
                                  value={deliveryPinInput[parcel._id] || ''}
                                  onChange={(e) =>
                                    setDeliveryPinInput((prev) => ({
                                      ...prev,
                                      [parcel._id]: e.target.value.replace(/\D/g, '').slice(0, 4),
                                    }))
                                  }
                                  className="bg-white border-2 border-indigo-300 focus:border-indigo-600 text-base font-mono font-extrabold tracking-widest text-center h-11 w-full rounded-xl shadow-xs"
                                  maxLength={4}
                                />
                              </div>
                              <Button
                                onClick={() => onVerifyDeliveryPin(parcel)}
                                disabled={verifyingDeliveryId === parcel._id}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-11 px-6 rounded-xl shadow-sm whitespace-nowrap w-full sm:w-auto"
                              >
                                {verifyingDeliveryId === parcel._id ? (
                                  <span className="animate-pulse">Verifying Delivery...</span>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-300" />
                                    VERIFY 4-DIGIT PIN & COMPLETE DELIVERY
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
