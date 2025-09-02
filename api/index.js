import serverless from 'serverless-http';
import app from '../src/app.js';
import { isConnected } from '../src/db/mongo.js';

export default async function handler(req, res) {
  if (req.url === '/healthz') {
    res.setHeader('content-type', 'application/json');
    return res.end(JSON.stringify({ ok: true, mongo: isConnected() ? 'up' : 'down' }));
  }
  const wrapped = serverless(app);
  return wrapped(req, res);
}
