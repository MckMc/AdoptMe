import { Router } from 'express';
import { PetModel } from '../models/pet.schema.js';
import { isConnected } from '../db/mongo.js';

const router = Router();

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);

const STATS_TTL = 60_000;
let cachedStats = { ts: 0, data: { total: 0, adoptadas: 0, disponibles: 0 } };

router.get('/', (_req, res) => res.redirect('/home'));

router.get('/home', async (req, res, next) => {
  console.time('HOME total');

  // cache hit
  if (Date.now() - cachedStats.ts < STATS_TTL) {
    console.timeLog('HOME total', 'cache-hit');
    res.render('home', { title: 'PetAdopt', stats: cachedStats.data });
    console.timeEnd('HOME total');
    return;
  }

  // si no hay DB, devolvé igual rápido
  if (!isConnected()) {
    console.timeLog('HOME total', 'sin-DB');
    res.render('home', { title: 'PetAdopt', stats: { total: 0, adoptadas: 0, disponibles: 0 } });
    console.timeEnd('HOME total');
    return;
  }

  let stats = { total: 0, adoptadas: 0, disponibles: 0 };

  try {
    console.time('HOME queries');
    const [t, a, d] = await Promise.allSettled([
      withTimeout(PetModel.countDocuments({}).maxTimeMS(1200), 1500),
      withTimeout(PetModel.countDocuments({ adopted: true }).maxTimeMS(1200), 1500),
      withTimeout(PetModel.countDocuments({ adopted: false }).maxTimeMS(1200), 1500),
    ]);
    console.timeEnd('HOME queries');

    if (t.status === 'fulfilled') stats.total = t.value;
    if (a.status === 'fulfilled') stats.adoptadas = a.value;
    if (d.status === 'fulfilled') stats.disponibles = d.value;

    cachedStats = { ts: Date.now(), data: stats };
  } catch (e) {
    console.timeEnd('HOME queries');
  }

  console.time('HOME render');
  res.render('home', { title: 'PetAdopt', stats });
  console.timeEnd('HOME render');

  console.timeEnd('HOME total');
});

export default router;
