'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribeToParcel: (trackingNumber: string) => void;
  unsubscribeFromParcel: (trackingNumber: string) => void;
  subscribeToAgents: () => void;
  subscribeToPartner: (partnerId: string) => void;
  subscribeToUser: (userId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    let socketInstance: Socket | null = null;
    let isMounted = true;

    import('socket.io-client').then(({ io }) => {
      if (!isMounted) return;
      const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
      const s = io(socketServerUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });

      s.on('connect', () => {
        console.log('[SocketContext] Connected to realtime server:', s.id);
        if (isMounted) setIsConnected(true);
      });

      s.on('disconnect', () => {
        console.log('[SocketContext] Disconnected from realtime server');
        if (isMounted) setIsConnected(false);
      });

      socketInstance = s;
      if (isMounted) setSocket(s);
    }).catch((err) => {
      console.warn('[SocketContext] Realtime socket initialization failed:', err);
    });

    return () => {
      isMounted = false;
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const subscribeToParcel = (trackingNumber: string) => {
    if (socket && trackingNumber) {
      socket.emit('subscribe:parcel', trackingNumber);
    }
  };

  const unsubscribeFromParcel = (trackingNumber: string) => {
    if (socket && trackingNumber) {
      socket.emit('unsubscribe:parcel', trackingNumber);
    }
  };

  const subscribeToAgents = () => {
    if (socket) {
      socket.emit('subscribe:agents');
    }
  };

  const subscribeToPartner = (partnerId: string) => {
    if (socket && partnerId) {
      socket.emit('subscribe:partner', partnerId);
    }
  };

  const subscribeToUser = (userId: string) => {
    if (socket && userId) {
      socket.emit('subscribe:user', userId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        subscribeToParcel,
        unsubscribeFromParcel,
        subscribeToAgents,
        subscribeToPartner,
        subscribeToUser,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
