import app from '../src/server.js';
import { connectDB } from '../src/config/db.js';

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (err: any) {
    console.error('[Vercel Handler] Database connection error:', err?.message || err);
  }
  return app(req, res);
}
