import serverless from 'serverless-http';
import app from '../src/app.js';
import { connectMongo } from '../src/db/mongo.js';

await connectMongo();

export default serverless(app);