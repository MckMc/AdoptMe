import mongoose from 'mongoose';

let cached = global.__mongoose;
if (!cached) cached = global.__mongoose = { conn: null, promise: null };

export function isConnected() {
  return !!(cached.conn && mongoose.connection.readyState === 1);
}

// util de timeout
const delayReject = (ms, msg='connect-timeout') =>
  new Promise((_, r) => setTimeout(() => r(new Error(msg)), ms));

export async function connectMongo() {
  if (isConnected()) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGO_URL;
    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS:        2000,
      socketTimeoutMS:         3000,
      maxPoolSize:             3,
      family:                  4,
    }).then(m => (cached.conn = m));
  }
  return cached.promise;
}

export async function ensureDb(req, res, next) {
  if (isConnected()) return next();
  try {
    await Promise.race([ connectMongo(), delayReject(2500) ]);
    return next();
  } catch (err) {
    console.error('DB connect error:', err?.message);
    res.status(503).type('text/plain')
       .send('DB temporalmente no disponible. Probá en unos segundos.');
  }
}
