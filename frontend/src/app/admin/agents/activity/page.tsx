'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { History, ShieldCheck, RefreshCw, Clock, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function AgentActivityLogsPage() {
  const [activeTab, setActiveTab] = useState<'AGENT' | 'ADMIN'>('AGENT');
  const [agentLogs, setAgentLogs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      if (activeTab === 'AGENT') {
        const res = await api.getAdminAgentActivityLogs({ limit: '30' });
        if (res.success) setAgentLogs(res.data || []);
      } else {
        const res = await api.getAdminAuditLogs({ limit: '30' });
        if (res.success) setAuditLogs(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Governance & Telemetry</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Agent Activity & Audit Trails</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Immutable log history of agent field actions, deliveries, logins, and platform administrative decisions.
          </p>
        </div>

        <Button onClick={fetchLogs} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Log
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('AGENT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'AGENT'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Agent Field Operational Stream
        </button>

        <button
          onClick={() => setActiveTab('ADMIN')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'ADMIN'
              ? 'bg-purple-800 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Immutable Admin Audit Trail
        </button>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500">Querying telemetry records...</div>
        ) : activeTab === 'AGENT' ? (
          agentLogs.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">No agent activities logged yet.</div>
          ) : (
            <div className="space-y-4">
              {agentLogs.map((log) => (
                <div key={log._id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900">{log.title}</span>
                        <Badge className="bg-emerald-50 text-emerald-800 border-emerald-100 font-mono text-[9px]">
                          {log.activityType}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {log.description && <p className="text-gray-600 text-[11px] mt-0.5">{log.description}</p>}
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                      <span>Agent: <strong className="text-gray-700">{log.agentId?.hubCode || 'Agent Hub'}</strong></span>
                      {log.parcelId && <span>• Parcel: <strong className="font-mono text-purple-700">{log.parcelId?.parcelTrackingNumber}</strong></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-400">No administrative audit entries found.</div>
        ) : (
          <div className="space-y-4">
            {auditLogs.map((audit) => (
              <div key={audit._id} className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-50/40 border border-purple-100 text-xs">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-purple-950 font-mono">{audit.action}</span>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[9px]">
                        Target: {audit.targetType}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(audit.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {audit.reason && (
                    <div className="text-gray-700 text-[11px] mt-1 bg-white/80 p-2 rounded-lg border border-purple-100/50">
                      <strong>Reason:</strong> {audit.reason}
                    </div>
                  )}
                  <div className="mt-1 text-[10px] text-gray-500 font-mono">
                    Admin Operator: <strong className="text-purple-900">{audit.adminName || audit.adminId?.name || 'Platform Admin'}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
