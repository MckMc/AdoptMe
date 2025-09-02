import serverless from 'serverless-http';
import app from '../src/app.js';
import { connectMongo, isConnected } from '../src/db/mongo.js';

const wrapped = serverless(app);

const race = (p, ms) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);

export default async function handler(req, res) {
  const pathname = req.headers['x-vercel-original-pathname'] || req.url;

  // --- rutas ultra rápidas, sin DB ---
  if (pathname === '/healthz') {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  if (pathname === '/favicon.ico') {
    res.statusCode = 204;
    return res.end();
  }
  if (pathname === '/') {
    res.statusCode = 302;
    res.setHeader('Location', '/home');
    return res.end();
  }
  // -----------------------------------

  if (!isConnected()) {
    try {
      await race(connectMongo(), 2500);
    } catch (err) {
      res.statusCode = 503;
      res.setHeader('content-type', 'text/plain');
      return res.end('DB temporalmente no disponible. Probá en unos segundos.');
    }
  }

  return wrapped(req, res);
}

// Opciones de la función
export const config = {
  runtime: 'nodejs',
  regions: ['gru1'],
  maxDuration: 10,
  memory: 1024,
};


