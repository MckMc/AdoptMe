import serverless from 'serverless-http';
import app from '../src/app.js';
import { connectMongo, isConnected } from '../src/db/mongo.js';

const wrapped = serverless(app);

const withTimeout = (p, ms = 2500) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);

export default async function handler(req, res) {
  const pathname = req.headers['x-vercel-original-pathname'] || req.url;

  // Rutas ultra-rápidas sin DB
  if (pathname === '/healthz') {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
    return;
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

  // No obligues DB en rutas que pueden responder sin DB
  const isStatic = pathname.startsWith('/static/') || pathname.startsWith('/uploads/');
  const canSkipDb =
    pathname === '/home' || pathname.startsWith('/login') || pathname.startsWith('/register') || isStatic;

  if (!isConnected()) {
    try {
      await Promise.race([connectMongo(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 2000))]);
    } catch {
      res.statusCode = 503;
      res.setHeader('content-type', 'text/plain');
      return res.end('DB temporalmente no disponible. Probá en unos segundos.');
    }
  }

  return wrapped(req, res);
}

export const config = { runtime: 'nodejs', regions: ['gru1'], maxDuration: 10, memory: 1024 };
