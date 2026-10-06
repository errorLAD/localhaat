'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { ParcelTable } from '../../../../components/ParcelTable';

export default function DisputedParcelsPage() {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-sm text-red-950">
              Customer & Transporter Disputes Resolution
            </div>
            <div className="text-xs text-red-800 mt-0.5">
              Review damage claims, transit loss reports, and approve compensation or refund disbursements.
            </div>
          </div>
        </div>
      </div>

      <ParcelTable
        title="Disputed Shipments Queue"
        subtitle="Parcels currently under active customer investigation or claims mediation"
      />
    </div>
  );
}
