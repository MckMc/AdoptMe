import { Router } from 'express';
import { PetModel } from '../models/pet.schema.js';
import { ensureDb, isConnected } from '../db/mongo.js';

const router = Router();

// Root
router.get('/', (_req, res) => res.redirect('/home'));

const race = (p, ms = 1200) =>
  Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);

router.get('/home', async (_req, res) => {
  let stats = { total: 0, adoptadas: 0, disponibles: 0 };

  if (isConnected()) {
    try {
      const [total, adoptadas, disponibles] = await race(
        Promise.all([
          PetModel.estimatedDocumentCount().maxTimeMS(800),
          PetModel.countDocuments({ adopted: true }).maxTimeMS(800),
          PetModel.countDocuments({ adopted: false }).maxTimeMS(800),
        ]),
        900
      );
      stats = { total, adoptadas, disponibles };
    } catch {/* si se vence el timeout, seguimos con ceros */}
  }

  res.render('home', { title: 'PetAdopt', stats });
});

// Rutas que SÍ necesitan DB
router.get('/pets', ensureDb, async (req, res, next) => { /* tu lógica actual */ });
router.get('/pets/:pid', ensureDb, async (req, res, next) => { /* tu lógica actual */ });

export default router;

