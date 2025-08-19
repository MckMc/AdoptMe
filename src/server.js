import http from 'http';
import app from './app.js';
import { registerSockets } from './sockets.js';
import { connectMongo } from './db/mongo.js';
import { seedProductsIfEmpty } from './seed/products.seed.js';

const server = http.createServer(app);
registerSockets(server);

const PORT = process.env.PORT || 8081;

connectMongo()
  .then(async () => {
    const r = await seedProductsIfEmpty();
    console.log(`Seed products: ${r.seeded ? 'inserted' : 'skipped'} (count=${r.count})`);
    server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
  })
  .catch(err => console.error('Mongo connection failed:', err));
