import mongoose from 'mongoose';

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export function isConnected() {
  return !!(cached.conn && mongoose.connection.readyState === 1);
}

export async function connectMongo() {
  if (isConnected()) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URL;

    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);

    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
      socketTimeoutMS: 5000,
      family: 4,
      maxPoolSize: 3,
    }).then((m) => {
      cached.conn = m;
      return m;
    });
  }
  return cached.promise;
}
