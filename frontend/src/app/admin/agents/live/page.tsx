'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { useSocket } from '../../../../context/SocketContext';
import {
  Radio,
  MapPin,
  RefreshCw,
  Package,
  Battery,
  Navigation,
  Eye,
  CheckCircle,
  Clock,
  Phone,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function LiveAgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<string>('ALL');
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastPingTime, setLastPingTime] = useState<Date>(new Date());
  const { socket, isConnected, subscribeToAgents } = useSocket();

  const fetchLiveAgents = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminLiveAgents();
      if (res.success) {
        setAgents(res.data || []);
        if (res.data?.length > 0 && !selectedAgent) {
          setSelectedAgent(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching live agents:', err);
    } finally {
      setLoading(false);
      setLastPingTime(new Date());
    }
  };

  useEffect(() => {
    fetchLiveAgents();
    subscribeToAgents();

    if (socket) {
      socket.on('agent:location', (data: any) => {
        setAgents((prev) =>
          prev.map((a) =>
            a._id === data.agentId
              ? {
                  ...a,
                  liveLocation: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    updatedAt: new Date(),
                    isSharing: true,
                  },
                  operationalStatus: data.operationalStatus || a.operationalStatus,
                }
              : a
          )
        );
        setLastPingTime(new Date());
      });

      socket.on('admin:agent_status_update', (data: any) => {
        setAgents((prev) =>
          prev.map((a) =>
            a._id === data.agentId
              ? {
                  ...a,
                  status: data.status,
                  operationalStatus: data.operationalStatus,
                }
              : a
          )
        );
      });
    }

    const interval = setInterval(fetchLiveAgents, 20000); // Polling fallback

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('agent:location');
        socket.off('admin:agent_status_update');
      }
    };
  }, [socket]);

  const displayedAgents = agents.filter((a) => {
    if (filteredStatus === 'ALL') return true;
    return a.operationalStatus === filteredStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">ONLINE (AVAILABLE)</Badge>;
      case 'ON_DELIVERY':
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse">ON DELIVERY</Badge>;
      case 'RECEIVING_PACKAGE':
        return <Badge className="bg-sky-100 text-sky-800 border-sky-200">RECEIVING INTAKE</Badge>;
      case 'WAITING':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">STANDBY / WAITING</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {isConnected ? 'Real-Time WebSocket Stream Active' : 'Polling Live Telemetry'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">Live Agents Operational Radar</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor GPS pings, active last-mile runs, and village cluster coverage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-gray-400 block font-mono">Last Signal Ping</span>
            <span className="text-xs font-bold text-gray-700 font-mono">
              {lastPingTime.toLocaleTimeString()}
            </span>
          </div>
          <Button
            onClick={fetchLiveAgents}
            size="sm"
            variant="outline"
            className="text-xs border-gray-200 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>
      </div>

      {/* Operational Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'ONLINE', 'ON_DELIVERY', 'RECEIVING_PACKAGE', 'WAITING'].map((status) => (
          <button
            key={status}
            onClick={() => setFilteredStatus(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filteredStatus === status
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {status.replace(/_/g, ' ')} ({status === 'ALL' ? agents.length : agents.filter((a) => a.operationalStatus === status).length})
          </button>
        ))}
      </div>

      {/* Radar Map & Agents Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Live Agents List */}
        <div className="lg:col-span-5 space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {displayedAgents.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-2">
              <Radio className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-600">No agents match selected operational status</p>
            </div>
          ) : (
            displayedAgents.map((agent) => {
              const isSelected = selectedAgent?._id === agent._id;
              return (
                <div
                  key={agent._id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                        {agent.userId?.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900">{agent.userId?.name || 'Village Agent'}</span>
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                            {agent.hubCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="truncate max-w-[170px]">{agent.villageName}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(agent.operationalStatus)}
                  </div>

                  {/* Operational Details Row */}
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">COD Cash</span>
                      <span className="font-extrabold text-gray-900">₹{agent.cashInHand || 0}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Parcels</span>
                      <span className="font-extrabold text-gray-900">{agent.activeParcelsCount || 0}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Rating</span>
                      <span className="font-extrabold text-amber-600">★ {agent.rating || 4.9}</span>
                    </div>
                  </div>

                  {agent.liveLocation && (
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-gray-500">
                      <span className="font-mono">
                        GPS: {agent.liveLocation.latitude?.toFixed(4)}, {agent.liveLocation.longitude?.toFixed(4)}
                      </span>
                      <Link href={`/admin/agents/${agent._id}`} className="text-emerald-700 hover:underline font-bold flex items-center gap-0.5">
                        Inspect Profile <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Interactive Operational Radar & Map View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md relative overflow-hidden min-h-[460px] flex flex-col justify-between">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

            {/* Radar Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Satellite Operational Plotter
                </span>
                <h3 className="text-base font-black text-white mt-0.5">Live Haat Geolocation Canvas</h3>
              </div>
              <Badge className="bg-slate-800 text-emerald-300 border-slate-700 font-mono text-xs">
                {displayedAgents.length} Nodes Active
              </Badge>
            </div>

            {/* Stylized SVG Interactive Map Canvas */}
            <div className="relative z-10 my-4 flex-1 flex items-center justify-center">
              <svg className="w-full h-72 border border-slate-800 rounded-xl bg-slate-950/60 p-4" viewBox="0 0 600 300">
                {/* Concentric Radar Rings */}
                <circle cx="300" cy="150" r="130" fill="none" stroke="#334155" strokeDasharray="3 3" />
                <circle cx="300" cy="150" r="85" fill="none" stroke="#1e293b" />
                <circle cx="300" cy="150" r="40" fill="none" stroke="#1e293b" />
                <line x1="300" y1="20" x2="300" y2="280" stroke="#1e293b" />
                <line x1="170" y1="150" x2="430" y2="150" stroke="#1e293b" />

                {/* Plot Real Agents on Canvas based on Normalized Coordinates */}
                {displayedAgents.map((agent, i) => {
                  const lat = agent.liveLocation?.latitude || 25.3;
                  const lng = agent.liveLocation?.longitude || 83.0;

                  // Normalize around Uttar Pradesh / Bihar corridor (approx Lat 24-27, Lng 82-86)
                  const x = Math.max(40, Math.min(560, 300 + (lng - 83.5) * 110));
                  const y = Math.max(30, Math.min(270, 150 - (lat - 25.5) * 80));

                  const isSelected = selectedAgent?._id === agent._id;

                  return (
                    <g
                      key={agent._id}
                      onClick={() => setSelectedAgent(agent)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      {/* Pulse Circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 16 : 9}
                        fill={isSelected ? '#10b981' : '#059669'}
                        fillOpacity={isSelected ? 0.35 : 0.2}
                        className={isSelected ? 'animate-ping' : ''}
                      />
                      {/* Pin Center */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 7 : 5}
                        fill={
                          agent.operationalStatus === 'ON_DELIVERY'
                            ? '#6366f1'
                            : agent.operationalStatus === 'ONLINE'
                            ? '#10b981'
                            : '#f59e0b'
                        }
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                      {/* Label */}
                      <text
                        x={x + 10}
                        y={y + 4}
                        fill="#cbd5e1"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {agent.hubCode}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Agent Quick Telemetry Card */}
            {selectedAgent && (
              <div className="relative z-10 bg-slate-800/90 border border-slate-700/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">{selectedAgent.userId?.name}</span>
                    <Badge className="bg-emerald-900/60 text-emerald-300 border-emerald-700 text-[10px]">
                      {selectedAgent.hubCode}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-3">
                    <span>Village: <strong>{selectedAgent.villageName}</strong></span>
                    <span>District: <strong>{selectedAgent.hubAddress?.district || 'Varanasi'}</strong></span>
                    <span>Status: <strong className="text-emerald-400">{selectedAgent.operationalStatus}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedAgent.userId?.phone}`}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition"
                    title="Call Agent"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <Link href={`/admin/agents/${selectedAgent._id}`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                      Inspect 360° Profile
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
