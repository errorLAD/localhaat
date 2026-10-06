'use client';

import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
        <div className="border-b border-gray-200 pb-4">
          <span className="text-xs font-mono font-bold uppercase text-primary-800">DATA PRIVACY & SECURITY</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">Privacy Policy</h1>
          <p className="text-xs text-gray-500 mt-1">Operated by InfraBlue Material Technologies Private Limited • localhaat.in</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <strong>InfraBlue Material Technologies Private Limited</strong> operates the LocalHaat platform. We respect your privacy and are committed to protecting the personal data of customers, logistics partners, travelling commuters, and village agents.
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">1. Information We Collect</h2>
          <p>
            When registering, booking consignments, or joining our partner network, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Contact details: Full name, mobile phone number, email address, and delivery coordinates.</li>
            <li>Verification data: Government identification for logistics partners and village agents during KYC verification.</li>
            <li>Shipment records: Package dimensions, declared category, tracking numbers, and waypoint custody audit logs.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">2. How We Use Your Data</h2>
          <p>
            Data is strictly utilized to operate the LocalHaat logistics network: matching parcel shipments with travelling partners, communicating 4-digit verification PINs, processing settlements, and maintaining regulatory compliance. We do not sell your personal data to third-party advertising brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">3. Data Security & Cryptographic Handover Logs</h2>
          <p>
            All verification PINs (pickup OTP, hub handover code, and recipient delivery PIN) are encrypted. Transaction logs and GPS milestone markers are securely stored to ensure accountability across all rural custody transfers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-gray-900">4. Contacting Our Data Officer</h2>
          <p>
            To request data correction or deletion under applicable data protection laws of India, contact privacy@localhaat.in.
          </p>
        </section>
      </div>
    </div>
  );
}
