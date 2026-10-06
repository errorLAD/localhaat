'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '../../../context/SocketContext';
import { Parcel, ParcelEvent, ShipmentLeg } from '../../../types';
import { api } from '../../../lib/api';
import { TrackingTimeline } from '../../../components/TrackingTimeline';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Package,
  MapPin,
  Clock,
  Radio,
  Truck,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Search,
  RefreshCw,
  Phone,
  User,
  IndianRupee,
  Calendar,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export default function PublicTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const trackingNumber = (params?.trackingNumber as string) || '';
  const { socket, subscribeToParcel, unsubscribeFromParcel } = useSocket();

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [events, setEvents] = useState<ParcelEvent[]>([]);
  const [legs, setLegs] = useState<ShipmentLeg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveLocationPing, setLiveLocationPing] = useState<{ lat: number; lng: number; time: string } | null>(null);
  const [quickSearch, setQuickSearch] = useState('');

  useEffect(() => {
    if (trackingNumber) {
      document.title = `Track Parcel #${trackingNumber} | LocalHaat`;
      try {
        const { analyticsEvents } = require('../../../lib/analytics');
        analyticsEvents.parcelTracked(trackingNumber);
      } catch (e) {
        // Safe fallback
      }
      loadTrackingData();
      subscribeToParcel(trackingNumber);
    }

    return () => {
      if (trackingNumber) {
        unsubscribeFromParcel(trackingNumber);
      }
    };
  }, [trackingNumber]);

  // Realtime Socket.IO Listeners
  useEffect(() => {
    if (!socket) return;

    const handleStatusChange = (data: any) => {
      console.log('[TrackingPage] Received realtime status change:', data);
      setParcel((prev) => (prev ? { ...prev, status: data.status, currentLegIndex: data.currentLegIndex } : null));
      if (data.event) {
        setEvents((prev) => [data.event, ...prev]);
      }
    };

    const handleLocationUpdate = (data: any) => {
      console.log('[TrackingPage] Received realtime location update:', data);
      setLiveLocationPing({
        lat: data.latitude,
        lng: data.longitude,
        time: new Date().toLocaleTimeString(),
      });
    };

    socket.on('parcel:status_change', handleStatusChange);
    socket.on('parcel:location', handleLocationUpdate);

    const handlePickupVerified = (data: any) => {
      setParcel((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'IN_TRANSIT',
          verificationCodes: {
            pickup: { status: 'VERIFIED', verifiedAt: data.verifiedAt || new Date().toISOString() },
            agent: prev.verificationCodes?.agent || { status: 'NOT_REQUIRED' },
            delivery: prev.verificationCodes?.delivery || { status: 'PENDING' },
          },
        };
      });
      if (data?.event) {
        setEvents((prev) => [data.event, ...prev]);
      }
    };

    const handleAgentHandoverVerified = (data: any) => {
      setParcel((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'RECEIVED_BY_AGENT',
          verificationCodes: {
            pickup: prev.verificationCodes?.pickup || { status: 'VERIFIED' },
            agent: { status: 'VERIFIED', verifiedAt: data.verifiedAt || new Date().toISOString() },
            delivery: prev.verificationCodes?.delivery || { status: 'PENDING' },
          },
        };
      });
      if (data?.event) {
        setEvents((prev) => [data.event, ...prev]);
      }
    };

    const handleDeliveryVerified = (data: any) => {
      setParcel((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'DELIVERED',
          paymentStatus: 'PAID',
          verificationCodes: {
            pickup: prev.verificationCodes?.pickup || { status: 'VERIFIED' },
            agent: prev.verificationCodes?.agent || { status: 'NOT_REQUIRED' },
            delivery: { status: 'VERIFIED', verifiedAt: data.verifiedAt || new Date().toISOString() },
          },
        };
      });
      if (data?.event) {
        setEvents((prev) => [data.event, ...prev]);
      }
    };

    socket.on('parcel:pickup_verified', handlePickupVerified);
    socket.on('parcel:pickup-verified', handlePickupVerified);
    socket.on('parcel:agent_handover_verified', handleAgentHandoverVerified);
    socket.on('parcel:agent-handover-verified', handleAgentHandoverVerified);
    socket.on('parcel:delivery_verified', handleDeliveryVerified);
    socket.on('parcel:delivery-verified', handleDeliveryVerified);

    return () => {
      socket.off('parcel:status_change', handleStatusChange);
      socket.off('parcel:location', handleLocationUpdate);
      socket.off('parcel:pickup_verified', handlePickupVerified);
      socket.off('parcel:pickup-verified', handlePickupVerified);
      socket.off('parcel:agent_handover_verified', handleAgentHandoverVerified);
      socket.off('parcel:agent-handover-verified', handleAgentHandoverVerified);
      socket.off('parcel:delivery_verified', handleDeliveryVerified);
      socket.off('parcel:delivery-verified', handleDeliveryVerified);
    };
  }, [socket]);

  const loadTrackingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.trackPublic(trackingNumber);
      setParcel(res.parcel);
      setEvents(res.events || []);
      setLegs(res.legs || []);
    } catch (err: any) {
      setError(err.message || 'Tracking reference not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/track/${quickSearch.trim()}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation & Quick Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <a
          href="/parcels"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Parcels Hub
        </a>

        {/* Quick Search */}
        <form onSubmit={handleSearchNew} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Track other parcel (e.g. LH-TRK-...)"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="text-xs h-8 pl-8 pr-3 rounded-lg border border-gray-300 w-64 focus:outline-none focus:ring-1 focus:ring-primary-700"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>
          <Button type="submit" size="sm" variant="outline" className="h-8 text-xs">
            Track
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={loadTrackingData}
            title="Refresh status"
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
          </Button>
        </form>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 text-sm shadow-xs space-y-3">
          <RefreshCw className="w-8 h-8 text-primary-700 animate-spin mx-auto" />
          <p className="font-semibold text-gray-700">Connecting to Realtime Consignment Network...</p>
          <p className="text-xs text-gray-400 font-mono">{trackingNumber}</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 text-center p-8">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-red-900">Tracking Reference Not Found</h2>
          <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">{error}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <a
              href="/parcels"
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
            >
              Go to Parcels Hub
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={loadTrackingData}
              className="text-xs"
            >
              Retry Search
            </Button>
          </div>
        </Card>
      ) : parcel ? (
        <div className="space-y-6">
          {/* Main Consignment Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Live Consignment Tracking
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Socket.IO Active
                </span>
              </div>
              <h1 className="text-2xl font-mono font-extrabold text-gray-900 mt-1 flex items-center gap-2">
                {parcel.parcelTrackingNumber}
                <span className="text-xs font-normal font-sans bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  ID: {parcel.parcelId || parcel._id}
                </span>
              </h1>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                <span className="font-semibold text-gray-900">Contents:</span>{' '}
                <span>{parcel.whatIsInside || 'Rural Goods'}</span>
                <span>•</span>
                <span className="text-gray-500">{parcel.parcelCategory || 'General Goods'}</span>
                <span>•</span>
                <span className="font-medium text-emerald-800">₹{parcel.customerOfferPrice || 150} Fee</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  parcel.status === 'delivered' || parcel.status === 'DELIVERED'
                    ? 'success'
                    : parcel.status === 'received_by_agent' || parcel.status === 'RECEIVED_BY_AGENT'
                    ? 'warning'
                    : 'secondary'
                }
                className="text-xs uppercase font-extrabold py-2 px-4 shadow-2xs"
              >
                {parcel.status.replace(/_/g, ' ')}
              </Badge>
              {parcel.status === 'DELIVERED' || parcel.status === 'delivered' || parcel.paymentStatus === 'PAID' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  PAID & SETTLED
                </span>
              ) : parcel.paymentStatus === 'CASH_PENDING' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border bg-amber-50 text-amber-900 border-amber-300">
                  CASH PENDING
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border bg-gray-50 text-gray-700 border-gray-200">
                  PAYMENT PENDING
                </span>
              )}
            </div>
          </div>

          {/* Realtime Live GPS Radar Banner (when partner sends telemetry) */}
          {liveLocationPing && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-4 text-xs animate-in zoom-in-95">
              <div className="flex items-center gap-2.5">
                <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
                <div>
                  <span className="font-bold text-emerald-950">Live Carrier GPS Beacon Received:</span>
                  <span className="text-emerald-800 ml-2 font-mono">
                    Lat: {liveLocationPing.lat.toFixed(4)}, Lng: {liveLocationPing.lng.toFixed(4)}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">{liveLocationPing.time}</span>
            </div>
          )}

          {/* Origin & Destination Hub Route Overview Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/70 space-y-1">
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Origin / Pickup Station
              </div>
              <div className="font-bold text-gray-900 text-sm">
                {parcel.pickupLocation || parcel.senderLocation?.villageOrCity || 'Origin'}
              </div>
              <div className="text-gray-600 text-[11px]">
                {parcel.pickupAddress || parcel.senderLocation?.addressLine || 'Pickup Address'}
              </div>
              <div className="text-[11px] text-gray-500 pt-1">
                Sender: <span className="font-medium text-gray-800">{parcel.senderName || 'Sender'}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/70 space-y-1">
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Destination / Drop Point Hub
              </div>
              <div className="font-bold text-gray-900 text-sm">
                {parcel.deliveryLocation || parcel.destinationLocation?.villageOrCity || 'Destination'}
              </div>
              <div className="text-gray-600 text-[11px]">
                {parcel.deliveryAddress || parcel.destinationLocation?.addressLine || 'Drop Point Hub'}
              </div>
              <div className="text-[11px] text-gray-500 pt-1">
                Receiver: <span className="font-medium text-gray-800">{parcel.receiverName || 'Receiver'}</span>
              </div>
            </div>
          </div>

          {/* SENDER & RECEIVER VERIFICATION CODES CARD */}
          <div className="bg-white rounded-2xl border-2 border-primary-200/80 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary-700" />
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                    Consignment Verification Codes
                  </h3>
                  <span className="text-[10px] bg-primary-100 text-primary-800 font-extrabold px-2 py-0.5 rounded-full">
                    Custody Security
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Distinct 4-digit verification codes for origin collection and final destination delivery.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>One-Time Tamper-Proof Transfer</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CODE 1: SENDER'S PICKUP CODE */}
              {(() => {
                const pickupCode = parcel.verificationCodes?.pickup?.code || parcel.pickupCode;
                const isPickupVerified =
                  parcel.verificationCodes?.pickup?.status === 'VERIFIED' ||
                  ['IN_TRANSIT', 'PICKED_UP', 'RECEIVED_BY_AGENT', 'AT_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(
                    (parcel.status || '').toUpperCase()
                  );

                return (
                  <div className={`p-4 rounded-xl border-2 space-y-3 transition-all ${
                    isPickupVerified
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50/80 border-amber-300 text-amber-950 ring-2 ring-amber-400/30'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-200/80 text-amber-900">
                            Step 1: Origin
                          </span>
                          <span className="text-xs font-bold text-gray-700">Sender Pickup Code</span>
                        </div>
                        <h4 className="text-sm font-black text-gray-900 mt-1">
                          Sender ➔ Transporter Handover
                        </h4>
                      </div>

                      <Badge className={
                        isPickupVerified
                          ? 'bg-emerald-600 text-white font-extrabold text-[10px]'
                          : 'bg-amber-500 text-white font-extrabold text-[10px] animate-pulse'
                      }>
                        {isPickupVerified ? '✓ PICKUP VERIFIED' : '⏳ READY FOR PICKUP'}
                      </Badge>
                    </div>

                    {/* Prominent Code Display */}
                    <div className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          4-Digit Secure Pickup Code
                        </div>
                        <div className="text-2xl font-mono font-black text-gray-900 tracking-widest mt-0.5">
                          {pickupCode || '••••'}
                        </div>
                      </div>

                      <div className="text-right">
                        {isPickupVerified ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Custody Transferred
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-800 font-semibold max-w-[130px] text-right leading-tight">
                            Give this code to carrier upon collection
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {isPickupVerified
                        ? `Custody successfully transferred from sender ${parcel.senderName || 'Sender'}. Parcel is loaded and progressing on route.`
                        : `Sender (${parcel.senderName || 'Customer'}) provides this 4-digit code to the transporter to verify parcel loading.`}
                    </p>
                  </div>
                );
              })()}

              {/* CODE 2: RECEIVER'S DELIVERY CODE */}
              {(() => {
                const deliveryCode =
                  parcel.verificationCodes?.delivery?.code ||
                  parcel.deliveryPin ||
                  (parcel as any).deliveryCode;
                const isDeliveryVerified =
                  parcel.verificationCodes?.delivery?.status === 'VERIFIED' ||
                  (parcel.status || '').toUpperCase() === 'DELIVERED';

                return (
                  <div className={`p-4 rounded-xl border-2 space-y-3 transition-all ${
                    isDeliveryVerified
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-blue-50/80 border-blue-300 text-blue-950 ring-2 ring-blue-400/30'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-blue-200/80 text-blue-900">
                            Step 2: Destination
                          </span>
                          <span className="text-xs font-bold text-gray-700">Receiver Delivery Code</span>
                        </div>
                        <h4 className="text-sm font-black text-gray-900 mt-1">
                          Receiver ➔ Deliverer Handover
                        </h4>
                      </div>

                      <Badge className={
                        isDeliveryVerified
                          ? 'bg-emerald-600 text-white font-extrabold text-[10px]'
                          : 'bg-blue-600 text-white font-extrabold text-[10px]'
                      }>
                        {isDeliveryVerified ? '✓ DELIVERED & PAID' : '⏳ SHARE AT DELIVERY'}
                      </Badge>
                    </div>

                    {/* Prominent Code Display */}
                    <div className="p-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          4-Digit Secure Delivery Code / PIN
                        </div>
                        <div className="text-2xl font-mono font-black text-gray-900 tracking-widest mt-0.5">
                          {deliveryCode || '••••'}
                        </div>
                      </div>

                      <div className="text-right">
                        {isDeliveryVerified ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Delivery Complete
                          </div>
                        ) : (
                          <div className="text-[10px] text-blue-800 font-semibold max-w-[130px] text-right leading-tight">
                            Share only with deliverer upon doorstep handover
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {isDeliveryVerified
                        ? `Parcel handed over safely to recipient ${parcel.receiverName || 'Receiver'}. Delivery finalized.`
                        : `Receiver (${parcel.receiverName || 'Receiver'}) provides this 4-digit code to the deliverer (or village agent) upon receiving the package.`}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Hub Notice (Explains why there is no agent handover code here) */}
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-500 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-700">🔒 Hub Transfer Notice:</span>
                Transporter-to-Village Agent Handover Code is private to hub logistics and not required for customer handover.
              </span>
              <span className="text-[10px] font-mono text-gray-400 bg-gray-200/70 px-2 py-0.5 rounded">
                Tamper-Proof
              </span>
            </div>
          </div>

          {/* 8-Stage Chronological Tracking Stepper & Timeline */}
          <TrackingTimeline
            parcel={parcel}
            events={events}
            legs={legs}
            showSecretCodes={true}
          />
        </div>
      ) : null}
    </div>
  );
}
