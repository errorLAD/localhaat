'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAgent } from '../../../context/AgentContext';
import {
  ShieldCheck,
  Package,
  MapPin,
  Phone,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { formatDate } from '../../../lib/utils';

export default function LastMileDeliveriesPage() {
  const {
    hubParcels,
    loading,
    loadAgentDashboard,
    handleVerifyDeliveryPin,
  } = useAgent();

  const [deliveryPinInputs, setDeliveryPinInputs] = useState<{ [id: string]: string }>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const isDeliveryVerified = (p: any): boolean => {
    return (
      p.verificationCodes?.delivery?.status === 'VERIFIED' ||
      (p.status || '').toUpperCase() === 'DELIVERED'
    );
  };

  const isHandoverDone = (p: any): boolean => {
    return (
      p.verificationCodes?.agentHandover?.status === 'VERIFIED' ||
      p.verificationCodes?.agent?.status === 'VERIFIED' ||
      ['AT_AGENT', 'RECEIVED_BY_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'delivered'].includes(
        (p.status || '').toUpperCase()
      )
    );
  };

  const onConfirmDelivery = async (parcel: any) => {
    // RULE 11: If parcel has not been received by agent yet, don't allow delivery
    if (!isHandoverDone(parcel)) {
      alert('Parcel has not yet been received by the village agent.');
      return;
    }

    const pin = deliveryPinInputs[parcel._id];
    if (!pin || pin.trim().length !== 4) {
      alert("Please request and enter the receiver's 4-digit Delivery PIN.");
      return;
    }

    // STRICT CHECK: Reject if user accidentally entered the Agent Handover Code
    const agentCode = (
      parcel.verificationCodes?.agentHandover?.code ||
      parcel.verificationCodes?.agent?.code ||
      parcel.agentCode ||
      parcel.handoverCode ||
      ''
    ).toString().trim().slice(0, 4);

    if (agentCode && pin.trim() === agentCode) {
      alert('Invalid Delivery PIN. (Agent Handover Code cannot be used as customer Delivery PIN).');
      return;
    }

    setVerifyingId(parcel._id);
    const ok = await handleVerifyDeliveryPin(parcel._id, pin.trim());
    setVerifyingId(null);
    if (ok) {
      setDeliveryPinInputs((prev) => ({ ...prev, [parcel._id]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Last-Mile Deliveries & PIN Verification</h1>
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold">
                {hubParcels.length} READY FOR DELIVERY
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Validate customer 4-digit OTP PINs upon physical package handover to credit your ₹25 commission
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
          Refresh Deliveries
        </Button>
      </div>

      {/* Explanatory Info Card */}
      <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
        <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Customer Handover Security:</span>
          <p className="text-emerald-900 leading-relaxed">
            The customer or recipient receives a 4-digit Delivery PIN via SMS when their package arrives at your village hub. When they come to pick it up or you deliver it to their doorstep, ask for their 4-digit PIN before handing over the item.
          </p>
        </div>
      </div>

      {/* Deliveries List */}
      {hubParcels.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-gray-900">
              All Customer Deliveries Fulfilled!
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              No packages are currently waiting for recipient pickup at your hub. Incoming consignments from arriving drivers will appear here once you accept them from Handovers.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Link
              href="/agent/handovers"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs"
            >
              <span>Check Transporter Handovers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {hubParcels.map((parcel) => (
            <Card
              key={parcel._id}
              className="rounded-2xl border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-gray-900">
                      {parcel.parcelId || parcel.parcelTrackingNumber}
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                      READY TO DELIVER
                    </Badge>
                    <span className="text-xs text-gray-400 font-mono">
                      Weight: <strong className="text-gray-700">{parcel.weightKg || 1} kg</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>+₹25 Agent Commission on Completion</span>
                  </div>
                </div>

                {/* Payment Direction Banner for Agent */}
                {parcel.paymentMethod === 'CASH_TO_PARTNER' ? (
                  parcel.paymentStatus === 'PAID' ? (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 text-xs flex items-center justify-between text-emerald-950 font-bold">
                      <span>💵 Cash Collected & Confirmed (₹{parcel.customerOfferPrice || 150})</span>
                      <Badge className="bg-emerald-600 text-white text-[10px]">SETTLED</Badge>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-300 text-xs flex items-center justify-between text-amber-950 font-bold">
                      <span>💵 Cash on Delivery: Collect ₹{parcel.customerOfferPrice || 150} Cash from Customer</span>
                      <Badge className="bg-amber-600 text-white text-[10px]">COLLECT CASH</Badge>
                    </div>
                  )
                ) : (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 text-xs flex items-center justify-between text-emerald-950 font-bold">
                    <span>💳 Prepaid Online: ₹{parcel.customerOfferPrice || 150} (Zero cash to collect from customer)</span>
                    <Badge className="bg-emerald-600 text-white text-[10px]">PREPAID</Badge>
                  </div>
                )}

                {/* Receiver Info Box */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">
                      Recipient Name & Mobile
                    </span>
                    <p className="font-bold text-gray-900 text-sm">
                      {parcel.receiverName || 'Recipient'}
                    </p>
                    {parcel.receiverMobile && (
                      <a
                        href={`tel:${parcel.receiverMobile}`}
                        className="inline-flex items-center gap-1 font-mono text-blue-600 hover:underline pt-0.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer: {parcel.receiverMobile}</span>
                      </a>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500">
                      Destination Address / Village Drop
                    </span>
                    <p className="font-semibold text-gray-800">
                      {parcel.deliveryAddress || parcel.deliveryLocation || 'Village Drop Center'}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      Item: <b>{parcel.whatIsInside || 'General Parcel'}</b>
                    </p>
                  </div>
                </div>

                {/* 4-Digit Customer Delivery PIN Box (One-Time Verification) */}
                {isDeliveryVerified(parcel) ? (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-emerald-950">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm">✅ Delivery Verified</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                          One-Time Verified
                        </span>
                      </div>
                      <Badge className="bg-emerald-600 text-white font-bold text-xs py-1 px-2.5 shadow-2xs">
                        FULFILLED & DELIVERED
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Delivered safely to recipient <strong>{parcel.receiverName || 'Customer'}</strong>. ₹25 Commission credited to your agent balance.
                      {parcel.verificationCodes?.delivery?.verifiedAt && (
                        <span className="ml-1 text-emerald-950 font-mono font-bold">
                          (Delivered: {formatDate(parcel.verificationCodes.delivery.verifiedAt)})
                        </span>
                      )}
                    </p>
                  </div>
                ) : !isHandoverDone(parcel) ? (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 space-y-2 text-xs text-amber-950">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <Info className="w-4 h-4 text-amber-700" />
                      <span className="text-sm">Transporter Handover Pending</span>
                    </div>
                    <p className="text-amber-800">
                      Parcel has not yet been received by the village agent. Please verify transporter handover first before delivering to recipient.
                    </p>
                    <Link
                      href="/agent/handovers"
                      className="inline-flex items-center gap-1 font-bold text-orange-700 hover:underline pt-1"
                    >
                      <span>Go to Transporter Handovers</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="p-4.5 bg-blue-50/80 rounded-xl border-2 border-blue-200 space-y-3.5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2 font-black text-blue-950">
                          <KeyRound className="w-4 h-4 text-blue-700" />
                          <span className="text-sm font-black uppercase tracking-wide">Delivery Verification</span>
                        </div>
                        <p className="text-xs text-blue-800 mt-0.5">
                          Receiver: <strong>{parcel.receiverName || 'Recipient'}</strong> ({parcel.receiverMobile || ''})
                        </p>
                      </div>
                      <span className="text-[11px] bg-blue-100 text-blue-900 font-bold px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                        Ask Customer for PIN
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder="Enter Receiver's 4-Digit Delivery Code"
                        value={deliveryPinInputs[parcel._id] || ''}
                        onChange={(e) =>
                          setDeliveryPinInputs((prev) => ({
                            ...prev,
                            [parcel._id]: e.target.value.replace(/\D/g, '').slice(0, 4),
                          }))
                        }
                        className="bg-white border-2 border-blue-300 focus:border-blue-600 text-base font-mono font-extrabold tracking-widest text-center h-10 w-full sm:max-w-xs rounded-xl shadow-xs"
                      />
                      <Button
                        onClick={() => onConfirmDelivery(parcel)}
                        disabled={verifyingId === parcel._id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 px-6 rounded-xl shadow-xs whitespace-nowrap w-full sm:w-auto"
                      >
                        {verifyingId === parcel._id ? (
                          <span className="animate-pulse">Verifying Delivery...</span>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 mr-1.5" />
                            VERIFY DELIVERY & FULFILL
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
