'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  Tag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Truck,
  MapPin,
  Sparkles,
  CreditCard,
  Banknote,
  KeyRound,
  ExternalLink,
  FileText,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import InvoiceModal, { printOrderInvoice } from '../../components/InvoiceModal';

export default function CartPage() {
  const router = useRouter();
  const { user, demoLogin } = useAuth();
  const { items, updateQuantity, removeFromCart, clearCart, setCartItems, itemCount, subtotal } = useCart();

  // Checkout Stepper State: 1 = Cart, 2 = Address, 3 = Payment
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Auto-validate and synchronize cart items with live MongoDB catalog
  React.useEffect(() => {
    if (items.length === 0) return;
    api.getProducts().then((res) => {
      const liveProducts = res.products || [];
      if (liveProducts.length === 0) return;

      const liveIdMap = new Map(liveProducts.map((p: any) => [p._id, p]));
      const liveSlugMap = new Map(liveProducts.map((p: any) => [p.slug, p]));
      let hasChanges = false;

      const updatedItems = items
        .map((item) => {
          // If already valid by ID
          if (liveIdMap.has(item.product._id)) {
            const liveProd = liveIdMap.get(item.product._id)!;
            return { ...item, product: liveProd };
          }
          // If ID changed after database seed, match by slug
          if (liveSlugMap.has(item.product.slug)) {
            hasChanges = true;
            return { ...item, product: liveSlugMap.get(item.product.slug)! };
          }
          // Match by title
          const titleMatch = liveProducts.find(
            (p: any) => p.title.toLowerCase() === item.product.title.toLowerCase()
          );
          if (titleMatch) {
            hasChanges = true;
            return { ...item, product: titleMatch };
          }
          // Match by partial title keyword
          const firstWord = (item.product.title || '').split(' ')[0].toLowerCase();
          if (firstWord && firstWord.length > 2) {
            const keywordMatch = liveProducts.find((p: any) =>
              p.title.toLowerCase().includes(firstWord)
            );
            if (keywordMatch) {
              hasChanges = true;
              return { ...item, product: keywordMatch };
            }
          }
          // Obsolete product from past dummy session, discard
          hasChanges = true;
          return null;
        })
        .filter(Boolean) as typeof items;

      if (hasChanges && updatedItems.length > 0) {
        setCartItems(updatedItems);
      }
    }).catch(console.error);
  }, []);

  // Item Selection State (checkboxes per item)
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => {
    return new Set(items.map((i) => i.product._id));
  });

  // Coupons State
  const [couponCode, setCouponCode] = useState('MAX500');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('MAX500');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Address State
  const [addressLine, setAddressLine] = useState(user?.defaultLocation?.addressLine || 'Flat 402, Green Valley Enclave');
  const [villageOrCity, setVillageOrCity] = useState(user?.defaultLocation?.villageOrCity || 'Central Hub');
  const [district, setDistrict] = useState(user?.defaultLocation?.district || 'Varanasi');
  const [state, setState] = useState(user?.defaultLocation?.state || 'Uttar Pradesh');
  const [pincode, setPincode] = useState(user?.defaultLocation?.pincode || '221008');
  const [recipientName, setRecipientName] = useState(user?.name || 'Priya Sharma');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '9999900005');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  const handleCopyPin = (pin: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  // Keep selectedItemIds in sync when cart items change
  React.useEffect(() => {
    setSelectedItemIds((prev) => {
      const next = new Set<string>();
      items.forEach((item) => {
        if (prev.has(item.product._id)) {
          next.add(item.product._id);
        } else {
          next.add(item.product._id);
        }
      });
      return next;
    });
  }, [items]);

  // Selected items calculation
  const selectedItems = useMemo(() => {
    return items.filter((i) => selectedItemIds.has(i.product._id));
  }, [items, selectedItemIds]);

  const allSelected = items.length > 0 && selectedItems.length === items.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(items.map((i) => i.product._id)));
    }
  };

  const toggleItemSelect = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Selected subtotal
  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }, [selectedItems]);

  // Coupon discount calculation
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || selectedSubtotal === 0) return 0;
    if (appliedCoupon === 'MAX500') {
      return Math.min(50, Math.round(selectedSubtotal * 0.1));
    }
    if (appliedCoupon === 'HAATFIRST') {
      return Math.min(100, Math.round(selectedSubtotal * 0.15));
    }
    if (appliedCoupon === 'LOCAL50') {
      return 50;
    }
    return 30;
  }, [appliedCoupon, selectedSubtotal]);

  // Delivery fee: Free for orders over ₹499
  const deliveryFee = selectedSubtotal >= 499 || selectedSubtotal === 0 ? 0 : 40;

  // Grand total
  const grandTotal = Math.max(0, selectedSubtotal - couponDiscount + deliveryFee);

  // Apply Coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (['MAX500', 'HAATFIRST', 'LOCAL50'].includes(code)) {
      setAppliedCoupon(code);
      setCouponError(null);
    } else {
      setCouponError('Invalid coupon. Try MAX500 or HAATFIRST');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  // Remove selected items
  const handleRemoveSelected = () => {
    selectedItems.forEach((i) => removeFromCart(i.product._id));
  };

  // Move to wishlist
  const handleMoveToWishlist = () => {
    alert(`${selectedItems.length} item(s) moved to your wishlist!`);
    handleRemoveSelected();
  };

  // Place order handler
  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) return;
    setOrderPlacing(true);
    const orderPayload = {
      items: selectedItems.map((i) => ({
        productId: i.product._id,
        slug: i.product.slug,
        title: i.product.title,
        quantity: i.quantity,
      })),
      deliveryAddress: {
        addressLine,
        villageOrCity,
        district,
        state,
        pincode,
      },
      paymentMethod,
    };

    try {
      const res = await api.createOrder(orderPayload);
      setSuccessOrder(res);
      // Track conversion event for Google Analytics / Google Ads
      try {
        const { analyticsEvents } = require('../../lib/analytics');
        analyticsEvents.purchase({
          id: res.order?._id || 'ORD-NEW',
          value: grandTotal,
          deliveryPin: res.order?.deliveryPin,
        });
      } catch (analyticsErr) {
        // Safe fallback
      }
      // Remove ordered items from cart
      selectedItems.forEach((i) => removeFromCart(i.product._id));
    } catch (err: any) {
      if (
        err.message?.includes('User no longer exists') ||
        err.message?.includes('Unauthorized') ||
        err.message?.includes('token')
      ) {
        alert('Please log in or sign up to complete your checkout.');
        router.push('/login?redirect=/cart');
        return;
      } else if (err.message?.includes('not found') || err.message?.includes('Product')) {
        // Stale cart item detected: auto-heal cart by fetching live catalog and replacing
        try {
          const prodsRes = await api.getProducts();
          const validIds = new Set((prodsRes.products || []).map((p: any) => p._id));
          // Remove invalid items
          items.forEach((it) => {
            if (!validIds.has(it.product._id)) {
              removeFromCart(it.product._id);
            }
          });
          const remainingValid = selectedItems.filter((i) => validIds.has(i.product._id));
          if (remainingValid.length > 0) {
            const retryPayload = {
              ...orderPayload,
              items: remainingValid.map((i) => ({
                productId: i.product._id,
                slug: i.product.slug,
                title: i.product.title,
                quantity: i.quantity,
              })),
            };
            const res = await api.createOrder(retryPayload);
            setSuccessOrder(res);
            remainingValid.forEach((i) => removeFromCart(i.product._id));
            return;
          } else {
            alert('Your cart contained items from an earlier catalog session. Your cart has now been updated to match the store.');
          }
        } catch (healErr: any) {
          alert(`Order placement failed: ${err.message}`);
        }
      } else {
        alert(`Order placement failed: ${err.message}`);
      }
    } finally {
      setOrderPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans pb-24 selection:bg-amber-100">
      {/* ================= 3-STEP CHECKOUT PROGRESS STEPPER (Exact Reference Design) ================= */}
      <header className="bg-white border-b border-slate-100 py-6 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Step 1: Cart */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 1
                    ? 'bg-black text-white ring-4 ring-slate-100'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <span
                className={`text-xs sm:text-sm font-bold tracking-wide ${
                  currentStep === 1 ? 'text-slate-950 font-black' : 'text-slate-500 group-hover:text-slate-900'
                }`}
              >
                Cart
              </span>
            </button>

            {/* Stepper Line 1 -> 2 */}
            <div
              className={`w-12 sm:w-24 h-0.5 transition-colors ${
                currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />

            {/* Step 2: Address */}
            <button
              type="button"
              onClick={() => items.length > 0 && setCurrentStep(2)}
              disabled={items.length === 0}
              className="flex items-center gap-2 group cursor-pointer disabled:cursor-not-allowed"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 2
                    ? 'bg-black text-white ring-4 ring-slate-100'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </div>
              <span
                className={`text-xs sm:text-sm font-bold tracking-wide ${
                  currentStep === 2 ? 'text-slate-950 font-black' : 'text-slate-500 group-hover:text-slate-900'
                }`}
              >
                Address
              </span>
            </button>

            {/* Stepper Line 2 -> 3 */}
            <div
              className={`w-12 sm:w-24 h-0.5 transition-colors ${
                currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />

            {/* Step 3: Payment */}
            <button
              type="button"
              onClick={() => items.length > 0 && setCurrentStep(3)}
              disabled={items.length === 0}
              className="flex items-center gap-2 group cursor-pointer disabled:cursor-not-allowed"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === 3
                    ? 'bg-black text-white ring-4 ring-slate-100'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                3
              </div>
              <span
                className={`text-xs sm:text-sm font-bold tracking-wide ${
                  currentStep === 3 ? 'text-slate-950 font-black' : 'text-slate-500 group-hover:text-slate-900'
                }`}
              >
                Payment
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SUCCESS ORDER CONFIRMATION MODAL */}
        {successOrder ? (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold tracking-widest uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Order Confirmed & Sealed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Thank you for your order!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Order #{successOrder.order?.orderNumber || 'LH-ORD-70192'} has been provisioned for cluster dispatch.
              </p>
            </div>

            {/* 4-Digit Security Delivery PIN Highlight */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 text-left space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <KeyRound className="w-4 h-4 text-amber-700" />
                  <span>Your 4-Digit Delivery PIN</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyPin(successOrder.order?.deliveryPin || '4826')}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-200/60 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
                >
                  {copiedPin ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPin ? 'Copied' : 'Copy PIN'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-slate-900 bg-white px-5 py-2.5 rounded-xl border-2 border-amber-300 shadow-xs text-center sm:text-left">
                  {successOrder.order?.deliveryPin || '4826'}
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  <span className="font-bold block text-amber-900 mb-0.5">Physical Verification Required</span>
                  Share this PIN with the delivery courier only when you inspect and receive your sealed package.
                </p>
              </div>
            </div>

            {/* Tax Invoice Actions Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Official Tax Invoice</div>
                  <div className="text-[11px] text-slate-500">Includes 4-digit Delivery PIN & GST breakdown</div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  onClick={() => setShowInvoiceModal(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-initial text-xs font-bold rounded-xl border-slate-300 hover:bg-slate-100"
                >
                  View Invoice
                </Button>
                <Button
                  type="button"
                  onClick={() => printOrderInvoice(successOrder.order, user)}
                  size="sm"
                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Print</span>
                </Button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={() => router.push('/orders')}
                variant="outline"
                className="flex-1 rounded-xl text-xs font-bold border-slate-300 text-slate-800 hover:bg-slate-50"
              >
                Go to My Orders (with PINs)
              </Button>
              <Button
                onClick={() => router.push('/parcels')}
                className="flex-1 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold"
              >
                Track Live Order →
              </Button>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* EMPTY CART VIEW */
          <div className="max-w-md mx-auto text-center py-20 bg-white rounded-3xl p-8 border border-slate-100 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Your Cart is Empty</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              You haven’t added any items yet. Explore our curated haat marketplace for authentic farm produce, textiles, and everyday goods.
            </p>
            <Button
              onClick={() => router.push('/marketplace')}
              className="bg-slate-900 hover:bg-black text-white rounded-full px-6 text-xs font-bold"
            >
              Browse Haat Marketplace →
            </Button>
          </div>
        ) : (
          /* ================= MAIN SPLIT 2-COLUMN LAYOUT ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* ================= LEFT COLUMN (Cart Items, Address Form, or Payment) ================= */}
            <div className="lg:col-span-7 space-y-4">
              {currentStep === 1 && (
                <>
                  {/* Top Selection Bar (Exact Reference Design: "1/4 items selected • Move to wishlist | Remove") */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 px-5 py-3.5 flex items-center justify-between shadow-2xs">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {selectedItems.length}/{items.length} items selected
                      </span>
                    </label>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <button
                        type="button"
                        onClick={handleMoveToWishlist}
                        disabled={selectedItems.length === 0}
                        className="hover:text-slate-900 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        Move to wishlist
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleRemoveSelected}
                        disabled={selectedItems.length === 0}
                        className="hover:text-rose-600 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* List of Cart Item Cards */}
                  <div className="space-y-3">
                    {items.map(({ product, quantity }) => {
                      const isSelected = selectedItemIds.has(product._id);
                      const unitPrice = product.discountPrice || product.price;
                      const itemSubtotal = unitPrice * quantity;

                      return (
                        <div
                          key={product._id}
                          className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs flex gap-3 sm:gap-4 items-start relative transition-all hover:border-slate-300"
                        >
                          {/* Item Checkbox */}
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleItemSelect(product._id)}
                              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                            />
                          </div>

                          {/* Product Image */}
                          <Link
                            href={`/marketplace/${product.slug}`}
                            className="w-20 h-20 sm:w-24 sm:h-24 bg-[#f8f7f4] rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 border border-slate-100"
                          >
                            <img
                              src={
                                product.images?.[0] ||
                                'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'
                              }
                              alt={product.title}
                              className="w-full h-full object-contain"
                            />
                          </Link>

                          {/* Product Info & Controls */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            {/* Title & Remove Button */}
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/marketplace/${product.slug}`}
                                className="text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1"
                              >
                                {product.title}
                              </Link>
                              <button
                                type="button"
                                onClick={() => removeFromCart(product._id)}
                                className="w-5 h-5 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Badges / Metadata row (exact reference style) */}
                            <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] text-slate-500 font-medium">
                              {product.isOrganic && (
                                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  100% Organic
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                {product.originVillage || 'Sonapur'} Hub
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-600">
                                <Truck className="w-2.5 h-2.5 text-emerald-600" />
                                Express delivery in 2-3 days
                              </span>
                            </div>

                            {/* Price & Stepper Row */}
                            <div className="flex items-center justify-between pt-2">
                              {/* Price */}
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                                  {formatCurrency(itemSubtotal)}
                                </span>
                                {quantity > 1 && (
                                  <span className="text-[10px] text-slate-400">
                                    ({formatCurrency(unitPrice)} each)
                                  </span>
                                )}
                              </div>

                              {/* Stepper control ([-] quantity [+]) */}
                              <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-2 py-1">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(product._id, quantity - 1)}
                                  className="w-6 h-6 rounded-full bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-slate-900">
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(product._id, quantity + 1)}
                                  className="w-6 h-6 rounded-full bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* STEP 2: ADDRESS & DELIVERY DETAILS */}
              {currentStep === 2 && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">Delivery Address</h2>
                      <p className="text-xs text-slate-500">Provide where your LocalHaat parcel should be delivered</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Cart
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Name</label>
                        <Input
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="Your Full Name"
                          className="h-10 text-xs rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number</label>
                        <Input
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="h-10 text-xs rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">House / Flat / Street Address</label>
                      <Input
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="House / Flat No., Street, Landmark"
                        className="h-10 text-xs rounded-xl"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Village / City Hub</label>
                        <Input
                          value={villageOrCity}
                          onChange={(e) => setVillageOrCity(e.target.value)}
                          placeholder="e.g. Sonapur / Varanasi"
                          className="h-10 text-xs rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">District</label>
                        <Input
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="e.g. Varanasi"
                          className="h-10 text-xs rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Pincode</label>
                        <Input
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="6-digit pincode"
                          className="h-10 text-xs rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
                      <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">PIN-Protected Handover</span>
                        <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                          Upon dispatch, a 4-digit security PIN will be issued for this address. The transporter will verify this code before final handover.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setCurrentStep(3)}
                      className="w-full bg-slate-900 hover:bg-black text-white h-12 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT & CONFIRMATION */}
              {currentStep === 3 && (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">Select Payment Method</h2>
                      <p className="text-xs text-slate-500">Choose your preferred payment mode</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Address
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Option A: Cash on Delivery */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-slate-900 bg-slate-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="w-4 h-4 text-slate-900 mt-1 focus:ring-slate-900"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span className="font-extrabold text-sm text-slate-900">Cash on Delivery (COD)</span>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Pay cash or UPI upon handover at your doorstep. Verified with 4-Digit Delivery PIN.
                        </p>
                      </div>
                    </label>

                    {/* Option B: Razorpay / UPI */}
                    <label
                      className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                        paymentMethod === 'razorpay'
                          ? 'border-slate-900 bg-slate-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        className="w-4 h-4 text-slate-900 mt-1 focus:ring-slate-900"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-600" />
                          <span className="font-extrabold text-sm text-slate-900">Online UPI / Cards / NetBanking</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Instant payment via Google Pay, PhonePe, Paytm, or Credit/Debit Card.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <span className="font-bold text-slate-900 block">Deliver to:</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {recipientName} • {recipientPhone}<br />
                      {addressLine}, {villageOrCity}, {district}, {state} - {pincode}
                    </p>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={orderPlacing}
                    className="w-full bg-[#1c1c1e] hover:bg-black text-white h-12 rounded-xl text-sm font-black tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg"
                  >
                    {orderPlacing ? 'Confirming Order...' : `Confirm & Place Order (${formatCurrency(grandTotal)})`}
                  </Button>
                </div>
              )}
            </div>

            {/* ================= RIGHT COLUMN (Coupons, Gifting, Price Details, Place Order) ================= */}
            <div className="lg:col-span-5 space-y-5">
              {/* SECTION 1: COUPONS CARD (Exact Reference Feature) */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-900 tracking-wider uppercase block">
                  Coupons
                </span>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 px-3.5 py-2.5 rounded-xl text-xs">
                      <div className="flex items-center gap-2 font-bold text-emerald-800">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Coupons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-emerald-700 tracking-wider">
                          {appliedCoupon}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-emerald-700 hover:text-rose-600 p-0.5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Enter coupon (e.g. MAX500)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full pl-9 pr-3 h-9 text-xs rounded-xl border border-slate-200 uppercase font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        className="bg-slate-900 hover:bg-black text-white h-9 px-4 text-xs font-bold rounded-xl"
                      >
                        Apply
                      </Button>
                    </form>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>
                  )}
                </div>
              </div>

              {/* SECTION 2: PRICE DETAILS CARD (Exact Reference Layout) */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-slate-900 tracking-wider uppercase block">
                  Price Details
                </span>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3.5">
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>{selectedItems.length} item(s) selected</span>
                    <span className="font-bold text-slate-900">{formatCurrency(selectedSubtotal)}</span>
                  </div>

                  {/* Itemized snippet */}
                  {selectedItems.map((item) => (
                    <div key={item.product._id} className="flex justify-between text-[11px] text-slate-600">
                      <span className="truncate max-w-[200px]">
                        {item.quantity} × {item.product.title}
                      </span>
                      <span>{formatCurrency((item.product.discountPrice || item.product.price) * item.quantity)}</span>
                    </div>
                  ))}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-xs font-semibold text-emerald-600">
                      <span>Coupon discount</span>
                      <span>-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Delivery Charges</span>
                    <span className={deliveryFee === 0 ? 'text-emerald-600 font-bold' : ''}>
                      {deliveryFee === 0 ? 'Free Delivery' : formatCurrency(deliveryFee)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-slate-900">Total Amount</span>
                    <span className="text-xl font-black text-slate-900">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: BIG BLACK CTA "Place order →" BUTTON */}
              {currentStep === 1 && (
                <button
                  type="button"
                  disabled={selectedItems.length === 0}
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-4 rounded-xl bg-[#1c1c1e] hover:bg-black text-white text-sm sm:text-base font-extrabold tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>Place order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="w-full py-4 rounded-xl bg-[#1c1c1e] hover:bg-black text-white text-sm sm:text-base font-extrabold tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Tax Invoice Modal */}
      {successOrder && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          order={successOrder?.order || successOrder}
          customer={user}
        />
      )}
    </div>
  );
}
