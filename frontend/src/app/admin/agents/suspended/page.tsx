'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { AlertTriangle, Clock, MapPin, RefreshCw, CheckCircle, ExternalLink, ShieldCheck, Eye } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function SuspendedAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSuspended = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAgents({ status: 'SUSPENDED', limit: '30' });
      if (res.success) {
        setAgents(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuspended();
  }, []);

  const handleUnsuspend = async (agentId: string) => {
    try {
      setActionLoading(true);
      const res = await api.updateAdminAgentStatus(agentId, 'UNSUSPEND');
      if (res.success) {
        setMessage('Agent successfully unsuspended and restored to ACTIVE status.');
        setTimeout(() => setMessage(null), 3000);
        fetchSuspended();
      }
    } catch (err: any) {
      setMessage(err.message || 'Failed to unsuspend agent');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Disciplinary Holds</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Suspended Village Agents</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Agents restricted temporarily due to customer delivery complaints, unverified handovers, or investigation.
          </p>
        </div>

        <Button onClick={fetchSuspended} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500">Retrieving disciplinary records...</div>
        ) : agents.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">No Suspended Agents</h3>
            <p className="text-xs text-gray-500">All village agents are operating cleanly with zero active disciplinary suspensions.</p>
          </div>
        ) : (
          agents.map((agent) => (
            <div key={agent._id} className="bg-white rounded-2xl border border-amber-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-gray-900 text-sm">{agent.userId?.name}</h3>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-mono">
                        {agent.hubCode}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">{agent.villageName} • {agent.userId?.phone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/agents/${agent._id}`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black tracking-wider text-xs px-3.5 shadow-sm flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> DETAIL
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => handleUnsuspend(agent._id)}
                    disabled={actionLoading}
                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Lift Suspension
                  </Button>
                </div>
              </div>

              {/* Suspension Reason & Term */}
              <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-amber-950 font-bold">
                  <span>Suspension Justification:</span>
                  <span className="font-mono text-[11px] text-amber-800">
                    Duration: {agent.suspensionDuration || 'Indefinite'}
                    {agent.suspensionEndDate && ` (Ends: ${new Date(agent.suspensionEndDate).toLocaleDateString()})`}
                  </span>
                </div>
                <p className="text-amber-900">{agent.suspensionReason || 'Administrative hold applied by platform supervisor.'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
