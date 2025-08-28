import serverless from 'serverless-http';
import app from '../src/app.js';
import { connectMongo } from '../src/db/mongo.js';

let mongoReady;

export default async function handler(req, res) {
  if (!mongoReady) {
    mongoReady = connectMongo().catch(err => {
      console.error('Mongo connect failed', err);
      mongoReady = null;
    });
  }
  await mongoReady;
  const wrapped = serverless(app);
  return wrapped(req, res);
}
