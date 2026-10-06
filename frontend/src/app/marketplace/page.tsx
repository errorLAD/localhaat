'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Product, Category, Order } from '../../types';
import { api } from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Heart,
  Star,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { CategoryNavStrip } from '../../components/CategoryNavStrip';

// Helper to get high-res image for categories loaded from MongoDB
const getCategoryImageUrl = (cat: Category) => {
  if (cat.image && cat.image.trim()) return cat.image;
  const name = (cat.name || '').toLowerCase();
  if (name.includes('rice')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80';
  if (name.includes('daal') || name.includes('pulse')) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';
  if (name.includes('aata') || name.includes('flour') || name.includes('grain')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80';
  if (name.includes('oil') || name.includes('ghee')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80';
  if (name.includes('honey') || name.includes('jaggery') || name.includes('gud')) return 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=300&q=80';
  if (name.includes('cookware') || name.includes('clay') || name.includes('kitchen') || name.includes('house')) return 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80';
  if (name.includes('spice') || name.includes('masala')) return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80';
  if (name.includes('care') || name.includes('soap') || name.includes('wellness')) return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80';
  if (name.includes('med') || name.includes('pharma') || name.includes('health')) return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80';
  if (name.includes('fmcg') || name.includes('staple')) return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
};

// Price range filter definitions
const PRICE_RANGES = [
  { id: 'under-250', label: 'Under ₹250', min: 0, max: 250 },
  { id: '250-500', label: '₹250 - ₹500', min: 250, max: 500 },
  { id: '500-1000', label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { id: 'above-1000', label: 'Above ₹1,000', min: 1000, max: Infinity },
];

export default function MarketplacePage() {
  const router = useRouter();
  const { user, demoLogin } = useAuth();
  const { items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, subtotal, totalWeightKg } = useCart();

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State (matching reference layout)
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'relevant' | 'price_asc' | 'price_desc' | 'rating'>('relevant');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setShowFilterSidebar(true);
    }
  }, []);

  // Sidebar Accordion State
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [originOpen, setOriginOpen] = useState(true);
  const [specialtyOpen, setSpecialtyOpen] = useState(true);

  // Wishlist & UI State
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  // Checkout Form State
  const [checkoutStep, setCheckoutStep] = useState(false);
  const [addressLine, setAddressLine] = useState(user?.defaultLocation?.addressLine || 'Flat 402, Green Avenue');
  const [villageOrCity, setVillageOrCity] = useState(user?.defaultLocation?.villageOrCity || 'Central Hub');
  const [district, setDistrict] = useState(user?.defaultLocation?.district || 'Varanasi');
  const [pincode, setPincode] = useState(user?.defaultLocation?.pincode || '221008');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  // Load initial catalog data
  useEffect(() => {
    fetchInitialData();
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([api.getProducts(), api.getCategories()]);
      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Error fetching marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await api.getMyOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Extract unique origins from products
  const availableOrigins = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.originDistrict) set.add(p.originDistrict);
      else if (p.originVillage) set.add(p.originVillage);
    });
    return Array.from(set);
  }, [products]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory) {
          const pCatSlug = typeof p.categoryId === 'object' && p.categoryId !== null ? (p.categoryId as any).slug : '';
          const pCatId = typeof p.categoryId === 'object' && p.categoryId !== null ? (p.categoryId as any)._id?.toString() : String(p.categoryId || '');
          const activeCat = categories.find((c) => c.slug === selectedCategory || c._id?.toString() === selectedCategory);
          const activeSlug = activeCat?.slug || selectedCategory;
          const activeId = activeCat?._id?.toString() || selectedCategory;

          const matches = pCatSlug === activeSlug || pCatId === activeId || pCatId === selectedCategory || pCatSlug === selectedCategory;
          if (!matches) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchOrigin = (p.originVillage + ' ' + p.originDistrict).toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchOrigin) return false;
        }

        // Price ranges
        if (selectedPriceRanges.length > 0) {
          const effectivePrice = p.discountPrice || p.price;
          const inRange = selectedPriceRanges.some((rangeId) => {
            const range = PRICE_RANGES.find((r) => r.id === rangeId);
            if (!range) return false;
            return effectivePrice >= range.min && effectivePrice <= range.max;
          });
          if (!inRange) return false;
        }

        // Origin filter
        if (selectedOrigins.length > 0) {
          const match = selectedOrigins.includes(p.originDistrict) || selectedOrigins.includes(p.originVillage);
          if (!match) return false;
        }

        // Specialty filter
        if (organicOnly && !p.isOrganic) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;
        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0; // 'relevant'
      });
  }, [products, categories, selectedCategory, searchQuery, selectedPriceRanges, selectedOrigins, organicOnly, sortBy]);

  // Wishlist toggle
  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSelectedPriceRanges([]);
    setSelectedOrigins([]);
    setOrganicOnly(false);
  };

  // Active filter count for badge
  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    selectedPriceRanges.length +
    selectedOrigins.length +
    (organicOnly ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // Place Order handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setOrderPlacing(true);
    const orderPayload = {
      items: items.map((i) => ({
        productId: i.product._id,
        quantity: i.quantity,
      })),
      deliveryAddress: {
        addressLine,
        villageOrCity,
        district,
        state: 'Uttar Pradesh',
        pincode,
      },
      paymentMethod,
    };

    try {
      const res = await api.createOrder(orderPayload);
      setSuccessOrder(res);
      clearCart();
      setCheckoutStep(false);
      fetchMyOrders();
    } catch (err: any) {
      if (
        err.message?.includes('User no longer exists') ||
        err.message?.includes('Unauthorized') ||
        err.message?.includes('token')
      ) {
        alert('Please log in or sign up to complete your checkout.');
        router.push('/login?redirect=/marketplace');
        return;
      } else {
        alert(`Order placement failed: ${err.message}`);
      }
    } finally {
      setOrderPlacing(false);
    }
  };

  const deliveryFee = items.length > 0 ? 40 : 0;
  const grandTotal = subtotal + deliveryFee;

  // Dynamic visual category story bubbles directly from Admin managed MongoDB categories
  const categoryBubbles = useMemo(() => {
    return [
      {
        slug: '',
        name: 'ALL HAAT',
        image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=300&q=80',
      },
      ...categories
        .filter((c) => c.isActive !== false)
        .map((c) => ({
          slug: c.slug,
          name: c.name.toUpperCase(),
          image: getCategoryImageUrl(c),
        })),
    ];
  }, [categories]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-16 selection:bg-emerald-100 selection:text-emerald-900">
      {/* 7-CATEGORY NAVIGATION STRIP (For You, Fashion, Mobiles, Electronics, Beauty, Home, Appliances) */}
      <CategoryNavStrip
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => setSelectedCategory(slug)}
      />

      {/* 4. MAIN CONTENT CONTAINER (Split Layout: Filter Sidebar + Portrait Product Grid) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Mobile Filter Toggle Banner */}
        <div className="lg:hidden flex items-center justify-between pb-3 mb-2 border-b border-slate-100 w-full">
          <button
            type="button"
            onClick={() => setShowFilterSidebar(!showFilterSidebar)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition min-h-[38px]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showFilterSidebar ? 'rotate-180' : ''}`} />
          </button>
          <span className="text-xs text-slate-500 font-medium">
            {filteredProducts.length} items
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          {/* ================= LEFT FILTER SIDEBAR ================= */}
          <aside className={`${showFilterSidebar ? 'block' : 'hidden lg:block'} w-full lg:w-64 shrink-0 space-y-5 bg-white lg:pr-4`}>
              {/* Filter Top: Header & Clear All */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Filters
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-900 underline transition-colors"
                  >
                    CLEAR ALL
                  </button>
                )}
              </div>

              {/* Active Filter Chips with 'X' */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-semibold">
                      {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                      <button onClick={() => setSelectedCategory('')} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedPriceRanges.map((rId) => (
                    <span
                      key={rId}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-semibold"
                    >
                      {PRICE_RANGES.find((r) => r.id === rId)?.label}
                      <button
                        onClick={() => setSelectedPriceRanges((prev) => prev.filter((id) => id !== rId))}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedOrigins.map((orig) => (
                    <span
                      key={orig}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-semibold"
                    >
                      {orig}
                      <button
                        onClick={() => setSelectedOrigins((prev) => prev.filter((o) => o !== orig))}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {organicOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                      100% Organic
                      <button onClick={() => setOrganicOnly(false)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Search keyword inside filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 h-9 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Accordion 1: Categories */}
              <div className="border-b border-slate-100 pb-4">
                <button
                  type="button"
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-900 py-1"
                >
                  <span>Category ({categories.length})</span>
                  {categoryOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </button>
                {categoryOpen && (
                  <div className="mt-2.5 space-y-2 text-xs text-slate-600">
                    {categories.map((cat) => {
                      const isChecked = selectedCategory === cat.slug;
                      const count = products.filter((p) => {
                        const pCatSlug = typeof p.categoryId === 'object' && p.categoryId !== null ? (p.categoryId as any).slug : '';
                        const pCatId = typeof p.categoryId === 'object' && p.categoryId !== null ? (p.categoryId as any)._id?.toString() : String(p.categoryId || '');
                        return pCatSlug === cat.slug || pCatId === cat._id?.toString() || pCatSlug === cat._id?.toString();
                      }).length;
                      return (
                        <label key={cat._id} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900 group select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => setSelectedCategory(isChecked ? '' : cat.slug)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                          />
                          <span className="flex-1 text-[11px] flex items-center justify-between">
                            <span className="group-hover:text-slate-900">
                              {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({count})
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Accordion 2: Price Range */}
              <div className="border-b border-slate-100 pb-4">
                <button
                  type="button"
                  onClick={() => setPriceOpen(!priceOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-900 py-1"
                >
                  <span>Price Range</span>
                  {priceOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </button>
                {priceOpen && (
                  <div className="mt-2.5 space-y-2 text-xs text-slate-600">
                    {PRICE_RANGES.map((r) => {
                      const isChecked = selectedPriceRanges.includes(r.id);
                      return (
                        <label key={r.id} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedPriceRanges((prev) =>
                                isChecked ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                              );
                            }}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                          />
                          <span className="flex-1 text-[11px]">{r.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Accordion 3: Origin Hub / Region */}
              {availableOrigins.length > 0 && (
                <div className="border-b border-slate-100 pb-4">
                  <button
                    type="button"
                    onClick={() => setOriginOpen(!originOpen)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-900 py-1"
                  >
                    <span>Origin / Region ({availableOrigins.length})</span>
                    {originOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                  {originOpen && (
                    <div className="mt-2.5 space-y-2 text-xs text-slate-600">
                      {availableOrigins.map((orig) => {
                        const isChecked = selectedOrigins.includes(orig);
                        return (
                          <label key={orig} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedOrigins((prev) =>
                                  isChecked ? prev.filter((o) => o !== orig) : [...prev, orig]
                                );
                              }}
                              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                            />
                            <span className="flex-1 text-[11px]">{orig}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Accordion 4: Specialty */}
              <div className="border-b border-slate-100 pb-4">
                <button
                  type="button"
                  onClick={() => setSpecialtyOpen(!specialtyOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-900 py-1"
                >
                  <span>Specialty & Verified</span>
                  {specialtyOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </button>
                {specialtyOpen && (
                  <div className="mt-2.5 space-y-2 text-xs text-slate-600">
                    <label className="flex items-center gap-2.5 cursor-pointer hover:text-slate-900">
                      <input
                        type="checkbox"
                        checked={organicOnly}
                        onChange={(e) => setOrganicOnly(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                      />
                      <span className="flex-1 text-[11px] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        100% Organic & Chemical-Free
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </aside>

          {/* ================= RIGHT PRODUCT GRID (Exact portrait design from reference mockup) ================= */}
          <section className="flex-1 w-full space-y-5">
            {/* Top Grid Status & Sort Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">
                Showing <strong className="text-slate-900">{filteredProducts.length}</strong> items
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="font-bold text-slate-900 bg-transparent border-none text-xs focus:outline-none cursor-pointer pr-1"
                >
                  <option value="relevant">Most Relevant</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
            {loading ? (
              /* Skeleton Loader */
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="space-y-3 animate-pulse">
                    <div className="w-full aspect-[3/4] bg-slate-100 rounded-xl" />
                    <div className="h-3 bg-slate-100 rounded w-3/4 mx-auto" />
                    <div className="h-3 bg-slate-100 rounded w-1/3 mx-auto" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty state */
              <div className="text-center py-20 bg-slate-50 rounded-3xl p-8 space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No products match your active filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search or filters to browse all available LocalHaat products.
                </p>
                <Button onClick={handleClearAll} variant="outline" size="sm" className="text-xs">
                  Reset All Filters
                </Button>
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.has(product._id);
                  const effectivePrice = product.discountPrice || product.price;
                  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);

                  return (
                    <div
                      key={product._id}
                      className="group flex flex-col justify-between text-center cursor-pointer"
                    >
                      {/* Portrait Image Container (Aspect 3/4 like the reference mockup) */}
                      <div
                        onClick={() => router.push(`/marketplace/${product.slug}`)}
                        className="relative w-full aspect-[3/4] bg-[#f7f7f7] rounded-xl overflow-hidden shadow-2xs group-hover:shadow-md transition-all duration-300 cursor-pointer"
                      >
                        <img
                          src={
                            product.images?.[0] ||
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Badges */}
                        {product.isOrganic && (
                          <div className="absolute top-2.5 left-2.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 text-emerald-800 text-[10px] font-bold shadow-2xs backdrop-blur-xs">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              Organic
                            </span>
                          </div>
                        )}

                        {/* Heart Wishlist Icon Top Right */}
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(product._id, e)}
                          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            isWishlisted
                              ? 'bg-rose-50 text-rose-600 shadow-xs'
                              : 'bg-white/80 text-slate-400 hover:text-slate-900 hover:bg-white shadow-2xs'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                        </button>

                        {/* HOVER OVERLAY "ADD TO CART" BAR BUTTON (Exact reference feature on card 1) */}
                        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="w-full py-2.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-[11px] sm:text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            ADD TO CART
                          </button>
                        </div>
                      </div>

                      {/* Under-Image Metadata: Title, Price, and Variant Swatch Dots */}
                      <div className="pt-2.5 pb-1 space-y-1">
                        {/* Title - Click opens product detail page */}
                        <Link href={`/marketplace/${product.slug}`} className="block">
                          <h3 className="text-xs sm:text-[13px] font-medium text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1 px-1 cursor-pointer">
                            {product.title}
                          </h3>
                        </Link>

                        {/* Price with strikethrough if discounted */}
                        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm">
                          <span className="font-extrabold text-slate-950">
                            {formatCurrency(effectivePrice)}
                          </span>
                          {hasDiscount && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>

                        {/* Variant / Weight Swatch Dots (exact circular dots row from reference mockup) */}
                        <div className="flex items-center justify-center gap-1 pt-0.5">
                          {['#2d3748', '#4a5568', '#718096', '#cbd5e0'].map((color, idx) => (
                            <span
                              key={idx}
                              style={{ backgroundColor: color }}
                              className={`w-2.5 h-2.5 rounded-full border border-white shadow-2xs transition-transform hover:scale-125 ${
                                idx === 0 ? 'ring-1 ring-slate-900' : ''
                              }`}
                              title={product.unit || 'Standard Unit'}
                            />
                          ))}
                          <span className="text-[10px] text-slate-400 font-mono ml-1">
                            {product.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 5. FLOATING CART BASKET PILL (Bottom Right Quick Drawer Entry) */}
      {itemCount > 0 && (
        <aside aria-label="Shopping Cart Drawer Entry" className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => router.push('/cart')}
            className="flex items-center gap-3 bg-slate-950 text-white pl-4 pr-5 py-3 rounded-full shadow-2xl hover:bg-emerald-800 transition-all hover:scale-105 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            </div>
            <div className="text-left text-xs">
              <div className="font-extrabold tracking-tight">View Cart ({itemCount})</div>
              <div className="text-[11px] text-amber-300 font-mono">{formatCurrency(subtotal)}</div>
            </div>
          </button>
        </aside>
      )}

      {/* 6. SLIDE-OVER CART & CHECKOUT DRAWER */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Your Haat Basket</h3>
                <Badge variant="secondary" className="text-xs">
                  {itemCount} items
                </Badge>
              </div>
              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  setCheckoutStep(false);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {successOrder ? (
                /* Order Success View */
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-4 text-center">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-base">Order Confirmed!</h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      Order #{successOrder.order.orderNumber} placed successfully.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Secret 4-Digit Delivery PIN
                    </span>
                    <span className="text-2xl font-mono font-black text-emerald-700 tracking-widest">
                      {successOrder.parcel?.deliveryPin}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Provide to courier upon delivery
                    </span>
                  </div>
                  <a
                    href={`/track/${successOrder.parcel?.trackingNumber}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                  >
                    Track Live Consignment <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Your basket is empty. Browse items to add!</p>
                </div>
              ) : !checkoutStep ? (
                /* Item list */
                <div className="divide-y divide-slate-100 space-y-3">
                  {items.map(({ product, quantity }) => (
                    <div key={product._id} className="pt-3 flex items-center gap-3 text-xs">
                      <img
                        src={product.images?.[0] || ''}
                        alt={product.title}
                        className="w-12 h-12 object-cover rounded-lg bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">{product.title}</div>
                        <div className="text-slate-500 text-[11px]">
                          {formatCurrency(product.discountPrice || product.price)} × {quantity}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateQuantity(product._id, quantity - 1)}
                          className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-xs">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product._id, quantity + 1)}
                          className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Checkout Form */
                <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-3 text-xs">
                  <div className="font-bold text-slate-900 pb-1 border-b border-slate-100">
                    Delivery Address
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Address Line / Colony</label>
                    <Input
                      type="text"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="h-8 text-xs mt-1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500">City / Town</label>
                      <Input
                        type="text"
                        value={villageOrCity}
                        onChange={(e) => setVillageOrCity(e.target.value)}
                        className="h-8 text-xs mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500">District</label>
                      <Input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="h-8 text-xs mt-1"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Pincode</label>
                    <Input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="h-8 text-xs mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Payment Mode</label>
                    <select
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full h-8 rounded border border-slate-200 text-xs px-2 mt-1 bg-white"
                    >
                      <option value="cod">Cash on Delivery (Pay at Handover)</option>
                      <option value="razorpay">Razorpay / UPI Online</option>
                    </select>
                  </div>
                </form>
              )}
            </div>

            {/* Drawer Footer */}
            {items.length > 0 && !successOrder && (
              <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Est. Weight:</span>
                    <span className="font-mono">{totalWeightKg.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Hub / Delivery Fee:</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total:</span>
                    <span className="text-emerald-800">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {!checkoutStep ? (
                  <Button
                    onClick={() => setCheckoutStep(true)}
                    className="w-full bg-slate-950 hover:bg-emerald-800 text-white font-bold h-10 text-xs rounded-xl"
                  >
                    Proceed to Checkout
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCheckoutStep(false)}
                      className="flex-1 h-10 text-xs"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      form="checkout-form"
                      disabled={orderPlacing}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-10 text-xs"
                    >
                      {orderPlacing ? 'Confirming...' : 'Confirm Order'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
