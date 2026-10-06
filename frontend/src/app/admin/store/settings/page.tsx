'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import {
  Settings,
  Save,
  RefreshCw,
  Store,
  DollarSign,
  Truck,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Building2,
  Clock,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    storeName: 'LocalHaat Rural Direct Store',
    storeTagline: 'Authentic Village Haat Commerce Delivered Direct',
    storeEmail: 'admin@localhaat.in',
    storePhone: '+91 9999900001',
    address: {
      street: 'Main Haat Central Facility, GT Road',
      city: 'Varanasi',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      pincode: '221001',
    },
    currency: 'INR',
    taxGstRate: 5,
    defaultDeliveryFee: 40,
    freeDeliveryThreshold: 499,
    lowStockThresholdDefault: 5,
    enableCod: true,
    enableOnlinePayment: true,
    storeStatus: 'OPEN',
    supportHours: 'Mon - Sun: 7:00 AM - 9:00 PM',
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getStoreSettings();
      if (res.success && res.settings) {
        setSettings({
          ...res.settings,
          address: {
            ...res.settings.address,
          },
        });
      }
    } catch (err: any) {
      console.error('Failed to load store settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.updateStoreSettings(settings);
      if (res.success) {
        setSuccessMsg('Store settings updated successfully in MongoDB');
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.message || 'Update failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Loading store configuration from MongoDB...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Company Configuration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Store Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure single-vendor store branding, tax rules, delivery thresholds, and payment switches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2 font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Store Identity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Store className="w-4 h-4 text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-900">1. Store Identity & Contact</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Store Name *</label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Tagline / Slogan</label>
              <input
                type="text"
                value={settings.storeTagline || ''}
                onChange={(e) => setSettings({ ...settings, storeTagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Email Address *</label>
              <input
                type="email"
                required
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Support Helpline *</label>
              <input
                type="text"
                required
                value={settings.storePhone}
                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Fulfillment & Warehouse Origin */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">2. Central Warehouse Facility</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">Street Address *</label>
              <input
                type="text"
                required
                value={settings.address.street}
                onChange={(e) =>
                  setSettings({ ...settings, address: { ...settings.address, street: e.target.value } })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">City / Town</label>
              <input
                type="text"
                value={settings.address.city}
                onChange={(e) =>
                  setSettings({ ...settings, address: { ...settings.address, city: e.target.value } })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={settings.address.district}
                onChange={(e) =>
                  setSettings({ ...settings, address: { ...settings.address, district: e.target.value } })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                value={settings.address.pincode}
                onChange={(e) =>
                  setSettings({ ...settings, address: { ...settings.address, pincode: e.target.value } })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Financial & Shipping Rules */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900">3. Taxation & Shipping Fee Parameters</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Currency</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tax / GST Rate (%)</label>
              <input
                type="number"
                value={settings.taxGstRate}
                onChange={(e) => setSettings({ ...settings, taxGstRate: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={settings.defaultDeliveryFee}
                onChange={(e) => setSettings({ ...settings, defaultDeliveryFee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Free Delivery Min (₹)</label>
              <input
                type="number"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Store Switches */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <h3 className="font-extrabold text-sm text-slate-900">4. Gateway Switches & Operational Status</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Cash On Delivery (COD)</span>
                <span className="text-[10px] text-slate-500">Allow customers to pay at door</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableCod}
                onChange={(e) => setSettings({ ...settings, enableCod: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Online / Razorpay</span>
                <span className="text-[10px] text-slate-500">Enable card/UPI gateway</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableOnlinePayment}
                onChange={(e) => setSettings({ ...settings, enableOnlinePayment: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border">
              <span className="font-bold text-slate-900 block mb-1">Store Status</span>
              <select
                value={settings.storeStatus}
                onChange={(e) => setSettings({ ...settings, storeStatus: e.target.value as any })}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs"
              >
                <option value="OPEN">OPEN (Accepting Orders)</option>
                <option value="MAINTENANCE">MAINTENANCE (Store Paused)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-2 text-xs"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Publish Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
