'use client';

import React from 'react';
import { Parcel, ParcelEvent, ShipmentLeg } from '../types';
import { formatDate } from '../lib/utils';
import {
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Package,
  Bike,
  Shield,
  Lock,
  UserCheck,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { Badge } from './ui/badge';

interface TrackingTimelineProps {
  parcel: Parcel;
  events?: ParcelEvent[];
  legs?: ShipmentLeg[];
  showSecretCodes?: boolean;
}

export const getTransportInfo = (type?: string) => {
  const norm = (type || '').toLowerCase();
  if (norm.includes('bike') || norm.includes('motorcycle')) {
    return { icon: '🏍️', label: 'Bike Courier', mode: 'Two-Wheeler Fast Delivery' };
  }
  if (norm.includes('cycle') || norm.includes('bicycle')) {
    return { icon: '🚲', label: 'Cycle Courier', mode: 'Eco Village Delivery' };
  }
  if (norm.includes('auto') || norm.includes('rickshaw')) {
    return { icon: '🛺', label: 'Auto / E-Rickshaw', mode: 'Cluster Transport' };
  }
  if (norm.includes('van') || norm.includes('pickup')) {
    return { icon: '🚐', label: 'Van / Pickup', mode: 'Bulk Rural Freight' };
  }
  if (norm.includes('bus')) {
    return { icon: '🚌', label: 'Regional Bus Route', mode: 'Scheduled Rural Bus' };
  }
  if (norm.includes('train') || norm.includes('rail')) {
    return { icon: '🚆', label: 'Approved Rail Courier', mode: 'Rail Station Haul' };
  }
  if (norm.includes('car')) {
    return { icon: '🚗', label: 'Car Transit', mode: 'Inter-district Car' };
  }
  return { icon: '🚚', label: 'Rural Fleet Carrier', mode: 'Regional Transport' };
};

export const getStageIndex = (status: string): number => {
  const norm = (status || '').toLowerCase();
  if (norm === 'delivered') return 7;
  if (norm === 'out_for_delivery') return 6;
  if (norm === 'received_by_agent' || norm === 'arrived_at_village_hub' || norm === 'handover_pending') return 5;
  if (norm === 'in_transit' || norm === 'picked_up' || norm === 'loaded') return 4;
  if (norm === 'pickup_pending' || norm === 'ready_for_pickup') return 2;
  if (norm === 'partner_accepted' || norm === 'accepted' || norm === 'partner_assigned') return 1;
  return 0; // searching_for_partner, created
};

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  parcel,
  events = [],
  legs = [],
  showSecretCodes = true,
}) => {
  const currentIdx = getStageIndex(parcel.status);
  const transport = getTransportInfo(parcel.preferredLogisticsType || (parcel.currentPartnerId as any)?.partnerType);

  const STAGES = [
    {
      num: 1,
      title: 'Parcel Created',
      badge: 'Step 1',
      desc: 'Consignment booked. Matching with available route transporters.',
      location: parcel.pickupLocation || parcel.senderLocation?.villageOrCity || 'Origin Village',
      icon: Package,
    },
    {
      num: 2,
      title: 'Partner Found',
      badge: 'Step 2',
      desc: (parcel.currentPartnerId as any)?.businessName
        ? `Carrier: ${(parcel.currentPartnerId as any).businessName} confirmed booking`
        : 'Travelling transporter confirmed route matching',
      location: 'Regional Transit Network',
      icon: UserCheck,
    },
    {
      num: 3,
      title: 'Pickup Confirmed',
      badge: 'Step 3',
      desc: 'Transporter heading to sender origin. Pickup Code scheduled.',
      location: parcel.pickupAddress || parcel.pickupLocation || 'Sender Address',
      statusBadge:
        parcel.verificationCodes?.pickup?.status === 'VERIFIED' || currentIdx >= 4
          ? '✓ Verified'
          : '⏳ Scheduled',
      icon: KeyRound,
    },
    {
      num: 4,
      title: 'Picked Up',
      badge: 'Step 4',
      desc:
        parcel.verificationCodes?.pickup?.status === 'VERIFIED' || currentIdx >= 4
          ? 'Pickup Code verified. Physical custody transferred to carrier.'
          : 'Custody transfer pending verification.',
      location: parcel.pickupLocation || 'Origin Station',
      statusBadge:
        parcel.verificationCodes?.pickup?.status === 'VERIFIED' || currentIdx >= 4
          ? '✓ Verified'
          : undefined,
      icon: Truck,
    },
    {
      num: 5,
      title: 'In Transit',
      badge: 'Step 5',
      desc: 'Consignment moving along rural corridor toward destination cluster.',
      location: `${parcel.pickupLocation || 'Origin'} ➔ ${parcel.deliveryLocation || 'Destination'}`,
      icon: Radio,
    },
    {
      num: 6,
      title: 'Village Agent Hub',
      badge: 'Step 6',
      desc: (parcel.currentAgentId as any)?.villageName
        ? `Custody handed over to ${(parcel.currentAgentId as any).villageName} Haat Drop Hub`
        : 'Transferred to destination Village Agent Drop Point Hub',
      location: (parcel.currentAgentId as any)?.hubAddress || `${parcel.deliveryLocation || 'Destination'} Hub`,
      statusBadge: parcel.agentSelected
        ? parcel.verificationCodes?.agent?.status === 'VERIFIED' || (parcel.verificationCodes as any)?.agentHandover?.status === 'VERIFIED' || currentIdx >= 6
          ? '✓ Verified'
          : '⏳ Transfer Pending'
        : undefined,
      icon: MapPin,
    },
    {
      num: 7,
      title: 'Out for Delivery',
      badge: 'Step 7',
      desc: parcel.agentSelected
        ? 'Village Agent carrying package for doorstep handover to customer.'
        : 'Transporter out for direct customer delivery.',
      location: parcel.deliveryLocation || 'Destination Cluster',
      icon: Bike,
    },
    {
      num: 8,
      title: 'Delivered',
      badge: 'Step 8',
      desc:
        parcel.verificationCodes?.delivery?.status === 'VERIFIED' || currentIdx === 7
          ? 'Customer verified secret 4-digit Delivery PIN. Delivered safely.'
          : 'Awaiting customer 4-digit Delivery PIN verification.',
      location: parcel.deliveryAddress || parcel.deliveryLocation || 'Final Destination',
      statusBadge:
        parcel.verificationCodes?.delivery?.status === 'VERIFIED' || currentIdx === 7
          ? '✓ Verified'
          : '⏳ Pending PIN',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 8-Stage Visual Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Chronological 8-Stage Consignment Journey
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-extrabold text-gray-900">
                Stage {currentIdx + 1} of 8:
              </span>
              <span className="text-base font-bold text-primary-700">
                {STAGES[currentIdx]?.title || parcel.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                currentIdx === 7
                  ? 'success'
                  : currentIdx >= 5
                  ? 'warning'
                  : 'secondary'
              }
              className="text-xs font-bold uppercase px-3 py-1"
            >
              {parcel.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        {/* MOBILE VERTICAL TIMELINE (< 640px) */}
        <div className="block sm:hidden space-y-0 relative pl-2 pr-1">
          <div className="absolute left-[22px] top-3 bottom-3 w-0.5 bg-gray-200" />
          {STAGES.map((step, idx) => {
            const isCompleted = currentIdx > idx;
            const isCurrent = currentIdx === idx;
            const Icon = step.icon;

            return (
              <div key={idx} className="relative flex items-start gap-3 pb-5 last:pb-1">
                {/* Node Indicator */}
                <div
                  className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                      : 'bg-gray-100 text-gray-400 border border-gray-300'
                  }`}
                >
                  {isCompleted ? '✓' : isCurrent ? '●' : '○'}
                </div>

                {/* Content Box */}
                <div
                  className={`flex-1 p-3 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isCurrent
                      ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300 shadow-2xs'
                      : 'bg-white border-gray-200 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-gray-900">{step.title}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCurrent
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1 leading-snug">{step.desc}</p>
                  <div className="text-[10px] text-gray-500 mt-1.5 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                    <span className="truncate">{step.location}</span>
                  </div>
                  {(step as any).statusBadge && (
                    <div className="mt-1.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          (step as any).statusBadge.includes('✓')
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {(step as any).statusBadge}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* TABLET / DESKTOP 8-STEP GRID (>= 640px) */}
        <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {STAGES.map((step, idx) => {
            const isCompleted = currentIdx > idx;
            const isCurrent = currentIdx === idx;
            const Icon = step.icon;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-2xs'
                    : isCurrent
                    ? 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-400/50 shadow-sm'
                    : 'bg-gray-50/80 border-gray-200 text-gray-400 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-200/70 text-emerald-800'
                          : isCurrent
                          ? 'bg-amber-200 text-amber-900 font-extrabold'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step.badge}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3 h-3" />}
                    </div>
                  </div>

                  <div className="text-xs font-bold leading-tight line-clamp-1">
                    {step.title}
                  </div>
                  <div className="text-[10px] mt-1 leading-snug line-clamp-3 text-gray-600">
                    {step.desc}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200/50">
                  <div className="text-[9px] text-gray-500 truncate flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                    <span>{step.location}</span>
                  </div>

                  {(step as any).statusBadge && (
                    <div className="mt-1.5 flex items-center justify-center">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          (step as any).statusBadge.includes('✓')
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {(step as any).statusBadge}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transporter Details & Strict Privacy Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Carrier Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Assigned Rural Logistics
            </span>
            <Badge variant="outline" className="text-[10px]">
              {transport.mode}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-2xs">
              {transport.icon}
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                {(parcel.currentPartnerId as any)?.businessName || 'Rural Transporter Partner'}
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xs text-gray-500">
                {transport.label} • Rating:{' '}
                <span className="text-amber-700 font-bold">
                  ★ {(parcel.currentPartnerId as any)?.rating || 4.8}
                </span>{' '}
                ({(parcel.currentPartnerId as any)?.totalTrips || 120}+ trips)
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              <span className="font-medium">Vehicle Registration & Plate</span>
            </div>
            <span className="text-[11px] font-mono text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded">
              Protected for Partner Privacy
            </span>
          </div>
        </div>

        {/* Verification Status & Privacy Safeguard (Zero code leakage) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Tamper-Proof Custody Verification
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3" />
              One-Time Cryptographic Handover
            </span>
          </div>

          <div className={`grid gap-2.5 ${parcel.agentSelected ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {/* 1. Pickup Verification */}
            <div className={`p-3 rounded-xl border text-center ${
              parcel.verificationCodes?.pickup?.status === 'VERIFIED' || currentIdx >= 4
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <span className="text-[10px] font-bold text-gray-700 uppercase block">
                Pickup Verification
              </span>
              <div className="my-1.5">
                {parcel.verificationCodes?.pickup?.status === 'VERIFIED' || currentIdx >= 4 ? (
                  <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ✓ Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-xs text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                    <Clock className="w-3 h-3 text-amber-600" />
                    ⏳ Pending
                  </span>
                )}
              </div>
              {showSecretCodes && (parcel.verificationCodes?.pickup?.code || parcel.pickupCode) && (
                <div className="my-1">
                  <span className="font-mono font-black text-xs bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-950 shadow-2xs">
                    Code: {parcel.verificationCodes?.pickup?.code || parcel.pickupCode}
                  </span>
                </div>
              )}
              <span className="text-[9px] text-gray-600 block leading-tight">
                {parcel.verificationCodes?.pickup?.status === 'VERIFIED' || currentIdx >= 4
                  ? 'Transferred from sender'
                  : 'Pending sender code'}
              </span>
            </div>

            {/* 2. Agent Handover (If Agent middle-point flow) */}
            {parcel.agentSelected && (
              <div className={`p-3 rounded-xl border text-center ${
                parcel.verificationCodes?.agent?.status === 'VERIFIED' || (parcel.verificationCodes as any)?.agentHandover?.status === 'VERIFIED' || currentIdx >= 6
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <span className="text-[10px] font-bold text-gray-700 uppercase block">
                  Agent Handover
                </span>
                <div className="my-1.5">
                  {parcel.verificationCodes?.agent?.status === 'VERIFIED' || (parcel.verificationCodes as any)?.agentHandover?.status === 'VERIFIED' || currentIdx >= 6 ? (
                    <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-xs text-orange-900 bg-orange-100 px-2.5 py-1 rounded-full border border-orange-300">
                      <Clock className="w-3 h-3 text-orange-600" />
                      ⏳ In Transit
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-gray-600 block leading-tight">
                  {parcel.verificationCodes?.agent?.status === 'VERIFIED' || (parcel.verificationCodes as any)?.agentHandover?.status === 'VERIFIED' || currentIdx >= 6
                    ? 'Transferred to Agent Hub'
                    : 'Awaiting Hub arrival'}
                </span>
              </div>
            )}

            {/* 3. Delivery Verification */}
            <div className={`p-3 rounded-xl border text-center ${
              parcel.verificationCodes?.delivery?.status === 'VERIFIED' || currentIdx === 7
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <span className="text-[10px] font-bold text-gray-700 uppercase block">
                Delivery Verification
              </span>
              <div className="my-1.5">
                {parcel.verificationCodes?.delivery?.status === 'VERIFIED' || currentIdx === 7 ? (
                  <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ✓ Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-xs text-blue-900 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-300">
                    <Clock className="w-3 h-3 text-blue-600" />
                    ⏳ Doorstep PIN
                  </span>
                )}
              </div>
              {showSecretCodes && (parcel.verificationCodes?.delivery?.code || parcel.deliveryPin || (parcel as any).deliveryCode) && (
                <div className="my-1">
                  <span className="font-mono font-black text-xs bg-white px-2 py-0.5 rounded border border-blue-300 text-blue-950 shadow-2xs">
                    Code: {parcel.verificationCodes?.delivery?.code || parcel.deliveryPin || (parcel as any).deliveryCode}
                  </span>
                </div>
              )}
              <span className="text-[9px] text-gray-600 block leading-tight">
                {parcel.verificationCodes?.delivery?.status === 'VERIFIED' || currentIdx === 7
                  ? 'Delivered to recipient'
                  : 'Requires recipient PIN'}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 leading-tight">
            💡 <span className="font-medium">Verification Protocol:</span> Sender Pickup Code confirms origin handover; Receiver Delivery Code confirms destination receipt. Hub transfers are verified directly between transporters and hub agents.
          </div>
        </div>
      </div>

      {/* Custody Activity Events Log */}
      {events && events.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-700" />
            Verified Custody & Milestones Activity Log ({events.length})
          </h4>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {events.map((evt, idx) => (
              <div key={idx} className="relative flex items-start justify-between gap-4 text-xs">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary-700 ring-4 ring-primary-100" />
                <div>
                  <p className="font-semibold text-gray-900">{evt.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-gray-500 text-[11px]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {evt.locationName || 'Rural Transit Hub'}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-gray-700">Role: {evt.actorRole}</span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 whitespace-nowrap">
                  {formatDate(evt.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
