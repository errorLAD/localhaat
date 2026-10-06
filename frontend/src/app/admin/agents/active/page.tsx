'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { CheckCircle2, MapPin, Phone, Star, Package, DollarSign, ExternalLink, RefreshCw, Eye } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function ActiveAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActive = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAgents({ status: 'ACTIVE', limit: '30' });
      if (res.success) {
        setAgents(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Operational Fleet</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Active Village Agents</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Agents currently in good standing, eligible for delivery dispatch and customer pickup at village hubs.
          </p>
        </div>

        <Button onClick={fetchActive} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Fleet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-xs text-gray-500">Loading active agent roster...</div>
        ) : agents.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-xs text-gray-500">No active agents found.</div>
        ) : (
          agents.map((agent) => (
            <div key={agent._id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{agent.userId?.name}</h3>
                  <span className="text-xs text-gray-500 font-mono">{agent.userId?.phone}</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-mono text-[10px]">
                  {agent.hubCode}
                </Badge>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl space-y-1 text-xs">
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{agent.villageName}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  District: {agent.hubAddress?.district}, {agent.hubAddress?.state}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-emerald-50/50 p-2 rounded-lg">
                  <span className="text-[9px] text-emerald-800 uppercase font-bold block">Rating</span>
                  <span className="font-extrabold text-emerald-950">★ {agent.rating || 4.9}</span>
                </div>
                <div className="bg-teal-50/50 p-2 rounded-lg">
                  <span className="text-[9px] text-teal-800 uppercase font-bold block">Delivered</span>
                  <span className="font-extrabold text-teal-950">{agent.totalDelivered || 0}</span>
                </div>
                <div className="bg-indigo-50/50 p-2 rounded-lg">
                  <span className="text-[9px] text-indigo-800 uppercase font-bold block">Cash In Hand</span>
                  <span className="font-extrabold text-indigo-950">₹{agent.cashInHand || 0}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-500">
                  Rate: ₹{agent.commissionPerDelivery}/del
                </span>
                <Link href={`/admin/agents/${agent._id}`}>
                  <Button size="sm" className="text-xs h-7 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold flex items-center gap-1 shadow-xs">
                    <Eye className="w-3.5 h-3.5" /> DETAIL
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
