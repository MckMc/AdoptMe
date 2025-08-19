import 'dotenv/config';
import mongoose from 'mongoose';
import { MONGO_URL } from '../config/env.js';

export async function connectMongo() {
  await mongoose.connect(MONGO_URL, { dbName: 'ecommerce' });
  console.log('Mongo connected:', MONGO_URL);
}
