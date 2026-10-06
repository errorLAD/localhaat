'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';
import {
  Users,
  Search,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  Shield,
  ArrowUpRight,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';

export default function StoreCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getStoreCustomers();
      if (res.success) {
        setCustomers(res.customers || []);
      }
    } catch (err: any) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const term = search.toLowerCase();
    return (
      !search ||
      c.name?.toLowerCase().includes(term) ||
      c.phone?.includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Base</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Store Customers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profiles, purchase volume, lifetime spending, and activity history for company store shoppers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-200"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by customer name, phone number, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800 placeholder-slate-400"
        />
        <Badge className="bg-slate-100 text-slate-600 font-mono text-[10px]">
          {filtered.length} Customers
        </Badge>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Aggregating customer history from MongoDB...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No customers found</h3>
          <p className="text-xs text-slate-500">Customer profiles will appear here once they register or place orders.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone & Email</th>
                  <th className="py-3 px-4">Lifetime Orders</th>
                  <th className="py-3 px-4">Total Spending</th>
                  <th className="py-3 px-4">Last Order Placed</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition">
                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-200">
                          {c.name.slice(0, 1)}
                        </div>
                        <span>{c.name}</span>
                      </div>
                    </td>

                    {/* Phone & Email */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-800 font-semibold flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {c.phone}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-300" />
                        {c.email}
                      </div>
                    </td>

                    {/* Total Orders */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      <div className="flex items-center gap-1 font-mono">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-bold text-slate-900">{c.totalOrders}</span> orders
                      </div>
                    </td>

                    {/* Total Spending */}
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                      ₹{c.totalSpending?.toLocaleString('en-IN')}
                    </td>

                    {/* Last Order */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.lastOrder ? (
                        <div className="font-mono text-[11px] text-slate-700">
                          {new Date(c.lastOrder).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No orders yet</span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="py-3.5 px-4">
                      <Badge
                        className={
                          c.accountStatus === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                            : 'bg-rose-50 text-rose-700 border-rose-200 text-[10px]'
                        }
                      >
                        {c.accountStatus}
                      </Badge>
                    </td>

                    {/* Member Since */}
                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {c.joinedAt ? new Date(c.joinedAt).toLocaleDateString('en-IN') : 'Recent'}
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
