import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { ENV } from './env.js';

const persistentDbPath = path.resolve(process.cwd(), '..', '.mongo-data');
let mongodInstance: any = null;

const cleanStaleLock = (): void => {
  const lockFile = path.join(persistentDbPath, 'mongod.lock');
  if (fs.existsSync(lockFile)) {
    try {
      const content = fs.readFileSync(lockFile, 'utf8').trim();
      const pid = parseInt(content, 10);
      let isAlive = false;
      if (!isNaN(pid) && pid > 0) {
        try {
          process.kill(pid, 0);
          isAlive = true;
        } catch {
          isAlive = false;
        }
      }
      if (!isAlive) {
        fs.unlinkSync(lockFile);
        console.log(`[Database] Removed stale mongod.lock from dead PID: ${pid}`);
      }
    } catch {
      try {
        fs.unlinkSync(lockFile);
      } catch {}
    }
  }
};

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const ensureMongodDaemonRunning = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const isRemote =
    ENV.MONGODB_URI.startsWith('mongodb+srv://') ||
    (!ENV.MONGODB_URI.includes('localhost') && !ENV.MONGODB_URI.includes('127.0.0.1'));

  if (isRemote) {
    if (cached.conn) {
      return;
    }

    if (!cached.promise) {
      const maskedUri = ENV.MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
      console.log(`[Database] Connecting to MongoDB Atlas: ${maskedUri}...`);
      cached.promise = mongoose
        .connect(ENV.MONGODB_URI, {
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000,
        })
        .then((m) => {
          console.log(`[Database] Connected successfully to MongoDB Atlas`);
          return m;
        })
        .catch((err) => {
          cached.promise = null;
          console.error(`[Database] Failed to connect to MongoDB Atlas:`, err.message);
          throw err;
        });
    }

    try {
      cached.conn = await cached.promise;
      return;
    } catch (err: any) {
      cached.promise = null;
      throw err;
    }
  }

  // 1. First check if persistent MongoDB is already running on port 27017
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`[Database] Connected directly to persistent MongoDB at: ${ENV.MONGODB_URI}`);
    return;
  } catch {
    console.log(`[Database] Port 27017 not reachable. Initializing persistent WiredTiger engine...`);
  }

  // Ensure persistent data directory exists
  if (!fs.existsSync(persistentDbPath)) {
    fs.mkdirSync(persistentDbPath, { recursive: true });
  }

  // Clean stale lock if previous process died uncleanly
  cleanStaleLock();

  // 2. Launch persistent MongoDB engine bound to port 27017 with persistent WiredTiger storage
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!mongodInstance) {
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'localhaat',
          dbPath: persistentDbPath,
          storageEngine: 'wiredTiger',
        },
      });
      console.log(`[Database] Persistent WiredTiger database engine active on port 27017`);
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] Successfully connected to persistent MongoDB at: ${ENV.MONGODB_URI}`);
  } catch (err: any) {
    console.error('[Database] Failed to initialize persistent database engine:', err.message);
    throw err;
  }
};

export const connectDB = async (): Promise<void> => {
  mongoose.set('strictQuery', false);
  await ensureMongodDaemonRunning();
};

export const disconnectDB = async (): Promise<void> => {
  // Disconnect client only; preserve all WiredTiger files on disk
  await mongoose.disconnect();
};

// Safe shutdown hook preserving disk data
const gracefulExit = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop({ doCleanup: false });
    }
  } catch {}
};

process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);
