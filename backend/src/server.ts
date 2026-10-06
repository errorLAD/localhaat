import express from 'express';
import http from 'http';
import cors from 'cors';
import { ENV } from './config/env.js';
import { connectDB, ensureMongodDaemonRunning } from './config/db.js';
import mongoose from 'mongoose';
import { initSocket } from './services/socketService.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { User } from './models/User.js';

const app = express();
const httpServer = http.createServer(app);

import path from 'path';
import fs from 'fs';

// Initialize Socket.IO
const io = initSocket(httpServer);

// Global Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'LocalHaat Rural Commerce & Logistics Platform API',
    status: 'online',
    health: '/health',
    api: '/api',
  });
});

// Serve uploaded files statically if directory exists
try {
  const staticUploadsDir = path.resolve(process.cwd(), '..', 'frontend', 'public', 'uploads');
  if (fs.existsSync(staticUploadsDir)) {
    app.use('/uploads', express.static(staticUploadsDir));
  }
} catch {
  // Ignore in serverless environments
}


// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'LocalHaat Rural Commerce & Logistics Engine',
    timestamp: new Date().toISOString(),
    env: ENV.NODE_ENV,
  });
});

// Auto-healing DB check for incoming API calls
app.use('/api', async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn(`[Database Auto-Heal] API called while DB state is ${mongoose.connection.readyState}. Resurrecting daemon...`);
    try {
      await ensureMongodDaemonRunning();
    } catch (e: any) {
      return res.status(503).json({
        success: false,
        message: 'Database is reconnecting. Please retry in a few seconds.',
        error: e.message,
      });
    }
  }
  next();
});

// API Routes
app.use('/api', routes);

// Centralized Error Handling
app.use(errorHandler);

// Start Server (only when running in non-serverless environments)
const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(ENV.PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 LocalHaat API & Socket Server running on port ${ENV.PORT}`);
      console.log(`🔗 Health Check: http://localhost:${ENV.PORT}/health`);
      console.log(`🌐 Environment: ${ENV.NODE_ENV}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

export { app, httpServer, io };
export default app;
