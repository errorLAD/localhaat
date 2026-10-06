import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb+srv://milddatain_db_user:WuPtvFPq5rIU8xiI@cluster0.m9ihmsm.mongodb.net/localhaat?retryWrites=true&w=majority&appName=Cluster0',
  JWT_SECRET: process.env.JWT_SECRET || 'localhaat_super_secret_jwt_key_2026_rural_commerce',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_localhaat12345',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'localhaat_test_secret_mock',
  USE_IN_MEMORY_DB_IF_LOCAL_FAILS: process.env.USE_IN_MEMORY_DB_IF_LOCAL_FAILS === 'true' || true,
};
