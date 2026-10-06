'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePartner } from '../../../context/PartnerContext';
import { ParcelBookingRequest } from '../../../types';
import {
  Radio,
  Package,
  MapPin,
  ArrowRight,
  Check,
  X,
  Clock,
  Phone,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Bell,
  Truck,
  IndianRupee,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

export default function NewRequestsPage() {
  const router = useRouter();
  const {
    incomingRequests,
    bookingRequests,
    setRingingRequest,
    loading,
    isOnline,
    loadDashboard,
    handleAcceptParcel,
    handleRejectParcel,
    handleAcceptBookingRequest,
    handleRejectBookingRequest,
  } = usePartner();

  const [activeTab, setActiveTab] = useState<'offers' | 'broadcasts'>('offers');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const pendingOffers = bookingRequests.filter(
    (b) => b.status === 'PENDING_PARTNER_RESPONSE' && new Date(b.expiresAt).getTime() > Date.now()
  );
  const pastOffers = bookingRequests.filter(
    (b) => b.status !== 'PENDING_PARTNER_RESPONSE' || new Date(b.expiresAt).getTime() <= Date.now()
  );

  React.useEffect(() => {
    if (pendingOffers.length === 0 && incomingRequests.length > 0) {
      setActiveTab('broadcasts');
    }
  }, [pendingOffers.length, incomingRequests.length]);

  const onAcceptOffer = async (requestId: string) => {
    setAcceptingId(requestId);
    const success = await handleAcceptBookingRequest(requestId);
    setAcceptingId(null);
    if (success) {
      alert('Offer accepted! Locked price confirmed. Navigating to Active Deliveries.');
      router.push('/partner/deliveries');
    }
  };

  const onRejectOffer = async (requestId: string) => {
    setRejectingId(requestId);
    await handleRejectBookingRequest(requestId, 'Partner unavailable / Route full');
    setRejectingId(null);
  };

  const onAcceptBroadcast = async (parcelId: string) => {
    setAcceptingId(parcelId);
    const success = await handleAcceptParcel(parcelId);
    setAcceptingId(null);
    if (success) {
      alert('Parcel accepted! Navigating to Active Deliveries.');
      router.push('/partner/deliveries');
    }
  };

  const onRejectBroadcast = async (parcelId: string) => {
    setRejectingId(parcelId);
    await handleRejectParcel(parcelId);
    setRejectingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-xs">
            <Bell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Partner Parcel Requests & Offers</h1>
              {pendingOffers.length > 0 ? (
                <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-bold">
                  {pendingOffers.length} DIRECT OFFER{pendingOffers.length === 1 ? '' : 'S'}
                </Badge>
              ) : incomingRequests.length > 0 ? (
                <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-bold">
                  {incomingRequests.length} CORRIDOR BROADCAST{incomingRequests.length === 1 ? '' : 'S'}
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs font-bold">
                  0 REQUESTS
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Live corridor consignments and direct customer route booking requests
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
          Refresh
        </Button>
      </div>

      {/* Online Status Reminder */}
      {!isOnline && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">You are currently OFFLINE (Paused).</span> Switch Online in the sidebar to receive live ringing offers from senders along your routes.
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'offers'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Direct Booking Offers ({pendingOffers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'broadcasts'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Corridor Broadcasts ({incomingRequests.length})</span>
        </button>
      </div>

      {/* Tab 1: Direct Offers */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          {pendingOffers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center">
                <Bell className="w-8 h-8 opacity-60" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">No Pending Direct Offers</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  When a customer selects your trip schedule, their complete offer and locked price will appear here with a real-time ringing notification.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingOffers.map((offer) => (
                <Card
                  key={offer.requestId}
                  className="p-5 border-2 border-orange-300 shadow-md bg-white rounded-2xl hover:border-orange-500 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Offer Summary */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-900 border-orange-300 text-xs font-bold font-mono">
                          #{offer.parcelTrackingNumber || offer.requestId}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-900 border-purple-300 text-xs font-bold">
                          {offer.methodCategory || 'SCHEDULED ROUTE'}
                        </Badge>
                        <span className="text-xs text-gray-500">Trip: {offer.tripCode}</span>
                        <span className="text-xs text-gray-700 font-semibold">• Sender: {offer.customerName}</span>
                        {offer.customerPhone && (
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-500" /> {offer.customerPhone}
                          </span>
                        )}
                      </div>

                      {/* Stops & Sequence */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" /> Pickup Stop
                          </div>
                          <div className="font-bold text-gray-900">{offer.pickupStop?.name}</div>
                          <div className="text-gray-500 text-[11px]">
                            Dep: {offer.pickupStop?.expectedDeparture || '08:00 AM'}
                          </div>
                        </div>

                        <div className="sm:border-l sm:border-gray-200 sm:pl-3">
                          <div className="text-[10px] uppercase font-bold text-blue-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-600" /> Destination Stop
                          </div>
                          <div className="font-bold text-gray-900">{offer.destinationStop?.name}</div>
                          <div className="text-gray-500 text-[11px]">
                            ETA: {offer.destinationStop?.expectedArrival || '09:45 AM'}
                          </div>
                        </div>
                      </div>

                      {/* Route Path */}
                      {offer.routeSequence && offer.routeSequence.length > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-600 font-medium overflow-x-auto py-1">
                          <span className="font-bold text-gray-500 shrink-0">Route:</span>
                          {offer.routeSequence.join(' ➔ ')}
                        </div>
                      )}

                      {/* Parcel Specs */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                        <span><strong className="text-gray-800">Weight:</strong> {offer.weightKg} KG</span>
                        <span><strong className="text-gray-800">Category:</strong> {offer.parcelCategory}</span>
                        <span><strong className="text-gray-800">Contents:</strong> {offer.whatIsInside}</span>
                      </div>
                    </div>

                    {/* Offer Price & Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">
                          Offered Earning
                        </span>
                        <span className="text-3xl font-black text-emerald-700 font-mono">
                          ₹{offer.offeredPrice}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold block">
                          Locked Net Fare
                        </span>
                        {offer.paymentMethod === 'CASH_TO_PARTNER' ? (
                          <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full inline-block mt-1">
                            💵 Cash on Pickup (₹{offer.offeredPrice})
                          </span>
                        ) : (offer.paymentMethod === 'ONLINE_RAZORPAY' || offer.paymentStatus === 'PAID') && offer.paymentMethod !== 'NOT_SELECTED' ? (
                          <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-block mt-1">
                            💳 Paid Online (Prepaid)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-900 bg-yellow-100 border border-yellow-300 px-2 py-0.5 rounded-full inline-block mt-1">
                            ⏳ Payment Pending Selection
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          onClick={() => setRingingRequest(offer)}
                          variant="outline"
                          size="sm"
                          className="text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-300 font-bold text-xs px-3 rounded-xl shadow-xs"
                          title="Open full ringing alert modal with live sound"
                        >
                          <Bell className="w-3.5 h-3.5 mr-1 text-amber-600 animate-bounce" /> Ringing Alert
                        </Button>

                        <Button
                          onClick={() => onRejectOffer(offer.requestId)}
                          disabled={rejectingId === offer.requestId || acceptingId === offer.requestId}
                          variant="outline"
                          size="sm"
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs px-3 rounded-xl border-gray-200"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Decline
                        </Button>

                        <Button
                          onClick={() => onAcceptOffer(offer.requestId)}
                          disabled={acceptingId === offer.requestId}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 rounded-xl shadow-xs"
                        >
                          {acceptingId === offer.requestId ? (
                            <span>Accepting...</span>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              ACCEPT OFFER ₹{offer.offeredPrice}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Past / Responded Offers Section */}
          {pastOffers.length > 0 && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Recently Responded Offers</h3>
              <div className="space-y-2">
                {pastOffers.slice(0, 5).map((po) => (
                  <div
                    key={po.requestId}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-gray-800">#{po.parcelTrackingNumber}</span>
                      <span className="text-gray-600">{po.pickupStop?.name} ➔ {po.destinationStop?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-700">₹{po.offeredPrice}</span>
                      <Badge
                        className={`text-[10px] font-bold ${
                          po.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-red-100 text-red-900 border-red-300'
                        }`}
                      >
                        {po.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Broadcasts */}
      {activeTab === 'broadcasts' && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 mx-auto flex items-center justify-center">
                <Radio className="w-8 h-8 opacity-60" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">No Live Broadcasts Right Now</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  When new senders publish unassigned corridor parcels along your registered routes, they will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {incomingRequests.map((parcel) => (
                <Card
                  key={parcel._id}
                  className="p-5 border border-gray-200 hover:border-orange-300 shadow-xs hover:shadow-md transition-all bg-white rounded-2xl"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-bold font-mono">
                          #{parcel.parcelTrackingNumber}
                        </Badge>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {parcel.parcelCategory || 'Standard'}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                          {parcel.weightKg ? `${parcel.weightKg} KG` : 'N/A'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-green-600" />
                            Pickup Origin
                          </span>
                          <p className="font-semibold text-gray-900">
                            {parcel.pickupLocation || parcel.pickupAddress || 'Origin'}
                          </p>
                        </div>
                        <div className="sm:border-l sm:border-gray-200 sm:pl-3">
                          <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-600" />
                            Destination Handover
                          </span>
                          <p className="font-semibold text-gray-900">
                            {parcel.deliveryLocation || parcel.deliveryAddress || 'Destination'}
                          </p>
                        </div>
                      </div>

                      {parcel.whatIsInside && (
                        <p className="text-xs text-gray-600 italic">
                          Contents: "{parcel.whatIsInside}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                          Offered Payout
                        </span>
                        <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                          ₹{parcel.customerOfferPrice ?? 0}
                        </span>
                        {parcel.paymentMethod === 'CASH_TO_PARTNER' ? (
                          <span className="text-[10px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            💵 Cash on Pickup
                          </span>
                        ) : (parcel.paymentMethod === 'ONLINE_RAZORPAY' || parcel.paymentStatus === 'PAID') && parcel.paymentMethod !== 'NOT_SELECTED' ? (
                          <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            💳 Paid Online (Prepaid)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-900 bg-yellow-100 border border-yellow-300 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            ⏳ Payment Pending Selection
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => onRejectBroadcast(parcel._id)}
                          disabled={rejectingId === parcel._id || acceptingId === parcel._id}
                          variant="outline"
                          size="sm"
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-xs px-3 rounded-xl border-gray-200"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Decline
                        </Button>

                        <Button
                          onClick={() => onAcceptBroadcast(parcel._id)}
                          disabled={acceptingId === parcel._id}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 rounded-xl shadow-xs"
                        >
                          {acceptingId === parcel._id ? (
                            <span>Accepting...</span>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" /> Accept Broadcast
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
