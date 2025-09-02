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
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 8000,
      family: 4,
      maxPoolSize: 3,
    }).then((m) => {
      cached.conn = m;
      return m;
    });
  }

  return cached.promise;
}

export async function ensureDb(req, res, next) {
  if (isConnected()) return next();
  try {
    await connectMongo();
    return next();
  } catch (err) {
    console.error('DB connect error:', err?.message);
    return res.status(503).type('text/plain')
      .send('DB temporalmente no disponible. Probá en unos segundos.');
  }
}
