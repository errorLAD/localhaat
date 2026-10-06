'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import {
  Star,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  Package,
  User,
  Calendar,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

export default function StoreReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.getStoreReviews();
      if (res.success) {
        setReviews(res.reviews || []);
      }
    } catch (err: any) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await api.updateStoreReviewStatus(id, newStatus);
      if (res.success) {
        fetchReviews();
      } else {
        alert(res.message || 'Status update failed');
      }
    } catch (err: any) {
      alert(`Error updating review status: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      const res = await api.deleteStoreReview(id);
      if (res.success) {
        fetchReviews();
      } else {
        alert(res.message || 'Delete failed');
      }
    } catch (err: any) {
      alert(`Error deleting review: ${err.message}`);
    }
  };

  const filtered = reviews.filter((r) => {
    const term = search.toLowerCase();
    const prodName = r.productId?.title?.toLowerCase() || '';
    const custName = r.customerName?.toLowerCase() || '';
    const text = r.review?.toLowerCase() || '';
    const matchesSearch = !search || prodName.includes(term) || custName.includes(term) || text.includes(term);

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Feedback</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Product Reviews & Moderation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve verified purchase testimonials and hide offensive or spam product feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReviews}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 w-full">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by review text, product name, or reviewer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">APPROVED (Visible)</option>
              <option value="HIDDEN">HIDDEN (Suppressed)</option>
              <option value="PENDING">PENDING MODERATION</option>
            </select>

            <Badge className="bg-slate-100 text-slate-700 font-mono text-[10px]">
              {filtered.length} Reviews
            </Badge>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Loading reviews from MongoDB...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Star className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No reviews found</h3>
          <p className="text-xs text-slate-500">Product reviews submitted by shoppers will be listed here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Review Testimonial</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((rev) => (
                  <tr key={rev._id} className="hover:bg-slate-50/70 transition">
                    {/* Product */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 max-w-[180px] truncate">
                        {rev.productId?.title || 'Catalog Product'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        SKU: {rev.productId?.sku || 'N/A'}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div>{rev.customerName || 'Shopper'}</div>
                      <span className="text-[10px] text-slate-400 font-mono">Verified Buyer</span>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-slate-800 font-mono text-xs ml-1">({rev.rating})</span>
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="py-3.5 px-4 text-slate-700 max-w-sm">
                      <p className="line-clamp-2 leading-relaxed">{rev.review}</p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge
                        className={
                          rev.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold'
                            : rev.status === 'HIDDEN'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold'
                            : 'bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold'
                        }
                      >
                        {rev.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rev.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleStatusChange(rev._id, 'APPROVED')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition border border-emerald-200 text-[11px] flex items-center gap-1"
                            title="Approve Review"
                          >
                            <Eye className="w-3 h-3" /> Approve
                          </button>
                        )}
                        {rev.status !== 'HIDDEN' && (
                          <button
                            onClick={() => handleStatusChange(rev._id, 'HIDDEN')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-[11px] flex items-center gap-1"
                            title="Hide Review"
                          >
                            <EyeOff className="w-3 h-3" /> Hide
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(rev._id)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
