'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

export default function ProhibitedItemsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <div className="border-b border-gray-200 pb-4">
          <span className="text-xs font-mono font-bold uppercase text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
            SAFETY & COMPLIANCE
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Prohibited & Restricted Items</h1>
          <p className="text-xs text-gray-500 mt-1">LocalHaat Guidelines • InfraBlue Material Technologies Private Limited</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Strict Transport Standards</span>
          </div>
          <p>
            To protect our travelling partners, village agents, and communities, the following goods are strictly prohibited across both ground transport and Phase 2 drone delivery.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">Strictly Prohibited Goods</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-gray-900">Explosives & Flammables</strong>
                <span className="text-gray-500">Fireworks, lighter fluid, gasoline, compressed gas cylinders.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-gray-900">Corrosive Chemicals & Toxins</strong>
                <span className="text-gray-500">Acids, industrial solvents, unsealed hazardous pesticides.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-gray-900">Illegal & Restricted Substances</strong>
                <span className="text-gray-500">Narcotics, contraband goods, or unregulated pharmaceuticals.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-gray-200 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-gray-900">Weapons & Sharp Contraband</strong>
                <span className="text-gray-500">Firearms, ammunition, untampered blades, and prohibited military equipment.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">Phase 2 Drone Specific Exclusions</h2>
          <p>
            Drones in Phase 2 operate exclusively for <strong>small parcels (1–2 KG per parcel, ≈ 1 KG focus)</strong>. In addition to general restrictions, loose liquids, heavy hardware, fragile glass without certified shock buffering, and oversized cartons are ineligible for aerial transport.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">Questions on Packaging Eligibility?</h2>
          <p>
            If you are uncertain whether your shipment meets packaging guidelines, visit our <Link href="/safety" className="text-primary-700 underline font-bold">Safety Guidelines</Link> or contact <Link href="/contact" className="text-primary-700 underline font-bold">Support</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
