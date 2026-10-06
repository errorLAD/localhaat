'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import {
  DollarSign,
  ShoppingCart,
  Clock,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Package,
  AlertTriangle,
  Ban,
  Users,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  ShoppingBag,
  Layers,
  Percent,
  CreditCard,
} from 'lucide-react';
import { Badge } from '../../../components/ui/badge';

export default function StoreDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStoreDashboard();
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load store dashboard stats');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching store dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading live e-commerce metrics from MongoDB...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
        <h3 className="text-base font-bold text-red-900">Dashboard Failed to Load</h3>
        <p className="text-sm text-red-700">{error || 'Unknown error occurred'}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { stats, charts } = data;

  // Max value for sales bar chart scaling
  const maxSales = Math.max(...(charts.salesOverTime?.map((d: any) => d.sales) || [1]), 100);
  const maxOrders = Math.max(...(charts.salesOverTime?.map((d: any) => d.orders) || [1]), 5);

  const totalCatRevenue = charts.categorySales?.reduce((acc: number, c: any) => acc + c.revenue, 0) || 1;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 p-6 sm:p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-400 text-amber-950 font-extrabold uppercase text-[10px] tracking-wider px-2 py-0.5">
              COMPANY STORE CONTROL
            </Badge>
            <span className="text-xs text-amber-200 font-medium">Real-Time MongoDB Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">E-Commerce & Store Command</h1>
          <p className="text-xs sm:text-sm text-amber-100/90 max-w-xl">
            Single-vendor unified catalog, inventory tracking, courier logistics, and automated ledger for company store operations.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md transition border border-white/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
          <Link
            href="/admin/store/products"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl text-xs font-black shadow-lg transition"
          >
            Manage Catalog
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ================= 1. REVENUE & FINANCIAL SUMMARY STATS ================= */}
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          Financial & Sales Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sales */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
            <span className="text-xs font-bold text-slate-500 flex items-center justify-between">
              Total Lifetime Sales
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </span>
            <div className="text-2xl font-black text-slate-900">₹{stats.totalSales.toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-slate-400 font-medium">Net revenue across fulfilled & confirmed orders</p>
          </div>

          {/* Today's Sales */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
            <span className="text-xs font-bold text-slate-500 flex items-center justify-between">
              Today's Sales
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Today</Badge>
            </span>
            <div className="text-2xl font-black text-emerald-600">₹{stats.todaySales.toLocaleString('en-IN')}</div>
            <p className="text-[11px] text-slate-400 font-medium">Processed since 00:00 midnight</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
            <span className="text-xs font-bold text-slate-500 flex items-center justify-between">
              Total Orders
              <ShoppingCart className="w-4 h-4 text-blue-600" />
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.totalOrders}</div>
            <p className="text-[11px] text-slate-400 font-medium">Recorded in MongoDB orders collection</p>
          </div>

          {/* Total Customers */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
            <span className="text-xs font-bold text-slate-500 flex items-center justify-between">
              Total Customers
              <Users className="w-4 h-4 text-purple-600" />
            </span>
            <div className="text-2xl font-black text-slate-900">{stats.totalCustomers}</div>
            <p className="text-[11px] text-slate-400 font-medium">Verified customer accounts on platform</p>
          </div>
        </div>
      </div>

      {/* ================= 2. ORDER PIPELINE & STATUS BREAKDOWN ================= */}
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          Fulfillment & Order Pipeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Pending */}
          <div className="bg-white p-4 rounded-2xl border border-amber-200/70 bg-amber-50/20 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-amber-700">
              Pending
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-slate-900">{stats.pendingOrders}</div>
            <span className="text-[10px] text-slate-500">Awaiting processing</span>
          </div>

          {/* Processing / Packed */}
          <div className="bg-white p-4 rounded-2xl border border-blue-200/70 bg-blue-50/20 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-blue-700">
              Processing
              <PackageCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-slate-900">{stats.processingOrders}</div>
            <span className="text-[10px] text-slate-500">Packing in warehouse</span>
          </div>

          {/* Shipped */}
          <div className="bg-white p-4 rounded-2xl border border-indigo-200/70 bg-indigo-50/20 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
              Shipped / Transit
              <Truck className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-slate-900">{stats.shippedOrders}</div>
            <span className="text-[10px] text-slate-500">On rural corridor route</span>
          </div>

          {/* Delivered */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-200/70 bg-emerald-50/20 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
              Delivered
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-emerald-700">{stats.deliveredOrders}</div>
            <span className="text-[10px] text-slate-500">PIN-verified handover</span>
          </div>

          {/* Cancelled */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              Cancelled
              <XCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-black text-slate-700">{stats.cancelledOrders}</div>
            <span className="text-[10px] text-slate-500">Customer / stock void</span>
          </div>

          {/* Refunded */}
          <div className="bg-white p-4 rounded-2xl border border-rose-200/70 bg-rose-50/20 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-rose-700">
              Refunded
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-rose-700">{stats.refundedOrders}</div>
            <span className="text-[10px] text-slate-500">Ledger balance reversed</span>
          </div>
        </div>
      </div>

      {/* ================= 3. INVENTORY TELEMETRY ================= */}
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-600" />
          Catalog & Inventory Health
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500">Total Catalog Items</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalProducts} Products</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Active single-vendor master products</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-700">Low Stock Alert</span>
              <div className="text-2xl font-black text-amber-800 mt-1">{stats.lowStockProducts} Items</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Under threshold (≤ 5 units)</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-700">Out of Stock</span>
              <div className="text-2xl font-black text-rose-800 mt-1">{stats.outOfStockProducts} Items</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Zero inventory available</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Ban className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. REAL CHARTS & DATA VISUALIZATIONS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Sales & Orders Over Time */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Sales & Order Volume Trend</h3>
              <p className="text-xs text-slate-500">Live 7-day trajectory from MongoDB order history</p>
            </div>
            <Badge className="bg-amber-100 text-amber-800 font-bold border-amber-200">Last 7 Days</Badge>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
            {charts.salesOverTime?.map((day: any, i: number) => {
              const heightPct = Math.max(10, Math.round((day.sales / maxSales) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-900 text-white px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap">
                    ₹{day.sales} ({day.orders} ord)
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[40px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all group-hover:from-amber-700 group-hover:to-amber-500 shadow-xs"
                  />
                  <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">
                    {day.date.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-around text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-amber-500" />
              <span>Daily Sales (₹)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              <span>Fulfilled Orders</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Category Sales Distribution</h3>
              <p className="text-xs text-slate-500">Product sales contribution by department</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 font-bold border-blue-200">Catalog Share</Badge>
          </div>

          <div className="space-y-4 pt-2">
            {charts.categorySales && charts.categorySales.length > 0 ? (
              charts.categorySales.map((cat: any, i: number) => {
                const pct = Math.round((cat.revenue / totalCatRevenue) * 100);
                const colors = [
                  'bg-amber-500',
                  'bg-emerald-500',
                  'bg-blue-500',
                  'bg-indigo-500',
                  'bg-purple-500',
                  'bg-rose-500',
                ];
                const color = colors[i % colors.length];

                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{cat.name}</span>
                      <span className="text-slate-600 font-mono">
                        ₹{cat.revenue.toLocaleString('en-IN')} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className={`h-full ${color} rounded-full`} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-xs text-slate-400">
                No orders yet. Placed orders will generate automated category telemetry.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= 5. TOP SELLING PRODUCTS & STATUS DISTRIBUTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top-Selling Products Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Top-Selling Products</h3>
              <p className="text-xs text-slate-500">Ranked by revenue contribution</p>
            </div>
            <Link
              href="/admin/store/products"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 transition"
            >
              View Full Catalog →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {charts.topSellingProducts && charts.topSellingProducts.length > 0 ? (
                  charts.topSellingProducts.map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold flex items-center justify-center text-[10px]">
                          {i + 1}
                        </span>
                        {p.image ? (
                          <img src={p.image} alt={p.title} className="w-9 h-9 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-bold text-slate-900 truncate max-w-[220px]">{p.title}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{p.count} units</td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 font-mono">
                        ₹{p.revenue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      No sales recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Order Status Distribution</h3>
            <p className="text-xs text-slate-500">Proportional breakdown of current orders</p>
          </div>

          <div className="space-y-3 pt-2">
            {charts.orderStatusDistribution && charts.orderStatusDistribution.length > 0 ? (
              charts.orderStatusDistribution.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">{item.status}</span>
                  <Badge className="bg-white text-slate-900 font-mono font-extrabold border shadow-2xs">
                    {item.count} orders
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">No active orders</div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/admin/store/orders"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
            >
              Open Order Manager
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
