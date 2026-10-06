'use client';

import React, { useState, useEffect } from 'react';
import { ParcelBookingRequest } from '../../types';
import {
  Bell,
  Clock,
  MapPin,
  Package,
  Truck,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowDown,
  Phone,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  playTwoToneChime,
  startRingingAlert,
  stopRingingAlert,
  markBookingRequestResponded,
  isBookingRequestResponded,
  isAudioSuspended,
  resumeAudioContext,
} from '../../lib/audioAlert';

interface PartnerRingingModalProps {
  request: ParcelBookingRequest;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string, reason: string, note?: string) => Promise<void>;
  onClose?: () => void;
}

const REJECTION_REASONS = [
  'Route is at maximum capacity / No space left',
  'Cannot deviate to specified pickup stop',
  'Offered price is too low for this distance/weight',
  'Timing does not match schedule',
  'Vehicle maintenance / breakdown',
  'Other reason',
];

export const PartnerRingingModal: React.FC<PartnerRingingModalProps> = ({
  request,
  onAccept,
  onReject,
  onClose,
}) => {
  // 300-second live countdown timer
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (!request.expiresAt) return 300;
    const diff = Math.max(0, Math.floor((new Date(request.expiresAt).getTime() - Date.now()) / 1000));
    return diff > 0 ? diff : 300;
  });

  const [isAccepting, setIsAccepting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customNote, setCustomNote] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioNeedsUnlock, setAudioNeedsUnlock] = useState(false);

  useEffect(() => {
    if (isAudioSuspended()) {
      setAudioNeedsUnlock(true);
    }
  }, []);

  const handleUnlockAndPlay = async () => {
    await resumeAudioContext();
    setAudioNeedsUnlock(false);
    startRingingAlert();
  };

  // Sound loop - completely shut down if muted, accepting, rejecting, or responded
  useEffect(() => {
    if (!isMuted && !isAccepting && !isRejecting && !isBookingRequestResponded(request.requestId)) {
      startRingingAlert();
    } else {
      stopRingingAlert(false);
    }
    return () => {
      stopRingingAlert(false);
    };
  }, [isMuted, isAccepting, isRejecting, request.requestId]);

  // Unconditional teardown on component unmount
  useEffect(() => {
    return () => {
      stopRingingAlert(false);
    };
  }, []);

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          stopRingingAlert();
          onClose?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAcceptClick = async () => {
    setIsAccepting(true);
    // 1. Immediately and synchronously stop ringing audio & mark responded
    markBookingRequestResponded(request.requestId);
    stopRingingAlert();
    try {
      await onAccept(request.requestId);
      onClose?.();
    } catch (e) {
      setIsAccepting(false);
    }
  };

  const handleConfirmReject = async () => {
    setIsRejecting(true);
    // 1. Immediately and synchronously stop ringing audio & mark responded
    markBookingRequestResponded(request.requestId);
    stopRingingAlert();
    try {
      await onReject(request.requestId, selectedReason, customNote);
      setShowRejectDialog(false);
      onClose?.();
    } catch (e) {
      setIsRejecting(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startRingingAlert();
    } else {
      setIsMuted(true);
      stopRingingAlert();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border-2 border-orange-500 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
        {/* Ringing Header Banner */}
        <div className="bg-linear-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-bold shadow-inner">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-400"></span>
              </span>
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-orange-200">
                Incoming Broadcast Alert
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                NEW PARCEL BOOKING REQUEST
              </h2>
            </div>
          </div>

          <button
            onClick={toggleMute}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all text-xs flex items-center gap-1"
            title={isMuted ? 'Unmute Ringing' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-200" /> : <Volume2 className="w-5 h-5 text-yellow-200" />}
          </button>
        </div>

        {/* Expiry Countdown Timer Bar */}
        <div className={`px-5 py-2.5 flex items-center justify-between text-xs font-bold transition-colors ${
          secondsLeft <= 30 ? 'bg-red-50 text-red-700 border-b border-red-200' : 'bg-orange-50 text-orange-800 border-b border-orange-200'
        }`}>
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${secondsLeft <= 30 ? 'animate-pulse text-red-600' : 'text-orange-600'}`} />
            <span>Request expires in:</span>
          </div>
          <span className="font-mono text-base font-black tracking-wider px-2.5 py-0.5 rounded-lg bg-white border shadow-xs">
            {formatTimer(secondsLeft)}
          </span>
        </div>

        {/* Audio Autoplay Unlock Callout */}
        {audioNeedsUnlock && !isMuted && (
          <div
            onClick={handleUnlockAndPlay}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 flex items-center justify-between text-xs font-bold cursor-pointer transition-all border-b border-amber-500 animate-pulse"
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-950 shrink-0" />
              <span>Browser paused sound alert. Tap here to unmute audio alert chime!</span>
            </div>
            <span className="underline uppercase tracking-wider text-[11px] shrink-0">Unmute Now ➔</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-gray-800">
          {/* Header IDs & Customer Info */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-600">Parcel ID</span>
              <div className="text-base font-black text-gray-900 font-mono">
                #{request.parcelTrackingNumber || request.requestId}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-600">Customer</span>
              <div className="text-sm font-bold text-gray-900">{request.customerName}</div>
              {request.customerPhone && (
                <div className="text-xs text-gray-600 flex items-center gap-1 justify-end">
                  <Phone className="w-3 h-3 text-gray-600" /> {request.customerPhone}
                </div>
              )}
            </div>
          </div>

          {/* Pickup & Destination Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            {/* Pickup */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <MapPin className="w-3.5 h-3.5" />
                <span>PICKUP STOP</span>
              </div>
              <div className="text-sm font-black text-gray-900">{request.pickupStop?.name}</div>
              <div className="text-xs text-gray-600">
                Departure Time: <span className="font-bold text-gray-900">{request.pickupStop?.expectedDeparture || '08:00 AM'}</span>
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-1 sm:border-l sm:border-gray-200 sm:pl-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                <MapPin className="w-3.5 h-3.5" />
                <span>DESTINATION STOP</span>
              </div>
              <div className="text-sm font-black text-gray-900">{request.destinationStop?.name}</div>
              <div className="text-xs text-gray-600">
                Expected Arrival: <span className="font-bold text-gray-900">{request.destinationStop?.expectedArrival || '09:45 AM'}</span>
              </div>
            </div>
          </div>

          {/* Route Sequence Tree */}
          {request.routeSequence && request.routeSequence.length > 0 && (
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2">
              <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                Full Trip Corridor Route
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                {request.routeSequence.map((stopName, idx) => {
                  const isPickup = stopName.toLowerCase().includes(request.pickupStop?.name?.toLowerCase() || '');
                  const isDrop = stopName.toLowerCase().includes(request.destinationStop?.name?.toLowerCase() || '');
                  return (
                    <React.Fragment key={idx}>
                      <span
                        className={`px-2.5 py-1 rounded-lg border ${
                          isPickup
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black'
                            : isDrop
                            ? 'bg-blue-100 text-blue-900 border-blue-300 font-black'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {stopName}
                      </span>
                      {idx < request.routeSequence.length - 1 && (
                        <span className="text-gray-400 font-black text-xs">↓</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Parcel Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-600 uppercase">Category</div>
              <div className="text-xs font-black text-gray-900 truncate">{request.parcelCategory}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-600 uppercase">Weight</div>
              <div className="text-xs font-black text-gray-900">{request.weightKg} KG</div>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-600 uppercase">Dimensions</div>
              <div className="text-xs font-black text-gray-900">
                {request.dimensions ? `${request.dimensions.lengthCm}×${request.dimensions.widthCm}×${request.dimensions.heightCm}` : 'Standard'} CM
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
              <div className="text-[10px] font-bold text-gray-600 uppercase">Declared Value</div>
              <div className="text-xs font-black text-gray-900">₹{request.declaredValue || 500}</div>
            </div>
          </div>

          {/* Description & Transport */}
          <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div>
              <span className="font-bold text-gray-700">Contents:</span> {request.whatIsInside || 'General package'}
            </div>
            <div className="flex items-center gap-1 font-bold text-indigo-700">
              <Truck className="w-3.5 h-3.5" />
              <span>{request.transportMethod || 'Public Transport / Bus'}</span>
            </div>
          </div>

          {/* Partner Locked Earning / Offered Price (Section 19 Highlights) */}
          <div className="bg-linear-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[11px] font-black uppercase text-emerald-700 tracking-wider">
                Partner Earning / Offered Price
              </div>
              <div className="text-xs text-emerald-900 font-semibold mt-0.5">
                Guaranteed locked price upon completion
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-emerald-800 flex items-center justify-end">
                <span>₹{request.offeredPrice}</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                Locked Net Fare
              </div>
            </div>
          </div>

          {/* Payment Terms Callout: Paid Before vs Cash to Partner vs Selection Pending */}
          {request.paymentMethod === 'CASH_TO_PARTNER' ? (
            <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-300 text-xs text-amber-950 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl shrink-0">💵</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-950 text-sm">
                      CASH TO PARTNER (Collect ₹{request.offeredPrice} Cash)
                    </span>
                    <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-full">
                      Cash on Pickup
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Customer selected Cash payment. Collect <strong>₹{request.offeredPrice} in cash</strong> directly from the sender upon pickup.
                  </p>
                </div>
              </div>
              <Badge className="bg-amber-600 text-white font-black text-[10px] px-2.5 py-1 shrink-0">
                COLLECT CASH
              </Badge>
            </div>
          ) : (request.paymentMethod === 'ONLINE_RAZORPAY' || request.paymentStatus === 'PAID') && request.paymentMethod !== 'NOT_SELECTED' ? (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-xs text-emerald-950 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl shrink-0">💳</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-950 text-sm">
                      PAID BEFORE (PREPAID ONLINE)
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                      ZERO CASH
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Customer already paid in advance online. <strong>Do NOT ask for cash</strong> from the sender or receiver. Your fare is credited automatically.
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 shrink-0">
                PAID ONLINE
              </Badge>
            </div>
          ) : (
            <div className="p-3.5 bg-yellow-50 rounded-2xl border-2 border-yellow-300 text-xs text-yellow-950 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl shrink-0">⏳</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-yellow-950 text-sm">
                      PAYMENT SELECTION PENDING (₹{request.offeredPrice})
                    </span>
                    <span className="text-[10px] bg-yellow-200 text-yellow-950 font-black px-2 py-0.5 rounded-full">
                      AWAITING CHOICE
                    </span>
                  </div>
                  <p className="text-[11px] text-yellow-800 mt-0.5">
                    Customer will choose between Cash to Carrier or Online Payment once you accept. Your ₹{request.offeredPrice} payout is guaranteed.
                  </p>
                </div>
              </div>
              <Badge className="bg-yellow-600 text-white font-black text-[10px] px-2.5 py-1 shrink-0">
                LOCKED FARE
              </Badge>
            </div>
          )}
        </div>

        {/* Action Buttons: REJECT & ACCEPT OFFER ₹X */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isAccepting || isRejecting}
            onClick={() => setShowRejectDialog(true)}
            className="flex-1 h-12 rounded-2xl border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 font-black text-sm tracking-wide shadow-xs"
          >
            <XCircle className="w-4 h-4 mr-1.5" /> REJECT
          </Button>

          <Button
            type="button"
            disabled={isAccepting || isRejecting || secondsLeft <= 0}
            onClick={handleAcceptClick}
            className="flex-2 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isAccepting ? (
              <span>Locking Offer...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>ACCEPT OFFER ₹{request.offeredPrice}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-60 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-gray-900">Decline Parcel Booking</h3>
            </div>
            <p className="text-xs text-gray-600">
              Please choose a reason for declining. This reason will be shared with the customer so they can find an alternative partner.
            </p>

            <div className="space-y-2">
              {REJECTION_REASONS.map((r, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === r
                      ? 'border-red-500 bg-red-50/50 text-red-900 font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="mt-0.5 text-red-600"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Other reason' && (
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Specify your reason..."
                className="w-full text-xs p-2.5 border rounded-xl focus:ring-2 focus:ring-red-400 focus:outline-hidden"
                rows={2}
              />
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRejectDialog(false)}
                className="text-xs h-9"
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isRejecting}
                onClick={handleConfirmReject}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-4 rounded-xl"
              >
                {isRejecting ? 'Declining...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
