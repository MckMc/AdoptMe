import serverless from 'serverless-http';
import app from '../src/app.js';
import { connectMongo, isConnected } from '../src/db/mongo.js';

const wrapped = serverless(app);
const timeout = (ms, msg='timeout') => new Promise((_, r) => setTimeout(() => r(new Error(msg)), ms));

export default async function handler(req, res) {
  const pathname = req.headers['x-vercel-original-pathname'] || req.url;

  // Rutas sin DB
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
    try {
      await Promise.race([ connectMongo(), timeout(2500) ]);
    } catch {
      res.statusCode = 503;
      res.setHeader('content-type', 'text/plain');
      return res.end('DB temporalmente no disponible. Probá en unos segundos.');
    }
  }

  return wrapped(req, res);
}

export const config = {
  runtime: 'nodejs',
  regions: ['gru1'],
  maxDuration: 10,
  memory: 1024,
};
