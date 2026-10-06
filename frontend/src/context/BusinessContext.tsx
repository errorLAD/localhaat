'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { BusinessAccount, Parcel } from '../types';
import { api } from '../lib/api';

export interface BusinessStats {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  totalSpend: number;
  creditLimit: number;
  availableCredit: number;
  accountStatus: string;
}

interface BusinessContextType {
  business: BusinessAccount | null;
  stats: BusinessStats;
  recentShipments: Parcel[];
  pickupLocations: any[];
  loading: boolean;
  loadBusinessDashboard: () => Promise<void>;
  createShipment: (data: any) => Promise<any>;
  createBulkShipments: (shipments: any[]) => Promise<any>;
  createPickupRequest: (data: any) => Promise<any>;
  updateProfile: (data: any) => Promise<boolean>;
  changePassword: (data: { currentPassword?: string; newPassword: string }) => Promise<boolean>;
}

const defaultStats: BusinessStats = {
  totalShipments: 0,
  activeShipments: 0,
  deliveredShipments: 0,
  totalSpend: 0,
  creditLimit: 25000,
  availableCredit: 25000,
  accountStatus: 'active',
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [business, setBusiness] = useState<BusinessAccount | null>(null);
  const [stats, setStats] = useState<BusinessStats>(defaultStats);
  const [recentShipments, setRecentShipments] = useState<Parcel[]>([]);
  const [pickupLocations, setPickupLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBusinessDashboard = async () => {
    if (!user || user.role !== 'business') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.getBusinessDashboard();
      if (res.success) {
        setBusiness(res.business || null);
        setStats(res.stats || defaultStats);
        setRecentShipments(res.recentShipments || []);
        setPickupLocations(res.pickupLocations || []);
      }
    } catch (err: any) {
      console.error('Error fetching business dashboard:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinessDashboard();
  }, [user]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      loadBusinessDashboard();
    };
    socket.on('parcel:status_update', handleUpdate);
    socket.on('parcel:new_request', handleUpdate);
    return () => {
      socket.off('parcel:status_update', handleUpdate);
      socket.off('parcel:new_request', handleUpdate);
    };
  }, [socket]);

  const createShipment = async (data: any) => {
    const res = await api.createBusinessShipment(data);
    await loadBusinessDashboard();
    return res;
  };

  const createBulkShipments = async (shipments: any[]) => {
    const res = await api.createBusinessBulkShipments(shipments);
    await loadBusinessDashboard();
    return res;
  };

  const createPickupRequest = async (data: any) => {
    const res = await api.createBusinessPickupRequest(data);
    await loadBusinessDashboard();
    return res;
  };

  const updateProfile = async (data: any): Promise<boolean> => {
    try {
      const res = await api.updateBusinessProfile(data);
      if (res.success) {
        await loadBusinessDashboard();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const changePassword = async (data: { currentPassword?: string; newPassword: string }): Promise<boolean> => {
    try {
      const res = await api.changeBusinessPassword(data);
      return !!res.success;
    } catch (err) {
      return false;
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        business,
        stats,
        recentShipments,
        pickupLocations,
        loading,
        loadBusinessDashboard,
        createShipment,
        createBulkShipments,
        createPickupRequest,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
