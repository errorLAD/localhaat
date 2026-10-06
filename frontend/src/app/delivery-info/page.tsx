'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Truck, Store, MapPin, ArrowRight } from 'lucide-react';

export default function DeliveryInfoPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 pb-20 pt-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            LOGISTICS INFORMATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
            Delivery Information
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            How LocalHaat delivers marketplace products and peer-to-peer parcels across rural communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Village Hub & Agent Collection</h3>
            <p className="text-gray-600 leading-relaxed">
              Consignments delivered to a local Village Agent point are held securely in the agent&apos;s verified store. Recipients can collect their parcel anytime during store hours by showing the 4-digit PIN.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Travelling Partner Transit</h3>
            <p className="text-gray-600 leading-relaxed">
              Parcels are transported along daily travel corridors by verified bike, auto, bus, and car commuters heading in that exact direction, reducing transit friction across unpaved roads and canals.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-3 text-xs">
          <h3 className="font-bold text-sm text-gray-900">Tracking Your Shipment</h3>
          <p className="text-gray-600 leading-relaxed">
            Every shipment created on LocalHaat receives a unique tracking number (e.g. <code>LH-TRK-904128</code>). Consignors and recipients can view real-time waypoint progression, custodian identity, and verified handover timestamps.
          </p>
          <div className="pt-2">
            <Link
              href="/track"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs"
            >
              <span>Track Parcel Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
