'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAgent } from '../../../context/AgentContext';
import {
  Package,
  MapPin,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Truck,
  Phone,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { formatDate } from '../../../lib/utils';

export default function TransporterHandoversPage() {
  const router = useRouter();
  const {
    incomingParcels,
    hubParcels,
    loading,
    loadAgentDashboard,
    handleVerifyHandover,
  } = useAgent();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified'>('all');
  const [handoverInputs, setHandoverInputs] = useState<{ [id: string]: string }>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const isAgentHandoverVerified = (p: any): boolean => {
    return (
      p.verificationCodes?.agentHandover?.status === 'VERIFIED' ||
      p.verificationCodes?.agent?.status === 'VERIFIED' ||
      ['RECEIVED_BY_AGENT', 'AT_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'delivered'].includes(
        (p.status || '').toUpperCase()
      )
    );
  };

  // Combine both incoming and hub parcels so verified handovers remain visible in-place
  const allHandovers = React.useMemo(() => {
    const map = new Map<string, any>();
    for (const p of [...incomingParcels, ...hubParcels]) {
      if (p && p._id && !map.has(p._id)) {
        map.set(p._id, p);
      }
    }
    return Array.from(map.values());
  }, [incomingParcels, hubParcels]);

  const pendingParcels = allHandovers.filter((p) => !isAgentHandoverVerified(p));
  const verifiedParcels = allHandovers.filter((p) => isAgentHandoverVerified(p));

  const displayedParcels =
    activeTab === 'pending'
      ? pendingParcels
      : activeTab === 'verified'
      ? verifiedParcels
      : allHandovers;

  const onConfirm = async (parcel: any) => {
    const code =
      handoverInputs[parcel._id] ||
      parcel.verificationCodes?.agentHandover?.code ||
      parcel.verificationCodes?.agent?.code ||
      parcel.agentCode ||
      parcel.handoverCode;
    if (!code || code.trim().length === 0) {
      alert('Please enter or verify the 4-digit Agent Handover Code.');
      return;
    }
    setVerifyingId(parcel._id);
    const ok = await handleVerifyHandover(parcel._id, code);
    setVerifyingId(null);
    if (ok) {
      setHandoverInputs((prev) => ({ ...prev, [parcel._id]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
            <Package className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Transporter Custody Handovers</h1>
              <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-bold">
                {pendingParcels.length} ARRIVING
              </Badge>
              {verifiedParcels.length > 0 && (
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold">
                  {verifiedParcels.length} VERIFIED
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter transporter handover codes when drivers arrive at your village drop point
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
          Refresh Handovers
        </Button>
      </div>

      {/* Explanatory Info Card */}
      <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl flex items-start gap-3 text-xs text-orange-950">
        <Info className="w-5 h-5 text-orange-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">How Custody Transfer Works:</span>
          <p className="text-orange-900 leading-relaxed">
            When a commuter transporter arrives at your village drop point, inspect the package and provide your 4-digit Agent Handover Code to the driver. The driver enters this code in their Partner app to officially transfer custody to your village hub inventory and receive payout. You can also confirm receipt directly below.
          </p>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          All Handovers ({allHandovers.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          ⏳ Waiting for Handover ({pendingParcels.length})
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'verified'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          ✅ Verified Handovers ({verifiedParcels.length})
        </button>
      </div>

      {/* Parcels List */}
      {displayedParcels.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center">
            <Truck className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-gray-900">
              No Parcels in this Tab
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {activeTab === 'pending'
                ? 'All en-route parcels have been safely received into your hub storage.'
                : activeTab === 'verified'
                ? 'No verified handovers found in this hub yet.'
                : 'No parcels scheduled for transporter custody handover at your hub.'}
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Link
              href="/agent/inventory"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-xs rounded-xl border border-amber-200 transition-colors"
            >
              <span>View Stored Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedParcels.map((parcel) => {
            const isVerified = isAgentHandoverVerified(parcel);
            const partnerName =
              parcel.currentPartnerId?.businessName ||
              parcel.currentPartnerId?.name ||
              parcel.assignedPartnerName ||
              'Logistics Partner';

            return (
              <Card
                key={parcel._id}
                className="rounded-2xl border-gray-200 hover:border-orange-300 hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Header line */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {parcel.parcelId || parcel.parcelTrackingNumber}
                      </span>
                      <Badge className={`text-[10px] font-bold ${
                        isVerified
                          ? 'bg-emerald-600 text-white'
                          : 'bg-orange-600 text-white'
                      }`}>
                        {isVerified ? 'SAFELY RECEIVED AT HUB' : 'IN TRANSIT TO HUB'}
                      </Badge>
                      <span className="text-xs text-gray-400 font-mono">
                        Weight: <strong className="text-gray-700">{parcel.weightKg || 1} kg</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Item:</span>
                      <strong className="text-xs text-gray-800">{parcel.whatIsInside || 'Goods / Farm Product'}</strong>
                    </div>
                  </div>

                  {/* Location Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-600" />
                        Shipped From
                      </span>
                      <p className="font-semibold text-gray-900">
                        {parcel.pickupLocation || parcel.pickupAddress || 'Rural Corridor Point'}
                      </p>
                      {parcel.senderName && (
                        <p className="text-gray-500 text-[11px]">
                          Sender: {parcel.senderName} ({parcel.senderMobile})
                        </p>
                      )}
                    </div>

                    <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        Village Drop Destination
                      </span>
                      <p className="font-semibold text-gray-900">
                        {parcel.deliveryLocation || parcel.deliveryAddress || 'Village Drop Point Hub'}
                      </p>
                      <p className="text-gray-500 text-[11px]">
                        Customer: {parcel.receiverName} ({parcel.receiverMobile})
                      </p>
                    </div>
                  </div>

                  {/* ================================================== */}
                  {/* SECTION 5: CUSTODY HANDOVER STATE (BEFORE / AFTER) */}
                  {/* ================================================== */}
                  {isVerified ? (
                    /* AFTER SUCCESSFUL VERIFICATION STATE */
                    <div className="p-4.5 bg-emerald-50 rounded-xl border-2 border-emerald-300 space-y-2.5 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 font-bold text-emerald-950">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span className="text-base font-black text-emerald-900">
                            ✅ Transporter Handover Verified
                          </span>
                        </div>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase self-start sm:self-auto">
                          One-Time Verified
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900 pt-2 border-t border-emerald-200/80">
                        <div>
                          <span className="text-gray-600">Parcel received by:</span>{' '}
                          <strong className="text-emerald-950 font-bold">Village Hub / Agent</strong>
                        </div>
                        <div>
                          <span className="text-gray-600">Verified:</span>{' '}
                          <strong className="text-emerald-950 font-mono font-bold">
                            {formatDate(
                              parcel.verificationCodes?.agentHandover?.verifiedAt ||
                                parcel.verificationCodes?.agent?.verifiedAt ||
                                parcel.updatedAt ||
                                new Date()
                            )}
                          </strong>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-gray-600">Partner:</span>{' '}
                          <strong className="text-emerald-950 font-bold">{partnerName}</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* BEFORE VERIFICATION STATE */
                    <div className="p-4.5 bg-amber-50 rounded-xl border-2 border-amber-300 space-y-3.5 shadow-xs">
                      <div className="bg-gradient-to-r from-amber-100/90 to-orange-100/70 border border-amber-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div>
                          <div className="flex items-center gap-2 font-black text-amber-950">
                            <KeyRound className="w-4 h-4 text-amber-700" />
                            <span className="text-sm">Agent Handover Code (OTP):</span>
                            <span className="text-[10px] bg-amber-300 text-amber-950 font-bold px-2 py-0.5 rounded-full">
                              Share with Driver
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800 mt-0.5">
                            Share this 4-digit code with the arriving transporter driver upon package physical arrival at your village hub.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="text-xs text-amber-900 font-bold uppercase">4-Digit OTP:</span>
                          <code className="font-mono text-2xl font-black bg-white px-4 py-1 rounded-xl border-2 border-amber-400 text-amber-950 tracking-widest shadow-xs">
                            {parcel.verificationCodes?.agentHandover?.code ||
                              parcel.verificationCodes?.agent?.code ||
                              parcel.agentCode ||
                              parcel.handoverCode ||
                              '••••'}
                          </code>
                        </div>
                      </div>

                      <p className="text-xs text-amber-800">
                        Status: <strong>⏳ Waiting for transporter handover</strong> • The driver can enter this code in their Partner app, or you can confirm receipt below.
                      </p>

                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-amber-200">
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder={`Enter 4-digit code (e.g. ${
                            parcel.verificationCodes?.agentHandover?.code ||
                            parcel.verificationCodes?.agent?.code ||
                            parcel.agentCode ||
                            parcel.handoverCode ||
                            '4291'
                          })`}
                          value={handoverInputs[parcel._id] || ''}
                          onChange={(e) =>
                            setHandoverInputs((prev) => ({
                              ...prev,
                              [parcel._id]: e.target.value.replace(/\D/g, '').slice(0, 4),
                            }))
                          }
                          className="bg-white border-amber-300 text-xs font-mono font-bold max-w-xs h-9 tracking-widest text-center"
                          maxLength={4}
                        />
                        <Button
                          onClick={() => onConfirm(parcel)}
                          disabled={verifyingId === parcel._id}
                          className="bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-xs whitespace-nowrap"
                        >
                          {verifyingId === parcel._id ? (
                            <span className="animate-pulse">Verifying...</span>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                              Confirm Received & Store in Hub
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
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
