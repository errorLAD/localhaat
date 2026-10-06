'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { Sliders, Save, RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';

export default function AgentSettingsPage() {
  const [settings, setSettings] = useState<any>({
    commissionReceivedPackage: 15,
    commissionDeliveredPackage: 25,
    cashCollectionBonusRate: 2,
    maxActiveParcelsPerAgent: 50,
    maxCashInHandAllowed: 10000,
    overdueStorageHours: 48,
    minPayoutThreshold: 500,
    autoVerifyThresholdRating: 4.8,
    smsAlertsEnabled: true,
    emailAlertsEnabled: true,
    autoAssignEnabled: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAgentSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Error fetching agent settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setFeedback(null);
      const res = await api.updateAdminAgentSettings(settings);
      if (res.success) {
        setFeedback('Operational parameters saved to MongoDB successfully!');
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: any) {
      setFeedback(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">System Parameters</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Agent Operations & Policy Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure default compensation tariffs, parcel holding capacity, cash deposit caps, and auto-dispatch rules.
          </p>
        </div>

        <Button onClick={fetchSettings} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Reload
        </Button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          {feedback}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Commission Tariffs */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-gray-900 border-b pb-2">
            Default Agent Compensation Tariffs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Hub Intake Commission (₹):</label>
              <Input
                type="number"
                value={settings.commissionReceivedPackage}
                onChange={(e) => setSettings({ ...settings, commissionReceivedPackage: Number(e.target.value) })}
                className="text-xs rounded-xl"
                required
              />
              <span className="text-[10px] text-gray-400">Credited when package arrives at hub</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Doorstep Delivery Commission (₹):</label>
              <Input
                type="number"
                value={settings.commissionDeliveredPackage}
                onChange={(e) => setSettings({ ...settings, commissionDeliveredPackage: Number(e.target.value) })}
                className="text-xs rounded-xl"
                required
              />
              <span className="text-[10px] text-gray-400">Credited upon final customer OTP verification</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">COD Cash Handling Incentive (%):</label>
              <Input
                type="number"
                value={settings.cashCollectionBonusRate}
                onChange={(e) => setSettings({ ...settings, cashCollectionBonusRate: Number(e.target.value) })}
                className="text-xs rounded-xl"
                required
              />
              <span className="text-[10px] text-gray-400">Bonus on timely COD reconciliation</span>
            </div>
          </div>
        </div>

        {/* Operational Limits & Thresholds */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-gray-900 border-b pb-2">
            Governance Thresholds & Caps
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Max Active Parcels per Hub:</label>
              <Input
                type="number"
                value={settings.maxActiveParcelsPerAgent}
                onChange={(e) => setSettings({ ...settings, maxActiveParcelsPerAgent: Number(e.target.value) })}
                className="text-xs rounded-xl"
                required
              />
              <span className="text-[10px] text-gray-400">Cap before auto-dispatch pauses</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Max COD Cash in Hand (₹):</label>
              <Input
                type="number"
                value={settings.maxCashInHandAllowed}
                onChange={(e) => setSettings({ ...settings, maxCashInHandAllowed: Number(e.target.value) })}
                className="text-xs rounded-xl"
                required
              />
              <span className="text-[10px] text-gray-400">Forces deposit to bank account</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Overdue Hub Holding Alert (Hours):</label>
              <Input
                type="number"
                value={settings.overdueStorageHours}
                onChange={(e) => setSettings({ ...settings, overdueStorageHours: Number(e.target.value) })}
                className="text-xs rounded-xl"
                required
              />
              <span className="text-[10px] text-gray-400">Triggers overdue flag on dashboard</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Minimum Payout Threshold (₹):</label>
              <Input
                type="number"
                value={settings.minPayoutThreshold}
                onChange={(e) => setSettings({ ...settings, minPayoutThreshold: Number(e.target.value) })}
                className="text-xs rounded-xl"
                required
              />
              <span className="text-[10px] text-gray-400">Minimum withdrawal allowed</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-700">Auto-Accreditation Star Rating:</label>
              <Input
                type="number"
                step="0.1"
                value={settings.autoVerifyThresholdRating}
                onChange={(e) => setSettings({ ...settings, autoVerifyThresholdRating: Number(e.target.value) })}
                className="text-xs rounded-xl"
                required
              />
              <span className="text-[10px] text-gray-400">Eligible for automatic performance bonus</span>
            </div>
          </div>
        </div>

        {/* System Automation Toggles */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <h2 className="text-sm font-extrabold text-gray-900 border-b pb-2">
            Automation & Notification Channels
          </h2>

          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsAlertsEnabled}
                onChange={(e) => setSettings({ ...settings, smsAlertsEnabled: e.target.checked })}
                className="rounded text-emerald-600"
              />
              <span className="font-semibold text-gray-800">Send SMS OTP & Delivery alerts to customers and agents</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailAlertsEnabled}
                onChange={(e) => setSettings({ ...settings, emailAlertsEnabled: e.target.checked })}
                className="rounded text-emerald-600"
              />
              <span className="font-semibold text-gray-800">Email daily reconciliation statements to agents</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoAssignEnabled}
                onChange={(e) => setSettings({ ...settings, autoAssignEnabled: e.target.checked })}
                className="rounded text-emerald-600"
              />
              <span className="font-semibold text-gray-800">Automatically route incoming village corridor parcels to nearest online hub</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Persisting Parameters...' : 'Save Operations Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
