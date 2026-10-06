'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { Star, RefreshCw, EyeOff, CheckCircle, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function AgentReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Moderate modal
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [hideReason, setHideReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: page.toString(),
        limit: '15',
      };
      if (status !== 'ALL') params.status = status;

      const res = await api.getAdminAgentReviews(params);
      if (res.success) {
        setReviews(res.data || []);
        setTotal(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, status]);

  const handleModerate = async (reviewId: string, newStatus: 'APPROVED' | 'HIDDEN', reason?: string) => {
    try {
      setActionLoading(true);
      const res = await api.moderateAdminAgentReview(reviewId, newStatus, reason);
      if (res.success) {
        setSelectedReview(null);
        setHideReason('');
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
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
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quality Assurance</span>
            <span className="text-xs font-bold text-amber-700 font-mono">({total} Reviews)</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">Agent Reviews & Ratings Moderation</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit customer feedback left for village agent deliveries. Hide inappropriate or abusive content.
          </p>
        </div>

        <Button onClick={fetchReviews} size="sm" variant="outline" className="text-xs border-gray-200 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'APPROVED', 'HIDDEN'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              status === s
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && reviews.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-xs text-gray-500">Querying customer reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-xs text-gray-500">No reviews found under {status}.</div>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                      />
                    ))}
                    <span className="text-xs font-bold font-mono text-gray-700 ml-1">{r.rating}.0</span>
                  </div>

                  <Badge className={r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'}>
                    {r.status}
                  </Badge>
                </div>

                <p className="mt-2 text-xs text-gray-700 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  &quot;{r.comment}&quot;
                </p>

                {r.hiddenReason && (
                  <div className="mt-2 text-[10px] text-rose-700 font-bold bg-rose-50 p-1.5 rounded-lg border border-rose-100">
                    Hidden Reason: {r.hiddenReason}
                  </div>
                )}

                <div className="mt-3 text-[11px] text-gray-500 space-y-0.5">
                  <div>Customer: <strong className="text-gray-900">{r.customerId?.name || 'Customer'}</strong></div>
                  <div>Agent Hub: <span className="font-mono text-emerald-800 font-bold">{r.agentId?.hubCode}</span> ({r.agentId?.villageName})</div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>

                {r.status === 'APPROVED' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedReview(r)}
                    className="text-xs h-7 px-2 text-rose-700 hover:bg-rose-50 font-bold"
                  >
                    <EyeOff className="w-3.5 h-3.5 mr-1" /> Hide Review
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleModerate(r._id, 'APPROVED')}
                    className="text-xs h-7 px-2 text-emerald-700 hover:bg-emerald-50 font-bold"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Restore
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Hide Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900">Hide Review from Public Profile</h3>
            <p className="text-xs text-gray-600">Provide an administrative justification for hiding this review:</p>
            <textarea
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
              placeholder="e.g. Abusive language, personal information disclosure, invalid delivery claim..."
              className="w-full border border-gray-200 rounded-xl p-2.5 text-xs min-h-[80px]"
              required
            />
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setSelectedReview(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => handleModerate(selectedReview._id, 'HIDDEN', hideReason)}
                disabled={actionLoading || !hideReason.trim()}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Confirm Hide
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
