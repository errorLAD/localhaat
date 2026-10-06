'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { MessageSquareWarning, RefreshCw, CheckCircle, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function AgentComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Resolution modal
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [resolveStatus, setResolveStatus] = useState<'RESOLVED' | 'REJECTED' | 'UNDER_REVIEW'>('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page.toString(),
        limit: '15',
      };
      if (status !== 'ALL') params.status = status;

      const res = await api.getAdminAgentComplaints(params);
      if (res.success) {
        setComplaints(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status]);

  const handleResolve = async () => {
    if (!selectedTicket) return;

    try {
      setActionLoading(true);
      const res = await api.resolveAdminAgentComplaint(
        selectedTicket._id,
        resolveStatus,
        resolutionNotes
      );
      if (res.success) {
        setSelectedTicket(null);
        setResolutionNotes('');
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return <Badge className="bg-rose-600 text-white border-rose-700 animate-pulse">CRITICAL</Badge>;
      case 'HIGH':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">HIGH PRIORITY</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">MEDIUM</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">LOW</Badge>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'OPEN':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200 animate-pulse">OPEN TICKET</Badge>;
      case 'UNDER_REVIEW':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">UNDER REVIEW</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">RESOLVED</Badge>;
      case 'REJECTED':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">REJECTED / INVALID</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Redressal</span>
            <span className="text-xs font-bold text-rose-700 font-mono">({total} Tickets)</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Agent Grievances & Complaints</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Resolve delivery issues, missing parcels, unverified PIN entries, and customer behavior tickets.
          </p>
        </div>

        <Button onClick={fetchComplaints} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap uppercase ${
              status === s
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {loading && complaints.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">Querying complaint tickets...</div>
        ) : complaints.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">Zero Open Grievances</h3>
            <p className="text-xs text-gray-500">No unresolved complaints pending against village agents.</p>
          </div>
        ) : (
          complaints.map((ticket) => (
            <div key={ticket._id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                      {ticket.ticketNumber}
                    </span>
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                    <span className="text-[11px] font-bold text-gray-500 font-mono">
                      Category: {ticket.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mt-1">{ticket.subject}</h3>
                  <p className="text-xs text-gray-600">{ticket.description}</p>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setResolveStatus('RESOLVED');
                      setResolutionNotes(ticket.resolutionNotes || '');
                    }}
                    className="text-xs h-8 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                  >
                    Action Ticket
                  </Button>
                </div>
              </div>

              {/* Agent & Customer Info */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50/70 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Customer</span>
                  <strong className="text-gray-900">{ticket.customerId?.name}</strong> • {ticket.customerId?.phone}
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">Agent Hub Node</span>
                  <span className="font-mono text-emerald-800 font-bold">{ticket.agentId?.hubCode}</span> • {ticket.agentId?.villageName}
                </div>
              </div>

              {ticket.resolutionNotes && (
                <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl text-xs">
                  <strong>Resolution Notes:</strong> {ticket.resolutionNotes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-extrabold text-gray-900">
              Manage Ticket: {selectedTicket.ticketNumber}
            </h3>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-gray-700">Set Ticket Status:</label>
              <select
                value={resolveStatus}
                onChange={(e) => setResolveStatus(e.target.value as any)}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-white"
              >
                <option value="RESOLVED">RESOLVED (Complaint Addressed)</option>
                <option value="UNDER_REVIEW">UNDER REVIEW (Investigation In Progress)</option>
                <option value="REJECTED">REJECTED (Invalid / False Claim)</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-gray-700">Resolution Summary / Notes:</label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter actions taken or customer communication summary..."
                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs min-h-[90px]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button size="sm" variant="ghost" onClick={() => setSelectedTicket(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleResolve}
                disabled={actionLoading || !resolutionNotes.trim()}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
              >
                {actionLoading ? 'Saving...' : 'Save Ticket Resolution'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
