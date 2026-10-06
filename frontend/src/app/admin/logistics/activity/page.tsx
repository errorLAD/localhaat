'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  History,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Truck,
  User,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

export default function LogisticsActivityPage() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminLogisticsActivity();
      if (res.success) {
        setActivities(res.activities || []);
        setAuditLogs(res.auditLogs || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div>
          <Link
            href="/admin/logistics"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Logistics Control Center
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Logistics Activity Trail & Admin Audit Stream
            </h1>
            <Badge className="bg-sky-100 text-sky-900 border-sky-300 font-bold text-xs">
              IMMUTABLE AUDIT LOGS
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Real-time activity logs recording partner verification, status transitions, trip starts, and operator dispatch decisions.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchActivity} className="text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stream
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Operational Activity Stream */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b pb-2">
            <Truck className="w-4 h-4 text-sky-600" />
            Operational Fleet Events ({activities.length})
          </h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No fleet events recorded yet.</p>
            ) : (
              activities.map((act) => (
                <div key={act._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-900">{act.title}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(act.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-gray-600">{act.description}</p>
                  <div className="text-[10px] text-sky-700 font-bold pt-1">
                    Actor: {act.actorType} {act.partnerId?.businessName && `• ${act.partnerId.businessName}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Admin Audit Trail */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 border-b pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Admin Operator Audit Logs ({auditLogs.length})
          </h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No admin audit logs recorded yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log._id} className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-sky-900">{log.action}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium">{log.details}</p>
                  <div className="text-[10px] text-gray-500 font-semibold pt-1">
                    Operator: <span className="text-gray-900">{log.adminName}</span> ({log.adminPhone})
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
