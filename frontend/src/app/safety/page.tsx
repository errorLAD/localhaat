'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Lock, Users, Truck } from 'lucide-react';

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <div className="border-b border-gray-200 pb-4">
          <span className="text-xs font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            SECURITY PROTOCOLS
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Safety Guidelines</h1>
          <p className="text-xs text-gray-500 mt-1">Multi-stage Digital Handover Verification • InfraBlue Material Technologies Private Limited</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-gray-900">Multi-Stage Custody Verification</h2>
          <p>
            LocalHaat eliminates parcel loss and fraud across inter-village transport through a 3-tier verification architecture:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">1. First-Mile</span>
              <strong className="block text-gray-900">4-Digit Pickup Code</strong>
              <p className="text-gray-500">The consignor provides this OTP only when handing over the package to the matched transporter.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">2. Mid-Mile</span>
              <strong className="block text-gray-900">Hub Handover Code</strong>
              <p className="text-gray-500">Validated when depositing the parcel at a local village hub or intermediate transit store.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">3. Last-Mile</span>
              <strong className="block text-gray-900">Customer Delivery PIN</strong>
              <p className="text-gray-500">Sent only to the verified recipient. Handover is impossible without this final digital confirmation.</p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">Partner & Transporter Safety Rules</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Never inspect or compromise sealed customer consignments.</li>
            <li>Adhere to speed limits and traffic safety guidelines across all village and district roads.</li>
            <li>Keep shipments sheltered from rain and extreme heat in weatherproof containers or bags.</li>
            <li>Promptly notify the LocalHaat support team in case of vehicle breakdown or road blockage.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">Emergency & Incident Support</h2>
          <p>
            If a package is damaged or an unexpected incident occurs, contact <Link href="/contact" className="text-primary-700 underline font-bold">LocalHaat Support</Link> immediately for real-time claim resolution.
          </p>
        </section>
      </div>
    </div>
  );
}
