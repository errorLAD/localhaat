'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Mail, Phone, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            HELP CENTER
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
            Help & Support
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Dedicated assistance for LocalHaat customers, logistics partners, travelling commuters, and village agents.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Email Support</h3>
            <p className="text-gray-500">Response within 24 hours.</p>
            <div className="font-mono text-primary-800 font-bold pt-1">support@localhaat.in</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Handover Issues</h3>
            <p className="text-gray-500">Assistance with OTP codes or PIN validation.</p>
            <Link href="/contact" className="text-primary-700 font-bold inline-flex items-center gap-1 pt-1">
              <span>Report Dispute</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Knowledge Base</h3>
            <p className="text-gray-500">Guides, FAQs, and step-by-step procedures.</p>
            <Link href="/faqs" className="text-primary-700 font-bold inline-flex items-center gap-1 pt-1">
              <span>Browse FAQs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3 text-xs">
          <h3 className="font-bold text-sm text-white">InfraBlue Material Technologies Private Limited</h3>
          <p className="text-slate-300 leading-relaxed max-w-2xl">
            LocalHaat is operated by InfraBlue Material Technologies Private Limited. For institutional partnerships, merchant contracts, or regulatory coordination, please reach our team through our official <Link href="/contact" className="text-emerald-400 underline font-bold">Contact Portal</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
