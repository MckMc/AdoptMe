import app from '../src/app.js';
import { connectMongo, isConnected } from '../src/db/mongo.js';

const race = (p, ms) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);

export default async function handler(req, res) {
  const pathname = req.headers['x-vercel-original-pathname'] || req.url;

  if (pathname === '/healthz') {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ ok: true }));
  }
  if (pathname === '/favicon.ico' || pathname === '/favicon.png') {
    res.statusCode = 204;
    return res.end();
  }
  if (pathname === '/') {
    res.statusCode = 302;
    res.setHeader('Location', '/home');
    return res.end();
  }

  if (!isConnected()) {
    try { await race(connectMongo(), 2500); }
    catch {
      res.statusCode = 503;
      res.setHeader('content-type', 'text/plain');
      return res.end('DB temporalmente no disponible. Probá en unos segundos.');
    }
  }

  // Entregamos el control a Express directamente
  return app(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
  memory: 1024,
};
