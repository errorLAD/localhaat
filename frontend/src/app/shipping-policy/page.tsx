'use client';

import React from 'react';
import Link from 'next/link';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <div className="border-b border-gray-200 pb-4">
          <span className="text-xs font-mono font-bold uppercase text-primary-800">LOGISTICS POLICIES</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Shipping & Delivery Policy</h1>
          <p className="text-xs text-gray-500 mt-1">Operated by InfraBlue Material Technologies Private Limited • localhaat.in</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">1. Multimodal Ground Shipping (Phase 1)</h2>
          <p>
            LocalHaat utilizes multimodal rural transport—including verified commuters, bike owners, autos, shared vans, and regional logistics fleets—to move shipments. Delivery timeframes depend on commuter route schedules, destination distance, and weather conditions. LocalHaat does not promise unsupported or guaranteed delivery time windows.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">2. Village Hubs & Drop Point Custody</h2>
          <p>
            Shipments routed through our <strong>Village Agent Network</strong> are held securely at verified village stores or local hub points. Recipients receive an SMS or notification with a 4-digit PIN upon arrival. Parcels must be collected within 5 business days from arrival.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">3. Drone Delivery Specification (Phase 2)</h2>
          <p>
            Drone delivery is introduced strictly in <strong>Phase 2</strong> as an auxiliary service for eligible lightweight parcels. Drone delivery operates with a parcel capacity of <strong>1–2 KG per parcel</strong> (initial focus ≈ 1 KG). All aerial dispatches are subject to DGCA Green Zone permissions, weather, and daylight operating conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">4. Tracking Your Consignment</h2>
          <p>
            You can monitor real-time consignment progress and view current custody milestones anytime using the <Link href="/track" className="text-primary-700 underline font-bold">LocalHaat Consignment Tracker</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
