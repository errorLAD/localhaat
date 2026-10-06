'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import {
  Building2,
  Lock,
  Phone,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Wheat,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export default function BusinessLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError('Please enter your registered business mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(phone.trim(), password, 'business');
      if (user.role !== 'business' && user.role !== 'admin') {
        setError('Access denied: This login is exclusively for authorized Business Logistics accounts.');
        return;
      }
      router.push('/business');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials or inactive business account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 mb-2">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            B2B Logistics Portal
          </h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Log in with your enterprise credentials to manage freight shipments, warehouse pickups, and tracking.
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Admin-Provisioned Access Only</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Public business registration is disabled. Business logistics accounts are created and activated strictly by LocalHaat platform administration.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                Registered Mobile Number
              </label>
              <Input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl h-11"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                Password / Temporary Activation Key
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl h-11"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm shadow-indigo-100 flex items-center justify-center gap-2 mt-2 transition"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Logistics Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials for Review */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[11px] text-gray-500 font-medium text-center mb-2">
              Need access or forgot your password?
            </p>
            <p className="text-[11px] text-center text-gray-400">
              Please contact the platform administrator to provision or reset your business account.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition inline-flex items-center gap-1"
          >
            ← Return to LocalHaat Home
          </Link>
        </div>
      </div>
    </div>
  );
}
