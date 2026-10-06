'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  Play,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Package,
  ShieldCheck,
  Check,
  Truck,
  MapPin,
  ArrowLeft,
  Heart,
  Share2,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Product } from '../../../types';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { formatCurrency } from '../../../lib/utils';
import { Button } from '../../../components/ui/button';

// Color & Variant palettes for pastel cards
const PASTEL_PALETTE = ['bg-[#ece6dd]', 'bg-[#f5e6b3]', 'bg-[#dcd9f8]', 'bg-[#f8d4d8]', 'bg-[#d8eedf]'];

// Customer social proof avatar photos
const SOCIAL_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { user } = useAuth();
  const { addToCart, items, itemCount, subtotal } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery & Options State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Fetch product data by slug
  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getProductBySlug(slug);
        if (res.product) {
          setProduct(res.product);
        } else {
          setError('Product not found.');
        }
      } catch (err: any) {
        console.error('Error fetching product detail:', err);
        setError(err.message || 'Unable to load product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Set SEO document title and track product view
  useEffect(() => {
    if (product) {
      document.title = `${product.title} | Buy Online | LocalHaat`;
      try {
        const { analyticsEvents } = require('../../../lib/analytics');
        analyticsEvents.viewItem({
          id: product._id,
          title: product.title,
          price: product.discountPrice || product.price,
          category: typeof product.categoryId === 'object' ? product.categoryId?.name : undefined,
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [product]);

  // Dynamic variants based on category or product type
  const variantOptions = useMemo(() => {
    if (!product) return [];
    const catSlug = typeof product.categoryId === 'object' ? (product.categoryId as any)?.slug || '' : '';
    const titleLower = product.title.toLowerCase();

    if (catSlug.includes('rice') || titleLower.includes('rice') || titleLower.includes('basmati')) {
      return ['Aged 2-Year Reserve', 'Traditional Harvest', 'Select Pure Grain'];
    }
    if (catSlug.includes('daal') || titleLower.includes('daal') || titleLower.includes('pulse')) {
      return ['Unpolished Desi', 'Organic Certified Farm', 'Hand-Cleaned Purity'];
    }
    if (catSlug.includes('aata') || titleLower.includes('aata') || titleLower.includes('sattu') || titleLower.includes('flour')) {
      return ['Cold Stone-Ground Chakki', '100% Whole Wheat Bran-Intact', 'Multi-Seed Blend'];
    }
    if (catSlug.includes('fmcg') || catSlug.includes('oil') || titleLower.includes('oil') || titleLower.includes('ghee')) {
      return ['Wood-Churned Cold Press', 'Single Origin Pure Harvest', 'Virgin Extra Natural'];
    }
    if (catSlug.includes('household') || catSlug.includes('clay') || titleLower.includes('handi') || titleLower.includes('tawa') || titleLower.includes('copper')) {
      return ['Natural Riverbank Terracotta', 'Wood-Kiln Seasoned', 'Pure Ayurvedic Metal'];
    }
    if (catSlug.includes('personal') || titleLower.includes('honey') || titleLower.includes('soap') || titleLower.includes('oil')) {
      return ['Wild Raw Forest', 'Cold-Process Herbal Extract', 'Classical Ayurvedic Formulation'];
    }
    if (catSlug.includes('spice') || titleLower.includes('turmeric') || titleLower.includes('pepper') || titleLower.includes('masala')) {
      return ['Organically Sun-Dried', 'Stone Pounded High-Aroma', 'Whole Cluster Pods'];
    }
    return ['LocalHaat Pure Reserve', 'Traditional Select', 'Artisan Heritage'];
  }, [product]);

  // Dynamic pack sizes based on product type
  const sizeOptions = useMemo(() => {
    if (!product) return [];
    const catSlug = typeof product.categoryId === 'object' ? (product.categoryId as any)?.slug || '' : '';
    const titleLower = product.title.toLowerCase();

    if (catSlug.includes('rice') || titleLower.includes('rice')) {
      return ['1 kg', '2 kg', '5 kg', '10 kg Pack'];
    }
    if (catSlug.includes('daal') || titleLower.includes('daal')) {
      return ['500 g', '1 kg', '2 kg', '5 kg Pack'];
    }
    if (catSlug.includes('aata') || titleLower.includes('aata') || titleLower.includes('sattu')) {
      return ['1 kg', '2 kg', '5 kg', '10 kg Bag'];
    }
    if (catSlug.includes('oil') || titleLower.includes('oil') || titleLower.includes('ghee')) {
      return ['500 ml', '1 Litre', '2 Litre', '5 Litre Can'];
    }
    if (catSlug.includes('spice') || titleLower.includes('masala') || titleLower.includes('turmeric') || titleLower.includes('pepper')) {
      return ['100 g', '250 g', '500 g', '1 kg Pack'];
    }
    if (catSlug.includes('household') || titleLower.includes('handi') || titleLower.includes('tawa')) {
      return ['Standard (1-2 Portions)', 'Medium (3-4 Portions)', 'Family Festive Size'];
    }
    if (titleLower.includes('soap')) {
      return ['Single Bar (125g)', 'Pack of 3 (375g)', 'Family Pack of 6'];
    }
    return [product.unit || 'Standard Unit', 'Duo Pack', 'Value Pack'];
  }, [product]);

  // Set default variant & size upon product load
  useEffect(() => {
    if (variantOptions.length > 0 && !selectedVariant) {
      setSelectedVariant(variantOptions[0]);
    }
    if (sizeOptions.length > 0 && !selectedSize) {
      setSelectedSize(sizeOptions[1] || sizeOptions[0]);
    }
  }, [variantOptions, sizeOptions]);

  // Extended gallery images (hero image + alternate angles)
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const baseImg = product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
    if (product.images && product.images.length > 1) {
      return product.images;
    }
    // Contextual secondary angle photos for rich presentation
    return [
      baseImg,
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    ];
  }, [product]);

  // Add to cart action
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
    setCartDrawerOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading LocalHaat product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center space-y-4 shadow-sm border border-slate-100">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
          <p className="text-xs text-slate-500">
            {error || 'The product you are looking for is currently unavailable or has been archived.'}
          </p>
          <Button onClick={() => router.push('/marketplace')} className="w-full bg-slate-900 text-white rounded-full">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const categoryName = typeof product.categoryId === 'object' ? product.categoryId?.name : 'Marketplace';
  const categorySlug = typeof product.categoryId === 'object' ? product.categoryId?.slug : '';

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images || [],
    description: product.description || `Buy ${product.title} online on LocalHaat with rural and inter-village delivery.`,
    sku: product._id,
    brand: {
      '@type': 'Brand',
      name: 'LocalHaat',
    },
    offers: {
      '@type': 'Offer',
      url: `https://localhaat.in/marketplace/${product.slug}`,
      priceCurrency: 'INR',
      price: effectivePrice,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'LocalHaat',
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://localhaat.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Haat Marketplace',
        item: 'https://localhaat.in/marketplace',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `https://localhaat.in/marketplace/${product.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans pb-24 selection:bg-amber-100">
      {/* Schema.org Product and BreadcrumbList Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Top Breadcrumb Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/marketplace" className="hover:text-slate-900 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Products</span>
          </Link>
          <span className="text-slate-300">/</span>
          {categorySlug ? (
            <Link
              href={`/marketplace`}
              className="hover:text-slate-900 transition-colors capitalize"
            >
              {categoryName}
            </Link>
          ) : (
            <span>Haat Catalog</span>
          )}
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold truncate max-w-[220px] sm:max-w-md">
            {product.title}
          </span>
        </nav>
      </div>

      {/* Main Split Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* ================= LEFT GALLERY COLUMN (Exact styling from reference mockup) ================= */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Hero Image Container with Warm Pastel Backdrop */}
            <div className="relative bg-[#ece6dd] rounded-3xl p-8 sm:p-12 flex items-center justify-center min-h-[420px] sm:min-h-[520px] overflow-hidden group shadow-2xs">
              {/* Top-Left Circular SALE/PURE Badge */}
              <div className="absolute top-6 left-6 z-10">
                <span className="w-14 h-14 rounded-full bg-white text-slate-900 font-extrabold text-[11px] tracking-wider uppercase flex items-center justify-center shadow-md">
                  {hasDiscount ? `${discountPercent}% OFF` : product.isOrganic ? 'PURE' : 'SALE'}
                </span>
              </div>

              {/* Top-Right Heart Wishlist Button */}
              <button
                type="button"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`absolute top-6 right-6 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isWishlisted ? 'bg-rose-50 text-rose-600 shadow-sm' : 'bg-white/80 hover:bg-white text-slate-600 shadow-sm'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>

              {/* Product Hero Image */}
              <div className="relative w-full h-[320px] sm:h-[400px] flex items-center justify-center">
                <img
                  src={galleryImages[activeImageIndex] || galleryImages[0]}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Bottom-Left "watch video!" Pill Button */}
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="absolute bottom-6 left-6 z-10 inline-flex items-center gap-2 bg-white/95 hover:bg-white text-slate-900 font-bold text-xs px-4 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer backdrop-blur-xs hover:scale-102"
              >
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                </div>
                <span>watch video!</span>
              </button>
            </div>

            {/* Thumbnail Row Below Hero (Pastel-tinted cards matching reference design) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {galleryImages.slice(0, 3).map((imgUrl, idx) => {
                const pastelBg = PASTEL_PALETTE[idx + 1] || 'bg-[#f5e6b3]';
                const isActive = activeImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative rounded-2xl sm:rounded-3xl p-3 sm:p-4 aspect-square flex items-center justify-center transition-all overflow-hidden cursor-pointer ${pastelBg} ${
                      isActive ? 'ring-3 ring-slate-900 scale-102 shadow-md' : 'opacity-85 hover:opacity-100 hover:scale-101'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Angle ${idx + 1}`}
                      className="w-full h-full object-contain drop-shadow-md"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= RIGHT DETAIL & PURCHASE COLUMN ================= */}
          <div className="lg:col-span-6 space-y-6 lg:pl-2">
            {/* Category Tag */}
            <div>
              <span className="text-[11px] font-extrabold tracking-widest text-slate-400 uppercase">
                {categoryName}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mt-1">
                {product.title}
              </h1>
            </div>

            {/* Rating Stars & Review Count */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {product.rating || 4.9}
              </span>
              <span className="text-xs text-slate-400">
                ({product.reviewCount || 36} reviews)
              </span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {formatCurrency(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-base text-slate-400 line-through font-semibold">
                  {formatCurrency(product.price)}
                </span>
              )}
              <span className="text-xs font-medium text-slate-400">
                shipping excl.
              </span>
            </div>

            {/* Short Product Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {product.description}
            </p>

            {/* Option 1: "Choose your taste / Variant" */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-900 block">
                Choose your taste / variant
              </span>
              <div className="flex flex-wrap gap-2">
                {variantOptions.map((variant) => {
                  const isSelected = selectedVariant === variant;
                  return (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`text-xs px-4 py-2.5 rounded-full font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#f4dfa1] text-slate-900 font-bold border border-amber-300 shadow-2xs'
                          : 'bg-[#ece8df] text-slate-700 hover:bg-[#e4ded4]'
                      }`}
                    >
                      {variant}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Option 2: "Pouch size / Pack Size" */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-900 block">
                Pouch size / weight
              </span>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`text-xs px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#f4dfa1] text-slate-900 font-bold border border-amber-300 shadow-2xs'
                          : 'bg-[#ece8df] text-slate-700 hover:bg-[#e4ded4]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 block">
                Quantity
              </span>
              <div className="inline-flex items-center gap-3 bg-[#ece8df] rounded-full px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-full bg-transparent hover:bg-white text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-black text-slate-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-full bg-transparent hover:bg-white text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Large Pill "add to cart" CTA Button */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 rounded-full bg-[#1c1c1e] hover:bg-black text-white text-sm sm:text-base font-extrabold tracking-wide uppercase shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {addedSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>add to cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Proof Row: Overlapping Avatars + Recent buyers count */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {SOCIAL_AVATARS.map((avatarUrl, idx) => (
                  <img
                    key={idx}
                    src={avatarUrl}
                    alt="Buyer"
                    className="w-7 h-7 rounded-full border-2 border-white object-cover"
                  />
                ))}
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                  +10
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                13 other people purchased it today
              </span>
            </div>

            {/* Trust Badges / USPs Bullet Points (Exact reference feature) */}
            <div className="pt-4 border-t border-slate-200/60 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span>Insanely delicious & authentic artisanal craft</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <span>Shipped right to your door with 4-Digit Delivery PIN</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>100% organic, non-GMO & artisan verified</span>
              </div>
            </div>

            {/* Artisan & Producer Origin Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Origin: {product.originVillage || 'Sonapur Cluster'}, {product.originDistrict || 'Varanasi'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                  Verified Origin
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Crafted and packed directly by LocalHaat registered producer cluster. Every order is verified with multi-leg security codes.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ================= ARTISAN VIDEO REEL MODAL ================= */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  <Play className="w-3.5 h-3.5 fill-amber-800" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{product.title}</h3>
                  <p className="text-[11px] text-slate-500">Artisan Craft & Purity Showcase</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Preview Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center group shadow-inner">
              <img
                src={galleryImages[0]}
                alt="Video backdrop"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white space-y-2">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-white text-white ml-1" />
                </div>
                <span className="text-xs font-bold tracking-wider uppercase">
                  Behind the Craft • {product.originVillage || 'Rural Producer Hub'}
                </span>
                <span className="text-[11px] text-white/80 max-w-xs">
                  Discover how artisans cultivate, pack, and authenticate this item before LocalHaat handover.
                </span>
              </div>
            </div>

            <Button
              onClick={() => setShowVideoModal(false)}
              className="w-full bg-slate-900 hover:bg-black text-white rounded-full py-2.5 text-xs font-bold"
            >
              Close Video Reel
            </Button>
          </div>
        </div>
      )}

      {/* ================= FLOATING CART DRAWER NOTIFICATION ================= */}
      {cartDrawerOpen && (
        <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">Cart Updated ({itemCount} items)</span>
            </div>
            <button
              onClick={() => setCartDrawerOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="py-3 flex items-center justify-between text-xs">
            <span className="text-slate-300 truncate max-w-[180px]">{product.title}</span>
            <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/marketplace"
              className="flex-1 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-center text-xs font-bold text-slate-200 transition-colors"
            >
              Keep Shopping
            </Link>
            <Link
              href="/cart"
              className="flex-1 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-center text-xs font-black text-slate-950 transition-colors"
            >
              View Cart ({itemCount}) →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
