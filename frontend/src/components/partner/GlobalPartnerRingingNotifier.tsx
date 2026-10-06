'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { ParcelBookingRequest } from '../../types';
import { api } from '../../lib/api';
import { PartnerRingingModal } from './PartnerRingingModal';
import {
  stopRingingAlert,
  markBookingRequestResponded,
  isBookingRequestResponded,
  playSuccessChime,
  playDeclineChime,
} from '../../lib/audioAlert';

/**
 * Global Partner Ringing Notifier
 * Renders on any page of the website outside /partner when the current user is a logistics partner
 * (or in demo mode) so that real-time ringing requests are NEVER missed even while browsing /parcels or marketplace.
 */
export const GlobalPartnerRingingNotifier: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [ringingRequest, setRingingRequest] = useState<ParcelBookingRequest | null>(null);

  // If already on /partner, PartnerContext handles ringing inside PartnerLayout to avoid duplicate modals
  const isInsidePartnerPortal = pathname?.startsWith('/partner');

  // Cross-tab broadcast listener to instantly stop ringing if another tab accepted or dismissed
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      const channel = new BroadcastChannel('localhaat_audio_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'STOP_RINGING') {
          // Cross-tab audio tone stop only; do NOT dismiss active request modal
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

  useEffect(() => {
    if (isInsidePartnerPortal) return;
    if (!socket) return;

    const handleBookingRequest = (data: any) => {
      console.log('[GlobalPartnerRinging] Incoming booking request received:', data);
      if (data?.bookingRequest) {
        const req = data.bookingRequest as ParcelBookingRequest;
        if (new Date(req.expiresAt).getTime() > Date.now() && !isBookingRequestResponded(req.requestId)) {
          setRingingRequest(req);
        }
      }
    };

    const handleDismissRequest = (data: any) => {
      if (data?.requestId) {
        markBookingRequestResponded(data.requestId);
        stopRingingAlert();
        setRingingRequest((prev) => (prev?.requestId === data.requestId ? null : prev));
      }
    };

    socket.on('partner:booking_request', handleBookingRequest);
    socket.on('partner:booking_cancelled', handleDismissRequest);
    socket.on('partner:booking_accepted', handleDismissRequest);
    socket.on('partner:booking_rejected', handleDismissRequest);
    socket.on('parcel:offer_accepted', handleDismissRequest);
    socket.on('parcel:offer_rejected', handleDismissRequest);

    return () => {
      socket.off('partner:booking_request', handleBookingRequest);
      socket.off('partner:booking_cancelled', handleDismissRequest);
      socket.off('partner:booking_accepted', handleDismissRequest);
      socket.off('partner:booking_rejected', handleDismissRequest);
      socket.off('parcel:offer_accepted', handleDismissRequest);
      socket.off('parcel:offer_rejected', handleDismissRequest);
    };
  }, [socket, isInsidePartnerPortal]);

  // Periodic polling check every 3s when outside partner portal for active partner accounts
  useEffect(() => {
    if (isInsidePartnerPortal) return;
    if (user && user.role !== 'logistics_partner') return;

    const pollPending = async () => {
      try {
        const bRes = await api.getPartnerBookingRequests();
        if (bRes?.requests) {
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

    const interval = setInterval(pollPending, 3000);
    return () => clearInterval(interval);
  }, [isInsidePartnerPortal, user]);

  if (isInsidePartnerPortal || !ringingRequest) {
    return null;
  }

  return (
    <PartnerRingingModal
      request={ringingRequest}
      onAccept={async (reqId) => {
        markBookingRequestResponded(reqId);
        stopRingingAlert();
        setRingingRequest(null);
        try {
          await api.acceptBookingRequest(reqId);
          playSuccessChime();
          router.push('/partner/deliveries');
        } catch (err: any) {
          alert(`Error accepting offer: ${err.message}`);
        }
      }}
      onReject={async (reqId, reason, note) => {
        markBookingRequestResponded(reqId);
        stopRingingAlert();
        setRingingRequest(null);
        try {
          await api.rejectBookingRequest(reqId, reason, note);
          playDeclineChime();
        } catch (err: any) {
          alert(`Error declining offer: ${err.message}`);
        }
      }}
      onClose={() => {
        if (ringingRequest) {
          markBookingRequestResponded(ringingRequest.requestId);
        }
        stopRingingAlert();
        setRingingRequest(null);
      }}
    />
  );
};
