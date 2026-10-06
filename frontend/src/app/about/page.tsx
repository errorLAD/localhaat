'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wheat,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Package,
  Store,
  Users,
  Compass,
  Truck,
  HeartPulse,
  Sprout,
  Zap,
  Home,
  Boxes,
  Globe,
  Building2,
  Scale,
  Send,
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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pb-24">
      {/* ================================================== */}
      {/* 1. HERO SECTION */}
      {/* ================================================== */}
      <section className="bg-white border-b border-gray-200 pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Wheat className="w-3.5 h-3.5 text-emerald-600" />
            <span>LOCALHAAT • BUILT FOR RURAL INDIA</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              About LocalHaat
            </h1>
            <p className="text-base sm:text-xl font-semibold text-primary-800">
              The Digital Backbone for Rural Commerce & Inter-Village Logistics
            </p>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              Local Commerce. Local Logistics. Connected Villages.
            </p>
            <p className="text-xs sm:text-sm text-emerald-700 font-bold uppercase tracking-wider">
              Built for Rural India. Built Around Local Networks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-gray-700 leading-relaxed space-y-3">
            <p>
              LocalHaat is building a digital commerce and logistics network for rural India, connecting customers, businesses, logistics partners, travelling partners and village agents through one platform.
            </p>
            <p>
              Our goal is to make everyday products and parcel movement more accessible across villages and small towns by connecting local commerce and existing transport networks with digital technology.
            </p>
            <p>
              LocalHaat is designed to grow from rural commerce and existing logistics infrastructure toward new delivery methods, including small-parcel drone delivery in Phase 2.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              <span>How LocalHaat Works</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="#our-network"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs border border-gray-300 transition-colors"
            >
              <span>Explore Our Network</span>
            </a>
            <Link
              href="/drone-delivery"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 transition-colors"
            >
              <DroneIcon className="w-3.5 h-3.5 text-amber-700" />
              <span>Drone Delivery Roadmap (Phase 2)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. OUR MISSION */}
      {/* ================================================== */}
      <section id="mission" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          <Badge className="bg-primary-100 text-primary-800 border-primary-200 font-bold">
            FOUNDATIONAL PURPOSE
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Our Mission
          </h2>
          <p className="text-base sm:text-lg font-bold text-primary-900">
            &ldquo;To build a reliable digital backbone for rural commerce and inter-village logistics.&rdquo;
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-4">
            {[
              { title: 'Connect Rural Customers', desc: 'Connect rural customers with essential everyday products and marketplace goods.' },
              { title: 'Improve Access to Commerce', desc: 'Strengthen local retail stores, kirana shops, and village entrepreneurs.' },
              { title: 'Utilize Existing Transport', desc: 'Connect available commuter and logistics transport capacity with parcel movement.' },
              { title: 'Enable Village-Level Logistics', desc: 'Empower village agents with digital handover tracking and local pickup custody.' },
              { title: 'Support Logistics Partners', desc: 'Provide predictable income opportunities for daily travellers and local vehicle owners.' },
              { title: 'Scalable Rural Delivery', desc: 'Build an interconnected, sustainable rural delivery infrastructure across villages.' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h3 className="font-bold text-xs text-gray-900">{item.title}</h3>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed pl-6">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. HOW LOCALHAAT WORKS */}
      {/* ================================================== */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-200 font-bold">
            STEP-BY-STEP ECOSYSTEM
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            How LocalHaat Works
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
            LocalHaat combines rural commerce with a connected logistics network. Customers can purchase products or send eligible parcels, while verified logistics and travelling partners help move shipments through existing local transport networks.
          </p>

          {/* Visual Step Tree */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-2xs space-y-3">
            {[
              { step: '1', title: 'CUSTOMER', desc: 'Places a marketplace order or books a rural parcel consignment.', icon: Users },
              { step: '2', title: 'LOCALHAAT PLATFORM', desc: 'Digital platform coordinates routing, verification PINs, and partner matching.', icon: Wheat },
              { step: '3', title: 'PRODUCTS / PARCELS', desc: 'Eligible goods packaged and verified for safe rural transport.', icon: Package },
              { step: '4', title: 'LOGISTICS PARTNERS', desc: 'Regional delivery partners and transporters accept inter-hub dispatch hauls.', icon: Truck },
              { step: '5', title: 'TRAVELLING PARTNERS', desc: 'Commuters already travelling that route (bike, auto, bus) carry parcels along.', icon: Compass },
              { step: '6', title: 'VILLAGE AGENTS', desc: 'Trusted village agents verify incoming parcels at local pickup hubs.', icon: Store },
              { step: '7', title: 'CUSTOMER', desc: 'Final doorstep delivery or hub pickup completed with 4-digit PIN verification.', icon: CheckCircle2 },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-white border border-gray-300 flex items-center justify-center font-bold text-xs text-primary-800 shrink-0">
                        {item.step}
                      </span>
                      <Icon className="w-4 h-4 text-primary-700 shrink-0" />
                      <div>
                        <div className="font-extrabold text-xs text-gray-900">{item.title}</div>
                        <div className="text-[11px] text-gray-600">{item.desc}</div>
                      </div>
                    </div>
                  </div>
                  {idx < 6 && (
                    <div className="flex justify-center py-1 text-gray-400 font-bold text-xs">
                      ↓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. OUR NETWORK */}
      {/* ================================================== */}
      <section id="our-network" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          <Badge className="bg-amber-100 text-amber-900 border-amber-200 font-bold">
            ECOSYSTEM PARTICIPANTS
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Our Network
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
            LocalHaat connects different participants of the rural delivery ecosystem through one digital platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {[
              { name: 'Customers', desc: 'Rural and semi-urban households buying products or sending parcels to family and friends.', icon: Users },
              { name: 'Rural & Local Commerce', desc: 'Local producers, Haat vendors, and village kirana retailers expanding their customer reach.', icon: Store },
              { name: 'Logistics Partners', desc: 'Professional transport operators moving higher volume shipments across district corridors.', icon: Truck },
              { name: 'Travelling Partners', desc: 'Daily commuters, bike owners, autos, and buses monetizing spare travel capacity.', icon: Compass },
              { name: 'Village Agents', desc: 'Local village shopkeepers and representatives providing safe parcel drop and collection points.', icon: Building2 },
              { name: 'Business Customers', desc: 'Merchants, farm-input suppliers, and SMEs requiring dependable rural shipment services.', icon: Boxes },
              { name: 'Existing Transport Network', desc: 'Utilizing India\'s active rural buses, shared autos, bikes, and commuter routes efficiently.', icon: Globe },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs text-gray-900">{item.name}</h3>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. DRONE DELIVERY — PHASE 2 */}
      {/* ================================================== */}
      <section id="drone-delivery" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50/50 via-white to-primary-50/40 border-2 border-primary-300 shadow-xs space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge className="bg-amber-400 text-gray-950 font-black">
              PHASE 2 ROADMAP
            </Badge>
            <span className="text-xs font-mono font-bold text-gray-500">
              Payload: 1–2 KG Per Parcel
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              <DroneIcon className="w-6 h-6 text-primary-700" />
              <span>Drone Delivery — Phase 2</span>
            </h2>
            <p className="text-base font-bold text-primary-900 mt-1">
              &ldquo;Start small. Deliver what matters.&rdquo;
            </p>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>
              <strong>Phase 1</strong> focuses on building the LocalHaat commerce and logistics network using existing transport partners, travelling partners and village agents.
            </p>
            <p>
              <strong>Phase 2</strong> introduces drone delivery for eligible small parcels. Initial drone delivery will focus on parcels weighing <strong>1–2 KG per parcel</strong>, with an initial focus around <strong>1 KG</strong>.
            </p>
          </div>

          {/* Potential Examples */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Potential Phase 2 Small-Parcel Examples:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-gray-200 font-semibold flex items-center gap-2">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                <span>Medicine / Health Essentials</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-gray-200 font-semibold flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-primary-700" />
                <span>FMCG (Everyday packs)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-gray-200 font-semibold flex items-center gap-2">
                <Sprout className="w-3.5 h-3.5 text-amber-700" />
                <span>Agriculture Essentials</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-gray-200 font-semibold flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Small Electronics</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-gray-200 font-semibold flex items-center gap-2">
                <Home className="w-3.5 h-3.5 text-orange-600" />
                <span>Household Essentials</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-gray-200 font-semibold flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-purple-600" />
                <span>Other Lightweight Parcels</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 space-y-1">
            <strong>Important Disclaimer:</strong>
            <p>
              Drone eligibility will depend on product type, weight, dimensions, packaging, safety requirements, applicable regulations and operational conditions. LocalHaat does not make claims of guaranteed delivery times, specific flight distances, or fleet sizes.
            </p>
          </div>

          <div>
            <Link
              href="/drone-delivery"
              className="inline-flex items-center gap-2 text-xs font-bold text-primary-800 hover:text-primary-900"
            >
              <span>Explore the full Phase 2 Drone Roadmap & Eligibility Checker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 6. GET IN TOUCH / COMPANY SECTION */}
      {/* ================================================== */}
      <section id="contact" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 text-white space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
              GET IN TOUCH
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Interested in LocalHaat, logistics partnerships, village agent opportunities or business services?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              We welcome regional transporters, daily commuters, local shopkeepers, and businesses to connect with us.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/auth?role=logistics_partner"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors"
            >
              Become a Partner
            </Link>
            <Link
              href="/auth?role=village_agent"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors"
            >
              Become a Village Agent
            </Link>
            <Link
              href="/contact?subject=business"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors"
            >
              Business Enquiry
            </Link>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Official Website: <strong>localhaat.in</strong></span>
            </div>
            <div>
              Legal Company: <strong>InfraBlue Material Technologies Private Limited</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
