'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Parcel, MatchedDeliveryOption } from '../../types';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { playSuccessChime, playDeclineChime } from '../../lib/audioAlert';
import {
  Package,
  Plus,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Phone,
  User as UserIcon,
  Eye,
  RefreshCw,
  Calendar,
  IndianRupee,
  Store,
  X,
  Star,
  Navigation,
  ChevronRight,
  Check,
  Route,
  Info,
  Bell,
  KeyRound,
  Copy,
  CreditCard,
  QrCode,
  Landmark,
  Smartphone,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

const PARCEL_CATEGORIES = [
  'Clothes',
  'Food & Grains',
  'Organic Produce',
  'Terracotta & Cookware',
  'Handicrafts & Art',
  'Documents & Parcels',
  'Medicine & Health',
  'Electronics & Tools',
  'Other Items',
];

export default function ParcelsPortal() {
  const router = useRouter();
  const { user } = useAuth();

  // Parcel creation form state
  const [senderName, setSenderName] = useState(user?.name || 'Priya Sharma');
  const [senderMobile, setSenderMobile] = useState(user?.phone || '9999900005');
  const [pickupLocation, setPickupLocation] = useState('Darbhanga');
  const [pickupAddress, setPickupAddress] = useState('Near Station Road, Darbhanga');

  const [receiverName, setReceiverName] = useState('Rameshwar Bahera');
  const [receiverMobile, setReceiverMobile] = useState('9876543210');
  const [deliveryLocation, setDeliveryLocation] = useState('Village Bahera');
  const [deliveryAddress, setDeliveryAddress] = useState('House 14, Main Chowk, Village Bahera');

  const [whatIsInside, setWhatIsInside] = useState('Handwoven Shawls & Cotton Fabric');
  const [parcelCategory, setParcelCategory] = useState('Clothes');
  const [parcelPhotoUrl, setParcelPhotoUrl] = useState('');
  const [weightKg, setWeightKg] = useState('3.0');
  const [lengthCm, setLengthCm] = useState('25');
  const [widthCm, setWidthCm] = useState('20');
  const [heightCm, setHeightCm] = useState('15');
  const [approximateValue, setApproximateValue] = useState('850');
  const [specialInstructions, setSpecialInstructions] = useState('Handle gently. Keep in waterproof bag.');

  const [customerOfferPrice, setCustomerOfferPrice] = useState('200');
  const [preferredDeliveryDate, setPreferredDeliveryDate] = useState('Today / By Evening');
  const [preferredLogisticsType] = useState('Bike');
  const [sendDate, setSendDate] = useState('Today');
  const [sendTime, setSendTime] = useState('Any Time (Flexible)');
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [customDateValue, setCustomDateValue] = useState('');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [customTimeValue, setCustomTimeValue] = useState('');

  // Delivery destination authority & Agent search
  const [deliveryMode, setDeliveryMode] = useState<'agent' | 'direct'>('agent');
  const [agentSearch, setAgentSearch] = useState('');
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [isSearchingAgent, setIsSearchingAgent] = useState(false);

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<{
    parcelId: string;
    trackingNumber: string;
    pickupCode: string;
    deliveryPin: string;
    assignedPartner?: string;
    assignedTrip?: string;
    isAwaitingPartner?: boolean;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // My Parcels state
  const [myParcels, setMyParcels] = useState<Parcel[]>([]);
  const [loadingParcels, setLoadingParcels] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Parcel Modal
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  // Route Matching state
  const [matchingState, setMatchingState] = useState<{
    parcel: any | null;
    formData?: any | null;
    matches: MatchedDeliveryOption[];
    matchCount: number;
    isSearching: boolean;
    flexibleDate: boolean;
    bookingTripId: string | null;
    bookingSuccess: string | null;
    bookingError: string | null;
    isPreBooking?: boolean;
  } | null>(null);

  // Stop Manifest Modal state
  const [manifestData, setManifestData] = useState<{
    trip: any;
    stops: any[];
    loading: boolean;
  } | null>(null);

  // Awaiting Partner Response Modal state (Sections 19, 21, 22, 23)
  const [awaitingBooking, setAwaitingBooking] = useState<{
    requestId: string;
    parcelId: string;
    trackingNumber: string;
    partnerName: string;
    partnerMethod: string;
    routeTitle: string;
    pickupStopName: string;
    destinationStopName: string;
    offeredPrice: number;
    expiresAt: string;
    status: 'PENDING' | 'REJECTED' | 'EXPIRED';
    rejectionReason?: string;
    savedFormData?: any;
    savedParcel?: any;
  } | null>(null);

  // Payment Selection Modal state (Sections 24-30)
  const [paymentModalData, setPaymentModalData] = useState<{
    parcelId: string;
    trackingNumber: string;
    partnerName: string;
    offeredPrice: number;
    pickupLocation: string;
    deliveryLocation: string;
  } | null>(null);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Verified Payment Success Result Modal state (Displays unlocked codes & custody transfer details)
  const [verifiedPaymentResult, setVerifiedPaymentResult] = useState<{
    parcelId: string;
    trackingNumber: string;
    amount: number;
    paymentId: string;
    partnerName: string;
    pickupCode: string;
    deliveryPin: string;
    pickupLocation: string;
    deliveryLocation: string;
    status: string;
  } | null>(null);

  // Interactive Razorpay Checkout Simulator state (for fallback/test mode)
  const [razorpaySimulator, setRazorpaySimulator] = useState<{
    isOpen: boolean;
    orderId: string;
    amount: number;
    parcelId: string;
    trackingNumber: string;
    partnerName: string;
    pickupLocation: string;
    deliveryLocation: string;
    tab: 'upi' | 'card' | 'netbanking';
    upiApp: 'gpay' | 'phonepe' | 'paytm' | 'bhim';
  } | null>(null);

  const [copiedCodes, setCopiedCodes] = useState<{ [key: string]: boolean }>({});

  const handleCopyCode = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCodes((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedCodes((prev) => ({ ...prev, [key]: false }));
    }, 2500);
  };

  // Dynamically load Razorpay Checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const existing = document.getElementById('razorpay-checkout-js');
      if (existing) {
        if ((window as any).Razorpay) return resolve(true);
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const { socket } = useSocket();

  useEffect(() => {
    loadMyParcels();
    loadAvailableAgents();
    loadRazorpayScript().catch(() => {});
  }, [user]);

  // Real-time socket updates for parcels and booking offers
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      loadMyParcels();
    };

    const handleOfferAccepted = (data: any) => {
      playSuccessChime();
      loadMyParcels();

      if (
        awaitingBooking &&
        (awaitingBooking.requestId === data.requestId ||
          awaitingBooking.trackingNumber === data.parcelTrackingNumber)
      ) {
        const currentReq = awaitingBooking;
        setAwaitingBooking(null);
        setPaymentModalData({
          parcelId: data.parcelId || currentReq.parcelId,
          trackingNumber: data.parcelTrackingNumber || currentReq.trackingNumber,
          partnerName: data.partnerName || currentReq.partnerName,
          offeredPrice: data.offeredPrice || currentReq.offeredPrice,
          pickupLocation: currentReq.pickupStopName,
          deliveryLocation: currentReq.destinationStopName,
        });
      }
    };

    const handleOfferRejected = (data: any) => {
      playDeclineChime();
      loadMyParcels();

      if (
        awaitingBooking &&
        (awaitingBooking.requestId === data.requestId ||
          awaitingBooking.trackingNumber === data.parcelTrackingNumber)
      ) {
        setAwaitingBooking((prev) =>
          prev
            ? {
                ...prev,
                status: 'REJECTED',
                rejectionReason: data.reason || 'Partner was unable to accept this parcel route.',
              }
            : null
        );
      }
    };

    socket.on('parcel:update', handleUpdate);
    socket.on('parcel:status_change', handleUpdate);
    socket.on('parcel:payment_updated', handleUpdate);
    socket.on('parcel:offer_accepted', handleOfferAccepted);
    socket.on('parcel:offer_rejected', handleOfferRejected);

    return () => {
      socket.off('parcel:update', handleUpdate);
      socket.off('parcel:status_change', handleUpdate);
      socket.off('parcel:payment_updated', handleUpdate);
      socket.off('parcel:offer_accepted', handleOfferAccepted);
      socket.off('parcel:offer_rejected', handleOfferRejected);
    };
  }, [socket, awaitingBooking]);

  const loadAvailableAgents = async (searchQuery?: string) => {
    setLoadingAgents(true);
    try {
      const res = await api.getAvailableAgents(searchQuery);
      if (res.agents) {
        setAvailableAgents(res.agents);
        if (!selectedAgent && res.agents.length > 0 && deliveryMode === 'agent') {
          // If searching Bahera or by default, prioritize matching agent
          const baheraMatch = res.agents.find(
            (a: any) =>
              a.villageName?.toLowerCase().includes('bahera') ||
              a.servingVillages?.some((v: string) => v.toLowerCase().includes('bahera'))
          );
          if (baheraMatch) {
            handleSelectAgent(baheraMatch);
          } else {
            handleSelectAgent(res.agents[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching available agents:', err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleSearchAgents = (term: string) => {
    setAgentSearch(term);
    loadAvailableAgents(term);
  };

  const handleSelectAgent = (agent: any) => {
    setSelectedAgent(agent);
    setIsSearchingAgent(false);
    const vName = agent.hubAddress?.villageOrCity || agent.villageName;
    setDeliveryLocation(vName);
    const addr = `Village Drop Hub [${agent.hubCode}] - ${agent.hubAddress?.addressLine || 'Main Village Center'}, ${vName}`;
    setDeliveryAddress(addr);
  };

  const handleSwitchToDirect = () => {
    setDeliveryMode('direct');
    setSelectedAgent(null);
    setIsSearchingAgent(false);
    setDeliveryLocation('Village Bahera');
    setDeliveryAddress('House 14, Main Chowk, Village Bahera');
  };

  const handleSwitchToAgent = () => {
    setDeliveryMode('agent');
    if (availableAgents.length > 0) {
      handleSelectAgent(selectedAgent || availableAgents[0]);
    } else {
      loadAvailableAgents();
    }
  };

  const loadMyParcels = async () => {
    setLoadingParcels(true);
    try {
      const res = await api.getMyParcels();
      if (res.parcels && res.parcels.length > 0) {
        setMyParcels(res.parcels);
      } else {
        // Fallback to all parcels if empty
        const allRes = await api.getParcels();
        setMyParcels(allRes.parcels || []);
      }
    } catch (err) {
      console.error('Error loading parcels:', err);
    } finally {
      setLoadingParcels(false);
    }
  };

  const handleOpenMatching = async (parcel: any, flexibleDate = false) => {
    setMatchingState({
      parcel,
      matches: [],
      matchCount: 0,
      isSearching: true,
      flexibleDate,
      bookingTripId: null,
      bookingSuccess: null,
      bookingError: null,
    });
    try {
      const res = await api.getParcelMatches(parcel.parcelId || parcel._id, {
        flexibleDate: String(flexibleDate),
      });
      setMatchingState((prev) =>
        prev
          ? {
              ...prev,
              matches: res.matches || [],
              matchCount: res.matchCount || (res.matches ? res.matches.length : 0),
              isSearching: false,
            }
          : null
      );
    } catch (err: any) {
      setMatchingState((prev) =>
        prev
          ? {
              ...prev,
              isSearching: false,
              bookingError: err.message || 'Failed to search matching trips.',
            }
          : null
      );
    }
  };

  const handleToggleFlexibleSearch = async (flexible = true) => {
    if (!matchingState) return;
    if (matchingState.isPreBooking && matchingState.formData) {
      setMatchingState((prev) =>
        prev
          ? {
              ...prev,
              matches: [],
              isSearching: true,
              flexibleDate: flexible,
              bookingError: null,
            }
          : null
      );
      try {
        const res = await api.searchParcelMatches({
          pickupLocation: matchingState.formData.pickupLocation,
          deliveryLocation: matchingState.formData.deliveryLocation,
          weightKg: matchingState.formData.weightKg,
          sendDate: matchingState.formData.sendDate,
          sendTime: matchingState.formData.sendTime,
          flexibleDate: flexible,
          customerOfferPrice: matchingState.formData.customerOfferPrice,
        });
        setMatchingState((prev) =>
          prev
            ? {
                ...prev,
                matches: res.matches || [],
                matchCount: res.matchCount || (res.matches ? res.matches.length : 0),
                isSearching: false,
              }
            : null
        );
      } catch (err: any) {
        setMatchingState((prev) =>
          prev
            ? {
                ...prev,
                isSearching: false,
                bookingError: err.message || 'Failed to search matching trips.',
              }
            : null
        );
      }
    } else if (matchingState.parcel) {
      handleOpenMatching(matchingState.parcel, flexible);
    }
  };

  // 120-second timer countdown effect for awaitingBooking
  useEffect(() => {
    if (!awaitingBooking || awaitingBooking.status !== 'PENDING') return;

    const timer = setInterval(() => {
      const diff = Math.floor((new Date(awaitingBooking.expiresAt).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        clearInterval(timer);
        setAwaitingBooking((prev) => (prev ? { ...prev, status: 'EXPIRED' } : null));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [awaitingBooking?.expiresAt, awaitingBooking?.status]);

  const handleSelectPartner = async (match: MatchedDeliveryOption) => {
    if (!matchingState) return;

    const offerPrice =
      Number(matchingState.parcel?.customerOfferPrice) ||
      Number(matchingState.formData?.customerOfferPrice) ||
      Number(customerOfferPrice) ||
      match.price;

    setMatchingState((prev) =>
      prev
        ? {
            ...prev,
            bookingTripId: match.tripId,
            bookingError: null,
          }
        : null
    );

    try {
      const cleanParcelData = matchingState.isPreBooking && matchingState.formData
        ? { ...matchingState.formData }
        : undefined;
      if (cleanParcelData) {
        delete cleanParcelData.parcelId;
        delete cleanParcelData.parcelTrackingNumber;
        delete cleanParcelData._id;
      }

      const res = await api.createBookingRequest({
        parcelId: matchingState.isPreBooking
          ? undefined
          : (matchingState.parcel?.parcelId || matchingState.parcel?._id),
        parcelData: cleanParcelData,
        tripId: match.tripId,
        partnerId: match.partnerId,
        pickupStopId: match.pickupStop.stopId,
        destinationStopId: match.destinationStop.stopId,
        agreedPrice: offerPrice,
      });

      const savedFormData = matchingState.formData;
      const savedParcel = matchingState.parcel;
      setMatchingState(null);

      // Reset form fields if creating new
      if (matchingState.isPreBooking) {
        setWhatIsInside('');
        setSpecialInstructions('');
        setSendDate('Today');
        setSendTime('Any Time (Flexible)');
        setIsCustomDate(false);
        setIsCustomTime(false);
        setCustomDateValue('');
        setCustomTimeValue('');
      }

      await loadMyParcels();

      // Open Awaiting Partner Response Modal
      setAwaitingBooking({
        requestId: res.bookingRequest.requestId,
        parcelId: res.parcel.parcelId || res.parcel._id,
        trackingNumber: res.parcel.parcelTrackingNumber,
        partnerName: match.partnerName,
        partnerMethod: match.methodCategory,
        routeTitle: match.routeTitle,
        pickupStopName: match.pickupStop.name,
        destinationStopName: match.destinationStop.name,
        offeredPrice: offerPrice,
        expiresAt: res.expiresAt,
        status: 'PENDING',
        savedFormData,
        savedParcel,
      });
    } catch (err: any) {
      let friendlyMsg = err.message || 'Unable to send booking request to selected carrier. Please try another option.';
      if (friendlyMsg.includes('E11000') || friendlyMsg.includes('duplicate key')) {
        friendlyMsg = 'A temporary code collision occurred while allocating parcel tracking. Please click Book again to generate a fresh booking.';
      }
      setMatchingState((prev) =>
        prev
          ? {
              ...prev,
              bookingTripId: null,
              bookingError: friendlyMsg,
            }
          : null
      );
    }
  };

  const handleCancelBooking = async () => {
    if (!awaitingBooking) return;
    try {
      await api.cancelBookingRequest(awaitingBooking.requestId);
    } catch (e) {}
    setAwaitingBooking(null);
    await loadMyParcels();
  };

  const handleSearchOtherPartners = async () => {
    if (!awaitingBooking) return;
    const { savedFormData, savedParcel } = awaitingBooking;
    setAwaitingBooking(null);

    if (savedFormData) {
      try {
        const res = await api.searchParcelMatches({
          pickupLocation: savedFormData.pickupLocation,
          deliveryLocation: savedFormData.deliveryLocation,
          weightKg: savedFormData.weightKg,
          sendDate: savedFormData.sendDate,
          sendTime: savedFormData.sendTime,
          flexibleDate: false,
          customerOfferPrice: savedFormData.customerOfferPrice,
        });

        setMatchingState({
          parcel: savedFormData,
          formData: savedFormData,
          matches: res.matches || [],
          matchCount: res.matchCount || (res.matches ? res.matches.length : 0),
          isSearching: false,
          flexibleDate: false,
          bookingTripId: null,
          bookingSuccess: null,
          bookingError: null,
          isPreBooking: true,
        });
      } catch (err: any) {
        setFormError('Failed to search alternate routes.');
      }
    } else if (savedParcel) {
      handleOpenMatching(savedParcel, false);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePayCash = async () => {
    if (!paymentModalData) return;
    setIsProcessingPayment(true);
    setPaymentError(null);
    try {
      const res = await api.payCashForParcel(paymentModalData.parcelId);
      const p = res.parcel || {};
      const pickupCode = res.pickupCode || p.pickupCode || '••••';
      const deliveryPin = p.deliveryPin || '••••';

      setPaymentModalData(null);
      setVerifiedPaymentResult({
        parcelId: p.parcelId || paymentModalData.parcelId,
        trackingNumber: p.parcelTrackingNumber || paymentModalData.trackingNumber,
        amount: paymentModalData.offeredPrice,
        paymentId: 'CASH_PAYMENT_SELECTED',
        partnerName: paymentModalData.partnerName,
        pickupCode,
        deliveryPin,
        pickupLocation: paymentModalData.pickupLocation,
        deliveryLocation: paymentModalData.deliveryLocation,
        status: p.status || 'PICKUP_PENDING',
      });
      await loadMyParcels();
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to confirm cash payment.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePayOnline = async () => {
    if (!paymentModalData) return;
    setIsProcessingPayment(true);
    setPaymentError(null);
    try {
      const modalData = { ...paymentModalData };
      const orderRes = await api.createParcelPaymentOrder(modalData.parcelId);
      const providerOrderId = orderRes.order?.providerOrderId || `order_${Date.now()}`;
      const keyId = orderRes.order?.keyId || 'rzp_test_localhaat12345';
      const amountInPaise = orderRes.order?.amount || (modalData.offeredPrice * 100);

      // Check if real active Razorpay merchant key is provided (not dev mock key)
      const isRealKey =
        keyId &&
        (keyId.startsWith('rzp_live_') ||
          (keyId.startsWith('rzp_test_') &&
            !keyId.includes('localhaat') &&
            !keyId.includes('mock') &&
            keyId !== 'rzp_test_localhaat12345'));

      if (isRealKey) {
        const scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded && typeof (window as any).Razorpay !== 'undefined') {
          const options = {
            key: keyId,
            amount: amountInPaise,
            currency: 'INR',
            name: 'LocalHaat Rural Logistics',
            description: `Parcel Booking: ${modalData.pickupLocation} to ${modalData.deliveryLocation}`,
            image: 'https://cdn-icons-png.flaticon.com/512/9561/9561688.png',
            order_id: providerOrderId,
            prefill: {
              name: user?.name || senderName || 'LocalHaat Customer',
              contact: user?.phone || senderMobile || '9999900005',
              email: user?.email || 'customer@localhaat.in',
            },
            theme: {
              color: '#059669',
            },
            handler: async function (response: any) {
              await handleVerifyOnlinePayment({
                parcelId: modalData.parcelId,
                orderId: response.razorpay_order_id || providerOrderId,
                paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                signature: response.razorpay_signature || `sig_${Date.now()}`,
                partnerName: modalData.partnerName,
                amount: modalData.offeredPrice,
                pickupLocation: modalData.pickupLocation,
                deliveryLocation: modalData.deliveryLocation,
              });
            },
            modal: {
              ondismiss: function () {
                setIsProcessingPayment(false);
              },
            },
          };

          try {
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (resp: any) {
              setPaymentError(resp?.error?.description || 'Payment was declined or failed.');
              setIsProcessingPayment(false);
            });
            rzp.open();
            return;
          } catch (sdkErr: any) {
            console.warn('Razorpay SDK error, switching to interactive checkout:', sdkErr);
          }
        }
      }

      // Close the payment selection modal and launch the seamless Razorpay Checkout dialog
      setPaymentModalData(null);
      setRazorpaySimulator({
        isOpen: true,
        orderId: providerOrderId,
        amount: modalData.offeredPrice,
        parcelId: modalData.parcelId,
        trackingNumber: modalData.trackingNumber,
        partnerName: modalData.partnerName,
        pickupLocation: modalData.pickupLocation,
        deliveryLocation: modalData.deliveryLocation,
        tab: 'upi',
        upiApp: 'gpay',
      });
      setIsProcessingPayment(false);
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to initialize Razorpay payment order.');
      setIsProcessingPayment(false);
    }
  };

  const handleVerifyOnlinePayment = async ({
    parcelId,
    orderId,
    paymentId,
    signature,
    partnerName,
    amount,
    pickupLocation,
    deliveryLocation,
  }: {
    parcelId: string;
    orderId: string;
    paymentId: string;
    signature: string;
    partnerName: string;
    amount: number;
    pickupLocation: string;
    deliveryLocation: string;
  }) => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    try {
      const verifyRes = await api.verifyParcelPayment(parcelId, {
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      });

      setPaymentModalData(null);
      setRazorpaySimulator(null);

      // Open the comprehensive Verified Payment Result panel
      setVerifiedPaymentResult({
        parcelId: verifyRes.parcel?.parcelId || parcelId,
        trackingNumber: verifyRes.parcel?.parcelTrackingNumber || parcelId,
        amount: amount,
        paymentId: paymentId,
        partnerName: partnerName,
        pickupCode: verifyRes.pickupCode || verifyRes.parcel?.pickupCode || '••••',
        deliveryPin: verifyRes.parcel?.deliveryPin || '••••',
        pickupLocation,
        deliveryLocation,
        status: verifyRes.parcel?.status || 'PICKUP_PENDING',
      });

      await loadMyParcels();
    } catch (err: any) {
      setPaymentError(err.message || 'Payment signature verification failed.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCreateWithoutPartner = async () => {
    if (!matchingState?.formData) return;
    setIsSubmitting(true);
    try {
      const cleanData = { ...matchingState.formData };
      delete cleanData.parcelId;
      delete cleanData.parcelTrackingNumber;
      delete cleanData._id;

      const res = await api.createParcel(cleanData);

      setMatchingState(null);
      setFormSuccess({
        parcelId: res.parcel.parcelId || res.parcel._id,
        trackingNumber: res.parcel.parcelTrackingNumber,
        pickupCode: res.pickupCode,
        deliveryPin: res.deliveryPin,
        isAwaitingPartner: true,
      });

      // Track parcel_created conversion event for Google Analytics / Google Ads
      try {
        const { analyticsEvents } = require('../../lib/analytics');
        analyticsEvents.parcelCreated({
          trackingNumber: res.parcel.parcelTrackingNumber,
          weightKg: Number(res.parcel.weightKg || cleanData.weightKg || 1),
          offerPrice: Number(res.parcel.customerOfferPrice || cleanData.customerOfferPrice || 0),
        });
      } catch (analyticsErr) {
        // Safe fallback
      }

      // Reset form fields
      setWhatIsInside('');
      setSpecialInstructions('');
      setSendDate('Today');
      setSendTime('Any Time (Flexible)');
      setIsCustomDate(false);
      setIsCustomTime(false);
      setCustomDateValue('');
      setCustomTimeValue('');

      await loadMyParcels();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      let friendlyMsg = err.message || 'Failed to post parcel request to network.';
      if (friendlyMsg.includes('E11000') || friendlyMsg.includes('duplicate key')) {
        friendlyMsg = 'A temporary code collision occurred while registering the parcel. Please click submit again to obtain a fresh tracking ID.';
      }
      setMatchingState((prev) =>
        prev
          ? {
              ...prev,
              bookingError: friendlyMsg,
            }
          : null
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenManifest = async (tripId: string) => {
    setManifestData({ trip: null, stops: [], loading: true });
    try {
      const res = await api.getTripStopManifest(tripId);
      setManifestData({
        trip: res.trip,
        stops: res.stops || [],
        loading: false,
      });
    } catch (err: any) {
      console.error('Error loading manifest:', err);
      setManifestData(null);
    }
  };

  const handleSearchAndPreviewRoutes = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!senderName || !senderMobile || !pickupLocation || !pickupAddress) {
      setFormError('Please fill in all sender details.');
      return;
    }
    if (!receiverName || !receiverMobile || !deliveryLocation || !deliveryAddress) {
      setFormError('Please fill in all receiver details.');
      return;
    }
    if (!whatIsInside) {
      setFormError('Please specify what is inside the parcel.');
      return;
    }
    if (!customerOfferPrice || Number(customerOfferPrice) <= 0) {
      setFormError('Please provide a valid delivery offer price in Rupees.');
      return;
    }

    const payload = {
      senderName,
      senderMobile,
      pickupLocation,
      pickupAddress,
      receiverName,
      receiverMobile,
      deliveryLocation,
      deliveryAddress,
      whatIsInside,
      parcelCategory,
      parcelPhotoUrl: parcelPhotoUrl || undefined,
      weightKg: Number(weightKg) > 0 ? Number(weightKg) : 0.002,
      lengthCm: Number(lengthCm) || 20,
      widthCm: Number(widthCm) || 20,
      heightCm: Number(heightCm) || 20,
      approximateValue: Number(approximateValue) || 500,
      specialInstructions,
      customerOfferPrice: Number(customerOfferPrice),
      preferredDeliveryDate,
      preferredLogisticsType,
      sendDate: isCustomDate && customDateValue ? customDateValue : sendDate,
      sendTime:
        isCustomTime && customTimeValue
          ? customTimeValue
          : sendTime && sendTime !== 'Any Time (Flexible)'
          ? sendTime
          : 'Flexible',
      selectedAgentId: selectedAgent?._id || undefined,
      agentId: selectedAgent?._id || undefined,
      agentSelected: deliveryMode === 'agent',
      deliveryMode,
    };

    setIsSubmitting(true);
    try {
      const res = await api.searchParcelMatches({
        pickupLocation: payload.pickupLocation,
        deliveryLocation: payload.deliveryLocation,
        weightKg: payload.weightKg,
        sendDate: payload.sendDate,
        sendTime: payload.sendTime,
        flexibleDate: false,
        customerOfferPrice: payload.customerOfferPrice,
      });

      // Open Matching Modal BEFORE saving to DB
      setMatchingState({
        parcel: payload,
        formData: payload,
        matches: res.matches || [],
        matchCount: res.matchCount || (res.matches ? res.matches.length : 0),
        isSearching: false,
        flexibleDate: false,
        bookingTripId: null,
        bookingSuccess: null,
        bookingError: null,
        isPreBooking: true,
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to search available routes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredParcels = myParcels.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.parcelId?.toLowerCase().includes(q) ||
      p.parcelTrackingNumber?.toLowerCase().includes(q) ||
      p.pickupLocation?.toLowerCase().includes(q) ||
      p.deliveryLocation?.toLowerCase().includes(q) ||
      p.whatIsInside?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q)
    );
  });

  const isLocationMatch = (loc1?: string, loc2?: string) => {
    if (!loc1 || !loc2) return false;
    const n1 = loc1.toLowerCase().replace(/[^\w\s]/gi, ' ').trim();
    const n2 = loc2.toLowerCase().replace(/[^\w\s]/gi, ' ').trim();
    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
  };

  const renderTransportBadge = (methodCategory?: string, transportType?: string) => {
    const text = (methodCategory || transportType || 'Logistics').toLowerCase();
    if (text.includes('bus')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          🚌 Bus
        </span>
      );
    }
    if (text.includes('travelling') || text.includes('commuter') || text.includes('person')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
          🚶 Travelling Person / Commuter
        </span>
      );
    }
    if (text.includes('bike')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
          🏍️ Bike Courier
        </span>
      );
    }
    if (text.includes('auto')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
          🛺 Auto / Local Transport
        </span>
      );
    }
    if (text.includes('van') || text.includes('truck')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
          🚐 Van / Mini-Truck
        </span>
      );
    }
    if (text.includes('cab') || text.includes('car')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
          🚗 Car / Shared Cab
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900 border border-teal-300">
        📦 Professional Logistics
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('DELIVERED')) {
      return <Badge className="bg-emerald-600 text-white font-semibold">DELIVERED</Badge>;
    }
    if (s.includes('RECEIVED_BY_AGENT') || s.includes('HUB')) {
      return <Badge className="bg-amber-600 text-white font-semibold">AT VILLAGE HUB</Badge>;
    }
    if (s.includes('PICKED_UP') || s.includes('IN_TRANSIT')) {
      return <Badge className="bg-blue-600 text-white font-semibold">IN TRANSIT</Badge>;
    }
    if (s.includes('ACCEPTED') || s.includes('READY')) {
      return <Badge className="bg-indigo-600 text-white font-semibold">PARTNER ACCEPTED</Badge>;
    }
    if (s.includes('ASSIGNED')) {
      return <Badge className="bg-indigo-700 text-white font-semibold">PARTNER ASSIGNED</Badge>;
    }
    if (s.includes('SEARCHING')) {
      return <Badge className="bg-orange-500 text-white font-semibold animate-pulse">SEARCHING PARTNER</Badge>;
    }
    return <Badge className="bg-gray-600 text-white font-semibold">{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getStatusStepIndex = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('DELIVERED')) return 5;
    if (s.includes('RECEIVED') || s.includes('HUB')) return 4;
    if (s.includes('IN_TRANSIT')) return 3;
    if (s.includes('PICKED_UP')) return 2;
    if (s.includes('ACCEPTED') || s.includes('READY')) return 1;
    return 0; // CREATED / SEARCHING
  };

  const TIMELINE_STEPS = [
    'Created',
    'Partner Found',
    'Picked Up',
    'In Transit',
    'At Hub',
    'Delivered',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Package className="w-3.5 h-3.5" />
            Peer-to-Peer & Shared Parcel Dispatch
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Parcels & Tracking Hub
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Book parcel transit with traveling commuters and fleet partners across cities and towns, secured with 3-tier
            verification codes and live GPS handover logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => loadMyParcels()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingParcels ? 'animate-spin' : ''}`} />
            Refresh Parcels
          </Button>
          <a
            href="#create-parcel-form"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create New Parcel
          </a>
        </div>
      </div>

      {/* Success Notification Banner */}
      {formSuccess && (
        <div className={`p-6 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 space-y-4 border-2 ${
          formSuccess.assignedPartner
            ? 'bg-emerald-50 border-emerald-500'
            : 'bg-amber-50 border-amber-500'
        }`}>
          <div className="flex items-start gap-3">
            <CheckCircle2 className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
              formSuccess.assignedPartner ? 'text-emerald-600' : 'text-amber-600'
            }`} />
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${
                formSuccess.assignedPartner ? 'text-emerald-950' : 'text-amber-950'
              }`}>
                {formSuccess.assignedPartner
                  ? `Parcel Booked Successfully with ${formSuccess.assignedPartner}!`
                  : 'Parcel Request Posted to Logistics Network!'}
              </h3>
              <p className={`text-xs mt-0.5 ${
                formSuccess.assignedPartner ? 'text-emerald-800' : 'text-amber-800'
              }`}>
                {formSuccess.assignedPartner
                  ? `Assigned to Trip ${formSuccess.assignedTrip}. Status: PARTNER_ASSIGNED. Transporter will collect the parcel according to schedule.`
                  : 'Status: SEARCHING_FOR_PARTNER. Your parcel request is now active in MongoDB. Commuters and fleet operators traveling this corridor will be notified.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-emerald-200 text-xs">
            <div>
              <span className="text-gray-500 block font-semibold text-[10px] uppercase">Parcel Tracking</span>
              <span className="font-mono font-bold text-gray-900 text-sm block">{formSuccess.parcelId}</span>
              <span className="font-mono text-[11px] text-primary-700 block">{formSuccess.trackingNumber}</span>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-amber-900 font-bold block text-[10px] uppercase">1. Secure Pickup Code</span>
              <span className="font-mono font-black text-amber-950 text-base block mt-0.5">
                {formSuccess.pickupCode}
              </span>
              <span className="text-[10px] text-amber-800 block mt-0.5">
                Give to transporter when they collect parcel.
              </span>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-blue-900 font-bold block text-[10px] uppercase">2. Receiver Delivery Code</span>
              <span className="font-mono font-black text-blue-950 text-base block mt-0.5">
                {formSuccess.deliveryPin}
              </span>
              <span className="text-[10px] text-blue-800 block mt-0.5">
                Keep private. Receiver gives to deliverer upon delivery.
              </span>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-700 font-bold block text-[10px] uppercase">Agent Handover Code</span>
              <span className="font-mono text-gray-500 text-xs block mt-1">Managed by Hub</span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                Used only for transporter-to-agent transfer. Not customer-facing.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={() => router.push(`/track/${formSuccess.trackingNumber}`)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
            >
              Track This Parcel Now →
            </Button>
            <Button
              variant="outline"
              onClick={() => setFormSuccess(null)}
              className="text-xs text-emerald-800 border-emerald-300"
            >
              Dismiss Notification
            </Button>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 1. CREATE NEW PARCEL FORM */}
      {/* ================================================== */}
      <section id="create-parcel-form" className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-800 to-primary-700 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <span className="text-amber-300 text-xs font-bold tracking-wider uppercase block">
              Step 1 of Dispatch
            </span>
            <h2 className="text-2xl font-bold">CREATE NEW PARCEL</h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <form onSubmit={handleSearchAndPreviewRoutes} className="p-6 sm:p-8 space-y-8">
          {formError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* SENDER & RECEIVER COLUMNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* SENDER DETAILS */}
            <div className="space-y-4 p-5 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                  SENDER DETAILS (ORIGIN)
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sender Name *</label>
                <Input
                  type="text"
                  placeholder="e.g. Priya Sharma / Kisan Kendra"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="bg-white text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sender Mobile *</label>
                <Input
                  type="tel"
                  placeholder="e.g. 9999900005"
                  value={senderMobile}
                  onChange={(e) => setSenderMobile(e.target.value)}
                  className="bg-white text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Village / City *</label>
                <Input
                  type="text"
                  placeholder="e.g. Darbhanga / Sonapur"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="bg-white text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Detailed Pickup Address *</label>
                <Input
                  type="text"
                  placeholder="e.g. Near Station Road, Gate #2"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="bg-white text-xs h-9"
                  required
                />
              </div>
            </div>

            {/* RECEIVER DETAILS */}
            <div className="space-y-4 p-5 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-secondary-600" />
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                    RECEIVER DETAILS (DESTINATION)
                  </h3>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Choose Drop Method</span>
              </div>

              {/* SENDER AUTHORITY: SELECT DELIVERY DESTINATION TYPE */}
              <div className="space-y-2">
                <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-xl">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deliveryMode === 'agent'}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSwitchToAgent();
                        } else {
                          handleSwitchToDirect();
                        }
                      }}
                      className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        Use Village Agent for delivery (Middle-Point Hub)
                      </span>
                      <span className="text-[11px] text-gray-600 block">
                        Carrier hands over to assigned Village Agent using 4-digit Agent Code. Receiver collects with PIN.
                      </span>
                    </div>
                  </label>
                </div>

                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Delivery Destination Mode *
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/70 rounded-xl">
                  <button
                    type="button"
                    onClick={handleSwitchToAgent}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                      deliveryMode === 'agent'
                        ? 'bg-white text-amber-900 shadow-sm border border-amber-300'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Store className={`w-4 h-4 ${deliveryMode === 'agent' ? 'text-amber-700' : 'text-gray-500'}`} />
                    <span>Village Agent Hub</span>
                    {deliveryMode === 'agent' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 ml-1" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSwitchToDirect}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                      deliveryMode === 'direct'
                        ? 'bg-white text-emerald-900 shadow-sm border border-emerald-300'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <UserIcon className={`w-4 h-4 ${deliveryMode === 'direct' ? 'text-emerald-700' : 'text-gray-500'}`} />
                    <span>Direct to Receiver</span>
                    {deliveryMode === 'direct' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 ml-1" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {deliveryMode === 'agent'
                    ? 'Deliver to a verified Village Agent Hub. Recipient collects locally with 4-digit PIN.'
                    : 'Transporter delivers directly to recipient’s private doorstep or counter address.'}
                </p>
              </div>

              {/* WHEN VILLAGE AGENT IS SELECTED */}
              {deliveryMode === 'agent' && (
                <div className="space-y-3 pt-1">
                  {/* SELECTED AGENT PROFILE CARD */}
                  {selectedAgent && !isSearchingAgent ? (
                    <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/70 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                              SELECTED DROP HUB
                            </span>
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-mono text-[10px] font-bold">
                              {selectedAgent.hubCode}
                            </Badge>
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Active Hub
                            </Badge>
                          </div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            {selectedAgent.villageName}
                          </h4>
                          <p className="text-xs text-gray-700">
                            Agent: <strong>{selectedAgent.userId?.name || selectedAgent.hubAddress?.contactPerson || 'Village Hub Agent'}</strong> ({selectedAgent.userId?.phone || selectedAgent.hubAddress?.contactPhone || '9999900004'})
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsSearchingAgent(true)}
                          className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-white hover:bg-amber-100 rounded-lg border border-amber-200 transition shrink-0"
                        >
                          Change Hub
                        </button>
                      </div>

                      <div className="text-xs text-gray-600 border-t border-amber-200/60 pt-2 space-y-1">
                        <div>
                          <span className="text-gray-500">Facility Address:</span> {selectedAgent.hubAddress?.addressLine}, {selectedAgent.hubAddress?.villageOrCity} {selectedAgent.hubAddress?.pincode ? `(${selectedAgent.hubAddress?.pincode})` : ''}
                        </div>
                        {selectedAgent.servingVillages && selectedAgent.servingVillages.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-0.5">
                            <span className="text-[11px] text-gray-500">Coverage:</span>
                            {selectedAgent.servingVillages.map((v: string, i: number) => (
                              <span key={i} className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-900 font-medium">
                                {v}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                          <span>Hours: {selectedAgent.workingHours || '08:00 AM - 07:30 PM'}</span>
                          <span>Rating: {selectedAgent.rating || 4.9} ⭐ ({selectedAgent.totalDelivered || 180}+ drops)</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* SMALL SEARCH SECTION WHERE SENDER CAN SEARCH VILLAGE NAME / AGENT PROFILE */
                    <div className="space-y-2.5 p-3.5 rounded-xl border border-amber-200 bg-amber-50/40">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-amber-700" />
                          <span>Search Village Name or Hub Profile</span>
                        </label>
                        {selectedAgent && (
                          <button
                            type="button"
                            onClick={() => setIsSearchingAgent(false)}
                            className="text-[11px] text-gray-500 hover:text-gray-800 underline"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                        <Input
                          type="text"
                          placeholder="Type Village Name (e.g. Bahera, Sonapur, Gajhara) or Hub Code..."
                          value={agentSearch}
                          onChange={(e) => handleSearchAgents(e.target.value)}
                          className="bg-white text-xs h-9 pl-9 rounded-xl border-amber-200"
                        />
                      </div>

                      {/* Quick Village Suggestion Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-gray-500 font-semibold">Quick Villages:</span>
                        {['Village Bahera', 'Sonapur', 'Ramnagar', 'GAJHARA', 'Chunar'].map((vName) => (
                          <button
                            key={vName}
                            type="button"
                            onClick={() => handleSearchAgents(vName)}
                            className="text-[10px] bg-white hover:bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 font-medium transition"
                          >
                            {vName}
                          </button>
                        ))}
                      </div>

                      {/* Matching Agent Profiles List */}
                      <div className="space-y-2 max-h-56 overflow-y-auto pt-1 pr-1">
                        {loadingAgents ? (
                          <div className="text-center py-4 text-xs text-gray-500 flex items-center justify-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                            <span>Finding village agent hubs...</span>
                          </div>
                        ) : availableAgents.length === 0 ? (
                          <div className="p-3 text-center bg-white rounded-lg border border-dashed border-gray-200 text-xs text-gray-500">
                            No village agent hubs found matching &quot;{agentSearch}&quot;.
                          </div>
                        ) : (
                          availableAgents.map((ag: any) => (
                            <div
                              key={ag._id}
                              className="p-3 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-2xs transition space-y-1.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-gray-900">
                                      {ag.villageName}
                                    </span>
                                    <Badge className="bg-amber-50 text-amber-800 border-amber-200 font-mono text-[9px]">
                                      {ag.hubCode}
                                    </Badge>
                                  </div>
                                  <div className="text-[11px] text-gray-600 mt-0.5">
                                    Agent: <strong>{ag.userId?.name || ag.hubAddress?.contactPerson || 'Village Agent'}</strong> ({ag.userId?.phone || ag.hubAddress?.contactPhone || '9999900004'})
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => handleSelectAgent(ag)}
                                  size="sm"
                                  className="h-7 px-3 bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold rounded-lg shrink-0"
                                >
                                  Select Hub
                                </Button>
                              </div>

                              <div className="text-[11px] text-gray-500">
                                📍 {ag.hubAddress?.addressLine}, {ag.hubAddress?.villageOrCity}
                              </div>

                              {ag.servingVillages && ag.servingVillages.length > 0 && (
                                <div className="text-[10px] text-amber-800 bg-amber-50/60 p-1 rounded border border-amber-100 truncate">
                                  Serving: {ag.servingVillages.join(', ')}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* RECIPIENT INFORMATION (APPLIES TO BOTH MODES) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Receiver / Contact Person Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Rameshwar Bahera"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="bg-white text-xs h-9"
                  required
                />
                <span className="text-[10px] text-gray-400">
                  {deliveryMode === 'agent'
                    ? 'Person authorized to collect package at the village hub with delivery PIN.'
                    : 'Recipient receiving delivery at doorstep.'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Receiver Mobile (For SMS PIN) *
                </label>
                <Input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={receiverMobile}
                  onChange={(e) => setReceiverMobile(e.target.value)}
                  className="bg-white text-xs h-9"
                  required
                />
                <span className="text-[10px] text-gray-400">
                  The 4-digit Delivery PIN will be sent to this number.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Delivery Village / City *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Village Bahera / Sonapur"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="bg-white text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Detailed Delivery Address *
                </label>
                <Input
                  type="text"
                  placeholder={
                    deliveryMode === 'agent'
                      ? 'e.g. Village Drop Hub [VH-BR-0108] - House 14, Main Chowk, Village Bahera'
                      : 'e.g. House 14, Main Chowk, Village Bahera'
                  }
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="bg-white text-xs h-9"
                  required
                />
              </div>
            </div>
          </div>

          {/* PARCEL DETAILS */}
          <div className="space-y-4 p-5 rounded-xl bg-emerald-50/40 border border-emerald-200">
            <div className="flex items-center gap-2 border-b border-emerald-200 pb-2">
              <Package className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                PARCEL DETAILS & SPECS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">What is inside? *</label>
                <Input
                  type="text"
                  placeholder="e.g. Clothes, Handmade Shawls, Desi Ghee, Ceramic Pots"
                  value={whatIsInside}
                  onChange={(e) => setWhatIsInside(e.target.value)}
                  className="bg-white text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Parcel Category</label>
                <select
                  value={parcelCategory}
                  onChange={(e) => setParcelCategory(e.target.value)}
                  className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  {PARCEL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Weight (KG) * <span className="text-gray-500 font-normal">(No minimum load — from 2 grams / 0.002 KG)</span>
                </label>
                <Input
                  type="number"
                  step="0.001"
                  min="0.001"
                  placeholder="e.g. 0.002 (2 grams), 0.5, or 3.0"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="bg-white text-xs h-9"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Dimensions (L × W × H in cm)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <Input
                    type="number"
                    placeholder="L"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(e.target.value)}
                    className="bg-white text-xs h-9 text-center px-1"
                  />
                  <Input
                    type="number"
                    placeholder="W"
                    value={widthCm}
                    onChange={(e) => setWidthCm(e.target.value)}
                    className="bg-white text-xs h-9 text-center px-1"
                  />
                  <Input
                    type="number"
                    placeholder="H"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="bg-white text-xs h-9 text-center px-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Approximate Parcel Value (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g. 850"
                  value={approximateValue}
                  onChange={(e) => setApproximateValue(e.target.value)}
                  className="bg-white text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Parcel Photo URL (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={parcelPhotoUrl}
                  onChange={(e) => setParcelPhotoUrl(e.target.value)}
                  className="bg-white text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Special Instructions</label>
                <Input
                  type="text"
                  placeholder="e.g. Keep upright, fragile pottery, call before drop"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="bg-white text-xs h-9"
                />
              </div>
            </div>
          </div>

          {/* DELIVERY OFFER & SCHEDULE */}
          <div className="space-y-4 p-5 rounded-xl bg-amber-50/40 border border-amber-200">
            <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
              <Truck className="w-4 h-4 text-amber-800" />
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                DELIVERY OFFER & TIMING
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Customer Offered Delivery Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-gray-500">₹</span>
                  <Input
                    type="number"
                    min="10"
                    placeholder="e.g. 200"
                    value={customerOfferPrice}
                    onChange={(e) => setCustomerOfferPrice(e.target.value)}
                    className="bg-white text-xs h-9 pl-7 font-bold text-primary-800"
                    required
                  />
                </div>
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  Fair price offered to travelling partner for carrying this parcel
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Preferred Delivery Deadline (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Today / By 6 PM / Tomorrow Morning"
                  value={preferredDeliveryDate}
                  onChange={(e) => setPreferredDeliveryDate(e.target.value)}
                  className="bg-white text-xs h-9"
                />
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  Target deadline for receiver handover
                </span>
              </div>
            </div>

            {/* PARCEL SEND TIME & DATE */}
            <div className="pt-3 border-t border-amber-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-700" />
                  When will the parcel be sent? (Send Schedule)
                </label>
                <span className="text-[11px] text-amber-900 font-semibold bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                  Ready: {isCustomDate && customDateValue ? customDateValue : sendDate}{' '}
                  {sendTime && sendTime !== 'Any Time (Flexible)'
                    ? `at ${isCustomTime && customTimeValue ? customTimeValue : sendTime}`
                    : '(Flexible Time)'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-white/90 p-3.5 rounded-xl border border-amber-200/80">
                {/* Send Date Selector */}
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    Parcel Send Date:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {['Today', 'Tomorrow'].map((day) => {
                      const isSelected = !isCustomDate && sendDate === day;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setSendDate(day);
                            setIsCustomDate(false);
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-primary-700 text-white border-primary-700 shadow-xs ring-2 ring-primary-500/20'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setIsCustomDate(true)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        isCustomDate
                          ? 'bg-primary-700 text-white border-primary-700 shadow-xs ring-2 ring-primary-500/20'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Specific Date
                    </button>
                  </div>
                  {isCustomDate && (
                    <Input
                      type="date"
                      value={customDateValue}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCustomDateValue(e.target.value)}
                      className="bg-white text-xs h-9 mt-1"
                    />
                  )}
                </div>

                {/* Send Time Selector (Optional) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      Parcel Send Time:
                    </span>
                    <span className="text-[10px] text-gray-600 font-semibold bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                      Optional
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {['Any Time (Flexible)', '9:00 AM', '1:00 PM', '6:00 PM', '9:00 PM'].map((time) => {
                      const isSelected = !isCustomTime && sendTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            if (isSelected && time !== 'Any Time (Flexible)') {
                              setSendTime('Any Time (Flexible)');
                            } else {
                              setSendTime(time);
                            }
                            setIsCustomTime(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-primary-700 text-white border-primary-700 shadow-xs ring-2 ring-primary-500/20'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setIsCustomTime(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        isCustomTime
                          ? 'bg-primary-700 text-white border-primary-700 shadow-xs ring-2 ring-primary-500/20'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Custom Time
                    </button>
                  </div>
                  {isCustomTime && (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="text"
                        placeholder="e.g. 10:30 AM or 9:00 PM"
                        value={customTimeValue}
                        onChange={(e) => setCustomTimeValue(e.target.value)}
                        className="bg-white text-xs h-9 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomTime(false);
                          setCustomTimeValue('');
                          setSendTime('Any Time (Flexible)');
                        }}
                        className="text-[11px] text-gray-600 hover:text-gray-900 underline whitespace-nowrap px-1"
                      >
                        Reset to Any Time
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[11px] text-gray-500 block">
                Send time is optional. If left as Any Time, travelling partners can pick up the consignment flexibly during the scheduled day.
              </span>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-700 hover:bg-primary-800 text-white font-bold px-8 h-12 rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Searching Matching Routes & Partners...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  FIND MATCHING PARTNERS & BOOK
                </>
              )}
            </Button>
          </div>
        </form>
      </section>

      {/* ================================================== */}
      {/* 2. MY PARCELS (Real MongoDB Parcels for User) */}
      {/* ================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">MY PARCELS</h2>
            <p className="text-xs text-gray-500">
              Live tracking & status timeline for consignments created by your account
            </p>
          </div>

          {/* Search filter */}
          <div className="relative max-w-xs w-full">
            <Input
              type="text"
              placeholder="Search by Parcel ID, Location, Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs h-9 pl-8"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {loadingParcels ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary-700" />
            <p className="text-sm font-medium">Fetching real parcels from MongoDB...</p>
          </div>
        ) : filteredParcels.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300 space-y-3">
            <Package className="w-10 h-10 mx-auto text-gray-300" />
            <h3 className="text-base font-bold text-gray-800">No Parcels Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              You haven't created any parcels yet. Use the "CREATE NEW PARCEL" form above to book your first delivery.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParcels.map((parcel) => {
              const currentStepIdx = getStatusStepIndex(parcel.status);
              const pickupCity = parcel.pickupLocation || parcel.senderLocation?.villageOrCity || 'Origin';
              const dropCity = parcel.deliveryLocation || parcel.destinationLocation?.villageOrCity || 'Destination';

              return (
                <div
                  key={parcel._id}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Header: IDs & Status */}
                    <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                          Parcel ID
                        </span>
                        <span className="text-sm font-mono font-bold text-gray-900 block">
                          {parcel.parcelId || parcel._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[11px] font-mono text-primary-700 block">
                          {parcel.parcelTrackingNumber}
                        </span>
                      </div>
                      {getStatusBadge(parcel.status)}
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                      <span>{pickupCity}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span>{dropCity}</span>
                    </div>

                    {/* Content & Specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-gray-400 block text-[10px]">What is inside:</span>
                        <span className="font-semibold text-gray-900 truncate block">
                          {parcel.whatIsInside || 'Goods'}
                        </span>
                        <span className="text-gray-500 text-[11px]">{parcel.weightKg} KG</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Send Schedule:</span>
                        <span className="font-semibold text-gray-900 block truncate">
                          {parcel.sendDate || 'Today'} {parcel.sendTime ? `• ${parcel.sendTime}` : ''}
                        </span>
                        <span className="text-emerald-700 font-bold text-[11px]">
                          Offer: ₹{parcel.customerOfferPrice || 150}
                        </span>
                      </div>
                    </div>

                    {/* Step-by-Step Timeline Preview */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[10px] font-medium text-gray-500 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-primary-700">
                          Step {currentStepIdx + 1} of {TIMELINE_STEPS.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {TIMELINE_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          return (
                            <div key={step} className="text-center">
                              <div
                                className={`h-1.5 rounded-full ${
                                  isDone ? 'bg-primary-600' : 'bg-gray-200'
                                }`}
                              />
                              <span className="text-[8px] text-gray-400 block truncate mt-0.5">
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payment Status & Method Badge */}
                    <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                          Payment Status
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {parcel.status === 'DELIVERED' || parcel.status === 'delivered' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                              {parcel.paymentMethod === 'CASH_TO_PARTNER' ? 'PAID (CASH CONFIRMED)' : 'PAID & DELIVERED'}
                            </Badge>
                          ) : parcel.paymentStatus === 'PAID' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                              {parcel.paymentMethod === 'ONLINE_RAZORPAY' ? 'PAID ONLINE (RAZORPAY)' : 'PAID (CASH CONFIRMED)'}
                            </Badge>
                          ) : parcel.paymentStatus === 'CASH_PENDING' ? (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-[10px]">
                              CASH ON PICKUP (PENDING)
                            </Badge>
                          ) : (
                            <Badge className="bg-red-50 text-red-700 border-red-200 font-bold text-[10px]">
                              UNPAID
                            </Badge>
                          )}
                          <span className="font-bold text-gray-800 font-mono">
                            ₹{parcel.customerOfferPrice || 150}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                          Method
                        </span>
                        <span className="text-xs font-semibold text-gray-700 block">
                          {parcel.paymentMethod === 'CASH_TO_PARTNER'
                            ? 'Cash to Carrier'
                            : parcel.paymentMethod === 'ONLINE_RAZORPAY'
                            ? 'Razorpay Online'
                            : 'Pending Selection'}
                        </span>
                      </div>
                    </div>

                    {/* Razorpay Online Paid Confirmation Box */}
                    {parcel.paymentMethod === 'ONLINE_RAZORPAY' && parcel.paymentStatus === 'PAID' && parcel.status !== 'DELIVERED' && parcel.status !== 'delivered' && (
                      <div className="p-3 bg-emerald-50/90 border border-emerald-300 rounded-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Paid Online via Razorpay (₹{parcel.customerOfferPrice || 150})
                          </span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-black uppercase">
                            No Cash Due
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          Pickup code is ready for carrier. Do not pay any cash to transporter upon collection.
                        </p>
                      </div>
                    )}

                    {/* Rejection Alert if carrier declined */}
                    {parcel.rejectionReason && parcel.status === 'SEARCHING_FOR_PARTNER' && (
                      <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 text-red-900 font-bold">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Partner Declined Offer</span>
                        </div>
                        <p className="text-[11px] text-red-800">
                          Reason: "{parcel.rejectionReason}"
                        </p>
                        <Button
                          type="button"
                          onClick={() => handleOpenMatching(parcel, false)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-8 shadow-xs flex items-center justify-center gap-1.5 rounded-lg"
                        >
                          <Search className="w-3.5 h-3.5" />
                          SEARCH OTHER PARTNERS
                        </Button>
                      </div>
                    )}

                    {/* Partner Accepted -> Payment Prompt Banner */}
                    {parcel.status === 'PARTNER_ACCEPTED' && parcel.paymentStatus === 'UNPAID' && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Offer Accepted (₹{parcel.customerOfferPrice})
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            Ready
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          The carrier agreed to transport your parcel. Select cash or online payment to confirm pickup.
                        </p>
                        <Button
                          type="button"
                          onClick={() =>
                            setPaymentModalData({
                              parcelId: parcel.parcelId || parcel._id,
                              trackingNumber: parcel.parcelTrackingNumber,
                              partnerName: parcel.assignedPartnerName || 'Logistics Carrier',
                              offeredPrice: parcel.customerOfferPrice || 150,
                              pickupLocation: parcel.pickupLocation || 'Origin',
                              deliveryLocation: parcel.deliveryLocation || 'Destination',
                            })
                          }
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 shadow-xs flex items-center justify-center gap-1.5 rounded-lg"
                        >
                          <IndianRupee className="w-3.5 h-3.5" />
                          SELECT PAYMENT METHOD (₹{parcel.customerOfferPrice})
                        </Button>
                      </div>
                    )}

                    {/* Custody Verification Stages Panel (One-Time State) */}
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                        <span className="font-bold text-gray-700 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-primary-700" />
                          Custody Verification Stages
                        </span>
                        {parcel.agentSelected && (
                          <Badge className="bg-orange-50 text-orange-800 border-orange-200 text-[10px] font-bold">
                            Via Village Hub
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* Step 1: Pickup */}
                        <div className={`p-2 rounded-lg border ${
                          parcel.verificationCodes?.pickup?.status === 'VERIFIED'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            : 'bg-amber-50 border-amber-200 text-amber-950'
                        }`}>
                          <span className="text-[10px] font-bold block uppercase">1. Pickup</span>
                          {parcel.verificationCodes?.pickup?.status === 'VERIFIED' ? (
                            <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5 text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ✓ Verified
                            </span>
                          ) : (
                            <div>
                              <span className="font-bold text-amber-900 text-[11px]">
                                Code: {parcel.pickupCode ? <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 font-extrabold">{parcel.pickupCode}</span> : 'Pending'}
                              </span>
                              <span className="text-[9px] text-amber-700 block mt-0.5">Share with driver</span>
                            </div>
                          )}
                        </div>

                        {/* Step 2: Agent Handover or Direct Transit */}
                        {parcel.agentSelected ? (
                          <div className={`p-2 rounded-lg border ${
                            parcel.verificationCodes?.agent?.status === 'VERIFIED'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                              : 'bg-orange-50 border-orange-200 text-orange-950'
                          }`}>
                            <span className="text-[10px] font-bold block uppercase">2. Village Agent</span>
                            {parcel.verificationCodes?.agent?.status === 'VERIFIED' ? (
                              <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5 text-[11px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                ✓ Verified
                              </span>
                            ) : (
                              <span className="font-bold text-orange-800 text-[11px] block mt-0.5">
                                ⏳ Hub Transfer
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg border bg-gray-100/70 border-gray-200 text-gray-500">
                            <span className="text-[10px] font-bold block uppercase">2. Transit</span>
                            <span className="text-[11px] font-medium text-gray-600 block mt-0.5">Direct Route</span>
                          </div>
                        )}

                        {/* Step 3: Delivery */}
                        <div className={`p-2 rounded-lg border ${
                          parcel.verificationCodes?.delivery?.status === 'VERIFIED' || parcel.status === 'DELIVERED'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            : 'bg-blue-50 border-blue-200 text-blue-950'
                        }`}>
                          <span className="text-[10px] font-bold block uppercase">3. Delivery Code</span>
                          {parcel.verificationCodes?.delivery?.status === 'VERIFIED' || parcel.status === 'DELIVERED' ? (
                            <span className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5 text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ✓ Delivered
                            </span>
                          ) : (
                            <div>
                              <span className="font-bold text-blue-900 text-[11px] block">
                                Code: {(parcel.deliveryCode || parcel.deliveryPin) ? (
                                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-300 font-extrabold text-blue-950">
                                    {parcel.deliveryCode || parcel.deliveryPin}
                                  </span>
                                ) : 'Pending'}
                              </span>
                              <span className="text-[9px] text-blue-700 block mt-0.5">Share with deliverer</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ROUTE MATCHING / ASSIGNED PARTNER SECTION */}
                    {parcel.status === 'SEARCHING_FOR_PARTNER' && !parcel.rejectionReason && (
                      <div className="p-3 bg-linear-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-amber-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            Route Matching Active
                          </span>
                          <span className="text-[10px] text-amber-700 font-semibold px-2 py-0.5 rounded-full bg-amber-100">
                            Awaiting Partner
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          Looking for active trips matching {pickupCity} ➔ {dropCity}.
                        </p>
                        <Button
                          type="button"
                          onClick={() => handleOpenMatching(parcel, false)}
                          className="w-full bg-linear-to-r from-amber-600 to-primary-700 hover:from-amber-700 hover:to-primary-800 text-white font-bold text-xs h-8 shadow-xs flex items-center justify-center gap-1.5 rounded-lg"
                        >
                          <Search className="w-3.5 h-3.5" />
                          FIND / SELECT PARTNER OPTIONS
                        </Button>
                      </div>
                    )}

                    {(parcel.status === 'PARTNER_ASSIGNED' ||
                      parcel.status === 'PARTNER_ACCEPTED' ||
                      Boolean(parcel.assignedTripCode)) && (
                      <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-indigo-600" />
                            Assigned Logistics Carrier
                          </span>
                          {parcel.assignedTripCode && (
                            <span className="font-mono text-[10px] bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-bold">
                              {parcel.assignedTripCode}
                            </span>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-gray-900 font-bold text-xs truncate">
                            {parcel.assignedPartnerName ||
                              parcel.currentPartnerId?.businessName ||
                              'Verified Logistics Partner'}
                          </p>
                          <div className="text-[11px] text-gray-600 flex items-center justify-between">
                            <span>Pickup: {parcel.pickupStopName || parcel.pickupLocation}</span>
                            <span>➔ Drop: {parcel.destinationStopName || parcel.deliveryLocation}</span>
                          </div>
                        </div>
                        {parcel.assignedTripCode && (
                          <button
                            type="button"
                            onClick={() => handleOpenManifest(parcel.assignedTripCode!)}
                            className="text-[11px] text-primary-700 hover:text-primary-900 hover:underline font-bold flex items-center gap-1 pt-1"
                          >
                            <Route className="w-3.5 h-3.5" /> View Stop-by-Stop Route Manifest →
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                    <Button
                      onClick={() => router.push(`/track/${parcel.parcelTrackingNumber}`)}
                      className="flex-1 bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold h-9"
                    >
                      TRACK
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedParcel(parcel)}
                      className="flex-1 text-xs h-9 border-gray-300 font-semibold"
                    >
                      VIEW DETAILS
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================================================== */}
      {/* 3. PARCEL DETAILS MODAL */}
      {/* ================================================== */}
      {selectedParcel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                  Parcel Specifications
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedParcel.parcelId || selectedParcel.parcelTrackingNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedParcel(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">SENDER DETAILS</h4>
                <p><span className="text-gray-500">Name:</span> {selectedParcel.senderName}</p>
                <p><span className="text-gray-500">Mobile:</span> {selectedParcel.senderMobile}</p>
                <p><span className="text-gray-500">Location:</span> {selectedParcel.pickupLocation}</p>
                <p><span className="text-gray-500">Address:</span> {selectedParcel.pickupAddress}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">RECEIVER DETAILS</h4>
                <p><span className="text-gray-500">Name:</span> {selectedParcel.receiverName}</p>
                <p><span className="text-gray-500">Mobile:</span> {selectedParcel.receiverMobile}</p>
                <p><span className="text-gray-500">Location:</span> {selectedParcel.deliveryLocation}</p>
                <p><span className="text-gray-500">Address:</span> {selectedParcel.deliveryAddress}</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl text-xs space-y-2 border border-emerald-200">
              <h4 className="font-bold text-emerald-950 border-b border-emerald-200 pb-1">PARCEL SPECIFICATIONS</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <p><span className="text-emerald-800">What is inside:</span> <b>{selectedParcel.whatIsInside}</b></p>
                <p><span className="text-emerald-800">Weight:</span> <b>{selectedParcel.weightKg} KG</b></p>
                <p><span className="text-emerald-800">Category:</span> <b>{selectedParcel.parcelCategory}</b></p>
                <p><span className="text-emerald-800">Send Schedule:</span> <b>{selectedParcel.sendDate || 'Today'} {selectedParcel.sendTime ? `• ${selectedParcel.sendTime}` : ''}</b></p>
                <p><span className="text-emerald-800">Offer:</span> <b>₹{selectedParcel.customerOfferPrice}</b></p>
                <p><span className="text-emerald-800">Preferred Date:</span> <b>{selectedParcel.preferredDeliveryDate}</b></p>
              </div>
              {selectedParcel.specialInstructions && (
                <p className="pt-1 text-gray-700">
                  <span className="text-gray-500">Special Notes:</span> {selectedParcel.specialInstructions}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pickup Stage */}
              <div className={`p-3.5 rounded-xl border text-center ${
                selectedParcel.verificationCodes?.pickup?.status === 'VERIFIED'
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-amber-50 border-amber-300'
              }`}>
                <span className="text-xs font-bold text-gray-700 block uppercase">1. Pickup Code</span>
                <span className="text-[10px] text-gray-500 block">Used when transporter collects parcel.</span>
                {selectedParcel.verificationCodes?.pickup?.status === 'VERIFIED' ||
                ['IN_TRANSIT', 'PICKED_UP', 'RECEIVED_BY_AGENT', 'AT_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(
                  (selectedParcel.status || '').toUpperCase()
                ) ? (
                  <div className="mt-2 space-y-1">
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-extrabold text-xs bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ✓ Verified
                    </span>
                    <span className="font-mono font-bold text-xs text-emerald-950 block">
                      Code: {selectedParcel.pickupCode || selectedParcel.verificationCodes?.pickup?.code || '••••'}
                    </span>
                    <span className="text-[10px] text-emerald-700 block font-medium">
                      Custody transferred to carrier
                    </span>
                  </div>
                ) : (
                  <div className="mt-1.5">
                    <span className="text-xl font-mono font-extrabold text-amber-950 block">
                      {selectedParcel.pickupCode || selectedParcel.verificationCodes?.pickup?.code || '••••'}
                    </span>
                    <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">
                      (Give to driver upon pickup)
                    </span>
                  </div>
                )}
              </div>

              {/* Agent Handover Stage */}
              {selectedParcel.agentSelected ? (
                <div className={`p-3.5 rounded-xl border text-center ${
                  selectedParcel.verificationCodes?.agent?.status === 'VERIFIED' || selectedParcel.verificationCodes?.agentHandover?.status === 'VERIFIED'
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-orange-50 border-orange-300'
                }`}>
                  <span className="text-xs font-bold text-gray-700 block uppercase">2. Village Agent Handover</span>
                  <span className="text-[10px] text-gray-500 block">Transporter to Hub transfer only.</span>
                  {selectedParcel.verificationCodes?.agent?.status === 'VERIFIED' || selectedParcel.verificationCodes?.agentHandover?.status === 'VERIFIED' ? (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 text-emerald-800 font-extrabold text-sm bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ✓ Verified
                      </span>
                      <span className="text-[10px] text-emerald-700 block mt-1 font-medium">
                        Stored in Village Hub
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1.5">
                      <span className="text-xs font-bold text-orange-900 block">
                        ⏳ Hub Transfer Pending
                      </span>
                      <span className="text-[10px] text-orange-700 block mt-0.5 font-medium">
                        Managed by Village Agent
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-center">
                  <span className="text-xs font-bold text-gray-500 block uppercase">2. Mid-Mile Transit</span>
                  <span className="text-xs text-gray-600 block mt-2 font-medium">
                    Direct Point-to-Point Route
                  </span>
                </div>
              )}

              {/* Final Delivery Stage */}
              <div className={`p-3.5 rounded-xl border text-center ${
                selectedParcel.verificationCodes?.delivery?.status === 'VERIFIED' || selectedParcel.status === 'DELIVERED'
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-blue-50 border-blue-300'
              }`}>
                <span className="text-xs font-bold text-gray-700 block uppercase">3. Final Delivery</span>
                <span className="text-[10px] text-gray-500 block">Used when receiver receives parcel.</span>
                {selectedParcel.verificationCodes?.delivery?.status === 'VERIFIED' || selectedParcel.status === 'DELIVERED' ? (
                  <div className="mt-2 space-y-1">
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-extrabold text-xs bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ✓ Verified
                    </span>
                    <span className="font-mono font-bold text-xs text-emerald-950 block">
                      Code: {selectedParcel.deliveryCode || selectedParcel.deliveryPin || selectedParcel.verificationCodes?.delivery?.code || '••••'}
                    </span>
                    <span className="text-[10px] text-emerald-700 block font-medium">
                      Delivered to recipient
                    </span>
                  </div>
                ) : (
                  <div className="mt-1.5">
                    <span className="text-xs font-bold text-blue-900 block">
                      ⏳ Pending Recipient Delivery
                    </span>
                    <span className="text-[10px] text-blue-700 block mt-0.5 font-medium">
                      Verify code below at doorstep
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ================================================== */}
            {/* SECURE DELIVERY INFORMATION SECTION */}
            {/* ================================================== */}
            <div className="p-5 bg-gradient-to-r from-blue-50/90 to-indigo-50/80 rounded-2xl border-2 border-blue-200 text-xs space-y-3.5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-blue-950 uppercase tracking-wide text-sm">
                      DELIVERY INFORMATION
                    </h4>
                    <span className="text-[11px] text-blue-800">
                      Recipient handover verification PIN
                    </span>
                  </div>
                </div>
                <Badge className={
                  selectedParcel.verificationCodes?.delivery?.status === 'VERIFIED' || ['DELIVERED', 'delivered'].includes((selectedParcel.status || '').toUpperCase())
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                    : 'bg-blue-100 text-blue-900 border-blue-300 font-bold'
                }>
                  Status: {selectedParcel.verificationCodes?.delivery?.status === 'VERIFIED' || ['DELIVERED', 'delivered'].includes((selectedParcel.status || '').toUpperCase()) ? 'VERIFIED' : 'PENDING'}
                </Badge>
              </div>

              {selectedParcel.verificationCodes?.delivery?.status === 'VERIFIED' || ['DELIVERED', 'delivered'].includes((selectedParcel.status || '').toUpperCase()) ? (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-800">Delivery Code</span>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-2xl font-black bg-white px-3 py-1 rounded-lg border border-emerald-300 text-emerald-900 tracking-widest">
                        {selectedParcel.deliveryCode || selectedParcel.deliveryPin || selectedParcel.verificationCodes?.delivery?.code || '••••'}
                      </code>
                      <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-xs bg-emerald-200/80 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        ✅ Delivery Verified
                      </span>
                    </div>
                  </div>
                  {(selectedParcel.verificationCodes?.delivery?.verifiedAt || (selectedParcel as any).deliveredAt) && (
                    <div className="text-xs text-emerald-900 sm:text-right">
                      <span className="text-gray-500 block text-[10px]">Delivered At:</span>
                      <strong className="font-mono text-emerald-950">
                        {formatDate(selectedParcel.verificationCodes?.delivery?.verifiedAt || (selectedParcel as any).deliveredAt)}
                      </strong>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-blue-200 shadow-2xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-800 block">
                        Customer / Receiver Delivery Code
                      </span>
                      <p className="text-xs text-blue-900 mt-0.5">
                        Give this 4-digit code <strong>ONLY</strong> to the person delivering/handing over your parcel when you receive it.
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-900 uppercase">Delivery Code:</span>
                      <code className="font-mono text-2xl font-black bg-blue-50 px-4 py-1.5 rounded-xl border-2 border-blue-400 text-blue-950 tracking-widest shadow-2xs">
                        {selectedParcel.verificationCodes?.delivery?.code ||
                          selectedParcel.deliveryCode ||
                          selectedParcel.deliveryPin ||
                          '••••'}
                      </code>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>⚠️ Keep this code private.</strong> Give it only to the person handing your parcel to you upon physical handover. It confirms receipt and completes delivery.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* If parcel has assigned trip, show details and link to manifest */}
            {selectedParcel.assignedTripCode && (
              <div className="p-4 bg-indigo-50 rounded-xl text-xs space-y-2 border border-indigo-200">
                <div className="flex items-center justify-between border-b border-indigo-200 pb-1">
                  <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    ASSIGNED LOGISTICS CARRIER
                  </h4>
                  <span className="font-mono font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                    {selectedParcel.assignedTripCode}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-indigo-900">
                  <p><span>Carrier:</span> <b>{selectedParcel.assignedPartnerName || selectedParcel.currentPartnerId?.businessName || 'Logistics Partner'}</b></p>
                  <p><span>Transport Mode:</span> <b>{selectedParcel.preferredLogisticsType || 'Vehicle'}</b></p>
                  <p><span>Pickup Stop:</span> <b>{selectedParcel.pickupStopName || selectedParcel.pickupLocation}</b></p>
                  <p><span>Drop Stop:</span> <b>{selectedParcel.destinationStopName || selectedParcel.deliveryLocation}</b></p>
                  <p><span>Expected Pickup:</span> <b>{selectedParcel.expectedPickupTime || 'Scheduled'}</b></p>
                  <p><span>Expected Delivery:</span> <b>{selectedParcel.expectedDeliveryTime || 'Scheduled'}</b></p>
                </div>
                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={() => {
                      const tripCode = selectedParcel.assignedTripCode;
                      setSelectedParcel(null);
                      handleOpenManifest(tripCode!);
                    }}
                    variant="outline"
                    className="w-full text-xs font-bold text-indigo-800 border-indigo-300 hover:bg-indigo-100 flex items-center justify-center gap-1.5"
                  >
                    <Route className="w-3.5 h-3.5" /> View Stop-by-Stop Route Manifest
                  </Button>
                </div>
              </div>
            )}

            {/* If parcel is searching for partner, offer route matching */}
            {selectedParcel.status === 'SEARCHING_FOR_PARTNER' && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                    Route Matching Active
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    SEARCHING_FOR_PARTNER
                  </span>
                </div>
                <p className="text-xs text-amber-800">
                  You can browse active commuter and fleet trips traveling this route to assign a carrier immediately.
                </p>
                <Button
                  type="button"
                  onClick={() => {
                    const pcl = selectedParcel;
                    setSelectedParcel(null);
                    handleOpenMatching(pcl, false);
                  }}
                  className="w-full bg-gradient-to-r from-amber-600 to-primary-700 hover:from-amber-700 hover:to-primary-800 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" /> Find & Select Partner Options
                </Button>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setSelectedParcel(null)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setSelectedParcel(null);
                  router.push(`/track/${selectedParcel.parcelTrackingNumber}`);
                }}
                className="bg-primary-700 hover:bg-primary-800 text-white text-xs font-bold"
              >
                Open Full Tracking Timeline →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 4. REAL ROUTE MATCHING & DELIVERY OPTIONS MODAL */}
      {/* ================================================== */}
      {matchingState && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Peer-to-Peer & Fleet Route Matching Engine
                </div>
                <h3 className="text-2xl font-black text-gray-900">
                  {matchingState.isPreBooking
                    ? 'MATCHING PARTNERS & BOOKING OPTIONS'
                    : 'AVAILABLE DELIVERY OPTIONS'}
                </h3>
                {matchingState.isPreBooking && (
                  <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                    Select a verified partner below to confirm and book your parcel with guaranteed vehicle capacity.
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mt-1">
                  <span className="font-semibold text-gray-800">
                    {matchingState.parcel?.pickupLocation} ➔ {matchingState.parcel?.deliveryLocation}
                  </span>
                  <span>•</span>
                  <span>Weight: <b>{matchingState.parcel?.weightKg} KG</b></span>
                  <span>•</span>
                  <span>Date: <b>{matchingState.parcel?.sendDate || 'Today'}</b></span>
                  {matchingState.flexibleDate && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      Flexible Dates Active
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setMatchingState(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Booking Success Banner */}
            {matchingState.bookingSuccess && (
              <div className="p-5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-emerald-950 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base font-bold">Partner Assigned Successfully!</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {matchingState.bookingSuccess}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Button
                    onClick={() => {
                      const trk = matchingState.parcel?.parcelTrackingNumber;
                      setMatchingState(null);
                      if (trk) router.push(`/track/${trk}`);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-9 px-4 rounded-xl"
                  >
                    Track Parcel Live →
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMatchingState(null)}
                    className="text-xs h-9 border-emerald-300 text-emerald-900"
                  >
                    Close Window
                  </Button>
                </div>
              </div>
            )}

            {/* Booking Error Banner */}
            {matchingState.bookingError && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-xl text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="font-medium">{matchingState.bookingError}</span>
              </div>
            )}

            {/* Searching State */}
            {matchingState.isSearching && (
              <div className="py-16 text-center space-y-4">
                <RefreshCw className="w-10 h-10 animate-spin mx-auto text-primary-700" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-900">
                    Evaluating Active Trips & Logistics Partners...
                  </h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Validating forward stop order (no reverse backtracks), departure schedules, partner verification status, and available weight capacity in MongoDB.
                  </p>
                </div>
              </div>
            )}

            {/* NO MATCHES FOUND (Section 3 Requirement) */}
            {!matchingState.isSearching && matchingState.matches.length === 0 && !matchingState.bookingSuccess && (
              <div className="p-8 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-lg font-black text-amber-950">
                      No suitable logistics partner is currently available for this route and date.
                    </h4>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Our route matching engine evaluated all active trips in MongoDB. No verified partner trip currently matches the requested forward corridor from{' '}
                      <b>{matchingState.parcel?.pickupLocation}</b> to{' '}
                      <b>{matchingState.parcel?.deliveryLocation}</b> on{' '}
                      <b>{matchingState.parcel?.sendDate || 'the requested date'}</b> with at least{' '}
                      <b>{matchingState.parcel?.weightKg} KG</b> payload capacity.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white/90 rounded-xl border border-amber-200 text-xs space-y-2">
                  <span className="font-bold text-gray-900 block">
                    Strict Quality & Safety Checks Evaluated:
                  </span>
                  <ul className="space-y-1 text-gray-600 list-disc list-inside text-[11px]">
                    <li>
                      <b>Forward Stop Sequence:</b> Commuter/bus must move in forward order from pickup to destination (reverse direction rejected).
                    </li>
                    <li>
                      <b>Partner Eligibility:</b> Only verified, active, non-suspended logistics partners are accepted.
                    </li>
                    <li>
                      <b>Capacity Assurance:</b> Trip available capacity (kg) must safely accommodate your parcel weight ({matchingState.parcel?.weightKg} KG).
                    </li>
                    <li>
                      <b>Time Compatibility:</b> Trip departure from pickup stop must be in the future.
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {matchingState.isPreBooking ? (
                    <>
                      <Button
                        onClick={handleCreateWithoutPartner}
                        disabled={isSubmitting}
                        className="bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-xs flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Package className="w-3.5 h-3.5" />
                        )}
                        Post Request to Network (SEARCHING_FOR_PARTNER)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleToggleFlexibleSearch(true)}
                        className="border-amber-400 text-amber-950 hover:bg-amber-100 font-bold text-xs h-10 px-5 rounded-xl flex items-center gap-1.5"
                      >
                        <Calendar className="w-4 h-4 text-amber-700" />
                        Search Flexible Dates Across Week
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setMatchingState(null)}
                        className="text-gray-600 hover:text-gray-900 text-xs h-10 px-4 rounded-xl"
                      >
                        Adjust Form Details
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => setMatchingState(null)}
                        className="bg-gray-900 hover:bg-black text-white font-bold text-xs h-10 px-5 rounded-xl shadow-xs"
                      >
                        Keep Parcel in SEARCHING_FOR_PARTNER
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleToggleFlexibleSearch(true)}
                        className="border-amber-400 text-amber-950 hover:bg-amber-100 font-bold text-xs h-10 px-5 rounded-xl flex items-center gap-1.5"
                      >
                        <Calendar className="w-4 h-4 text-amber-700" />
                        Search Flexible Dates Across Week
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* MATCHED DELIVERY OPTIONS LIST (Section 3 Requirement) */}
            {!matchingState.isSearching && matchingState.matches.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-gray-600 border-b border-gray-100 pb-2">
                  <span>
                    Found <b className="text-gray-900">{matchingState.matches.length}</b> verified option(s) sorted by forward corridor compatibility and carrier rating.
                  </span>
                  {!matchingState.flexibleDate && (
                    <button
                      onClick={() => handleToggleFlexibleSearch(true)}
                      className="text-primary-700 hover:text-primary-900 hover:underline font-bold flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Search Flexible Dates
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {matchingState.matches.map((match) => {
                    const isBooking = matchingState.bookingTripId === match.tripId;
                    const isCurrentlyAssigned = matchingState.parcel?.assignedTripCode === match.tripId;

                    return (
                      <div
                        key={match.tripId}
                        className={`p-5 rounded-2xl border transition-all space-y-4 ${
                          isCurrentlyAssigned
                            ? 'bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-500/20'
                            : 'bg-white border-gray-200 hover:border-primary-400 hover:shadow-md'
                        }`}
                      >
                        {/* Top: Partner & Transport Method Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            {renderTransportBadge(match.methodCategory, match.transportType)}
                            <div className="flex items-center gap-1 font-bold text-gray-900 text-sm">
                              <span>{match.partnerName}</span>
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span className="font-semibold text-gray-800">{match.rating}</span>
                              <span>({match.totalTrips} trips)</span>
                            </span>
                            {match.vehicleNumber && (
                              <span className="text-[10px] font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                {match.vehicleNumber}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs">
                              {match.matchScore}% MATCH
                            </span>
                          </div>
                        </div>

                        {/* Route Sequence Arrow Chain (Section 3 Requirement) */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                            <Route className="w-3.5 h-3.5 text-primary-700" />
                            <span>Trip {match.tripId}: {match.routeTitle}</span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                            {match.routeSequence.map((stopName, idx) => {
                              const isPickup = isLocationMatch(stopName, match.pickupStop.name);
                              const isDrop = isLocationMatch(stopName, match.destinationStop.name);
                              return (
                                <React.Fragment key={idx}>
                                  {idx > 0 && (
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                  )}
                                  <div
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                                      isPickup
                                        ? 'bg-emerald-100 text-emerald-950 border border-emerald-400 font-bold shadow-xs'
                                        : isDrop
                                        ? 'bg-blue-100 text-blue-950 border border-blue-400 font-bold shadow-xs'
                                        : 'bg-white text-gray-600 border border-gray-200'
                                    }`}
                                  >
                                    {isPickup && <MapPin className="w-3 h-3 text-emerald-600" />}
                                    {isDrop && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                                    <span>{stopName}</span>
                                    {isPickup && (
                                      <span className="text-[10px] text-emerald-700 font-bold ml-0.5">
                                        (Pickup • {match.pickupStop.expectedDeparture})
                                      </span>
                                    )}
                                    {isDrop && (
                                      <span className="text-[10px] text-blue-700 font-bold ml-0.5">
                                        (Drop • {match.destinationStop.expectedArrival})
                                      </span>
                                    )}
                                  </div>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>

                        {/* Logistics Specs Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                          <div>
                            <span className="text-gray-400 block text-[10px] font-semibold uppercase">
                              Pickup Stop
                            </span>
                            <span className="font-bold text-gray-900 block truncate">
                              {match.pickupStop.name}
                            </span>
                            <span className="text-[11px] text-emerald-700 font-medium">
                              Dep: {match.pickupStop.expectedDeparture}
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-400 block text-[10px] font-semibold uppercase">
                              Destination Stop
                            </span>
                            <span className="font-bold text-gray-900 block truncate">
                              {match.destinationStop.name}
                            </span>
                            <span className="text-[11px] text-blue-700 font-medium">
                              Arr: {match.destinationStop.expectedArrival}
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-400 block text-[10px] font-semibold uppercase">
                              Available Payload
                            </span>
                            <span className="font-bold text-gray-900 block">
                              {match.availableCapacityKg} KG Free
                            </span>
                            <span className="text-[11px] text-gray-500 block">
                              Total: {match.totalCapacityKg} KG
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-400 block text-[10px] font-semibold uppercase">
                              Schedule Date
                            </span>
                            <span className="font-bold text-gray-900 block">
                              {match.travelDate}
                            </span>
                            <span className="text-[11px] text-gray-500 block">
                              ETA: {match.estimatedDelivery}
                            </span>
                          </div>
                        </div>

                        {/* Match Explanation Callout */}
                        <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                          <span>{match.matchExplanation}</span>
                        </div>

                        {/* Pricing and Action Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-2xl font-black text-gray-900">
                                ₹{matchingState.parcel?.customerOfferPrice || matchingState.formData?.customerOfferPrice || match.customerOfferPrice || match.price}
                              </span>
                              <span className="text-xs text-gray-600 font-bold">
                                {matchingState.parcel?.customerOfferPrice || matchingState.formData?.customerOfferPrice || match.customerOfferPrice
                                  ? 'Customer Offered Price'
                                  : 'Total Delivery Fare'}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500 block">
                              {match.estimatedFare ? (
                                <>
                                  Est. corridor fare: ₹{match.estimatedFare} • Stops span: {match.stopsSpan} • Weight: {matchingState.parcel?.weightKg || 1} KG
                                </>
                              ) : (
                                <>
                                  Transparent fare based on base fee, corridor stops ({match.stopsSpan}), and weight.
                                </>
                              )}
                            </span>
                          </div>

                          <div>
                            {isCurrentlyAssigned ? (
                              <Button
                                disabled
                                className="bg-emerald-600 text-white font-bold text-xs h-10 px-6 rounded-xl flex items-center gap-1.5 cursor-default"
                              >
                                <Check className="w-4 h-4" /> CURRENTLY ASSIGNED
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleSelectPartner(match)}
                                disabled={Boolean(matchingState.bookingTripId)}
                                className="bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-sm transition-all flex items-center gap-2"
                              >
                                {isBooking ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    {matchingState.isPreBooking
                                      ? 'Creating & Booking Parcel...'
                                      : 'Securing Capacity...'}
                                  </>
                                ) : (
                                  <>
                                    <span>
                                      {matchingState.isPreBooking
                                        ? `BOOK PARCEL WITH THIS PARTNER (₹${matchingState.parcel?.customerOfferPrice || matchingState.formData?.customerOfferPrice || match.customerOfferPrice || match.price})`
                                        : `SELECT THIS OPTION (₹${match.price})`}
                                    </span>
                                    <ChevronRight className="w-4 h-4" />
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs text-gray-500">
              <span>
                LocalHaat Real-Time Route Engine • Atomic Capacity Guaranteed
              </span>
              <Button
                variant="outline"
                onClick={() => setMatchingState(null)}
                className="text-xs h-9"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 5. STOP-BY-STOP MANIFEST MODAL (Section 5 Requirement) */}
      {/* ================================================== */}
      {manifestData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold mb-1.5">
                  <Route className="w-3 h-3 text-blue-700" />
                  Trip Stop-by-Stop Manifest
                </div>
                <h3 className="text-2xl font-black text-gray-900">
                  {manifestData.trip?.tripId || 'Trip Manifest'}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {manifestData.trip?.routeTitle} • Carrier: <b>{manifestData.trip?.partnerName}</b> ({manifestData.trip?.transportType})
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2 font-mono">
                  <span>Total: <b>{manifestData.trip?.totalCapacityKg || 0} KG</b></span>
                  <span>•</span>
                  <span>Used: <b className="text-amber-700">{manifestData.trip?.usedCapacityKg || 0} KG</b></span>
                  <span>•</span>
                  <span>Available: <b className="text-emerald-700">{manifestData.trip?.availableCapacityKg || 0} KG</b></span>
                </div>
              </div>
              <button
                onClick={() => setManifestData(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Manifest Stops */}
            {manifestData.loading ? (
              <div className="py-16 text-center space-y-2">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-700" />
                <p className="text-xs text-gray-500 font-medium">Loading stop manifest...</p>
              </div>
            ) : manifestData.stops.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-xs">
                No stops recorded for this trip.
              </div>
            ) : (
              <div className="space-y-4">
                {manifestData.stops.map((stop, idx) => (
                  <div
                    key={stop.stopId || idx}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary-700 text-white text-xs font-bold flex items-center justify-center">
                          {stop.stopOrder || idx + 1}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {stop.name}
                        </h4>
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        <span>Arr: {stop.expectedArrival || '—'}</span>
                        <span className="mx-1">•</span>
                        <span>Dep: {stop.expectedDeparture || '—'}</span>
                        <span className="ml-2 px-2 py-0.5 rounded bg-gray-200 text-gray-800 text-[10px] font-mono">
                          Onboard: {stop.onboardCount || 0} ({stop.onboardWeightKg || 0} KG)
                        </span>
                      </div>
                    </div>

                    {/* Pickups at this stop */}
                    {stop.parcelsToPickup && stop.parcelsToPickup.length > 0 && (
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1.5 text-xs">
                        <span className="font-bold text-emerald-950 flex items-center gap-1 text-[11px]">
                          ⬆ Pickups at this Stop ({stop.parcelsToPickup.length}):
                        </span>
                        <div className="space-y-1">
                          {stop.parcelsToPickup.map((p: any) => (
                            <div
                              key={p.parcelId}
                              className="p-2 bg-white rounded border border-emerald-200 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-mono font-bold text-emerald-900">
                                  {p.parcelTrackingNumber || p.parcelId}
                                </span>
                                <span className="text-gray-500 text-[11px] ml-2">
                                  {p.weightKg} KG • From: {p.senderName}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                                Code: {p.pickupCode}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Drop-offs at this stop */}
                    {stop.parcelsToDrop && stop.parcelsToDrop.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-1.5 text-xs">
                        <span className="font-bold text-blue-950 flex items-center gap-1 text-[11px]">
                          ⬇ Deliveries / Drop-offs at this Stop ({stop.parcelsToDrop.length}):
                        </span>
                        <div className="space-y-1">
                          {stop.parcelsToDrop.map((p: any) => (
                            <div
                              key={p.parcelId}
                              className="p-2 bg-white rounded border border-blue-200 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-mono font-bold text-blue-900">
                                  {p.parcelTrackingNumber || p.parcelId}
                                </span>
                                <span className="text-gray-500 text-[11px] ml-2">
                                  {p.weightKg} KG • To: {p.receiverName}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                                PIN: {p.deliveryPin}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!stop.parcelsToPickup || stop.parcelsToPickup.length === 0) &&
                      (!stop.parcelsToDrop || stop.parcelsToDrop.length === 0) && (
                        <p className="text-[11px] text-gray-400 italic">
                          Transit stop: No parcels scheduled for pickup or delivery at this location.
                        </p>
                      )}
                  </div>
                ))}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setManifestData(null)}
                className="text-xs"
              >
                Close Manifest
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 6. AWAITING PARTNER ACCEPTANCE MODAL (Sections 19, 21, 22, 23) */}
      {/* ================================================== */}
      {awaitingBooking && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Status: PENDING */}
            {awaitingBooking.status === 'PENDING' && (
              <>
                <div className="text-center space-y-3">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Bell className="w-9 h-9 animate-bounce" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-gray-900">
                      Ringing Delivery Partner...
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Waiting for <strong>{awaitingBooking.partnerName}</strong> to review and accept your offer.
                    </p>
                  </div>

                  {/* 120-second live countdown */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 font-mono font-black text-lg">
                    <Clock className="w-5 h-5 text-orange-600 animate-spin" />
                    <span>
                      {Math.max(
                        0,
                        Math.floor(
                          (new Date(awaitingBooking.expiresAt).getTime() - Date.now()) / 1000
                        )
                      )}s remaining
                    </span>
                  </div>
                </div>

                {/* Offer Summary */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2.5 text-xs text-gray-700">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">Carrier:</span>
                    <span className="font-bold text-gray-900">{awaitingBooking.partnerName}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">Transport:</span>
                    <span className="font-bold text-indigo-700">{awaitingBooking.partnerMethod}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">Segment:</span>
                    <span className="font-bold text-gray-900">
                      {awaitingBooking.pickupStopName} ➔ {awaitingBooking.destinationStopName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-bold text-emerald-800">Locked Offer Price:</span>
                    <span className="text-xl font-black text-emerald-700 font-mono">
                      ₹{awaitingBooking.offeredPrice}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelBooking}
                    className="w-full text-xs h-10 border-gray-300 text-gray-600 hover:text-red-600 rounded-xl font-bold"
                  >
                    Cancel Booking Request
                  </Button>
                </div>
              </>
            )}

            {/* Status: REJECTED */}
            {awaitingBooking.status === 'REJECTED' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    Partner Did Not Accept This Offer
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {awaitingBooking.partnerName} declined the trip request.
                  </p>
                  {awaitingBooking.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 text-xs font-semibold text-red-900">
                      Reason: "{awaitingBooking.rejectionReason}"
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  No money has been deducted. You can instantly pick another available route or carrier.
                </p>

                <Button
                  type="button"
                  onClick={handleSearchOtherPartners}
                  className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs h-11 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>SEARCH OTHER PARTNERS</span>
                </Button>
              </div>
            )}

            {/* Status: EXPIRED */}
            {awaitingBooking.status === 'EXPIRED' && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    Booking Request Expired
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {awaitingBooking.partnerName} did not respond within the 2-minute time window.
                  </p>
                </div>

                <p className="text-xs text-gray-500">
                  No charges incurred. Please choose another carrier along this corridor.
                </p>

                <Button
                  type="button"
                  onClick={handleSearchOtherPartners}
                  className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold text-xs h-11 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>SEARCH OTHER PARTNERS</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 7. PAYMENT SELECTION MODAL (Sections 24-30) */}
      {/* ================================================== */}
      {paymentModalData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-gray-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2 border-b border-gray-100 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                Partner Accepted Your Parcel Offer!
              </h3>
              <p className="text-xs text-gray-600">
                <strong>{paymentModalData.partnerName}</strong> is assigned to your parcel. Select your preferred payment method to finalize the pickup booking.
              </p>
            </div>

            {paymentError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Price Banner */}
            <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                  Locked Total Amount
                </span>
                <div className="text-xs text-gray-600 font-medium">
                  {paymentModalData.pickupLocation} ➔ {paymentModalData.deliveryLocation}
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-800 font-mono">
                ₹{paymentModalData.offeredPrice}
              </div>
            </div>

            {/* Payment Method Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Cash to Partner */}
              <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/50 hover:bg-amber-50 flex flex-col justify-between space-y-3 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <IndianRupee className="w-4 h-4 text-amber-700" />
                    <span>Cash to Carrier</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Pay ₹{paymentModalData.offeredPrice} directly in cash to {paymentModalData.partnerName} when they collect your parcel.
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handlePayCash}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xs h-10 rounded-xl shadow-xs"
                >
                  {isProcessingPayment ? 'Confirming...' : `CONFIRM CASH (₹${paymentModalData.offeredPrice})`}
                </Button>
              </div>

              {/* Option 2: Pay Online */}
              <div className="p-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 flex flex-col justify-between space-y-3 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Pay Online</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Instant contactless payment via UPI, Cards, or Netbanking powered by secure checkout.
                  </p>
                </div>

                <Button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handlePayOnline}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 rounded-xl shadow-xs"
                >
                  {isProcessingPayment ? 'Processing...' : `PAY ONLINE (₹${paymentModalData.offeredPrice})`}
                </Button>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalData(null)}
                className="text-xs text-gray-400 hover:text-gray-600 underline font-semibold"
              >
                Decide Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 8. RAZORPAY CHECKOUT INTERACTIVE MODAL / SIMULATOR */}
      {/* ================================================== */}
      {razorpaySimulator && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Razorpay Brand Header */}
            <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                    ₹
                  </div>
                  <span className="font-extrabold tracking-wide text-sm">RAZORPAY CHECKOUT</span>
                </div>
                <div className="text-[11px] text-gray-300 mt-1">
                  LocalHaat Rural Logistics • {razorpaySimulator.pickupLocation} ➔ {razorpaySimulator.deliveryLocation}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Payable</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ₹{razorpaySimulator.amount}
                </span>
              </div>
            </div>

            {/* Test Mode Notification */}
            <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Razorpay Test Mode / Dev Sandbox
              </span>
              <span className="font-mono text-[10px] text-amber-700">
                #{razorpaySimulator.orderId.slice(-10)}
              </span>
            </div>

            {/* Payment Method Tabs */}
            <div className="p-5 space-y-4">
              <div className="flex border-b border-gray-100 pb-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRazorpaySimulator((prev) => prev ? { ...prev, tab: 'upi' } : null)}
                  className={`flex-1 py-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                    razorpaySimulator.tab === 'upi'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpaySimulator((prev) => prev ? { ...prev, tab: 'card' } : null)}
                  className={`flex-1 py-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                    razorpaySimulator.tab === 'card'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setRazorpaySimulator((prev) => prev ? { ...prev, tab: 'netbanking' } : null)}
                  className={`flex-1 py-2 rounded-xl text-center transition-all flex items-center justify-center gap-1.5 ${
                    razorpaySimulator.tab === 'netbanking'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  Netbanking
                </button>
              </div>

              {/* Tab Content: UPI */}
              {razorpaySimulator.tab === 'upi' && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-2">
                    <div className="w-24 h-24 mx-auto bg-white rounded-xl border border-gray-300 p-2 flex items-center justify-center shadow-2xs">
                      <QrCode className="w-20 h-20 text-gray-800" />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-600 block">
                      Scan QR code using any UPI App
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    <div
                      onClick={() => setRazorpaySimulator((prev) => (prev ? { ...prev, upiApp: 'gpay' } : null))}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        razorpaySimulator.upiApp === 'gpay'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 font-black'
                          : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      Google Pay
                    </div>
                    <div
                      onClick={() => setRazorpaySimulator((prev) => (prev ? { ...prev, upiApp: 'phonepe' } : null))}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        razorpaySimulator.upiApp === 'phonepe'
                          ? 'bg-purple-50 border-purple-500 text-purple-950 ring-2 ring-purple-400 font-black'
                          : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      PhonePe
                    </div>
                    <div
                      onClick={() => setRazorpaySimulator((prev) => (prev ? { ...prev, upiApp: 'paytm' } : null))}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        razorpaySimulator.upiApp === 'paytm'
                          ? 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-400 font-black'
                          : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      Paytm UPI
                    </div>
                    <div
                      onClick={() => setRazorpaySimulator((prev) => (prev ? { ...prev, upiApp: 'bhim' } : null))}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        razorpaySimulator.upiApp === 'bhim'
                          ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-400 font-black'
                          : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      BHIM UPI
                    </div>
                  </div>

                  <div className="pt-2 text-left">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      UPI ID / VPA
                    </label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${user?.phone || '9999900005'}@okhdfcbank`}
                        className="h-9 text-xs font-mono font-bold bg-gray-50 text-gray-800"
                      />
                      <Badge className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 shrink-0">
                        ✓ Verified
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content: Cards */}
              {razorpaySimulator.tab === 'card' && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Card Number</span>
                      <span className="font-mono font-bold text-gray-800">4111 •••• •••• 1111 (Test Card)</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-600">
                      <span>Exp: 12/28</span>
                      <span>CVV: •••</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content: Netbanking */}
              {razorpaySimulator.tab === 'netbanking' && (
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2 text-gray-700">
                    <Landmark className="w-4 h-4 text-blue-700" /> State Bank of India
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2 text-gray-700">
                    <Landmark className="w-4 h-4 text-blue-700" /> HDFC Bank
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2 text-gray-700">
                    <Landmark className="w-4 h-4 text-blue-700" /> ICICI Bank
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2 text-gray-700">
                    <Landmark className="w-4 h-4 text-blue-700" /> Axis Bank
                  </div>
                </div>
              )}

              {/* Confirm Payment Action Button */}
              <Button
                type="button"
                disabled={isProcessingPayment}
                onClick={() =>
                  handleVerifyOnlinePayment({
                    parcelId: razorpaySimulator.parcelId,
                    orderId: razorpaySimulator.orderId,
                    paymentId: `pay_${Date.now()}`,
                    signature: `mock_sig_${Date.now()}`,
                    partnerName: razorpaySimulator.partnerName,
                    amount: razorpaySimulator.amount,
                    pickupLocation: razorpaySimulator.pickupLocation,
                    deliveryLocation: razorpaySimulator.deliveryLocation,
                  })
                }
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm h-12 rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {isProcessingPayment
                    ? 'Verifying with Razorpay...'
                    : `AUTHORIZE & PAY ₹${razorpaySimulator.amount}`}
                </span>
              </Button>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  256-bit SSL Secure Razorpay
                </span>
                <button
                  type="button"
                  onClick={() => setRazorpaySimulator(null)}
                  className="hover:text-gray-700 underline"
                >
                  Cancel Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 9. VERIFIED PAYMENT & CUSTODY UNLOCKED PANEL */}
      {/* ================================================== */}
      {verifiedPaymentResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border-2 border-emerald-400 shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Top Celebration Banner */}
            <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-7 text-white text-center relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md text-white mx-auto flex items-center justify-center ring-4 ring-white/30 shadow-lg">
                  <CheckCircle2 className="w-10 h-10 text-emerald-100" />
                </div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-800/60 border border-emerald-400/50 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Razorpay Payment Verified</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Payment Successful!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
                  ₹{verifiedPaymentResult.amount} has been securely processed. Transporter{' '}
                  <strong className="text-white underline">{verifiedPaymentResult.partnerName}</strong> is assigned and authorized for pickup.
                </p>
                <div className="text-[11px] text-emerald-200/90 font-mono pt-1">
                  Ref ID: {verifiedPaymentResult.paymentId}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-7 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Route & Transporter Summary */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Route</span>
                  <span className="font-bold text-gray-900">
                    {verifiedPaymentResult.pickupLocation} ➔ {verifiedPaymentResult.deliveryLocation}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Status</span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold text-[10px]">
                    READY FOR PICKUP
                  </Badge>
                </div>
              </div>

              {/* The Two Codes */}
              <div className="space-y-3">
                <div className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  Your Custody Handover Verification Codes
                </div>

                {/* 1. SENDER PICKUP CODE */}
                <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-800 px-2 py-0.5 rounded bg-amber-200/80">
                        Step 1: Origin
                      </span>
                      <h4 className="text-sm font-extrabold text-amber-950 mt-1">
                        1. Sender Pickup Code (Share with Carrier)
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(verifiedPaymentResult.pickupCode, 'pickupCodeModal')}
                      className="inline-flex items-center gap-1 bg-white hover:bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-300 font-bold text-xs transition-colors shadow-2xs"
                    >
                      {copiedCodes['pickupCodeModal'] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 py-1">
                    {verifiedPaymentResult.pickupCode.split('').map((digit, i) => (
                      <div
                        key={i}
                        className="w-12 h-14 rounded-xl bg-white border-2 border-amber-400 flex items-center justify-center font-mono font-black text-2xl text-amber-950 shadow-xs"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-amber-800 leading-tight">
                    🔒 <strong>Important:</strong> Hand over this 4-digit code to{' '}
                    <strong>{verifiedPaymentResult.partnerName}</strong> when they arrive to pick up your parcel. The driver enters this in their app to confirm physical collection.
                  </p>
                </div>

                {/* 2. RECEIVER DELIVERY PIN */}
                <div className="p-4 rounded-2xl bg-blue-50/90 border-2 border-blue-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-800 px-2 py-0.5 rounded bg-blue-200/80">
                        Step 2: Destination
                      </span>
                      <h4 className="text-sm font-extrabold text-blue-950 mt-1">
                        2. Receiver Delivery PIN (Private)
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(verifiedPaymentResult.deliveryPin, 'deliveryPinModal')}
                      className="inline-flex items-center gap-1 bg-white hover:bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-300 font-bold text-xs transition-colors shadow-2xs"
                    >
                      {copiedCodes['deliveryPinModal'] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 py-1">
                    {verifiedPaymentResult.deliveryPin.split('').map((digit, i) => (
                      <div
                        key={i}
                        className="w-12 h-14 rounded-xl bg-white border-2 border-blue-400 flex items-center justify-center font-mono font-black text-2xl text-blue-950 shadow-xs"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-blue-800 leading-tight">
                    🔑 <strong>Private:</strong> Share this PIN with the receiver. The recipient provides this PIN to the deliverer at the destination to verify final parcel handover.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    const trk = verifiedPaymentResult.trackingNumber;
                    setVerifiedPaymentResult(null);
                    router.push(`/track/${trk}`);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm h-12 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>TRACK PARCEL IN REAL-TIME</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setVerifiedPaymentResult(null)}
                  className="sm:w-auto h-12 rounded-xl text-gray-700 font-bold text-xs border-gray-300 hover:bg-gray-100"
                >
                  DONE / VIEW MY PARCELS
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
