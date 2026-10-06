'use client';

import React, { useState } from 'react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { api } from '../lib/api';
import { ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

interface VerificationCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parcelId: string;
  trackingNumber: string;
  stage: 'pickup' | 'handover' | 'delivery';
  onSuccess: (data: any) => void;
  expectedCodeHint?: string; // For testing convenience
}

export const VerificationCodeModal: React.FC<VerificationCodeModalProps> = ({
  open,
  onOpenChange,
  parcelId,
  trackingNumber,
  stage,
  onSuccess,
  expectedCodeHint,
}) => {
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStageMeta = () => {
    switch (stage) {
      case 'pickup':
        return {
          title: 'Verify First-Mile Pickup',
          desc: 'Enter the 4-digit Pickup Code provided by the Seller/Artisan to confirm custody handover into your vehicle.',
          placeholder: 'Enter 4-digit Pickup Code (e.g. 8412)',
          codeLabel: 'Pickup Code',
          submitText: 'Verify & Take Custody',
        };
      case 'handover':
        return {
          title: 'Verify Hub Handover',
          desc: 'Village Agent enters the 4-digit Handover Code provided by the arriving Logistics Partner, or partner verifies agent code.',
          placeholder: 'Enter 4-digit Handover Code (e.g. 5729)',
          codeLabel: 'Handover Code',
          submitText: 'Verify & Intake at Hub',
        };
      case 'delivery':
        return {
          title: 'Verify Customer Doorstep Delivery',
          desc: 'Village Agent enters the 4-digit Delivery PIN provided by the Customer upon receiving the package.',
          placeholder: 'Enter 4-digit Delivery PIN (e.g. 4826)',
          codeLabel: 'Customer Delivery PIN',
          submitText: 'Verify & Mark Delivered',
        };
    }
  };

  const meta = getStageMeta();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res;
      if (stage === 'pickup') {
        res = await api.verifyPickup(parcelId, code.trim(), locationName || undefined, notes || undefined);
      } else if (stage === 'handover') {
        res = await api.verifyHandover(parcelId, code.trim(), locationName || undefined, notes || undefined);
      } else {
        res = await api.verifyDelivery(parcelId, code.trim(), locationName || undefined, notes || undefined);
      }

      setCode('');
      setNotes('');
      onOpenChange(false);
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillExpected = () => {
    if (expectedCodeHint) {
      setCode(expectedCodeHint);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleVerify}>
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center mb-2">
            <KeyRound className="w-5 h-5" />
          </div>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription>{meta.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-gray-500">Tracking Reference:</span>{' '}
            <span className="font-mono font-bold text-gray-900">{trackingNumber}</span>
          </div>

          {expectedCodeHint && (
            <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs">
              <div>
                <span className="font-semibold">Demo Hint:</span> The active code is{' '}
                <span className="font-mono font-bold">{expectedCodeHint}</span>
              </div>
              <button
                type="button"
                onClick={handleFillExpected}
                className="px-2 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
              >
                Auto-Fill
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {meta.codeLabel} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder={meta.placeholder}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 4));
                setError(null);
              }}
              className="text-center font-mono text-lg font-bold tracking-widest uppercase h-12"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Location Name (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Sonapur Main Haat or Customer Residence"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Verification Notes (Optional)
            </label>
            <Input
              type="text"
              placeholder="Condition intact, seal checked"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !code.trim()}>
            {loading ? 'Verifying...' : meta.submitText}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
