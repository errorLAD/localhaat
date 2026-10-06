'use client';

import React from 'react';
import Link from 'next/link';
import {
  Truck,
  Bike,
  ArrowRight,
  CheckCircle2,
  Clock,
  Wallet,
  MapPin,
  Sparkles,
  Users,
  Store,
} from 'lucide-react';

export default function PartnerSignupChoicePage() {
  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-gray-50 via-emerald-50/20 to-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Choose Your <span className="text-primary-700">Partner Model</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Whether you operate a commercial freight vehicle or simply commute between villages daily, LocalHaat has a high-earning model tailored for you.
          </p>
        </div>

        {/* 2 Big Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Professional Logistics Partner */}
          <div className="bg-white rounded-2xl border-2 border-emerald-600/30 shadow-md hover:shadow-xl hover:border-emerald-600 transition-all p-8 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Commercial Fleet
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Truck className="w-7 h-7" />
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
                For Vehicle Owners & Transporters
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                Professional Logistics Partner
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 mt-2 mb-6 leading-relaxed">
                Dedicated commercial transporters, buses, tractor trolleys, e-rickshaws, pickups (Tata Ace / Bolero Maxi), auto tempos, and fleet trucks running daily scheduled haat deliveries.
              </p>

              <div className="space-y-3 pt-2 border-t border-gray-100 text-xs text-gray-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>No Minimum Load Requirement:</strong> Zero minimum weight — carry everything from tiny 2-gram parcels & packets up to 1,000+ kg bulk freight and farm produce.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Scheduled Routes & Batching:</strong> Guaranteed multi-parcel batch manifests and fixed trip assignments.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Driver Fleet Support:</strong> Register yourself or assign authorized drivers to your vehicles.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Weekly Direct Payouts:</strong> Transparent per-km and per-parcel freight earnings straight to bank account.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link
                href="/partner/signup/logistics"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold text-sm shadow-sm transition-all group-hover:gap-3"
              >
                <span>Onboard as Professional Partner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-center text-[11px] text-gray-500 mt-2">
                Requires Driving License & Vehicle RC
              </div>
            </div>
          </div>

          {/* Card 2: Travelling Partner / Commuter */}
          <div className="bg-white rounded-2xl border-2 border-amber-500/40 shadow-md hover:shadow-xl hover:border-amber-500 transition-all p-8 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Travels That Way Anyway
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Bike className="w-7 h-7" />
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold mb-2">
                Commuters, Students & Daily Travelers
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                Travelling Partner / Commuter
              </h2>

              <p className="text-xs sm:text-sm text-gray-600 mt-2 mb-6 leading-relaxed">
                Turn your routine journeys into earnings. If you travel between villages, towns or haats via bike, bus, train, auto or bicycle, carry a small parcel along your existing route!
              </p>

              <div className="space-y-3 pt-2 border-t border-gray-100 text-xs text-gray-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero Extra Trip Overhead:</strong> Earn without making special delivery round trips.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>No Vehicle RC Required for Transit:</strong> Bus, train, shared auto, bicycle & walking commuters need NO vehicle papers!
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>No Minimum Weight (Up to 5 kg):</strong> Carry compact items from 2-gram documents and packets to 5 kg parcels easily in your personal bag or backpack.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Instant UPI Payouts:</strong> Get paid per parcel directly to your GooglePay / PhonePe / Paytm UPI.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link
                href="/partner/signup/travelling"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all group-hover:gap-3"
              >
                <span>Onboard as Travelling Partner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-center text-[11px] text-gray-500 mt-2">
                Fast KYC with Aadhaar • Start Earning on Daily Commute
              </div>
            </div>
          </div>
        </div>

        {/* Footer Support Navigation */}
        <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">
                Want to operate a local village collection hub?
              </div>
              <div className="text-[11px] text-gray-500">
                Register as a Village Agent Drop Hub and earn ₹25–₹30 commission per parcel
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/agent/signup"
              className="px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
            >
              Village Agent Signup →
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors"
            >
              Partner Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
