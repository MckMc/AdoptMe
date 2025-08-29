import serverless from 'serverless-http';
import app from '../src/app.js';
import { connectMongo, isConnected } from '../src/db/mongo.js';

const wrapped = serverless(app);

export default async function handler(req, res) {
  if (req.url === '/healthz') {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ ok: true }));
  }

  if (!isConnected()) {
    try {
      await connectMongo();
    } catch (err) {
      console.error('Mongo connect failed', err);
      res.statusCode = 500;
      return res.end('DB connection error');
    }
  }

  return wrapped(req, res);
}