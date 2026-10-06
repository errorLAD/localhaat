'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { User, KycDocument, Payout, Parcel, Product } from '../types';
import { api } from '../lib/api';

interface AdminContextType {
  stats: any;
  users: User[];
  businesses: any[];
  kycDocs: KycDocument[];
  payouts: Payout[];
  shipments: Parcel[];
  products: Product[];
  loading: boolean;
  loadAdminData: () => Promise<void>;
  handleVerifyKyc: (id: string, status: 'VERIFIED' | 'REJECTED', reason?: string) => Promise<boolean>;
  handleProcessPayout: (id: string, status?: string, transactionRef?: string) => Promise<boolean>;
  handleCreateBusiness: (data: any) => Promise<any>;
  handleUpdateBusiness: (id: string, data: any) => Promise<any>;
  handleResetBusinessPassword: (id: string, newPassword?: string) => Promise<any>;
  handleCreateProduct: (data: any) => Promise<any>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [kycDocs, setKycDocs] = useState<KycDocument[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [shipments, setShipments] = useState<Parcel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [statsRes, usersRes, kycRes, payoutsRes, bizRes, shipmentsRes, prodRes] = await Promise.all([
        api.getAdminStats().catch(() => ({ stats: {} })),
        api.getAdminUsers().catch(() => ({ users: [] })),
        api.getAdminKyc().catch(() => ({ documents: [] })),
        api.getAdminPayouts().catch(() => ({ payouts: [] })),
        api.getAdminBusinessAccounts().catch(() => ({ businesses: [] })),
        api.getParcels().catch(() => ({ parcels: [] })),
        api.getProducts().catch(() => ({ products: [] })),
      ]);

      setStats(statsRes.stats || {});
      setUsers(usersRes.users || []);
      setKycDocs(kycRes.documents || []);
      setPayouts(payoutsRes.payouts || []);
      setBusinesses(bizRes.businesses || []);
      setShipments(shipmentsRes.parcels || []);
      setProducts(prodRes.products || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      loadAdminData();
    };
    socket.on('parcel:status_update', handleUpdate);
    socket.on('parcel:new_request', handleUpdate);
    return () => {
      socket.off('parcel:status_update', handleUpdate);
      socket.off('parcel:new_request', handleUpdate);
    };
  }, [socket]);

  const handleVerifyKyc = async (id: string, status: 'VERIFIED' | 'REJECTED', reason?: string): Promise<boolean> => {
    try {
      await api.verifyKyc(id, status, reason);
      await loadAdminData();
      return true;
    } catch (err: any) {
      alert(`Error updating KYC: ${err.message}`);
      return false;
    }
  };

  const handleProcessPayout = async (id: string, status = 'processed', transactionRef?: string): Promise<boolean> => {
    try {
      await api.processPayout(id, status, transactionRef || `TXN-UPI-${Date.now().toString().slice(-6)}`);
      await loadAdminData();
      return true;
    } catch (err: any) {
      alert(`Error processing payout: ${err.message}`);
      return false;
    }
  };

  const handleCreateBusiness = async (data: any) => {
    const res = await api.createAdminBusinessAccount(data);
    await loadAdminData();
    return res;
  };

  const handleUpdateBusiness = async (id: string, data: any) => {
    const res = await api.updateAdminBusinessAccount(id, data);
    await loadAdminData();
    return res;
  };

  const handleResetBusinessPassword = async (id: string, newPassword?: string) => {
    const res = await api.resetAdminBusinessPassword(id, newPassword);
    await loadAdminData();
    return res;
  };

  const handleCreateProduct = async (data: any) => {
    const res = await api.createProduct(data);
    await loadAdminData();
    return res;
  };

  return (
    <AdminContext.Provider
      value={{
        stats,
        users,
        businesses,
        kycDocs,
        payouts,
        shipments,
        products,
        loading,
        loadAdminData,
        handleVerifyKyc,
        handleProcessPayout,
        handleCreateBusiness,
        handleUpdateBusiness,
        handleResetBusinessPassword,
        handleCreateProduct,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
