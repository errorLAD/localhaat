'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { Ban, RefreshCw, CheckCircle, ShieldAlert, ShieldCheck, Eye } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function BlockedAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchBlocked = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAgents({ status: 'BLOCKED', limit: '30' });
      if (res.success) {
        setAgents(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  const handleUnblock = async (agentId: string) => {
    try {
      setActionLoading(true);
      const res = await api.updateAdminAgentStatus(agentId, 'UNBLOCK');
      if (res.success) {
        setMessage('Agent successfully unblocked and returned to operational standing.');
        setTimeout(() => setMessage(null), 3000);
        fetchBlocked();
      }
    } catch (err: any) {
      setMessage(err.message || 'Failed to unblock agent');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Access Blocklist</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Blocked Village Agents</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Severely restricted accounts with revoked portal access due to financial discrepancies or fraud risk.
          </p>
        </div>

        <Button onClick={fetchBlocked} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1.5">
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
          <div className="text-center py-12 text-xs text-gray-500">Querying blocked accounts...</div>
        ) : agents.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">Zero Blocked Accounts</h3>
            <p className="text-xs text-gray-500">No village agents are currently on the administrative blocklist.</p>
          </div>
        ) : (
          agents.map((agent) => (
            <div key={agent._id} className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                    <Ban className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-gray-900 text-sm">{agent.userId?.name}</h3>
                      <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px] font-mono">
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
                    onClick={() => handleUnblock(agent._id)}
                    disabled={actionLoading}
                    className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Unblock Account
                  </Button>
                </div>
              </div>

              {/* Blocked Reason */}
              <div className="bg-rose-50/70 border border-rose-200/60 rounded-xl p-3.5 space-y-1 text-xs">
                <span className="font-bold text-rose-950 block">Incident Reason:</span>
                <p className="text-rose-900">{agent.blockedReason || 'Platform supervisor placed administrative block.'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
