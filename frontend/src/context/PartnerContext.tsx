'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import {
  LogisticsPartner,
  PartnerRoute,
  Vehicle,
  Parcel,
  ParcelBookingRequest,
  PartnerLocation,
  PartnerShop,
  PartnerDriver,
  LogisticsTrip,
  KycDocument,
} from '../types';
import { api } from '../lib/api';
import { PartnerRingingModal } from '../components/partner/PartnerRingingModal';
import {
  stopRingingAlert,
  markBookingRequestResponded,
  isBookingRequestResponded,
  playSuccessChime,
  playDeclineChime,
} from '../lib/audioAlert';

interface PartnerContextType {
  partner: LogisticsPartner | null;
  routes: PartnerRoute[];
  vehicles: Vehicle[];
  locations: PartnerLocation[];
  shops: PartnerShop[];
  drivers: PartnerDriver[];
  trips: LogisticsTrip[];
  documents: KycDocument[];
  incomingRequests: Parcel[];
  bookingRequests: ParcelBookingRequest[];
  ringingRequest: ParcelBookingRequest | null;
  setRingingRequest: (request: ParcelBookingRequest | null) => void;
  activeParcels: Parcel[];
  recentCompletedParcels: Parcel[];
  stats: any;
  loading: boolean;
  isOnline: boolean;
  togglingOnline: boolean;
  loadDashboard: () => Promise<void>;
  loadFullProfile: () => Promise<void>;
  handleToggleOnline: () => Promise<void>;
  handleUpdateProfile: (profileData: any) => Promise<boolean>;
  handleCreateLocation: (locationData: any) => Promise<boolean>;
  handleUpdateLocation: (id: string, locationData: any) => Promise<boolean>;
  handleDeactivateLocation: (id: string) => Promise<boolean>;
  handleCreateShop: (shopData: any) => Promise<boolean>;
  handleUpdateShop: (id: string, shopData: any) => Promise<boolean>;
  handleDeactivateShop: (id: string) => Promise<boolean>;
  handleCreateDriver: (driverData: any) => Promise<boolean>;
  handleUpdateDriver: (id: string, driverData: any) => Promise<boolean>;
  handleDeactivateDriver: (id: string) => Promise<boolean>;
  handleUpdateVehicle: (id: string, vehicleData: any) => Promise<boolean>;
  handleDeactivateVehicle: (id: string) => Promise<boolean>;
  handleCreateTrip: (tripData: any) => Promise<boolean>;
  handleUpdateTripStatus: (id: string, status: string, loc?: string) => Promise<boolean>;
  handleUploadDocument: (docData: any) => Promise<boolean>;
  handleAcceptParcel: (parcelId: string) => Promise<boolean>;
  handleRejectParcel: (parcelId: string) => Promise<boolean>;
  handleAcceptBookingRequest: (requestId: string) => Promise<boolean>;
  handleRejectBookingRequest: (requestId: string, reason?: string, note?: string) => Promise<boolean>;
  handleVerifyPickupCode: (parcelId: string, code: string) => Promise<boolean>;
  handleVerifyAgentCode: (parcelId: string, code: string) => Promise<boolean>;
  handleVerifyDeliveryPin: (parcelId: string, pin: string) => Promise<boolean>;
  handleCreateRoute: (routeData: any) => Promise<boolean>;
  handleUpdateRoute: (id: string, routeData: any) => Promise<boolean>;
  handleDeleteRoute: (id: string) => Promise<boolean>;
  handleRegisterVehicle: (vehicleData: any) => Promise<boolean>;
  handleRequestPayout: (amount: number, paymentMode?: string) => Promise<boolean>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [partner, setPartner] = useState<LogisticsPartner | null>(null);
  const [routes, setRoutes] = useState<PartnerRoute[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [locations, setLocations] = useState<PartnerLocation[]>([]);
  const [shops, setShops] = useState<PartnerShop[]>([]);
  const [drivers, setDrivers] = useState<PartnerDriver[]>([]);
  const [trips, setTrips] = useState<LogisticsTrip[]>([]);
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Parcel[]>([]);
  const [bookingRequests, setBookingRequests] = useState<ParcelBookingRequest[]>([]);
  const [ringingRequest, setRingingRequest] = useState<ParcelBookingRequest | null>(null);
  const [activeParcels, setActiveParcels] = useState<Parcel[]>([]);
  const [recentCompletedParcels, setRecentCompletedParcels] = useState<Parcel[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Online / Offline state
  const [isOnline, setIsOnline] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  // Cross-tab broadcast listener to instantly stop ringing if another tab accepted or dismissed
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      const channel = new BroadcastChannel('localhaat_audio_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'STOP_RINGING') {
          // Stop audio tone synthesizer only; do NOT dismiss the request modal
          stopRingingAlert(false);
        } else if (event.data?.type === 'DISMISS_REQUEST') {
          const dismissedId = event.data?.requestId;
          if (dismissedId) {
            setRingingRequest((prev) => (prev?.requestId === dismissedId ? null : prev));
          }
          stopRingingAlert(false);
        }
      };
      return () => {
        channel.close();
      };
    } catch (e) {}
  }, []);

  // Realtime Socket listener for new incoming requests and partner booking offers
  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = (data: any) => {
      if (data?.parcel) {
        setIncomingRequests((prev) => [data.parcel, ...prev.filter((p) => p._id !== data.parcel._id)]);
      }
    };

    const handleBookingRequest = (data: any) => {
      console.log('[PartnerContext] Received partner:booking_request:', data);
      if (data?.bookingRequest) {
        const req = data.bookingRequest as ParcelBookingRequest;
        if (!isBookingRequestResponded(req.requestId)) {
          setRingingRequest((prev) => (prev?.requestId === req.requestId ? prev : req));
          setBookingRequests((prev) => {
            if (prev.some((r) => r.requestId === req.requestId)) {
              return prev.map((r) => (r.requestId === req.requestId ? req : r));
            }
            return [req, ...prev];
          });
        }
      }
    };

    const handleBookingCancelled = (data: any) => {
      if (data?.requestId) {
        markBookingRequestResponded(data.requestId);
        stopRingingAlert();
        setRingingRequest((prev) => (prev?.requestId === data.requestId ? null : prev));
        setBookingRequests((prev) =>
          prev.map((r) => (r.requestId === data.requestId ? { ...r, status: 'CANCELLED_BY_CUSTOMER' } : r))
        );
      }
    };

    const handleBookingAcceptedOrOfferAccepted = (data: any) => {
      if (data?.requestId) {
        markBookingRequestResponded(data.requestId);
        stopRingingAlert();
        setRingingRequest((prev) => (prev?.requestId === data.requestId ? null : prev));
        setBookingRequests((prev) =>
          prev.map((r) => (r.requestId === data.requestId ? { ...r, status: 'ACCEPTED' } : r))
        );
      }
    };

    const handleBookingRejectedOrOfferRejected = (data: any) => {
      if (data?.requestId) {
        markBookingRequestResponded(data.requestId);
        stopRingingAlert();
        setRingingRequest((prev) => (prev?.requestId === data.requestId ? null : prev));
        setBookingRequests((prev) =>
          prev.map((r) => (r.requestId === data.requestId ? { ...r, status: 'REJECTED_BY_PARTNER' } : r))
        );
      }
    };

    const handlePaymentUpdated = (data: any) => {
      console.log('[PartnerContext] Received payment updated event:', data);
      const targetId = data?.parcelId;
      const targetTracking = data?.parcelTrackingNumber;
      if (!targetId && !targetTracking) return;

      setActiveParcels((prev) =>
        prev.map((p) => {
          if (
            p.parcelId === targetId ||
            p._id === targetId ||
            p.parcelTrackingNumber === targetTracking
          ) {
            return {
              ...p,
              paymentStatus: data.paymentStatus || p.paymentStatus,
              paymentMethod: data.paymentMethod || p.paymentMethod,
              status: data.status || p.status,
            };
          }
          return p;
        })
      );

      setBookingRequests((prev) =>
        prev.map((r) => {
          if (
            (r.parcelId as any) === targetId ||
            r.parcelTrackingNumber === targetTracking
          ) {
            return {
              ...r,
              paymentStatus: data.paymentStatus || r.paymentStatus,
              paymentMethod: data.paymentMethod || r.paymentMethod,
            };
          }
          return r;
        })
      );

      setIncomingRequests((prev) =>
        prev.map((p) => {
          if (
            p.parcelId === targetId ||
            p._id === targetId ||
            p.parcelTrackingNumber === targetTracking
          ) {
            return {
              ...p,
              paymentStatus: data.paymentStatus || p.paymentStatus,
              paymentMethod: data.paymentMethod || p.paymentMethod,
              status: data.status || p.status,
            };
          }
          return p;
        })
      );

      // Trigger dashboard reload to sync server state
      loadDashboard();
    };

    const handleStatusChange = (data: any) => {
      if (data?.paymentStatus || data?.paymentMethod) {
        handlePaymentUpdated(data);
      }
    };

    socket.on('parcel:new_request', handleNewRequest);
    socket.on('partner:booking_request', handleBookingRequest);
    socket.on('partner:booking_cancelled', handleBookingCancelled);
    socket.on('partner:booking_accepted', handleBookingAcceptedOrOfferAccepted);
    socket.on('partner:booking_rejected', handleBookingRejectedOrOfferRejected);
    socket.on('parcel:offer_accepted', handleBookingAcceptedOrOfferAccepted);
    socket.on('parcel:offer_rejected', handleBookingRejectedOrOfferRejected);
    socket.on('parcel:payment_updated', handlePaymentUpdated);
    socket.on('partner:payment_updated', handlePaymentUpdated);
    socket.on('parcel:status_change', handleStatusChange);

    // Join partner and user notification rooms on backend
    if (partner?._id) {
      socket.emit('subscribe:partner', partner._id);
    }
    if (user?._id) {
      socket.emit('subscribe:user', user._id);
    }

    return () => {
      socket.off('parcel:new_request', handleNewRequest);
      socket.off('partner:booking_request', handleBookingRequest);
      socket.off('partner:booking_cancelled', handleBookingCancelled);
      socket.off('partner:booking_accepted', handleBookingAcceptedOrOfferAccepted);
      socket.off('partner:booking_rejected', handleBookingRejectedOrOfferRejected);
      socket.off('parcel:offer_accepted', handleBookingAcceptedOrOfferAccepted);
      socket.off('parcel:offer_rejected', handleBookingRejectedOrOfferRejected);
      socket.off('parcel:payment_updated', handlePaymentUpdated);
      socket.off('partner:payment_updated', handlePaymentUpdated);
      socket.off('parcel:status_change', handleStatusChange);
    };
  }, [socket, partner, user]);

  // Periodic polling fallback (every 3 seconds) to ensure ringing alerts are NEVER missed
  useEffect(() => {
    const pollPendingRequests = async () => {
      try {
        const bRes = await api.getPartnerBookingRequests();
        if (bRes?.requests) {
          setBookingRequests(bRes.requests);
          const activePending = bRes.requests.find(
            (r: ParcelBookingRequest) =>
              r.status === 'PENDING_PARTNER_RESPONSE' &&
              new Date(r.expiresAt).getTime() > Date.now() &&
              !isBookingRequestResponded(r.requestId)
          );
          if (activePending) {
            setRingingRequest((prev) => (prev?.requestId === activePending.requestId ? prev : activePending));
          } else {
            setRingingRequest((prev) => {
              if (prev && (new Date(prev.expiresAt).getTime() <= Date.now() || isBookingRequestResponded(prev.requestId))) {
                stopRingingAlert();
                return null;
              }
              return prev;
            });
          }
        }
      } catch (e) {}
    };

    const interval = setInterval(pollPendingRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getPartnerDashboard();
      setPartner(res.partner || null);
      setIsOnline(res.partner?.isOnline !== false);
      setRoutes(res.routes || []);
      setVehicles(res.vehicles || []);
      setIncomingRequests(res.incomingRequests || []);
      setActiveParcels(res.activeParcels || []);
      setRecentCompletedParcels(res.recentCompletedParcels || []);
      setStats(res.stats || {});
      await loadFullProfile();

      // Also load booking requests
      try {
        const bRes = await api.getPartnerBookingRequests();
        if (bRes?.requests) {
          setBookingRequests(bRes.requests);
          // Check for any currently active pending requests to resume ringing
          const pending = bRes.requests.find(
            (r: ParcelBookingRequest) =>
              r.status === 'PENDING_PARTNER_RESPONSE' &&
              new Date(r.expiresAt).getTime() > Date.now() &&
              !isBookingRequestResponded(r.requestId)
          );
          if (pending) {
            setRingingRequest((prev) => (prev?.requestId === pending.requestId ? prev : pending));
          } else {
            setRingingRequest((prev) => {
              if (prev && (new Date(prev.expiresAt).getTime() <= Date.now() || isBookingRequestResponded(prev.requestId))) {
                stopRingingAlert(false);
                return null;
              }
              return prev;
            });
          }
        }
      } catch (e) {}
    } catch (err) {
      console.error('Error fetching partner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    try {
      const res = await api.togglePartnerOnline();
      setIsOnline(res.isOnline);
      if (partner) {
        setPartner({ ...partner, isOnline: res.isOnline });
      }
    } catch (err: any) {
      alert(`Could not toggle status: ${err.message}`);
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleAcceptParcel = async (parcelId: string): Promise<boolean> => {
    try {
      await api.acceptParcel(parcelId);
      await loadDashboard();
      return true;
    } catch (err: any) {
      alert(`Error accepting parcel: ${err.message}`);
      return false;
    }
  };

  const handleRejectParcel = async (parcelId: string): Promise<boolean> => {
    try {
      await api.rejectParcel(parcelId);
      setIncomingRequests((prev) => prev.filter((p) => p._id !== parcelId));
      return true;
    } catch (err: any) {
      alert(`Error rejecting parcel: ${err.message}`);
      return false;
    }
  };

  const handleVerifyPickupCode = async (parcelId: string, code: string): Promise<boolean> => {
    if (!code || code.trim().length === 0) {
      alert('Please enter the pickup code provided by the sender.');
      return false;
    }

    try {
      const res = await api.verifyPickup(parcelId, code.trim());
      alert(`Success! ${res.message || 'Parcel picked up and loaded.'}`);
      await loadDashboard();
      return true;
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
      return false;
    }
  };

  const handleVerifyAgentCode = async (parcelId: string, code: string): Promise<boolean> => {
    if (!code || code.trim().length === 0) {
      alert('Please enter the 4-digit Agent Code provided by the village agent.');
      return false;
    }

    try {
      const res = await api.verifyAgentCode(parcelId, code.trim());
      alert(`Agent Handover Verified! ${res.message || 'Parcel safely handed over to Village Agent.'}`);
      await loadDashboard();
      return true;
    } catch (err: any) {
      alert(`Agent handover verification failed: ${err.message}`);
      return false;
    }
  };

  const handleVerifyDeliveryPin = async (parcelId: string, pin: string): Promise<boolean> => {
    if (!pin || pin.trim().length === 0) {
      alert('Please enter the 4-digit Delivery PIN provided by receiver.');
      return false;
    }

    try {
      const res = await api.verifyDelivery(parcelId, pin.trim());
      alert(`Delivery Confirmed! ${res.message || 'Parcel successfully delivered to receiver.'}`);
      await loadDashboard();
      return true;
    } catch (err: any) {
      alert(`Delivery verification failed: ${err.message}`);
      return false;
    }
  };

  const handleCreateRoute = async (routeData: any): Promise<boolean> => {
    try {
      await api.createPartnerRoute(routeData);
      await loadDashboard();
      return true;
    } catch (err: any) {
      alert(`Failed to save route: ${err.message}`);
      return false;
    }
  };

  const handleUpdateRoute = async (id: string, routeData: any): Promise<boolean> => {
    try {
      await api.updatePartnerRoute(id, routeData);
      await loadDashboard();
      return true;
    } catch (err: any) {
      alert(`Failed to update route: ${err.message}`);
      return false;
    }
  };

  const handleDeleteRoute = async (id: string): Promise<boolean> => {
    try {
      await api.deletePartnerRoute(id);
      await loadDashboard();
      return true;
    } catch (err: any) {
      alert(`Failed to delete route: ${err.message}`);
      return false;
    }
  };

  const handleRegisterVehicle = async (vehicleData: any): Promise<boolean> => {
    try {
      await api.registerVehicle(vehicleData);
      await loadDashboard();
      return true;
    } catch (err: any) {
      alert(`Failed to register vehicle: ${err.message}`);
      return false;
    }
  };

  const handleRequestPayout = async (amount: number, paymentMode: string = 'UPI'): Promise<boolean> => {
    try {
      await api.requestPayout(amount, paymentMode);
      await loadDashboard();
      return true;
    } catch (err: any) {
      alert(`Payout request failed: ${err.message}`);
      return false;
    }
  };

  const handleAcceptBookingRequest = async (requestId: string): Promise<boolean> => {
    // 1. Immediately and synchronously silence ringing and dismiss modal
    markBookingRequestResponded(requestId);
    stopRingingAlert();
    setRingingRequest(null);

    try {
      await api.acceptBookingRequest(requestId);
      await loadDashboard();
      playSuccessChime();
      return true;
    } catch (err: any) {
      alert(`Error accepting offer: ${err.message}`);
      return false;
    }
  };

  const handleRejectBookingRequest = async (requestId: string, reason?: string, note?: string): Promise<boolean> => {
    // 1. Immediately and synchronously silence ringing and dismiss modal
    markBookingRequestResponded(requestId);
    stopRingingAlert();
    setRingingRequest(null);

    try {
      await api.rejectBookingRequest(requestId, reason, note);
      await loadDashboard();
      playDeclineChime();
      return true;
    } catch (err: any) {
      alert(`Error declining offer: ${err.message}`);
      return false;
    }
  };

  const loadFullProfile = async () => {
    try {
      const pRes = await api.getPartnerFullProfile();
      if (pRes?.success) {
        if (pRes.partner) setPartner(pRes.partner);
        if (pRes.locations) setLocations(pRes.locations);
        if (pRes.shops) setShops(pRes.shops);
        if (pRes.vehicles) setVehicles(pRes.vehicles);
        if (pRes.drivers) setDrivers(pRes.drivers);
        if (pRes.routes) setRoutes(pRes.routes);
        if (pRes.trips) setTrips(pRes.trips);
        if (pRes.documents) setDocuments(pRes.documents);
        if (pRes.stats) setStats((prev: any) => ({ ...prev, ...pRes.stats }));
      }
    } catch (e) {
      console.warn('Could not load full partner profile:', e);
    }
  };

  const handleUpdateProfile = async (profileData: any): Promise<boolean> => {
    try {
      const res = await api.updatePartnerProfile(profileData);
      if (res?.success) {
        if (res.partner) setPartner(res.partner);
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error updating profile: ${err.message}`);
      return false;
    }
  };

  const handleCreateLocation = async (locationData: any): Promise<boolean> => {
    try {
      const res = await api.addPartnerLocation(locationData);
      if (res?.success && res.location) {
        setLocations((prev) => [res.location, ...prev]);
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error adding location: ${err.message}`);
      return false;
    }
  };

  const handleUpdateLocation = async (id: string, locationData: any): Promise<boolean> => {
    try {
      const res = await api.updatePartnerLocation(id, locationData);
      if (res?.success && res.location) {
        setLocations((prev) => prev.map((loc) => (loc._id === id ? res.location : loc)));
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error updating location: ${err.message}`);
      return false;
    }
  };

  const handleDeactivateLocation = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deactivatePartnerLocation(id);
      if (res?.success) {
        setLocations((prev) => prev.filter((loc) => loc._id !== id));
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error deactivating location: ${err.message}`);
      return false;
    }
  };

  const handleCreateShop = async (shopData: any): Promise<boolean> => {
    try {
      const res = await api.addPartnerShop(shopData);
      if (res?.success && res.shop) {
        setShops((prev) => [res.shop, ...prev]);
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error adding shop: ${err.message}`);
      return false;
    }
  };

  const handleUpdateShop = async (id: string, shopData: any): Promise<boolean> => {
    try {
      const res = await api.updatePartnerShop(id, shopData);
      if (res?.success && res.shop) {
        setShops((prev) => prev.map((s) => (s._id === id ? res.shop : s)));
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error updating shop: ${err.message}`);
      return false;
    }
  };

  const handleDeactivateShop = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deactivatePartnerShop(id);
      if (res?.success) {
        setShops((prev) => prev.filter((s) => s._id !== id));
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error deactivating shop: ${err.message}`);
      return false;
    }
  };

  const handleCreateDriver = async (driverData: any): Promise<boolean> => {
    try {
      const res = await api.addPartnerDriver(driverData);
      if (res?.success && res.driver) {
        setDrivers((prev) => [res.driver, ...prev]);
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error adding driver: ${err.message}`);
      return false;
    }
  };

  const handleUpdateDriver = async (id: string, driverData: any): Promise<boolean> => {
    try {
      const res = await api.updatePartnerDriver(id, driverData);
      if (res?.success && res.driver) {
        setDrivers((prev) => prev.map((d) => (d._id === id ? res.driver : d)));
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error updating driver: ${err.message}`);
      return false;
    }
  };

  const handleDeactivateDriver = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deactivatePartnerDriver(id);
      if (res?.success) {
        setDrivers((prev) => prev.filter((d) => d._id !== id));
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error deactivating driver: ${err.message}`);
      return false;
    }
  };

  const handleUpdateVehicle = async (id: string, vehicleData: any): Promise<boolean> => {
    try {
      const res = await api.updatePartnerVehicle(id, vehicleData);
      if (res?.success && res.vehicle) {
        setVehicles((prev) => prev.map((v) => (v._id === id ? res.vehicle : v)));
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error updating vehicle: ${err.message}`);
      return false;
    }
  };

  const handleDeactivateVehicle = async (id: string): Promise<boolean> => {
    try {
      const res = await api.deactivatePartnerVehicle(id);
      if (res?.success) {
        setVehicles((prev) => prev.filter((v) => v._id !== id));
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error deactivating vehicle: ${err.message}`);
      return false;
    }
  };

  const handleCreateTrip = async (tripData: any): Promise<boolean> => {
    try {
      const res = await api.createPartnerTrip(tripData);
      if (res?.success && res.trip) {
        setTrips((prev) => [res.trip, ...prev]);
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error creating trip: ${err.message}`);
      return false;
    }
  };

  const handleUpdateTripStatus = async (id: string, status: string, loc?: string): Promise<boolean> => {
    try {
      const res = await api.updatePartnerTripStatus(id, status, loc);
      if (res?.success && res.trip) {
        setTrips((prev) => prev.map((t) => (t._id === id ? res.trip : t)));
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error updating trip: ${err.message}`);
      return false;
    }
  };

  const handleUploadDocument = async (docData: any): Promise<boolean> => {
    try {
      const res = await api.uploadPartnerDocument(docData);
      if (res?.success && res.document) {
        setDocuments((prev) => [res.document, ...prev]);
        playSuccessChime();
        return true;
      }
      return false;
    } catch (err: any) {
      alert(`Error uploading document: ${err.message}`);
      return false;
    }
  };

  return (
    <PartnerContext.Provider
      value={{
        partner,
        routes,
        vehicles,
        locations,
        shops,
        drivers,
        trips,
        documents,
        incomingRequests,
        bookingRequests,
        ringingRequest,
        setRingingRequest,
        activeParcels,
        recentCompletedParcels,
        stats,
        loading,
        isOnline,
        togglingOnline,
        loadDashboard,
        loadFullProfile,
        handleToggleOnline,
        handleUpdateProfile,
        handleCreateLocation,
        handleUpdateLocation,
        handleDeactivateLocation,
        handleCreateShop,
        handleUpdateShop,
        handleDeactivateShop,
        handleCreateDriver,
        handleUpdateDriver,
        handleDeactivateDriver,
        handleUpdateVehicle,
        handleDeactivateVehicle,
        handleCreateTrip,
        handleUpdateTripStatus,
        handleUploadDocument,
        handleAcceptParcel,
        handleRejectParcel,
        handleAcceptBookingRequest,
        handleRejectBookingRequest,
        handleVerifyPickupCode,
        handleVerifyAgentCode,
        handleVerifyDeliveryPin,
        handleCreateRoute,
        handleUpdateRoute,
        handleDeleteRoute,
        handleRegisterVehicle,
        handleRequestPayout,
      }}
    >
      {children}
      {ringingRequest && (
        <PartnerRingingModal
          request={ringingRequest}
          onAccept={async (reqId) => {
            await handleAcceptBookingRequest(reqId);
          }}
          onReject={async (reqId, reason, note) => {
            await handleRejectBookingRequest(reqId, reason, note);
          }}
          onClose={() => setRingingRequest(null)}
        />
      )}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => {
  const context = useContext(PartnerContext);
  if (!context) {
    throw new Error('usePartner must be used within a PartnerProvider');
  }
  return context;
};
