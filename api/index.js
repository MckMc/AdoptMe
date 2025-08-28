import serverless from 'serverless-http';
import app from '../src/app.js';
import { connectMongo } from '../src/db/mongo.js';

let mongoReady;

export default async function handler(req, res) {
  if (!mongoReady) {
    try {
      await connectMongo();
      mongoReady = true;
    } catch (err) {
      console.error('Mongo connect failed', err);
      res.statusCode = 500;
      return res.end('DB connection error');
    }
  }
  const wrapped = serverless(app);
  return wrapped(req, res);
}
