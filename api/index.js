import serverless from 'serverless-http';
import app from '../src/app.js';
import { connectMongo, isConnected } from '../src/db/mongo.js';

const wrapped = serverless(app, { callbackWaitsForEmptyEventLoop: false });

// util para timeout si lo estás usando
const race = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);

export default async function handler(req, res) {
  const pathname = req.headers['x-vercel-original-pathname'] || req.url;

  console.time('REQ total');

  // --- rutas ultra rápidas, sin DB ---
  if (pathname === '/healthz') {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
    console.timeEnd('REQ total');
    return;
  }
  if (pathname === '/favicon.ico') {
    res.statusCode = 204;
    res.end();
    console.timeEnd('REQ total');
    return;
  }
  if (pathname === '/') {
    res.statusCode = 302;
    res.setHeader('Location', '/home');
    res.end();
    console.timeEnd('REQ total');
    return;
  }
  // -----------------------------------

  // conexión a DB solo si hace falta
  if (!isConnected()) {
    console.time('DB connectMongo');
    try {
      await race(connectMongo(), 2500);
    } catch (err) {
      console.timeEnd('DB connectMongo');
      res.statusCode = 503;
      res.setHeader('content-type', 'text/plain');
      res.end('DB temporalmente no disponible. Probá en unos segundos.');
      console.timeEnd('REQ total');
      return;
    }
    console.timeEnd('DB connectMongo');
  }

  console.time('EXPRESS wrapped');
  const result = await wrapped(req, res);
  console.timeEnd('EXPRESS wrapped');

  console.timeEnd('REQ total');
  return result;
}

export const config = {
  runtime: 'nodejs',
  regions: ['iad1'],
  maxDuration: 10,
  memory: 1024,
};
