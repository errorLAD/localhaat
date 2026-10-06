'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  requestOtp: (phone: string) => Promise<{ devOtp?: string; isNewUser?: boolean }>;
  loginWithOtp: (phone: string, otp: string, role?: string, name?: string) => Promise<User>;
  signup: (data: { name: string; phone: string; password?: string; role?: string; email?: string; defaultLocation?: any }) => Promise<User>;
  signupCustomer: (data: any) => Promise<User>;
  signupLogisticsPartner: (data: any) => Promise<any>;
  signupTravellingPartner: (data: any) => Promise<any>;
  signupVillageAgent: (data: any) => Promise<any>;
  login: (phone: string, password?: string, role?: string) => Promise<User>;
  switchRole: (role: UserRole) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PHONE_MAP: Record<UserRole, { phone: string; name: string }> = {
  customer: { phone: '9999900005', name: 'Priya Sharma (Customer)' },
  logistics_partner: { phone: '9999900003', name: 'Balwant Singh (Logistics)' },
  village_agent: { phone: '9999900004', name: 'Sudhir Kumar (Village Agent)' },
  business: { phone: '9999900002', name: 'Rameshwar Mahato (Artisan/Farmer)' },
  admin: { phone: '9999900001', name: 'Devendra Pratap (Admin)' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('localhaat_token');
    const savedUser = localStorage.getItem('localhaat_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        api
          .getProfile()
          .then((res) => {
            if (res.user) {
              setUser(res.user);
              localStorage.setItem('localhaat_user', JSON.stringify(res.user));
            }
          })
          .catch((err: any) => {
            // ONLY log out if the server explicitly responded with 401 Unauthorized
            // NEVER wipe user session on network timeouts, server reloads, or temporary 500/502/503 errors!
            const isUnauthorized = err?.status === 401 || err?.message?.includes('401') || err?.message?.toLowerCase()?.includes('unauthorized');
            if (isUnauthorized) {
              console.warn('[AuthContext] Session expired or invalid token. Clearing credentials.');
              localStorage.removeItem('localhaat_token');
              localStorage.removeItem('localhaat_user');
              setToken(null);
              setUser(null);
            } else {
              console.info('[AuthContext] Server temporarily busy or reloading; maintaining saved login state.');
            }
          });
      } catch (e) {
        localStorage.removeItem('localhaat_token');
        localStorage.removeItem('localhaat_user');
        setToken(null);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const requestOtp = async (phone: string) => {
    const res = await api.requestOtp(phone);
    return { devOtp: res.devOtp, isNewUser: res.isNewUser };
  };

  const loginWithOtp = async (phone: string, otp: string, role?: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await api.verifyOtp(phone, otp, role, name);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('localhaat_token', res.token);
      localStorage.setItem('localhaat_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { name: string; phone: string; password?: string; role?: string; email?: string; defaultLocation?: any }) => {
    setIsLoading(true);
    try {
      const res = await api.signup(data);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('localhaat_token', res.token);
      localStorage.setItem('localhaat_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const signupCustomer = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.signupCustomer(data);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('localhaat_token', res.token);
      localStorage.setItem('localhaat_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const signupLogisticsPartner = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.signupLogisticsPartner(data);
      if (res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('localhaat_token', res.token);
        localStorage.setItem('localhaat_user', JSON.stringify(res.user));
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const signupTravellingPartner = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.signupTravellingPartner(data);
      if (res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('localhaat_token', res.token);
        localStorage.setItem('localhaat_user', JSON.stringify(res.user));
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const signupVillageAgent = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.signupVillageAgent(data);
      if (res.token) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('localhaat_token', res.token);
        localStorage.setItem('localhaat_user', JSON.stringify(res.user));
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password?: string, role?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(phone, password, role);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('localhaat_token', res.token);
      localStorage.setItem('localhaat_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.switchRole(role);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('localhaat_token', res.token);
      localStorage.setItem('localhaat_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(role);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('localhaat_token', res.token);
      localStorage.setItem('localhaat_user', JSON.stringify(res.user));
    } catch (e: any) {
      console.warn('Demo login failed or disabled:', e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('localhaat_token');
    localStorage.removeItem('localhaat_user');
    localStorage.removeItem('localhaat_cart');
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        requestOtp,
        loginWithOtp,
        signup,
        signupCustomer,
        signupLogisticsPartner,
        signupTravellingPartner,
        signupVillageAgent,
        login,
        switchRole,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
