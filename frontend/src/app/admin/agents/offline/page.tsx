'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { Moon, MapPin, RefreshCw, ExternalLink, Eye } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function OfflineAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffline = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAgents({ status: 'OFFLINE', limit: '30' });
      if (res.success) {
        setAgents(res.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffline();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Shift Off Duty</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Offline Village Agents</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Agents currently disconnected or off duty. Hub intake remains closed until back online.
          </p>
        </div>

        <Button onClick={fetchOffline} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-xs text-gray-500">Querying offline agents...</div>
        ) : agents.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-xs text-gray-500">No offline agents currently.</div>
        ) : (
          agents.map((agent) => (
            <div key={agent._id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{agent.userId?.name}</h3>
                  <span className="text-xs text-gray-500 font-mono">{agent.userId?.phone}</span>
                </div>
                <Badge className="bg-gray-100 text-gray-700 border-gray-200 font-mono text-[10px]">
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

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Hours: {agent.workingHours || '08:00 AM - 07:00 PM'}</span>
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
