import http from 'http';
import app from './app.js';
import { connectMongo } from './db/mongo.js';
import { seedPets } from './seed/pets.js';

const PORT = process.env.PORT || 8081;

(async () => {
  try {
    await connectMongo();
    const r = await seedPets({ replace: true });
    console.log('Seed pets:', r);

    const server = http.createServer(app);
    server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
})();
