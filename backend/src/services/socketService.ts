import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ENV } from '../config/env.js';

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join tracking room for specific parcel
    socket.on('subscribe:parcel', (trackingNumber: string) => {
      socket.join(`parcel:${trackingNumber}`);
      console.log(`[Socket.IO] Client ${socket.id} subscribed to parcel:${trackingNumber}`);
    });

    socket.on('unsubscribe:parcel', (trackingNumber: string) => {
      socket.leave(`parcel:${trackingNumber}`);
    });

    // Join user notifications room
    socket.on('subscribe:user', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    // Join partner room for dispatch updates
    socket.on('subscribe:partner', (partnerId: string) => {
      socket.join(`partner:${partnerId}`);
    });

    // Live partner location broadcast
    socket.on('partner:location_update', (data: { partnerId: string; trackingNumber?: string; latitude: number; longitude: number }) => {
      if (data.trackingNumber) {
        io?.to(`parcel:${data.trackingNumber}`).emit('parcel:location', data);
      }
      io?.emit('admin:partner_location', data);
    });

    // Join admin agents monitor room
    socket.on('subscribe:agents', () => {
      socket.join('admin:agents');
      console.log(`[Socket.IO] Client ${socket.id} joined admin:agents room`);
    });

    // Live agent location broadcast
    socket.on('agent:location_update', (data: { agentId: string; latitude: number; longitude: number; operationalStatus?: string }) => {
      io?.to('admin:agents').emit('agent:location', data);
      io?.emit('admin:agent_location', data);
    });

    // Agent operational status broadcast
    socket.on('agent:status_change', (data: { agentId: string; status: string; operationalStatus: string }) => {
      io?.to('admin:agents').emit('agent:status_update', data);
      io?.emit('admin:agent_status_update', data);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server | null => {
  return io;
};

export const emitToParcel = (trackingNumber: string, event: string, payload: any) => {
  if (io) {
    io.to(`parcel:${trackingNumber}`).emit(event, payload);
    // Also emit to global admin feed
    io.emit('admin:event', { event, trackingNumber, payload });
  }
};

export const emitToUser = (userId: string, event: string, payload: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
};

export const emitToAll = (event: string, payload: any) => {
  if (io) {
    io.emit(event, payload);
  }
};

export const emitToPartner = (partnerId: string, event: string, payload: any) => {
  if (io) {
    io.to(`partner:${partnerId}`).emit(event, payload);
    // Also emit broadcast so client listening globally will receive it
    io.emit(event, { partnerId, ...payload });
  }
};

export const emitAgentUpdate = (agentId: string, event: string, payload: any) => {
  if (io) {
    io.to('admin:agents').emit(event, { agentId, ...payload });
    io.emit('admin:agent_update', { agentId, event, payload });
  }
};
