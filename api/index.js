// api/index.js
import serverless from 'serverless-http';
import app from '../src/app.js';
import { connectMongo, isConnected } from '../src/db/mongo.js';

export default async function handler(req, res) {
  const pathname = req.headers['x-vercel-original-pathname'] || req.url;
  if (pathname === '/healthz') {
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ ok: true }));
  }

  // Asegurar conexión a DB
  if (!isConnected()) {
    try { await connectMongo(); }
    catch (err) {
      console.error('Mongo connect failed:', err?.message);
      res.statusCode = 503;
      return res.end('DB connection error');
    }
  }

  // Enviar al app de Express
  const wrapped = serverless(app);
  return wrapped(req, res);
}

// Config de la función en Vercel
export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
  regions: ['iad1'],
};
