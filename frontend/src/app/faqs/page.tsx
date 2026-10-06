'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Package, Truck, Store, Building2 } from 'lucide-react';

export default function FaqsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      category: 'General & Customers',
      q: 'What is LocalHaat?',
      a: 'LocalHaat is a digital commerce and logistics platform built for rural India, operated by InfraBlue Material Technologies Private Limited. It connects rural customers, local Haat vendors, verified logistics partners, travelling commuters, and village agents through a unified network.',
    },
    {
      category: 'Parcels & Shipping',
      q: 'Can anyone send a parcel on LocalHaat?',
      a: 'Yes. Individuals, local store owners, and businesses can send eligible lightweight everyday parcels across villages and towns. Booking a parcel provides an instant tracking ID and pickup verification code.',
    },
    {
      category: 'Security & Verification',
      q: 'How does LocalHaat ensure packages are not lost or stolen?',
      a: 'LocalHaat uses a 3-tier digital custody model: a 4-digit pickup code when handing over to the commuter, a 4-digit handover code at village hubs, and a 4-digit customer delivery PIN for final handover.',
    },
    {
      category: 'Travelling Partners',
      q: 'How do daily commuters earn money with LocalHaat?',
      a: 'If you travel regularly between villages and markets by bike, auto, shared van, or bus, you can register as a Travelling Partner. You can accept parcel requests travelling along your existing route and earn money upon verified delivery.',
    },
    {
      category: 'Village Agents',
      q: 'What is the role of a Village Agent?',
      a: 'Village Agents are local shopkeepers or community representatives who serve as verified local drop and collection hubs. They receive parcels, store them safely, and hand them over to recipients upon PIN confirmation.',
    },
    {
      category: 'Drone Delivery',
      q: 'When will drone delivery be available?',
      a: 'Drone delivery is part of Phase 2 of the LocalHaat roadmap. Phase 1 focuses on building the ground logistics and village agent network. Phase 2 introduces drone delivery for eligible small parcels weighing 1–2 KG per parcel (initial focus ≈ 1 KG), subject to DGCA Green Zone permissions and weather conditions.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            KNOWLEDGE BASE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Common questions about LocalHaat commerce, parcel delivery, partner earnings, and village hubs.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 hover:text-primary-700"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-emerald-700 block">
                      {faq.category}
                    </span>
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-primary-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
