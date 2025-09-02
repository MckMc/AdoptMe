import serverless from 'serverless-http';
import app from '../src/app.js';
import { connectMongo, isConnected } from '../src/db/mongo.js';

const wrapped = serverless(app);

export default async function handler(req, res) {
  const pathname = req.headers['x-vercel-original-pathname'] || req.url;

  if (pathname === '/healthz' || pathname === '/api/healthz') {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ ok: true }));
  }

  if (!isConnected()) {
    try {
      await connectMongo();
    } catch (err) {
      console.error('Mongo connect failed:', err?.message);
      res.statusCode = 503;
      return res.end('DB connection error');
    }
  }

  const wrapped = serverless(app);
  return wrapped(req, res);
}

export const config = {
  runtime: 'nodejs20.x',
  regions: ['gru1'],
  maxDuration: 10,
};