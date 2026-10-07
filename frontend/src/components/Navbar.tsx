'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '../lib/api';
import {
  ShoppingBag,
  Package,
  Compass,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Truck,
  ShieldCheck,
  DollarSign,
  Radio,
  Boxes,
  Banknote,
  Building2,
  Receipt,
  Users,
  FileText,
  Store,
  Menu,
  X,
  Search,
  Home,
  Layers,
  MapPin,
  ArrowRight,
  Phone,
  HelpCircle,
} from 'lucide-react';
import { Badge } from './ui/badge';

// Quadcopter Drone SVG Icon
const DroneIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
    <line x1="9" y1="9" x2="4.5" y2="4.5" />
    <line x1="15" y1="9" x2="19.5" y2="4.5" />
    <line x1="9" y1="15" x2="4.5" y2="19.5" />
    <line x1="15" y1="15" x2="19.5" y2="19.5" />
    <circle cx="4.5" cy="4.5" r="2.5" />
    <circle cx="19.5" cy="4.5" r="2.5" />
    <circle cx="4.5" cy="19.5" r="2.5" />
    <circle cx="19.5" cy="19.5" r="2.5" />
  </svg>
);

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount, subtotal } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  // Desktop user profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);

  // Mobile drawer sheet
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search input state
  const [desktopSearchQuery, setDesktopSearchQuery] = useState('');
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Real live Partner & Agent earnings state
  const [partnerEarnings, setPartnerEarnings] = useState<number>(0);
  const [agentCommission, setAgentCommission] = useState<number>(0);

  useEffect(() => {
    if (user?.role === 'logistics_partner') {
      api
        .getPartnerDashboard()
        .then((res: any) => {
          if (res?.success) {
            const bal = res.stats?.totalEarnings ?? res.partner?.walletBalance ?? 0;
            setPartnerEarnings(bal);
          }
        })
        .catch(() => setPartnerEarnings(0));
    } else if (user?.role === 'village_agent') {
      api
        .getAgentDashboard()
        .then((res: any) => {
          if (res?.success) {
            const comm = res.stats?.totalEarnings ?? res.agent?.walletBalance ?? 0;
            setAgentCommission(comm);
          }
        })
        .catch(() => setAgentCommission(0));
    }
  }, [user?.role, user?._id, pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (desktopSearchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(desktopSearchQuery.trim())}`);
      setDesktopSearchQuery('');
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
      setMobileSearchQuery('');
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
    }
  };

  const getPortalLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'logistics_partner':
        return '/partner';
      case 'village_agent':
        return '/agent';
      case 'business':
        return '/business';
      case 'admin':
        return '/admin';
      default:
        return '/marketplace';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xs w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* LEFT: LocalHaat Logo */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link href="/" className="flex items-center gap-2 group py-1">
              <img
                src="/logo.png"
                alt="LocalHaat — Rural Commerce & Logistics"
                className="h-9 sm:h-11 w-auto max-w-[170px] sm:max-w-[210px] object-contain hover:opacity-95 transition-opacity"
              />
            </Link>
          </div>

          {/* DESKTOP NAVIGATION (Hidden on mobile/tablet) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                pathname === '/'
                  ? 'bg-primary-50 text-primary-700 font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Home</span>
            </Link>

            <Link
              href="/marketplace"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                pathname === '/marketplace'
                  ? 'bg-primary-50 text-primary-700 font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Store className="w-4 h-4 text-primary-700" />
              <span>Shop</span>
            </Link>

            <Link
              href="/parcels"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                pathname?.startsWith('/parcels')
                  ? 'bg-primary-50 text-primary-700 font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Send Parcel</span>
            </Link>

            <Link
              href="/drone-delivery"
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs group ${
                pathname === '/drone-delivery'
                  ? 'bg-emerald-800 text-white ring-2 ring-emerald-400 shadow-xs'
                  : 'bg-primary-700 hover:bg-primary-800 text-white hover:shadow-xs'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <DroneIcon className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Drone Delivery</span>
              <span className="text-[9px] font-extrabold uppercase bg-amber-400 text-gray-950 px-1.5 py-0.5 rounded tracking-wider font-mono">
                Phase 2
              </span>
            </Link>
          </nav>

          {/* DESKTOP SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-xs mx-2">
            <form onSubmit={handleDesktopSearch} className="w-full relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products or villages..."
                value={desktopSearchQuery}
                onChange={(e) => setDesktopSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-700 transition"
              />
            </form>
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary-700 hover:bg-gray-100 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* CUSTOMER CART ICON */}
            {(!user || user.role === 'customer') && (
              <Link
                href="/cart"
                className="relative p-2 text-gray-700 hover:text-primary-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5 min-w-[40px] min-h-[40px] justify-center"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:-top-1 sm:-right-1 bg-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                    {itemCount}
                  </span>
                )}
                <span className="hidden sm:inline text-xs font-bold text-gray-800">
                  ₹{subtotal}
                </span>
              </Link>
            )}

            {/* PARTNER EARNINGS PILL (Desktop) - Real Live Wallet Data */}
            {user?.role === 'logistics_partner' && (
              <Link
                href="/partner/wallet"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Earnings:</span>
                <span className="font-mono text-emerald-900 text-xs">₹{partnerEarnings}</span>
              </Link>
            )}

            {/* VILLAGE AGENT PILL (Desktop) - Real Live Commission Data */}
            {user?.role === 'village_agent' && (
              <Link
                href="/agent"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold hover:bg-amber-100 transition-colors shadow-2xs"
              >
                <span>Hub Commission:</span>
                <span className="font-mono text-amber-950 text-xs">₹{agentCommission}</span>
              </Link>
            )}

            {/* DESKTOP USER ACCOUNT DROPDOWN */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-left text-xs bg-white shadow-2xs min-h-[40px]"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 leading-tight max-w-[110px] truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                      {user.role.replace('_', ' ')}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3.5 py-2.5 border-b border-gray-100 bg-gray-50/50">
                      <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                      <p className="text-gray-500 font-mono text-[11px]">{user.phone}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge
                          variant={
                            user.role === 'logistics_partner'
                              ? 'secondary'
                              : user.role === 'admin'
                              ? 'destructive'
                              : 'outline'
                          }
                          className="text-[10px] font-bold uppercase"
                        >
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href={getPortalLink()}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        <Compass className="w-4 h-4 text-primary-700" />
                        <span>Open My Portal Dashboard</span>
                      </Link>

                      {user.role === 'logistics_partner' && (
                        <>
                          <Link
                            href="/partner/requests"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                          >
                            <Radio className="w-4 h-4 text-orange-600" />
                            <span>Dispatch Requests</span>
                          </Link>
                          <Link
                            href="/partner/deliveries"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                          >
                            <Package className="w-4 h-4 text-indigo-600" />
                            <span>Active Pickups & Hauls</span>
                          </Link>
                          <Link
                            href="/partner/wallet"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-emerald-800 hover:bg-emerald-50 font-bold"
                          >
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span>My Profit & Wallet</span>
                          </Link>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <>
                          <Link
                            href="/admin/users"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                          >
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>Users Directory</span>
                          </Link>
                          <Link
                            href="/admin/kyc"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                          >
                            <FileText className="w-4 h-4 text-amber-600" />
                            <span>KYC Verification</span>
                          </Link>
                          <Link
                            href="/admin/payouts"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-gray-700 hover:bg-gray-50 font-medium"
                          >
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span>Payout Settlements</span>
                          </Link>
                        </>
                      )}

                      <Link
                        href="/orders"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-slate-800 hover:bg-gray-50 font-medium"
                      >
                        <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        <span>My Orders</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-600 hover:bg-red-50 text-left font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary-700 text-white hover:bg-primary-800 transition-colors shadow-2xs min-h-[38px]"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors min-h-[38px]"
                >
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* MOBILE DRONE DELIVERY BUTTON (Near Hamburger Menu) */}
            <Link
              href="/drone-delivery"
              className={`lg:hidden relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs group shrink-0 min-h-[40px] ${
                pathname === '/drone-delivery'
                  ? 'bg-emerald-800 text-white ring-2 ring-emerald-400 shadow-xs'
                  : 'bg-primary-700 hover:bg-primary-800 text-white hover:shadow-xs'
              }`}
              aria-label="Drone Delivery"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <DroneIcon className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform shrink-0" />
              <span className="text-[11px] sm:text-xs">
                Drone<span className="hidden sm:inline"> Delivery</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase bg-amber-400 text-gray-950 px-1.5 py-0.5 rounded tracking-wider font-mono">
                Phase 2
              </span>
            </Link>

            {/* MOBILE HAMBURGER BUTTON (Min 44x44 touch target) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-xl transition min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* MOBILE POPDOWN SEARCH BAR */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-gray-100 p-3 bg-white animate-in fade-in slide-in-from-top-2">
            <form onSubmit={handleMobileSearch} className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, groceries or villages..."
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-16 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-700"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary-700 text-white text-[11px] font-bold rounded-lg"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* MOBILE SLIDE-OVER DRAWER SHEET (FULL NAVIGATION) */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop Blur */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <aside className="relative w-full max-w-[320px] xs:max-w-[360px] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="inline-block">
                <img
                  src="/logo.png"
                  alt="LocalHaat"
                  className="h-8 w-auto max-w-[160px] object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition shadow-2xs"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Search Input */}
            <div className="p-4 border-b border-gray-100 bg-white">
              <form onSubmit={handleMobileSearch} className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-700 min-h-[42px]"
                />
              </form>
            </div>

            {/* User Account State Card */}
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100/60">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {user.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-sm text-gray-900 truncate">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono">
                        {user.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase bg-white">
                      {user.role.replace('_', ' ')}
                    </Badge>
                    <Link
                      href={getPortalLink()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold text-primary-700 hover:underline flex items-center gap-1"
                    >
                      <span>My Portal</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs text-gray-600 font-medium">
                    Sign in to track orders, manage deliveries, or start selling:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center justify-center py-2 px-3 rounded-xl bg-primary-700 text-white font-bold text-xs shadow-xs min-h-[44px]"
                    >
                      <UserIcon className="w-3.5 h-3.5 mr-1.5" />
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center justify-center py-2 px-3 rounded-xl bg-white border border-gray-300 text-gray-800 font-bold text-xs min-h-[44px]"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Navigation List */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-semibold overscroll-contain">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition min-h-[44px] ${
                  pathname === '/'
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Home className="w-4 h-4 text-emerald-700" />
                <span>Home</span>
              </Link>

              <Link
                href="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition min-h-[44px] ${
                  pathname === '/marketplace'
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Store className="w-4 h-4 text-primary-700" />
                <span>Shop</span>
              </Link>

              <Link
                href="/marketplace#categories"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition min-h-[44px]"
              >
                <Layers className="w-4 h-4 text-sky-600" />
                <span>Categories</span>
              </Link>

              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition min-h-[44px] ${
                  pathname === '/orders'
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Orders</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                  PIN
                </span>
              </Link>

              <Link
                href="/parcels"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition min-h-[44px] ${
                  pathname === '/parcels'
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Package className="w-4 h-4 text-orange-600" />
                <span>Send Parcel</span>
              </Link>

              <div className="pt-2 pb-1 border-t border-gray-100 text-[10px] uppercase font-bold tracking-wider text-gray-400 px-3">
                Partner Networks
              </div>

              <Link
                href="/partner/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition min-h-[44px]"
              >
                <Truck className="w-4 h-4 text-blue-700" />
                <span>Become a Partner</span>
              </Link>

              <Link
                href="/signup?role=village_agent"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition min-h-[44px]"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Become a Village Agent</span>
              </Link>

              <Link
                href="/business"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition min-h-[44px]"
              >
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>Business Logistics</span>
              </Link>

              <Link
                href="/drone-delivery"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition min-h-[44px] ${
                  pathname === '/drone-delivery'
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <DroneIcon className="w-4 h-4 text-emerald-700" />
                  <span>Drone Delivery</span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-amber-400 text-gray-900 px-1.5 py-0.5 rounded">
                  PHASE 2
                </span>
              </Link>

              <div className="pt-2 pb-1 border-t border-gray-100 text-[10px] uppercase font-bold tracking-wider text-gray-400 px-3">
                Information & Support
              </div>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition min-h-[44px]"
              >
                <Phone className="w-4 h-4 text-slate-500" />
                <span>Contact</span>
              </Link>

              <Link
                href="/faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 transition min-h-[44px]"
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>Help & FAQs</span>
              </Link>

              {user && (
                <div className="pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition font-semibold min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </nav>

            {/* Drawer Bottom Brand Line */}
            <div className="p-3 border-t border-gray-100 text-[11px] text-gray-500 text-center bg-gray-50">
              Operated by <strong className="text-gray-700">InfraBlue Material Technologies</strong>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
