import mongoose from 'mongoose';

let cached = global.__mongoose;
if (!cached) cached = (global.__mongoose = { conn: null, promise: null });

export function isConnected() {
  return !!cached.conn && mongoose.connection.readyState === 1;
}

export async function connectMongo() {
  if (isConnected()) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URL;
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 8000,
      family: 4
    }).then(m => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
