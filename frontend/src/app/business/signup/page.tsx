'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Wheat,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function BusinessSignupPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Warning Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 shadow-sm border border-amber-200">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Public Registration Disabled
          </h1>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            LocalHaat is <strong>NOT a multi-vendor marketplace</strong>. Store commerce is operated centrally by LocalHaat.
          </p>
        </div>

        {/* Informative Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-sm text-left space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600">
              <strong className="text-gray-900 block font-semibold mb-0.5">B2B Logistics Service</strong>
              The <code className="bg-gray-100 px-1 py-0.5 rounded text-indigo-700 font-mono">/business</code> portal is exclusively for contracted business clients (factories, warehouses, distributors) utilizing our freight and parcel logistics network.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600">
              <strong className="text-gray-900 block font-semibold mb-0.5">Admin-Provisioned Accounts Only</strong>
              Only the platform administrator can create, activate, or reset business accounts from the central Admin Panel.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-2.5">
            <Link href="/business/login" className="block w-full">
              <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2">
                <span>Sign In with Business Credentials</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/" className="block w-full">
              <Button variant="outline" className="w-full h-11 rounded-xl text-gray-700 font-semibold">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Need an enterprise account? Contact your LocalHaat Account Executive.
        </p>
      </div>
    </div>
  );
}
