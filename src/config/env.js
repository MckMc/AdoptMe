import dotenv from 'dotenv';
dotenv.config();

export const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/ecommerce';
