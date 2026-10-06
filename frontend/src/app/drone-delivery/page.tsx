'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Package,
  Layers,
  Sparkles,
  Truck,
  Building2,
  Store,
  Users,
  Compass,
  FileText,
  Clock,
  Info,
  Check,
  X,
  Sliders,
  ChevronRight,
  Radio,
  Boxes,
  HeartPulse,
  Zap,
  Home,
  Sprout,
  Scale,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

// Custom Drone Quadcopter SVG Icon
const DroneIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.2" />
    <line x1="9" y1="9" x2="4.5" y2="4.5" />
    <line x1="15" y1="9" x2="19.5" y2="4.5" />
    <line x1="9" y1="15" x2="4.5" y2="19.5" />
    <line x1="15" y1="15" x2="19.5" y2="19.5" />
    <circle cx="4.5" cy="4.5" r="2.5" />
    <circle cx="19.5" cy="4.5" r="2.5" />
    <circle cx="4.5" cy="19.5" r="2.5" />
    <circle cx="19.5" cy="19.5" r="2.5" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </svg>
);

export default function DroneDeliveryRoadmapPage() {
  // Interactive Small Parcel Eligibility Checker State
  const [testWeight, setTestWeight] = useState<number>(1.0);
  const [testCategory, setTestCategory] = useState<string>('MEDICINE');
  const [testPackagingCompliant, setTestPackagingCompliant] = useState<boolean>(true);
  const [testDropPointAvailable, setTestDropPointAvailable] = useState<boolean>(true);

  // Strict Phase 2 Eligibility Rules (1-2 KG small parcels only)
  const isWeightValid = testWeight >= 0.1 && testWeight <= 2.0;
  const isOptimalFocus = testWeight >= 0.5 && testWeight <= 1.2;
  const isCategoryValid = testCategory !== 'HAZARDOUS' && testCategory !== 'BULK_OVERSIZED';
  const isPackagingValid = testPackagingCompliant;
  const isDropPointValid = testDropPointAvailable;

  const isEligibleForDrone =
    isWeightValid && isCategoryValid && isPackagingValid && isDropPointValid;

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pb-24">
      {/* ================================================== */}
      {/* 1. HERO SECTION */}
      {/* ================================================== */}
      <section className="bg-white border-b border-gray-200 pt-8 pb-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary-700">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/parcels" className="hover:text-primary-700">Logistics Network</Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-primary-700 font-bold">Drone Delivery Roadmap</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* LEFT COLUMN: Strategic Headline & Positioning */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  PHASE 1: ACTIVE LOGISTICS NETWORK
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold tracking-wide">
                  <DroneIcon className="w-3.5 h-3.5 text-amber-700" />
                  PHASE 2: SMALL-PARCEL DRONE DELIVERY
                </span>
              </div>

              <div>
                <div className="text-xs font-mono font-black uppercase text-amber-700 tracking-wider mb-1">
                  PHASE 2 • DRONE DELIVERY
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
                  Small Parcel Delivery.<br />
                  <span className="text-primary-700">Start Small. Deliver What Matters.</span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
                  LocalHaat&apos;s first drone-delivery use cases will focus on eligible small parcels, beginning with lightweight everyday and important products.
                </p>
              </div>

              {/* Core Positioning Callout */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-amber-950 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Important Positioning</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  <strong>First build the rural logistics network. Then add drones for small, important parcels.</strong> LocalHaat is primarily a rural commerce, logistics network, and village agent platform. Drone delivery is only an additional delivery method introduced in Phase 2.
                </p>
              </div>

              {/* 1 KG Focus & Phase 2 Capacity Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl bg-primary-50/70 border-2 border-primary-200">
                  <span className="text-[11px] font-black text-primary-800 uppercase tracking-wider block">
                    STARTING WITH SMALL PARCELS
                  </span>
                  <div className="text-3xl font-black text-primary-900 font-mono mt-1">≈ 1 KG</div>
                  <p className="text-xs text-primary-700 mt-1 font-medium">
                    Initial focus: approximately 1 KG lightweight, high-priority parcels.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border-2 border-emerald-200">
                  <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider block">
                    PHASE 2 CAPACITY
                  </span>
                  <div className="text-3xl font-black text-emerald-900 font-mono mt-1">1–2 KG</div>
                  <p className="text-xs text-emerald-700 mt-1 font-medium">
                    Supported Phase 2 parcel range: 1–2 KG per parcel.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#roadmap"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <span>VIEW 2-PHASE ROADMAP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="#categories"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs border border-gray-300 shadow-2xs transition-colors"
                >
                  <span>EXPLORE ELIGIBLE CATEGORIES</span>
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN: Realistic Phase 2 Drone Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-primary-200/80 shadow-xl bg-gray-100 group">
                <Image
                  src="/images/drone-delivery-phase2.webp"
                  alt="Realistic commercial quadcopter delivery drone carrying one small 1 KG parcel over a rural Indian village and farmland"
                  width={800}
                  height={500}
                  priority
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                />

                {/* Overlay Card */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-gray-200 shadow-lg text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-amber-950 flex items-center justify-center font-bold">
                        <DroneIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-gray-900">Phase 2 Small-Parcel Delivery</div>
                        <div className="text-[11px] text-gray-500">Carrying 1 Small Parcel (≈ 1 KG) • Rural Delivery</div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                      1–2 KG PER PARCEL
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-center mt-2.5 text-[11px] text-gray-500 font-medium">
                Phase 2 concept: Commercial delivery drone carrying a single small parcel over a rural village corridor.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. PHASE ROADMAP (PHASE 1 VS PHASE 2) */}
      {/* ================================================== */}
      <section id="roadmap" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 text-center max-w-3xl mx-auto">
          <Badge className="bg-primary-100 text-primary-800 border-primary-200 font-bold mb-2">
            STRATEGIC EVOLUTION
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            LocalHaat Phase Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            A simple, realistic path: first establish ground rural logistics, then introduce small-parcel aerial delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* PHASE 1: LOCALHAAT LOGISTICS (NO DRONE) */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border-2 border-slate-300 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black uppercase bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200">
                  PHASE 1 • ACTIVE FOUNDATION
                </span>
                <span className="text-xs font-black uppercase text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                  NO DRONE
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  PHASE 1 — LOCALHAAT LOGISTICS
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  &ldquo;Build the LocalHaat commerce and logistics network using existing transport partners and village agents.&rdquo;
                </p>
              </div>

              {/* Phase 1 Pillars */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Core Network Pillars (No Drones):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-primary-700 shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900">Commerce</div>
                      <div className="text-[11px] text-gray-500">Local village marketplace</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900">Parcel Delivery</div>
                      <div className="text-[11px] text-gray-500">Everyday parcel logistics</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900">Logistics Partners</div>
                      <div className="text-[11px] text-gray-500">Regional transport fleets</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900">Travelling Partners</div>
                      <div className="text-[11px] text-gray-500">Commuters, bikes, autos</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 sm:col-span-2">
                    <Users className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <div className="font-bold text-gray-900">Village Agents</div>
                      <div className="text-[11px] text-gray-500">Verified local drop points & PIN handovers</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Transport Network */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Existing Transport Methods Utilized:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-700">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 font-medium">🚌 Bus</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 font-medium">🏍️ Bike</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 font-medium">🛺 Auto & E-Rickshaw</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 font-medium">🚐 Shared Van</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 font-medium">🛻 Rural Pickup</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 font-medium">🚶 Travelling Partner</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-200 font-medium">🚚 Commercial Logistics</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Phase 1 is strictly ground-based. No drones are deployed in Phase 1.</span>
            </div>
          </div>

          {/* PHASE 2: DRONE DELIVERY */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-primary-50/30 border-2 border-primary-500 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black uppercase bg-amber-400 text-gray-950 px-3 py-1 rounded-full shadow-2xs">
                  PHASE 2 • PLANNED DRONE EXPANSION
                </span>
                <span className="text-xs font-black uppercase text-primary-800 bg-primary-100 px-2.5 py-0.5 rounded">
                  SMALL PARCELS
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <DroneIcon className="w-6 h-6 text-primary-700" />
                  <span>PHASE 2 — DRONE DELIVERY</span>
                </h3>
                <div className="text-sm font-bold text-primary-800 mt-1">
                  Small Parcel Delivery
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  &ldquo;Introduce drone delivery for eligible small parcels. Starting with lightweight parcels and an initial focus around 1 KG, within a 1–2 KG parcel range.&rdquo;
                </p>
              </div>

              {/* Payload Highlight */}
              <div className="p-4 rounded-xl bg-white border border-primary-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Payload Capacity</span>
                  <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    1–2 KG PER PARCEL
                  </span>
                </div>
                <div className="text-lg font-black text-gray-900">
                  Starting Concept: ≈ 1 KG small parcels
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Phase 2 is specifically designed for <strong>small parcels</strong>. It is <strong>NOT</strong> a large-cargo service. It is <strong>NOT</strong> a heavy-freight service.
                </p>
              </div>

              {/* Phase 2 Key Parameters */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Starting Focus</span>
                  <div className="font-mono font-black text-primary-800 text-sm mt-0.5">≈ 1 KG</div>
                  <div className="text-[11px] text-gray-500">Lightweight essentials</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Supported Range</span>
                  <div className="font-mono font-black text-emerald-800 text-sm mt-0.5">1–2 KG</div>
                  <div className="text-[11px] text-gray-500">Strict parcel limit</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Parcel Type</span>
                  <div className="font-bold text-gray-900 text-xs mt-0.5">Eligible Small Packages</div>
                  <div className="text-[11px] text-gray-500">Subject to rules & review</div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Receiving Mode</span>
                  <div className="font-bold text-gray-900 text-xs mt-0.5">Village / Drop Point</div>
                  <div className="text-[11px] text-gray-500">Secure agent custody</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-primary-200 text-xs text-primary-900 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-primary-700 shrink-0" />
              <span>Drones join as an additional transport layer in Phase 2 for small, important parcels.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. 1 KG STARTING CONCEPT (Visual Spotlight) */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <Scale className="w-3.5 h-3.5 text-emerald-700" />
                <span>SMALL-PARCEL ARCHITECTURE SPECIFICATION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                Starting with Small Parcels ≈ 1 KG
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                The initial product and use-case focus centers around approximately <strong>1 KG</strong>, with the Phase 2 supported parcel range extending to <strong>1–2 KG per parcel</strong>. This ensures high operational safety, legal compliance, and reliable rural handling.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-700">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600" /> Initial Focus: ≈ 1 KG
                </span>
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600" /> Phase 2 Capacity: 1–2 KG Per Parcel
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <X className="w-4 h-4 text-red-500" /> No Large Cargo or Heavy Freight
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">INITIAL USE-CASE FOCUS</div>
                <div className="text-3xl font-black text-primary-800 font-mono mt-0.5">≈ 1 KG</div>
                <div className="text-[11px] text-gray-500 mt-1">Lightweight everyday & urgent essentials</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center">
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">PHASE 2 PARCEL LIMIT</div>
                <div className="text-3xl font-black text-emerald-900 font-mono mt-0.5">1–2 KG</div>
                <div className="text-[11px] text-emerald-700 mt-1">Maximum allowed per parcel in Phase 2</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. WHAT CAN START WITH DRONE DELIVERY? */}
      {/* ================================================== */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Badge className="bg-amber-100 text-amber-900 border-amber-200 font-bold mb-2">
            PRACTICAL USE CASES
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            What Can Start with Drone Delivery?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-3xl">
            Practical, lightweight, and important products that can potentially fit within the 1–2 KG parcel requirement.
          </p>
        </div>

        {/* 6 Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Medicine */}
          <Card className="border border-gray-200 bg-white rounded-2xl shadow-2xs hover:border-emerald-300 transition-colors">
            <CardHeader className="bg-slate-50/70 border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-600" />
                <span>💊 Medicine / Health Essentials</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2 text-xs">
              <p className="text-gray-600 leading-relaxed">
                Small eligible medicine or health-related packages, subject to applicable rules and requirements.
              </p>
              <div className="pt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Small • Lightweight • Important</span>
              </div>
            </CardContent>
          </Card>

          {/* 2. FMCG */}
          <Card className="border border-gray-200 bg-white rounded-2xl shadow-2xs hover:border-primary-300 transition-colors">
            <CardHeader className="bg-slate-50/70 border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-primary-700" />
                <span>🛒 FMCG</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2 text-xs">
              <p className="text-gray-600 leading-relaxed">
                Small everyday consumer-product orders fitting within the 1–2 KG payload threshold.
              </p>
              <div className="pt-2 text-[11px] text-primary-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Small • Lightweight • Important</span>
              </div>
            </CardContent>
          </Card>

          {/* 3. Agriculture Essentials */}
          <Card className="border border-gray-200 bg-white rounded-2xl shadow-2xs hover:border-amber-300 transition-colors">
            <CardHeader className="bg-slate-50/70 border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-amber-700" />
                <span>🌾 Agriculture Essentials</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2 text-xs">
              <p className="text-gray-600 leading-relaxed">
                Small eligible agricultural products or supplies, subject to applicable agricultural and transport rules.
              </p>
              <div className="pt-2 text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Small • Lightweight • Important</span>
              </div>
            </CardContent>
          </Card>

          {/* 4. Small Electronics */}
          <Card className="border border-gray-200 bg-white rounded-2xl shadow-2xs hover:border-indigo-300 transition-colors">
            <CardHeader className="bg-slate-50/70 border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>🔌 Small Electronics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2 text-xs">
              <p className="text-gray-600 leading-relaxed">
                Small lightweight electronic products and accessories (cables, connectors, compact devices).
              </p>
              <div className="pt-2 text-[11px] text-indigo-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Small • Lightweight • Important</span>
              </div>
            </CardContent>
          </Card>

          {/* 5. Household Essentials */}
          <Card className="border border-gray-200 bg-white rounded-2xl shadow-2xs hover:border-orange-300 transition-colors">
            <CardHeader className="bg-slate-50/70 border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Home className="w-4 h-4 text-orange-600" />
                <span>🏠 Household Essentials</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2 text-xs">
              <p className="text-gray-600 leading-relaxed">
                Small everyday household products required by village families and local retail buyers.
              </p>
              <div className="pt-2 text-[11px] text-orange-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Small • Lightweight • Important</span>
              </div>
            </CardContent>
          </Card>

          {/* 6. Other Important Small Parcels */}
          <Card className="border border-gray-200 bg-white rounded-2xl shadow-2xs hover:border-purple-300 transition-colors">
            <CardHeader className="bg-slate-50/70 border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                <span>📦 Other Important Small Parcels</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-2 text-xs">
              <p className="text-gray-600 leading-relaxed">
                Other eligible products that fit the 1–2 KG parcel requirement and pass safety screening.
              </p>
              <div className="pt-2 text-[11px] text-purple-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Small • Lightweight • Important</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regulatory & Safety Requirements Banner */}
        <div className="mt-6 bg-amber-50 border border-amber-300 rounded-2xl p-5 flex items-start gap-3 text-xs text-amber-950">
          <Info className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <div className="font-extrabold uppercase tracking-wide">
              IMPORTANT REGULATORY & PRODUCT ELIGIBILITY NOTICE:
            </div>
            <p className="leading-relaxed text-amber-900">
              These are product categories and examples, <strong>NOT a statement that every product in these categories can be transported by drone</strong>. Actual drone eligibility must depend on:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-semibold text-amber-950">
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">• Product type</div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">• Weight (1–2 KG)</div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">• Dimensions</div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">• Packaging</div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">• Safety requirements</div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">• Applicable regulations</div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">• Operational conditions</div>
              <div className="bg-white/80 p-2 rounded-lg border border-amber-200">• Village drop clearance</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. EXAMPLE SMALL PARCELS (Visual Cards) */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-200 font-bold mb-2">
            PARCEL CARDS
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Example Small Parcels
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Visual representative examples of eligible lightweight parcels evaluated for Phase 2 dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[
            {
              title: 'Medicine',
              icon: '💊',
              sub: 'Eligible Health Parcel',
              bg: 'bg-emerald-50/70 border-emerald-200',
            },
            {
              title: 'Small FMCG',
              icon: '🛒',
              sub: 'Daily Household Pack',
              bg: 'bg-primary-50/70 border-primary-200',
            },
            {
              title: 'Agriculture Essential',
              icon: '🌾',
              sub: 'Permitted Farm Input',
              bg: 'bg-amber-50/70 border-amber-200',
            },
            {
              title: 'Small Electronics',
              icon: '🔌',
              sub: 'Compact Accessories',
              bg: 'bg-indigo-50/70 border-indigo-200',
            },
            {
              title: 'Household Essential',
              icon: '🏠',
              sub: 'Everyday Village Item',
              bg: 'bg-orange-50/70 border-orange-200',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${item.bg} bg-white shadow-2xs flex flex-col justify-between space-y-3`}
            >
              <div>
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="font-extrabold text-gray-900 text-sm">{item.title}</div>
                <div className="text-[11px] text-gray-500 font-medium">{item.sub}</div>
              </div>

              {/* 4 Standard Attributes */}
              <div className="space-y-1 pt-2 border-t border-gray-100 text-[10px] font-bold">
                <span className="block px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  SMALL
                </span>
                <span className="block px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  LIGHTWEIGHT
                </span>
                <span className="block px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  IMPORTANT
                </span>
                <span className="block px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                  ELIGIBLE FOR REVIEW
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 6. DRONE DELIVERY FLOW (Visual Diagrams) */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Badge className="bg-primary-100 text-primary-800 border-primary-200 font-bold mb-2">
            CUSTODY & DELIVERY FLOW
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Drone Delivery Flow
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Simple, realistic custody transfer for small parcels during Phase 2.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FLOW A: Direct Village Drop Point */}
          <Card className="border border-gray-200 bg-white rounded-2xl shadow-2xs">
            <CardHeader className="bg-slate-50/70 border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>Standard Delivery Flow</span>
                <span className="text-[10px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                  Drop Point Handover
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-2 font-semibold text-xs">
                {[
                  { step: '1', title: 'LOCALHAAT', desc: 'Small parcel prepared at regional hub', icon: Building2 },
                  { step: '2', title: 'SMALL PARCEL', desc: '1–2 KG verified lightweight package', icon: Package },
                  { step: '3', title: '🛸 DRONE', desc: 'Commercial drone transport', icon: DroneIcon },
                  { step: '4', title: 'VILLAGE / DROP POINT', desc: 'Designated safe rural drop point', icon: MapPin },
                  { step: '5', title: 'CUSTOMER', desc: 'Secure handover to recipient', icon: CheckCircle2 },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="relative">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {item.step}
                          </span>
                          <Icon className="w-4 h-4 text-primary-700 shrink-0" />
                          <div>
                            <div className="font-black text-gray-900 text-xs">{item.title}</div>
                            <div className="text-[11px] text-gray-500 font-normal">{item.desc}</div>
                          </div>
                        </div>
                      </div>
                      {idx < 4 && (
                        <div className="flex justify-center py-0.5 text-gray-400 font-black text-xs">
                          ↓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* FLOW B: Agent Assisted Flow */}
          <Card className="border border-gray-200 bg-white rounded-2xl shadow-2xs">
            <CardHeader className="bg-slate-50/70 border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>Agent-Assisted Delivery Flow</span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Village Agent Custody
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-2 font-semibold text-xs">
                {[
                  { step: '1', title: 'LOCALHAAT', desc: 'Small parcel prepared at regional hub', icon: Building2 },
                  { step: '2', title: 'SMALL PARCEL', desc: '1–2 KG verified lightweight package', icon: Package },
                  { step: '3', title: '🛸 DRONE', desc: 'Commercial drone transport', icon: DroneIcon },
                  { step: '4', title: 'VILLAGE AGENT', desc: 'LocalHaat village agent verifies arrival & inspects parcel', icon: Users },
                  { step: '5', title: 'CUSTOMER', desc: 'Customer receives parcel with PIN verification', icon: CheckCircle2 },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="relative">
                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-white border border-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 text-emerald-900">
                            {item.step}
                          </span>
                          <Icon className="w-4 h-4 text-emerald-700 shrink-0" />
                          <div>
                            <div className="font-black text-gray-900 text-xs">{item.title}</div>
                            <div className="text-[11px] text-gray-500 font-normal">{item.desc}</div>
                          </div>
                        </div>
                      </div>
                      {idx < 4 && (
                        <div className="flex justify-center py-0.5 text-emerald-500 font-black text-xs">
                          ↓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. RESPONSIBLE OPERATIONS & TRANSPARENT COMMITMENT */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-100 border border-slate-300 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gray-700" />
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wide">
              Responsible Operational Policy & Transparency
            </h3>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed max-w-4xl">
            LocalHaat maintains strict factual integrity across all logistics specifications. We do not make unsupported claims such as guaranteed delivery times, specific flight distances, guaranteed availability, guaranteed cost savings, faster delivery guarantees, number of villages covered, or drone fleet sizes. All drone operations in Phase 2 remain subject to applicable civil aviation regulations, DGCA Green Zone permissions, weather conditions, daylight hours, and verified operator safety clearance.
          </p>
        </div>
      </section>

      {/* ================================================== */}
      {/* 8. INTERACTIVE SMALL-PARCEL ELIGIBILITY CHECKER */}
      {/* ================================================== */}
      <section id="eligibility-engine" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Badge className="bg-primary-100 text-primary-800 border-primary-200 font-bold mb-2">
            PHASE 2 REVIEW ENGINE
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Small Parcel Eligibility Checker
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Simulate how a small parcel is screened against Phase 2 weight limits (1–2 KG) and safety parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <Card className="lg:col-span-6 border border-gray-200 bg-white rounded-2xl shadow-sm">
            <CardHeader className="bg-slate-50/70 border-b border-gray-100 py-3.5 px-5">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary-700" />
                <span>Simulate Parcel Specifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {/* Weight Slider */}
              <div>
                <div className="flex items-center justify-between font-bold text-gray-700 mb-1">
                  <span>Parcel Weight:</span>
                  <span className={`font-mono text-sm ${isWeightValid ? 'text-emerald-800 font-black' : 'text-red-600'}`}>
                    {testWeight.toFixed(1)} KG {isWeightValid ? (isOptimalFocus ? '(≈ 1 KG Focus ✓)' : '(Within 1–2 KG ✓)') : '(Exceeds 2 KG limit ✗)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={testWeight}
                  onChange={(e) => setTestWeight(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-700"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                  <span>0.2 KG</span>
                  <span className="font-bold text-primary-800">≈ 1 KG Starting Focus</span>
                  <span className="font-bold text-emerald-800">2.0 KG Phase 2 Limit</span>
                  <span>3.0 KG</span>
                </div>
              </div>

              {/* Product Category Selection */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Product Category:
                </label>
                <select
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value)}
                  className="w-full text-xs h-9 rounded-lg border border-gray-300 px-3 bg-white font-semibold"
                >
                  <option value="MEDICINE">💊 Medicine / Health Essentials</option>
                  <option value="FMCG">🛒 FMCG (Small everyday consumer products)</option>
                  <option value="AGRICULTURE">🌾 Agriculture Essentials (Small farm inputs)</option>
                  <option value="ELECTRONICS">🔌 Small Electronics (Lightweight accessories)</option>
                  <option value="HOUSEHOLD">🏠 Household Essentials (Compact items)</option>
                  <option value="OTHER_SMALL">📦 Other Important Small Parcels</option>
                  <option value="HAZARDOUS">Hazardous / Corrosive / Liquid Fuel (Prohibited)</option>
                  <option value="BULK_OVERSIZED">Heavy Bulk / Oversized Freight (Ineligible)</option>
                </select>
              </div>

              {/* Packaging Compliance Toggle */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800">Packaging & Safety Requirements:</div>
                  <div className="text-[11px] text-gray-500">
                    Compliant dimensions, secure sealing, and non-hazardous packaging.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTestPackagingCompliant(!testPackagingCompliant)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    testPackagingCompliant
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {testPackagingCompliant ? 'Compliant ✓' : 'Non-compliant ✗'}
                </button>
              </div>

              {/* Drop Point & Agent Toggle */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800">Approved Village Drop Point / Agent:</div>
                  <div className="text-[11px] text-gray-500">
                    Registered village agent or designated drop point available.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTestDropPointAvailable(!testDropPointAvailable)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    testDropPointAvailable
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {testDropPointAvailable ? 'Available ✓' : 'Unavailable ✗'}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Engine Outcome */}
          <div className="lg:col-span-6 space-y-4">
            {isEligibleForDrone ? (
              <Card className="border-2 border-emerald-500 bg-emerald-50/40 rounded-2xl shadow-sm overflow-hidden animate-in fade-in">
                <CardHeader className="bg-emerald-600 text-white py-3.5 px-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-black tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      PHASE 2 REVIEW: ELIGIBLE FOR REVIEW
                    </span>
                    <Badge className="bg-white text-emerald-900 font-extrabold text-[10px]">
                      1–2 KG RANGE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-emerald-950 text-sm font-black">
                    <DroneIcon className="w-5 h-5 text-emerald-700" />
                    <span>DELIVERY METHOD: 🛸 PHASE 2 DRONE DELIVERY</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                      <span className="text-[10px] text-gray-500 block">Parcel Weight:</span>
                      <span className="font-black text-gray-900 font-mono text-xs">{testWeight.toFixed(1)} KG</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200">
                      <span className="text-[10px] text-gray-500 block">Payload Classification:</span>
                      <span className="font-black text-emerald-800 font-mono text-xs">
                        {isOptimalFocus ? '≈ 1 KG Initial Focus' : '1–2 KG Parcel Range'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-emerald-200 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-gray-400">Custody Handover</div>
                    <div className="font-bold text-gray-800">
                      LocalHaat ➔ Small Parcel ➔ Drone ➔ Village Agent / Drop Point ➔ Customer
                    </div>
                    <div className="text-[11px] text-emerald-800 font-semibold">
                      Subject to regulatory corridor clearance and operational conditions.
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-amber-400 bg-amber-50/40 rounded-2xl shadow-sm overflow-hidden animate-in fade-in">
                <CardHeader className="bg-amber-500 text-amber-950 py-3.5 px-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase font-black tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-950" />
                      INELIGIBLE FOR DRONE — ROUTED TO GROUND NETWORK
                    </span>
                    <Badge variant="outline" className="bg-white/80 text-amber-950 font-bold text-[10px] border-amber-600">
                      PHASE 1 GROUND ROUTE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-amber-300 text-amber-950 font-bold">
                    &ldquo;Drone delivery is unavailable for this parcel. Dispatched via LocalHaat ground network.&rdquo;
                  </div>

                  <div className="space-y-1.5 text-gray-700">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block">Screening Outcome:</span>
                    {!isWeightValid && (
                      <div className="flex items-center gap-1.5 text-red-700">
                        <X className="w-3.5 h-3.5" />
                        <span>Weight ({testWeight.toFixed(1)} KG) exceeds the Phase 2 small-parcel ceiling of 2.0 KG.</span>
                      </div>
                    )}
                    {!isCategoryValid && (
                      <div className="flex items-center gap-1.5 text-red-700">
                        <X className="w-3.5 h-3.5" />
                        <span>Category does not qualify for drone transport under safety requirements.</span>
                      </div>
                    )}
                    {!isPackagingValid && (
                      <div className="flex items-center gap-1.5 text-red-700">
                        <X className="w-3.5 h-3.5" />
                        <span>Packaging does not meet standard safety or dimensional guidelines.</span>
                      </div>
                    )}
                    {!isDropPointValid && (
                      <div className="flex items-center gap-1.5 text-red-700">
                        <X className="w-3.5 h-3.5" />
                        <span>No approved village agent or drop point available at destination.</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-amber-200">
                    <span className="text-[11px] font-bold text-gray-600 uppercase block mb-1.5">
                      Dispatched Via Phase 1 Ground Logistics:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 bg-white rounded-lg border border-gray-200 flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-primary-700" />
                        <span>Travelling Partner / Commuter</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-gray-200 flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-amber-700" />
                        <span>Logistics Partner / Shared Transport</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Screening Rules Checklist */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-2 text-xs">
              <span className="font-bold text-gray-800 uppercase tracking-wide block text-[11px]">
                Actual Drone Eligibility Depends On:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-gray-600">
                <div>✓ Product type</div>
                <div>✓ Weight (1–2 KG limit)</div>
                <div>✓ Dimensions & form factor</div>
                <div>✓ Packaging integrity</div>
                <div>✓ Safety requirements</div>
                <div>✓ Applicable regulations & DGCA clearance</div>
                <div>✓ Operational & weather conditions</div>
                <div>✓ Village agent / drop point availability</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 9. LOCALHAAT MULTIMODAL CONTEXT */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs text-center space-y-4">
          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-200 font-bold">
            UNIFIED PLATFORM
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            &ldquo;First build the rural logistics network. Then add drones for small, important parcels.&rdquo;
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
            LocalHaat is not a drone company. LocalHaat is a rural commerce and logistics platform connecting village customers, kirana stores, logistics partners, travelling commuters, and village agents. Drone delivery will serve strictly as an auxiliary method introduced in Phase 2 for eligible small parcels.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-gray-200 text-xs font-bold text-gray-800">
              <span className="text-lg">🛒</span>
              <span>Rural Commerce</span>
            </div>
            <span className="text-gray-400 font-bold">+</span>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-gray-200 text-xs font-bold text-gray-800">
              <span className="text-lg">🚚</span>
              <span>Logistics Network</span>
            </div>
            <span className="text-gray-400 font-bold">+</span>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-gray-200 text-xs font-bold text-gray-800">
              <span className="text-lg">🏪</span>
              <span>Village Agents</span>
            </div>
            <span className="text-gray-400 font-bold">+</span>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-xs font-black text-amber-950">
              <span className="text-lg">🛸</span>
              <span>Phase 2 Drones (1–2 KG)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 10. FINAL MESSAGE & ACTIONS */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-gradient-to-br from-primary-50 via-white to-emerald-50/60 border border-primary-200 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-primary-700 text-white flex items-center justify-center mx-auto shadow-xs">
            <DroneIcon className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 max-w-2xl mx-auto leading-tight">
            &ldquo;Start small. Deliver what matters.&rdquo;
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Phase 1 builds our commerce and parcel network through trusted ground partners and village agents. Phase 2 introduces drone delivery for eligible small parcels, focusing on lightweight everyday and essential products within a 1–2 KG parcel range.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/marketplace"
              className="px-5 py-2.5 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs shadow-xs"
            >
              Shop Haat Marketplace
            </Link>
            <Link
              href="/parcels"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs border border-gray-300"
            >
              Parcel Delivery Network
            </Link>
            <Link
              href="/admin/logistics"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs border border-gray-300"
            >
              Admin Logistics Overview
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
