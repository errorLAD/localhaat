'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <div className="border-b border-gray-200 pb-4">
          <span className="text-xs font-mono font-bold uppercase text-primary-800">LEGAL DOCUMENTATION</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Terms & Conditions</h1>
          <p className="text-xs text-gray-500 mt-1">Effective Date: October 2026 • localhaat.in</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <strong>Operating Entity Disclosure:</strong> LocalHaat is a proprietary digital brand and platform operated by <strong>InfraBlue Material Technologies Private Limited</strong>. By accessing localhaat.in, booking parcels, participating as a logistics partner, travelling partner, or village agent, you agree to these Terms.
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">1. Overview of Platform Services</h2>
          <p>
            LocalHaat provides a rural commerce and inter-village logistics platform connecting customers, marketplace merchants, logistics partners, travelling partners, and village agents. LocalHaat operates as a technological facilitator matching supply and demand for everyday goods and eligible parcel movement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">2. Custody Verification & Verification Codes</h2>
          <p>
            All shipments on LocalHaat require digital custody verification via multi-stage PIN codes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Pickup Code (First-Mile):</strong> Generated at the time of consignor dispatch and validated by the transporter.</li>
            <li><strong>Hub Handover Code (Mid-Mile):</strong> Validated when transferring custody to a village agent or intermediate storage point.</li>
            <li><strong>Customer Delivery PIN (Last-Mile):</strong> Provided to the verified recipient. No delivery is marked complete without this confirmation.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">3. Partner & Agent Obligations</h2>
          <p>
            Logistics partners, travelling commuters, and village agents operate as independent service participants. They agree to handle packages with due care, refrain from opening sealed parcels, verify codes at each custody transition, and adhere to applicable Indian traffic, motor vehicle, and civil laws.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">4. Prohibited Items & Safety</h2>
          <p>
            Users are strictly prohibited from dispatching hazardous materials, corrosive liquids, weapons, illicit substances, perishable items violating transport hygiene, or any items forbidden by Indian law. InfraBlue Material Technologies Private Limited reserves the right to report non-compliant shipments to authorities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">5. Limitation of Liability</h2>
          <p>
            InfraBlue Material Technologies Private Limited provides the platform on an &ldquo;as-available&rdquo; basis. Real-world transit schedules depend on road conditions, weather, and verified partner availability. We do not make unsupported claims of guaranteed transit times or absolute delivery speed.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">6. Contact & Legal Enquiries</h2>
          <p>
            For legal inquiries or clarifications regarding these Terms, contact our legal team at legal@localhaat.in or visit <Link href="/contact" className="text-primary-700 underline font-bold">Contact Us</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
