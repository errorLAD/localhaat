'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { VillageAgent, Parcel } from '../types';
import { api } from '../lib/api';

interface AgentContextType {
  agent: VillageAgent | null;
  incomingParcels: Parcel[];
  hubParcels: Parcel[];
  deliveredParcels: Parcel[];
  handoverHistory: any[];
  stats: any;
  loading: boolean;
  isHubOpen: boolean;
  togglingHub: boolean;
  loadAgentDashboard: (showLoading?: boolean) => Promise<void>;
  handleToggleHub: () => Promise<void>;
  handleVerifyHandover: (parcelId: string, code: string) => Promise<boolean>;
  handleManualHandover: (parcelId: string, reason: string) => Promise<boolean>;
  handleVerifyDeliveryPin: (parcelId: string, pin: string) => Promise<boolean>;
  handleRecordCash: (amount: number, parcelId?: string) => Promise<boolean>;
  updateAgentProfile: (data: any) => Promise<boolean>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [agent, setAgent] = useState<VillageAgent | null>(null);
  const [incomingParcels, setIncomingParcels] = useState<Parcel[]>([]);
  const [hubParcels, setHubParcels] = useState<Parcel[]>([]);
  const [deliveredParcels, setDeliveredParcels] = useState<Parcel[]>([]);
  const [handoverHistory, setHandoverHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [isHubOpen, setIsHubOpen] = useState(true);
  const [togglingHub, setTogglingHub] = useState(false);

  useEffect(() => {
    loadAgentDashboard(true);
  }, [user]);

  // Real-time socket updates for all parcel and assignment changes
  useEffect(() => {
    if (!socket) return;

    // Join user notification room
    if (user?._id) {
      socket.emit('subscribe:user', user._id);
    }
    socket.emit('subscribe:agents');

    const handleStatusUpdate = () => {
      loadAgentDashboard(false);
    };

    const handleHandoverVerified = (data: any) => {
      console.log('[AgentContext] Transporter handover verified event received:', data);
      const targetId = data?.parcelId || data?.parcel?.parcelId;
      const targetTracking = data?.parcelTrackingNumber || data?.parcel?.parcelTrackingNumber;
      if (targetId || targetTracking) {
        setIncomingParcels((prev) => {
          const match = prev.find(
            (p) => p.parcelId === targetId || p._id === targetId || p.parcelTrackingNumber === targetTracking
          );
          if (match) {
            const updated = data.parcel || {
              ...match,
              status: 'AT_AGENT',
              verificationCodes: {
                ...match.verificationCodes,
                agentHandover: { ...match.verificationCodes?.agentHandover, status: 'VERIFIED' },
              },
            };
            setHubParcels((hPrev) => [updated, ...hPrev.filter((p) => p._id !== updated._id && p.parcelId !== updated.parcelId)]);
            return prev.filter(
              (p) => p.parcelId !== targetId && p._id !== targetId && p.parcelTrackingNumber !== targetTracking
            );
          }
          return prev;
        });
      }
      loadAgentDashboard(false);
    };

    socket.on('parcel:status_update', handleStatusUpdate);
    socket.on('parcel:status_change', handleStatusUpdate);
    socket.on('parcel:new_request', handleStatusUpdate);
    socket.on('parcel:agent_handover_verified', handleHandoverVerified);
    socket.on('parcel:agent-handover-verified', handleHandoverVerified);
    socket.on('admin:parcel_update', handleStatusUpdate);
    socket.on('partner:booking_accepted', handleStatusUpdate);
    socket.on('partner:booking_request', handleStatusUpdate);

    return () => {
      socket.off('parcel:status_update', handleStatusUpdate);
      socket.off('parcel:status_change', handleStatusUpdate);
      socket.off('parcel:new_request', handleStatusUpdate);
      socket.off('parcel:agent_handover_verified', handleHandoverVerified);
      socket.off('parcel:agent-handover-verified', handleHandoverVerified);
      socket.off('admin:parcel_update', handleStatusUpdate);
      socket.off('partner:booking_accepted', handleStatusUpdate);
      socket.off('partner:booking_request', handleStatusUpdate);
    };
  }, [socket, user]);

  // Periodic polling fallback (every 4s) so agent view is continuously refreshed
  useEffect(() => {
    const interval = setInterval(() => {
      loadAgentDashboard(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadAgentDashboard = async (showLoading: boolean = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.getAgentDashboard();
      setAgent(res.agent || null);
      if (res.agent?.isAvailable !== undefined) {
        setIsHubOpen(res.agent.isAvailable);
      }
      setIncomingParcels(res.incomingParcels || []);
      setHubParcels(res.hubParcels || res.readyForDeliveryParcels || []);
      setDeliveredParcels(res.deliveredParcels || []);
      setHandoverHistory(res.handoverHistory || []);
      setStats(res.stats || {});
    } catch (err) {
      console.error('Error fetching agent dashboard:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleToggleHub = async () => {
    setTogglingHub(true);
    try {
      const nextStatus = !isHubOpen;
      const res = await api.toggleAgentStatus(nextStatus);
      setIsHubOpen(res.isAvailable !== undefined ? res.isAvailable : nextStatus);
      if (res.agent) {
        setAgent(res.agent);
      }
    } catch (err: any) {
      alert(`Could not toggle hub status: ${err.message}`);
    } finally {
      setTogglingHub(false);
    }
  };

  const updateAgentProfile = async (profileData: any): Promise<boolean> => {
    try {
      const res = await api.updateAgentProfile(profileData);
      if (res.agent) {
        setAgent(res.agent);
        if (res.agent.isAvailable !== undefined) {
          setIsHubOpen(res.agent.isAvailable);
        }
      }
      return true;
    } catch (err: any) {
      console.error('Failed to update agent profile in database:', err);
      throw err;
    }
  };

  const handleVerifyHandover = async (parcelId: string, code: string): Promise<boolean> => {
    if (!code || code.trim().length === 0) {
      alert('Please enter or verify the 4-digit Agent Handover Code.');
      return false;
    }
    try {
      const res = await api.verifyHandover(parcelId, code.trim());
      alert(`Success! Handover verified. Package is now safely secured at the Village Hub.`);
      await loadAgentDashboard();
      return true;
    } catch (err: any) {
      alert(`Handover verification failed: ${err.message}`);
      return false;
    }
  };

  const handleManualHandover = async (parcelId: string, reason: string): Promise<boolean> => {
    if (!reason || !reason.trim()) {
      alert('Please provide a reason for manual confirmation.');
      return false;
    }
    try {
      await api.confirmManualAgentHandover(parcelId, reason.trim());
      alert('Manual handover confirmed! Parcel recorded in hub inventory.');
      await loadAgentDashboard();
      return true;
    } catch (err: any) {
      alert(`Manual handover confirmation failed: ${err.message}`);
      return false;
    }
  };

  const handleVerifyDeliveryPin = async (parcelId: string, pin: string): Promise<boolean> => {
    if (!pin || pin.trim().length === 0) {
      alert('Please request and enter the 4-digit Delivery PIN from the receiver.');
      return false;
    }
    try {
      const res = await api.verifyDelivery(parcelId, pin.trim());
      alert(`Delivery Fulfilled! Order completed with customer PIN. Commission credited to your wallet.`);
      await loadAgentDashboard();
      return true;
    } catch (err: any) {
      alert(`Delivery verification failed: ${err.message}`);
      return false;
    }
  };

  const handleRecordCash = async (amount: number, parcelId?: string): Promise<boolean> => {
    if (!amount || amount <= 0) {
      alert('Please enter a valid cash amount.');
      return false;
    }
    try {
      await api.recordCashCollection(amount, parcelId);
      alert(`Recorded ₹${amount} cash collection in the hub register.`);
      await loadAgentDashboard();
      return true;
    } catch (err: any) {
      alert(`Failed to record cash: ${err.message}`);
      return false;
    }
  };

  return (
    <AgentContext.Provider
      value={{
        agent,
        incomingParcels,
        hubParcels,
        deliveredParcels,
        handoverHistory,
        stats,
        loading,
        isHubOpen,
        togglingHub,
        loadAgentDashboard,
        handleToggleHub,
        handleVerifyHandover,
        handleManualHandover,
        handleVerifyDeliveryPin,
        handleRecordCash,
        updateAgentProfile,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
