import { Router } from 'express';
import { PetModel } from '../models/pet.schema.js';
import { ensureDb } from '../db/mongo.js';

const router = Router();
router.use(ensureDb);

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);

const STATS_TTL = 60_000;
let cachedStats = { ts: 0, data: { total: 0, adoptadas: 0, disponibles: 0 } };

// root -> redirije
router.get('/', (_req, res) => res.redirect('/home'));

// home
router.get('/home', async (_req, res) => {
  // si el cache está fresco, devolvé eso
  if (Date.now() - cachedStats.ts < STATS_TTL) {
    return res.render('home', { title: 'PetAdopt', stats: cachedStats.data });
  }

  // valores por defecto (fallback)
  let stats = { total: 0, adoptadas: 0, disponibles: 0 };

  try {
    const [t, a, d] = await Promise.allSettled([
      withTimeout(PetModel.countDocuments({}).maxTimeMS(1200), 1500),
      withTimeout(PetModel.countDocuments({ adopted: true }).maxTimeMS(1200), 1500),
      withTimeout(PetModel.countDocuments({ adopted: false }).maxTimeMS(1200), 1500),
    ]);

    if (t.status === 'fulfilled') stats.total = t.value;
    if (a.status === 'fulfilled') stats.adoptadas = a.value;
    if (d.status === 'fulfilled') stats.disponibles = d.value;

    cachedStats = { ts: Date.now(), data: stats };
  } catch {
  }

  return res.render('home', { title: 'PetAdopt', stats });
});

export default router;
