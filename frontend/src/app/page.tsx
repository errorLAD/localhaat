'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product, Category, UserRole } from '../types';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import {
  Search,
  ShoppingCart,
  ShoppingBag,
  Heart,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Minus,
  Truck,
  MapPin,
  Store,
  ShieldCheck,
  Check,
  ExternalLink,
  Sparkles,
  Filter,
  ArrowRight,
  Package,
  Layers,
  Leaf,
  Info,
  User,
  UserCheck,
  Bike,
  Car,
  Bus,
  Train,
  ArrowDown,
  Play,
  Pause,
  CheckCircle2,
  HelpCircle,
  Zap,
  Lock,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  Shield,
  Coins,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CategoryNavStrip } from '../components/CategoryNavStrip';

export default function HomePage() {
  const router = useRouter();
  const { user, demoLogin, logout, isLoading: authLoading } = useAuth();
  const { items, addToCart, removeFromCart, updateQuantity, itemCount, subtotal } = useCart();

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedVillages, setSelectedVillages] = useState<string[]>([]);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'rating'>('recommended');
  const [sortOpen, setSortOpen] = useState(false);

  // Accordion UI State
  const [productTypeOpen, setProductTypeOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [villageOpen, setVillageOpen] = useState(true);
  const [specialtyOpen, setSpecialtyOpen] = useState(true);
  const [seeMoreCategories, setSeeMoreCategories] = useState(false);

  // Interactive UI State
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [portalsModalOpen, setPortalsModalOpen] = useState(false);
  const [trackCode, setTrackCode] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Transport visual flow state (Person / On Foot, Cycle, Bike, Car, Bus, Train)
  const [activeTransport, setActiveTransport] = useState<number>(1);
  const [transportAutoPlay, setTransportAutoPlay] = useState<boolean>(true);

  useEffect(() => {
    if (!transportAutoPlay) return;
    const interval = setInterval(() => {
      setActiveTransport((prev) => (prev + 1) % 6);
    }, 3200);
    return () => clearInterval(interval);
  }, [transportAutoPlay]);

  // Fetch initial data from backend API
  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        api.getProducts(),
        api.getCategories(),
      ]);
      if (prodRes.status === 'fulfilled' && prodRes.value?.products) {
        setProducts(prodRes.value.products);
      }
      if (catRes.status === 'fulfilled' && catRes.value?.categories) {
        setCategories(catRes.value.categories);
      }
    } catch (err) {
      console.error('Failed to load products from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle wishlist state
  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Handle Add to Cart with feedback
  const handleAddToCart = (product: Product, e?: React.MouseEvent, qty: number = 1) => {
    if (e) e.stopPropagation();
    addToCart(product, qty);
    setAddedItemNotice(product._id);
    setTimeout(() => {
      setAddedItemNotice((current) => (current === product._id ? null : current));
    }, 1800);
  };

  // Portal switch handler
  const handleLaunchPortal = async (role: UserRole, path: string) => {
    setPortalsModalOpen(false);
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  // Track live parcel submission
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackCode.trim()) {
      router.push(`/track/${trackCode.trim()}`);
    }
  };

  // Filter calculation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const catSlug = typeof p.categoryId === 'object' && p.categoryId ? p.categoryId.slug : '';
      if (catSlug) {
        counts[catSlug] = (counts[catSlug] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const villageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.originVillage) {
        counts[p.originVillage] = (counts[p.originVillage] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(q);
          const matchesDesc = p.description?.toLowerCase().includes(q);
          const matchesVillage = p.originVillage?.toLowerCase().includes(q);
          const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesVillage && !matchesTags) {
            return false;
          }
        }

        // Category filter (support both selectedCategory and selectedCategories)
        if (selectedCategory) {
          const catSlug = typeof p.categoryId === 'object' && p.categoryId ? (p.categoryId as any).slug : '';
          const catId = typeof p.categoryId === 'object' && p.categoryId ? (p.categoryId as any)._id?.toString() : String(p.categoryId || '');
          if (catSlug !== selectedCategory && catId !== selectedCategory) {
            return false;
          }
        } else if (selectedCategories.length > 0) {
          const catSlug = typeof p.categoryId === 'object' && p.categoryId ? (p.categoryId as any).slug : '';
          const catId = typeof p.categoryId === 'object' && p.categoryId ? (p.categoryId as any)._id?.toString() : String(p.categoryId || '');
          if (!selectedCategories.includes(catSlug) && !selectedCategories.includes(catId)) {
            return false;
          }
        }

        // Price range filter
        if (selectedPriceRanges.length > 0) {
          const effPrice = p.discountPrice || p.price;
          const matchPrice = selectedPriceRanges.some((range) => {
            if (range === 'under_200') return effPrice < 200;
            if (range === '200_300') return effPrice >= 200 && effPrice <= 300;
            if (range === '300_500') return effPrice > 300 && effPrice <= 500;
            if (range === '500_plus') return effPrice > 500;
            return false;
          });
          if (!matchPrice) return false;
        }

        // Village filter
        if (selectedVillages.length > 0) {
          if (!selectedVillages.includes(p.originVillage)) {
            return false;
          }
        }

        // Organic filter
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
        return 0; // recommended preserves original order
      });
  }, [products, searchQuery, selectedCategory, selectedCategories, selectedPriceRanges, selectedVillages, organicOnly, sortBy]);

  const activeFiltersCount =
    selectedCategories.length +
    selectedPriceRanges.length +
    selectedVillages.length +
    (organicOnly ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSelectedVillages([]);
    setOrganicOnly(false);
    setSearchQuery('');
  };

  const sortLabels = {
    recommended: 'Recommended',
    price_asc: 'Price: Low to High',
    price_desc: 'Price: High to Low',
    rating: 'Highest Rated',
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 space-y-6 sm:space-y-7 w-full">
        {/* 2. HERO BANNER (Compact, balanced and modern with lighter mint tone) */}
        <section className="relative overflow-hidden rounded-[24px] sm:rounded-[30px] bg-[#c8eee0] bg-gradient-to-r from-[#dcf6ec] via-[#c8eee0] to-[#d4f3e7] border border-[#b6e8d4]/70 p-5 sm:p-7 lg:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 border border-emerald-600/20 text-emerald-900 text-[11px] font-semibold backdrop-blur-xs">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Built for Rural India. Built Around Local Networks.
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-emerald-950 tracking-tight leading-tight">
                The Digital Backbone for <br />
                <span className="text-emerald-800">Rural Commerce & Inter-Village Logistics</span>
              </h1>

              <p className="text-emerald-900/90 text-xs sm:text-sm leading-relaxed max-w-xl font-normal">
                Local Commerce. Local Logistics. Connected Villages. Connecting customers, businesses, logistics partners, travelling commuters, and village agents through verified custody handovers.
              </p>

              {/* Hero Action CTA Buttons: Shop & Send Parcel */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop</span>
                </Link>
                <Link
                  href="/parcels"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 border border-emerald-300/80 font-bold text-xs sm:text-sm shadow-2xs transition-all hover:scale-105 active:scale-95"
                >
                  <Package className="w-4 h-4 text-emerald-700" />
                  <span>Send Parcel</span>
                </Link>
              </div>
            </div>

            {/* Right Visual (E-Commerce Floating Illustration / GIF) */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              <div className="relative w-full max-w-xs sm:max-w-sm rounded-xl overflow-hidden shadow-xs hover:scale-102 transition-all duration-300">
                <img
                  src="/hero-animation.png"
                  alt="LocalHaat Digital Commerce"
                  className="w-full h-auto object-cover rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* QUICK SERVICE ENTRYPOINTS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <a
            href="/parcels"
            className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                Send a Parcel
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Peer-to-peer fast delivery</p>
            </div>
          </a>

          <a
            href="#track-section"
            className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors flex items-center gap-1">
                Track Live
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">3-tier OTP custody status</p>
            </div>
          </a>

          <a
            href="#haat"
            className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-700 group-hover:text-white transition-all shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1">
                Shop Haat
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Authentic direct products</p>
            </div>
          </a>

          <a
            href="/partner"
            className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3.5 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors flex items-center gap-1">
                Earn on Commute
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Carry parcels along your way</p>
            </div>
          </a>
        </section>

        {/* 7-CATEGORY TOP NAVIGATION STRIP (For You, Fashion, Mobiles, Electronics, Beauty, Home, Appliances) */}
        <section className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <CategoryNavStrip
            selectedCategory={selectedCategory}
            onSelectCategory={(slug) => {
              setSelectedCategory(slug);
              setSelectedCategories(slug ? [slug] : []);
            }}
          />
        </section>

        {/* HAAT PRODUCTS CATALOG SECTION */}
        <section id="haat" className="w-full space-y-4">
          {/* Section Headline */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedCategory
                  ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                  : 'For You — Featured Haat Catalog'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedCategory
                  ? `Showing top products in ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
                  : 'Curated products with fast inter-village logistics delivery'}
              </p>
            </div>
            <Link
              href="/marketplace"
              className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1 group"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            /* Skeleton Loader */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-[24px] bg-white border border-slate-100 p-3 shadow-xs flex flex-col justify-between h-[290px] animate-pulse"
                >
                  <div className="w-full h-40 bg-slate-100 rounded-[18px]" />
                  <div className="space-y-1.5 mt-2.5 px-1">
                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                    <div className="h-3.5 bg-slate-100 rounded w-4/5" />
                    <div className="h-3.5 bg-slate-100 rounded w-1/4" />
                    <div className="h-8 bg-slate-200 rounded-full w-full mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 bg-[#f4f6f8] rounded-2xl p-6 space-y-3">
              <Package className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No products match your filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try resetting filters to view all products.
              </p>
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="rounded-xl border-slate-300 text-xs font-semibold text-emerald-800"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Products Grid: Exactly 4 products shown on landing page */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
              {filteredProducts.slice(0, 4).map((product) => {
                const isWishlisted = wishlist.has(product._id);
                const isJustAdded = addedItemNotice === product._id;
                const displayPrice = product.discountPrice || product.price;
                const categoryName =
                  typeof product.categoryId === 'object' && product.categoryId
                    ? product.categoryId.name
                    : product.originVillage
                    ? `${product.originVillage} Haat`
                    : 'LocalHaat Pure';

                return (
                  <div
                    key={product._id}
                    onClick={() => {
                      setQuickViewProduct(product);
                      setQuickViewQty(1);
                    }}
                    className="group cursor-pointer rounded-[20px] sm:rounded-[24px] bg-white border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] p-2 sm:p-3.5 relative flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
                  >
                    {/* Top Rounded Image Box with Soft Light-Grey Background */}
                    <div className="w-full h-32 xs:h-36 sm:h-44 rounded-[14px] sm:rounded-[18px] bg-[#f2f4f6] p-2 sm:p-2.5 relative flex flex-col justify-between items-center overflow-hidden">
                      {/* Top Bar inside Image Box: "Best Seller" pill on left, Red Heart Wishlist on right */}
                      <div className="w-full flex items-center justify-between z-10">
                        <span className="bg-white/95 text-slate-700 text-[9px] sm:text-[10px] font-semibold px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs tracking-tight truncate max-w-[70%]">
                          {product.isOrganic ? '100% Organic' : product.rating >= 4.8 ? 'Top Rated' : 'Best Seller'}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(product._id, e)}
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 flex items-center justify-center shadow-2xs transition-transform active:scale-90 hover:scale-105 shrink-0 ${
                            isWishlisted ? 'scale-105' : ''
                          }`}
                          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                        >
                          <Heart
                            className={`w-3 sm:w-3.5 h-3 sm:h-3.5 fill-rose-500 text-rose-500 ${
                              isWishlisted ? 'scale-110' : 'opacity-90'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Centered Product Image */}
                      <div className="flex-1 flex items-center justify-center w-full px-1 sm:px-2 py-0.5">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="max-h-20 sm:max-h-28 max-w-[90%] object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                            <Package className="w-5 sm:w-6 h-5 sm:h-6" />
                          </div>
                        )}
                      </div>

                      {/* Carousel / Pagination Dots */}
                      <div className="flex items-center justify-center gap-1 pb-0.5 z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 transition-all"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      </div>
                    </div>

                    {/* Product Typography & Pricing below the grey image container - ALWAYS VISIBLE */}
                    <div className="pt-2 sm:pt-2.5 px-0.5 pb-0.5">
                      {/* Green Category / Brand label */}
                      <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 tracking-tight block truncate">
                        {categoryName}
                      </span>

                      {/* Left-Aligned Bold Product Title */}
                      <h3 className="text-xs sm:text-[14px] font-bold text-slate-900 tracking-tight line-clamp-2 sm:line-clamp-1 mt-0.5 group-hover:text-emerald-700 transition-colors" title={product.title}>
                        {product.title}
                      </h3>

                      {/* Left-Aligned Price */}
                      <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
                        <span className="text-xs sm:text-[14px] font-bold text-slate-900">
                          {formatCurrency(displayPrice)}
                        </span>
                        {product.discountPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>

                      {/* Full-Width Dark Pill "Buy Now" Button (touch target friendly) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product, e);
                          setCartDrawerOpen(true);
                        }}
                        className={`w-full mt-2 sm:mt-2.5 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide transition-all duration-200 shadow-2xs active:scale-[0.98] flex items-center justify-center gap-1.5 min-h-[36px] sm:min-h-[42px] ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#242424] hover:bg-black text-white'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Added</span>
                          </>
                        ) : (
                          <span>Buy Now</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

              {filteredProducts.length > 4 && (
                <div className="flex justify-center pt-3">
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-98"
                  >
                    <span>Explore All Products ({filteredProducts.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </>
          )}
        </section>

        {/* 6. HOW LOCAL HAAT WORKS: VISUAL ANIMATED LOGISTICS FLOW */}
        <section className="bg-white rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] space-y-10 mt-10">
          {/* Top Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Tier Shared Logistics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              How LocalHaat Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              A seamless commerce & logistics pipeline connecting senders and receivers across cities, towns, and villages through verified 3-tier custody and flexible shared transport.
            </p>
          </div>

          {/* 5-STAGE LOGISTICS PIPELINE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                5-Stage Verified Custody Chain
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
                3-Tier Security
              </span>
            </div>

            {/* Steps Sequence Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 relative">
              {/* Step 1: Customer */}
              <div className="group rounded-2xl bg-[#f8fafc] hover:bg-emerald-50/50 p-4 border border-slate-200/80 hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      STEP 01
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      Customer
                    </h3>
                    <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                      Cities & Towns • Senders & Buyers
                    </p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Sends any parcel, package, or orders products across the LocalHaat network.
                    </p>
                  </div>
                </div>
                {/* Arrow to Next Step (Desktop) */}
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs items-center justify-center text-slate-400">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                {/* Arrow to Next Step (Mobile) */}
                <div className="flex md:hidden justify-center pt-2 text-slate-300">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>

              {/* Step 2: Create Order / Parcel */}
              <div className="group rounded-2xl bg-[#fffbeb] hover:bg-amber-50 p-4 border border-amber-200/80 hover:border-amber-400 transition-all shadow-2xs flex flex-col justify-between relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-amber-200 text-amber-900 shadow-2xs">
                      STEP 02
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shadow-2xs">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                      Create Order / Parcel
                    </h3>
                    <p className="text-[11px] font-medium text-amber-700 mt-0.5">
                      Any Package • QR & Tracking
                    </p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      System automatically assigns tracking ID, calculates weight tier, and provisions 3-tier secure verification codes.
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs items-center justify-center text-slate-400">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div className="flex md:hidden justify-center pt-2 text-slate-300">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>

              {/* Step 3: Verified Logistics Partner */}
              <div className="group rounded-2xl bg-[#f8fafc] hover:bg-emerald-50/50 p-4 border border-slate-200/80 hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      STEP 03
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shadow-2xs">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      Logistics Partner
                    </h3>
                    <p className="text-[11px] font-medium text-emerald-700 mt-0.5">
                      Shared Route Transit
                    </p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Verified transporter or commuter matching the route scans pickup OTP and carries the consignment along their corridor.
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs items-center justify-center text-slate-400">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div className="flex md:hidden justify-center pt-2 text-slate-300">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>

              {/* Step 4: Local Hub / Agent */}
              <div className="group rounded-2xl bg-[#fffbeb] hover:bg-amber-50 p-4 border border-amber-200/80 hover:border-amber-400 transition-all shadow-2xs flex flex-col justify-between relative">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-amber-200 text-amber-900 shadow-2xs">
                      STEP 04
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shadow-2xs">
                      <Store className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                      Local Hub / Agent
                    </h3>
                    <p className="text-[11px] font-medium text-amber-700 mt-0.5">
                      City & Local Drop Points
                    </p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Local drop hub or agent inspects the parcel, completes handover verification, and holds it safely for collection or delivery.
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs items-center justify-center text-slate-400">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <div className="flex md:hidden justify-center pt-2 text-slate-300">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>

              {/* Step 5: Receiver */}
              <div className="group rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-4 border border-emerald-300 transition-all shadow-2xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-700 text-white shadow-2xs">
                      STEP 05
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">
                      Receiver
                    </h3>
                    <p className="text-[11px] font-medium text-emerald-700 mt-0.5">
                      Any City or Town • OTP Verification
                    </p>
                    <p className="text-xs text-emerald-900/80 mt-2 leading-relaxed">
                      Recipient provides final delivery OTP at their home, shop, or local hub to complete delivery securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SHARED MULTIMODAL TRANSPORT ROUTE HIGHWAY */}
          <div className="rounded-[26px] bg-gradient-to-br from-emerald-50/70 via-slate-50 to-amber-50/60 p-5 sm:p-8 border border-emerald-200/70 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                  Shared Logistics Concept
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>Flexible Shared Transport Options</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  LocalHaat utilizes everyday journeys by regular commuters traveling that direction anyway, bicycles, bikes, cars, buses, and trains to deliver parcels affordably and rapidly.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setTransportAutoPlay(!transportAutoPlay)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    transportAutoPlay
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title={transportAutoPlay ? 'Pause auto-cycle' : 'Play auto-cycle'}
                >
                  {transportAutoPlay ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>Simulating Route</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>Resume Simulation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ANIMATED ROUTE TRACK WITH MOVING CONSIGNMENT GLIDE */}
            <div className="relative pt-2 pb-2">
              {/* Highway Track Container */}
              <div className="relative h-14 bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center px-4 sm:px-8 border border-slate-800">
                {/* Center Road Dashed Line */}
                <div className="absolute inset-x-0 h-0.5 border-b-2 border-dashed border-amber-400/70 animate-dash-flow z-0" />

                {/* Animated Moving Vehicle / Parcel Indicator along the Route */}
                {transportAutoPlay && (
                  <div className="absolute top-1/2 -translate-y-1/2 z-20 animate-route-glide pointer-events-none flex items-center gap-1.5 bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full shadow-lg text-[11px] font-bold">
                    <span className="text-sm">📦</span>
                    <span className="hidden sm:inline text-[10px]">Parcel En-Route</span>
                  </div>
                )}

                {/* 6 Transport Waypoint Markers on Highway including Person / Commuter */}
                <div className="relative z-10 w-full flex items-center justify-between">
                  {[
                    { id: 0, icon: '🚶‍♂️', label: 'Person' },
                    { id: 1, icon: '🚲', label: 'Cycle' },
                    { id: 2, icon: '🏍️', label: 'Bike' },
                    { id: 3, icon: '🚗', label: 'Car' },
                    { id: 4, icon: '🚌', label: 'Bus' },
                    { id: 5, icon: '🚆', label: 'Train' },
                  ].map((item) => {
                    const isSelected = activeTransport === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTransport(item.id);
                          setTransportAutoPlay(false);
                        }}
                        className={`flex flex-col items-center gap-1 transition-all group ${
                          isSelected ? 'scale-110' : 'opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg transition-all shadow-md ${
                            isSelected
                              ? 'bg-amber-400 ring-4 ring-amber-400/30 scale-110 shadow-amber-500/50'
                              : 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <span
                          className={`text-[10px] font-bold tracking-tight transition-colors hidden sm:block ${
                            isSelected ? 'text-amber-300 font-extrabold' : 'text-slate-400'
                          }`}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* VEHICLE MODES INTERACTIVE TILES (Person -> Cycle -> Bike -> Car -> Bus -> Train) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                {
                  id: 0,
                  name: 'Person / Commuter',
                  emoji: '🚶‍♂️',
                  range: 'Any Distance',
                  speed: 'Their Schedule',
                  cap: 'Up to 10 kg',
                  tag: 'Travels That Way Anyway',
                  desc: 'A person already traveling in that direction anyway — taking parcels along whichever route or method they decide.',
                },
                {
                  id: 1,
                  name: 'Cycle',
                  emoji: '🚲',
                  range: '1–3 km',
                  speed: '~10 km/h',
                  cap: 'Up to 10 kg',
                  tag: 'Hyper-Local Delivery',
                  desc: 'Short neighborhood runs, local shop pickups, and swift doorstep deliveries.',
                },
                {
                  id: 2,
                  name: 'Bike',
                  emoji: '🏍️',
                  range: '3–15 km',
                  speed: '~35 km/h',
                  cap: 'Up to 30 kg',
                  tag: 'Express Courier',
                  desc: 'Fastest city, town, and local dispatch for daily goods, medicines & parcels.',
                },
                {
                  id: 3,
                  name: 'Car / Van',
                  emoji: '🚗',
                  range: '15–40 km',
                  speed: '~50 km/h',
                  cap: 'Up to 450 kg',
                  tag: 'Consolidated Cargo',
                  desc: 'Cars, vans, and delivery vehicles transporting packages, cartons & clustered hauls.',
                },
                {
                  id: 4,
                  name: 'Bus / Transit',
                  emoji: '🚌',
                  range: '40–80 km',
                  speed: '~45 km/h',
                  cap: 'Up to 250 kg',
                  tag: 'Inter-City Highway',
                  desc: 'Scheduled public and private transit buses carrying parcel cargo across corridors.',
                },
                {
                  id: 5,
                  name: 'Rail Network',
                  emoji: '🚆',
                  range: '80+ km',
                  speed: '~70 km/h',
                  cap: 'Multi-Quintal',
                  tag: 'Long Distance Rail',
                  desc: 'Passenger and express freight trains moving shipments and bulk parcels reliably across regions.',
                },
              ].map((vehicle) => {
                const isSelected = activeTransport === vehicle.id;
                return (
                  <div
                    key={vehicle.id}
                    onClick={() => {
                      setActiveTransport(vehicle.id);
                      setTransportAutoPlay(false);
                    }}
                    className={`cursor-pointer rounded-2xl p-3.5 transition-all duration-200 border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20 translate-y-[-2px]'
                        : 'bg-white/80 hover:bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{vehicle.emoji}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {vehicle.range}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1">
                        {vehicle.name}
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </h4>
                      <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                        {vehicle.tag}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                        {vehicle.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-500">
                      <span>Speed: <strong className="text-slate-700">{vehicle.speed}</strong></span>
                      <span>Cap: <strong className="text-slate-700">{vehicle.cap}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanatory Banner */}
            <div className="rounded-xl bg-white/90 border border-emerald-200/80 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
                  ✓
                </span>
                <span className="text-slate-700">
                  <strong>Zero Empty Miles:</strong> Commuters and transporters earn extra income on routes they are already traveling by carrying matched parcels across cities and towns.
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
                  Smart Shared Fleet
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE LOCALHAAT */}
        <section className="bg-white rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] space-y-8 mt-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Platform Advantages</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Why People & Businesses Choose LocalHaat
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Built on shared transit infrastructure, zero-compromise security codes, and hyper-transparent handover logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100/90 hover:border-emerald-300 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                3-Tier Custody Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                4-digit pickup OTP, 4-digit mid-mile hub transfer code, and 4-digit recipient PIN. No custody change occurs without digital authorization.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 to-white border border-amber-100/90 hover:border-amber-300 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Zero Empty Miles & Low Rates
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                By utilizing commuters and existing vehicles traveling that route anyway, senders save significantly while reducing carbon emissions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 hover:border-slate-400 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Every City, Town & Drop Hub
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless connectivity between metro hubs, district centers, and neighborhood drop stores where traditional courier firms struggle.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100/90 hover:border-emerald-300 hover:shadow-xs transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Any Parcel, Package or Product
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Documents, smartphones, electronics, garments, or everyday marketplace goods. From small parcels to heavy multi-kg consignments.
              </p>
            </div>
          </div>
        </section>

        {/* THE LOCALHAAT ECOSYSTEM */}
        <section className="bg-white rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] space-y-8 mt-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <span>The LocalHaat Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              An Open Logistics & Commerce Ecosystem
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Connecting senders, everyday commuters, local shop drop points, and businesses into one seamless loop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Senders & Shoppers */}
            <div className="group rounded-2xl bg-[#f8fafc] hover:bg-emerald-50/50 p-5 border border-slate-200/90 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Senders & Shoppers</h3>
                  <span className="text-[11px] font-semibold text-emerald-700">Doorstep & Hub Transit</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Send any package affordably with live GPS tracking, or order direct authentic goods straight from verified sellers.
                </p>
              </div>
              <a
                href="/parcels"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 pt-2"
              >
                Send a Parcel <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Card 2: Commuters & Transporters */}
            <div className="group rounded-2xl bg-[#fffbeb] hover:bg-amber-50 p-5 border border-amber-200/90 hover:border-amber-400 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Commuters & Partners</h3>
                  <span className="text-[11px] font-semibold text-amber-700">Earn on Your Daily Route</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Traveling by bike, car, bus, or train? Carry matched consignments along your corridor and earn on trips you take anyway.
                </p>
              </div>
              <a
                href="/partner"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:text-amber-900 pt-2"
              >
                Start Delivering <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Card 3: Local Hubs & Agents */}
            <div className="group rounded-2xl bg-[#f8fafc] hover:bg-emerald-50/50 p-5 border border-slate-200/90 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Local Hubs & Stores</h3>
                  <span className="text-[11px] font-semibold text-emerald-700">Monetize Shop Space</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Shopkeepers and community centers become verified LocalHaat hubs. Safely hold parcels and earn commission per handover.
                </p>
              </div>
              <a
                href="/agent"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 pt-2"
              >
                Become a Drop Hub <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            {/* Card 4: Merchants & Businesses */}
            <div className="group rounded-2xl bg-[#f8fafc] hover:bg-blue-50/50 p-5 border border-slate-200/90 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Merchants & Sellers</h3>
                  <span className="text-[11px] font-semibold text-blue-700">Direct Order Fulfillment</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  List your products, dispatch orders with verified pickup codes, and receive direct escrow-secured settlements.
                </p>
              </div>
              <a
                href="/business"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:text-blue-800 pt-2"
              >
                Business Portal <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>

        {/* QUICK TRACKING FOOTPRINT SECTION */}
        <section id="track-section" className="bg-emerald-50/50 rounded-3xl p-6 sm:p-8 border border-emerald-200/70 mt-10">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <Badge variant="outline" className="border-emerald-300 text-emerald-800 text-xs font-semibold">
              Live Parcel Verification
            </Badge>
            <h2 className="text-2xl font-bold text-emerald-900">
              Track Your LocalHaat Consignment
            </h2>
            <p className="text-xs sm:text-sm text-emerald-950/70">
              Check real-time multi-carrier custody status, GPS waypoint simulation, and 3-tier verification codes.
            </p>

            <form onSubmit={handleTrackSubmit} className="flex items-center gap-2 max-w-md mx-auto pt-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. LH-TRK-904128"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  className="w-full h-11 pl-4 pr-3 text-xs sm:text-sm rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-11 px-5 rounded-xl text-xs">
                Track Live
              </Button>
            </form>

            <div className="flex items-center justify-center gap-3 text-xs text-gray-500 pt-1">
              <span>Try test codes:</span>
              <button
                type="button"
                onClick={() => setTrackCode('LH-TRK-904128')}
                className="underline hover:text-emerald-700 font-mono"
              >
                LH-TRK-904128
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setTrackCode('LH-TRK-710492')}
                className="underline hover:text-emerald-700 font-mono"
              >
                LH-TRK-710492
              </button>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="bg-white rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] space-y-6 mt-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything you need to know about parcel booking, security verification, and commuter transit.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3 pt-2">
            {[
              {
                q: 'Can anyone send any parcel through LocalHaat?',
                a: 'Yes! Anyone can send personal packages, documents, electronics, apparel, gifts, and daily items across cities, towns, and local drop hubs. Simply create an order on the Parcels page to get an instant tracking ID and pickup verification code.',
              },
              {
                q: 'How does LocalHaat guarantee parcel safety during transit?',
                a: 'LocalHaat uses a strict 3-tier digital custody model: a 4-digit pickup OTP when handing over to the transporter, a 4-digit handover code at intermediary hubs, and a 4-digit recipient PIN for final delivery. No handover is recognized without cryptographic confirmation.',
              },
              {
                q: 'How do regular commuters earn money with LocalHaat?',
                a: 'If you travel between towns or neighborhoods by cycle, motorcycle, car, bus, or train, you can register as a Logistics Partner. You will see parcel requests traveling in the exact same direction. Accept the match, transport the parcel, and get paid instantly upon verified handover.',
              },
              {
                q: 'What is the difference between doorstep delivery and local hub pickup?',
                a: 'Senders can opt for direct doorstep delivery or drop off/collect parcels at verified neighborhood hubs (local shops or agents). Hub collection gives senders maximum flexibility and lower delivery fees.',
              },
              {
                q: 'How can I track my shipment in real-time?',
                a: 'Enter your tracking number (e.g. LH-TRK-904128) in the live tracker above or visit the dedicated tracking page. You will see current custodian info, GPS waypoint progression, and confirmed milestone timestamps.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden transition-all bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-transform ${
                        isOpen
                          ? 'rotate-180 bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-950 p-6 sm:p-10 text-white text-center shadow-lg mt-10">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Get Started With LocalHaat
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Send a Parcel or Explore the Marketplace?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
              Join thousands of senders, commuters, local hubs, and businesses across the country on India&apos;s verified shared logistics network.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/parcels"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
              >
                <Package className="w-4 h-4" />
                Book Parcel Delivery
              </a>
              <a
                href="#haat"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/25 backdrop-blur-xs transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Explore Marketplace
              </a>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/25 backdrop-blur-xs transition-all"
              >
                About LocalHaat
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Image Preview */}
              <div className="rounded-2xl bg-[#f4f6f8] p-6 flex items-center justify-center h-64">
                <img
                  src={quickViewProduct.images?.[0] || ''}
                  alt={quickViewProduct.title}
                  className="max-h-56 max-w-full object-contain drop-shadow-sm"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-800 text-[10px] font-bold uppercase mb-1">
                    {quickViewProduct.originVillage} Haat
                  </Badge>
                  <h3 className="text-xl font-bold text-slate-800">
                    {quickViewProduct.title}
                  </h3>
                  <div className="flex items-center gap-1 text-amber-500 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                    <span className="text-xs text-slate-500 ml-1">
                      ({quickViewProduct.reviewCount || 42} reviews)
                    </span>
                  </div>
                </div>

                <div className="text-2xl font-black text-emerald-700">
                  {formatCurrency(quickViewProduct.discountPrice || quickViewProduct.price)}
                  {quickViewProduct.discountPrice && (
                    <span className="text-sm font-normal text-slate-400 line-through ml-2">
                      {formatCurrency(quickViewProduct.price)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-emerald-200 rounded-xl bg-emerald-50/40 p-1">
                    <button
                      onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}
                      className="p-1 hover:bg-white rounded-lg text-emerald-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-emerald-900">
                      {quickViewQty}
                    </span>
                    <button
                      onClick={() => setQuickViewQty(quickViewQty + 1)}
                      className="p-1 hover:bg-white rounded-lg text-emerald-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Button
                    onClick={() => {
                      handleAddToCart(quickViewProduct, undefined, quickViewQty);
                      setQuickViewProduct(null);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 text-xs"
                  >
                    Add {quickViewQty} to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLIDE-OVER CART DRAWER */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-800">Your Basket</h3>
                <span className="text-xs text-slate-500">({itemCount} items)</span>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <ShoppingCart className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs">Your basket is currently empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center border border-gray-200 shrink-0">
                        <img
                          src={item.product.images?.[0] || ''}
                          alt={item.product.title}
                          className="max-h-10 max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                          {item.product.title}
                        </h4>
                        <span className="text-xs font-semibold text-emerald-700">
                          {formatCurrency(item.product.discountPrice || item.product.price)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-600 hover:bg-gray-100 text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-emerald-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-600 hover:bg-gray-100 text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-extrabold text-emerald-800">{formatCurrency(subtotal)}</span>
              </div>
              <Button
                disabled={items.length === 0}
                onClick={() => {
                  setCartDrawerOpen(false);
                  router.push('/marketplace');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl py-3 text-xs"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PORTALS & DEMO LOGIN MODAL */}
      {portalsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-emerald-950">
                  Select Demo Portal
                </h3>
                <p className="text-xs text-slate-500">
                  Switch roles instantly to test all 5 participants in the rural supply chain.
                </p>
              </div>
              <button
                onClick={() => setPortalsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { role: 'customer' as UserRole, title: 'Customer', desc: 'Shop marketplace & track orders', icon: ShoppingCart, color: 'text-emerald-700 bg-emerald-50' },
                { role: 'logistics_partner' as UserRole, title: 'Logistics Partner', desc: 'Pickups & commuter fleet', icon: Truck, color: 'text-blue-700 bg-blue-50' },
                { role: 'village_agent' as UserRole, title: 'Local Hub Agent', desc: 'Drop point & delivery PINs', icon: MapPin, color: 'text-amber-700 bg-amber-50' },
                { role: 'business' as UserRole, title: 'Merchant / Seller', desc: 'Manage inventory & dispatches', icon: Store, color: 'text-orange-700 bg-orange-50' },
                { role: 'admin' as UserRole, title: 'Platform Admin', desc: 'Network telemetry & payouts', icon: ShieldCheck, color: 'text-purple-700 bg-purple-50' },
              ].map(({ role, title, desc, icon: Icon, color }) => (
                <button
                  key={role}
                  disabled={authLoading}
                  onClick={() => handleLaunchPortal(role, role === 'customer' ? '/marketplace' : `/${role.replace('_', '/')}`)}
                  className="flex items-start gap-3 p-3 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all group"
                >
                  <div className={`p-2 rounded-xl ${color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {user && (
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Signed in as <strong>{user.name}</strong> ({user.role})
                </span>
                <button
                  onClick={() => {
                    logout();
                    setPortalsModalOpen(false);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
