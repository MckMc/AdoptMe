import { Router } from 'express';
import { listPetsMongo, getPetById } from '../services/pets.mongo.service.js';
import { PetModel } from '../models/pet.schema.js';
import { ensureDb } from '../db/mongo.js';

const router = Router();
router.use(ensureDb);

const limit = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);

// raíz -> redirect
router.get('/', (_req, res) => res.redirect('/home'));

// Home
router.get('/home', async (_req, res, next) => {
  let stats = { total: 0, adoptadas: 0, disponibles: 0 };
  try {
    const counts = Promise.all([
      PetModel.countDocuments({}).maxTimeMS(1800),
      PetModel.countDocuments({ adopted: true }).maxTimeMS(1800),
      PetModel.countDocuments({ adopted: false }).maxTimeMS(1800),
    ]);
    const [total, adoptadas, disponibles] = await limit(counts, 1900);
    stats = { total, adoptadas, disponibles };
  } catch { /* fallback con ceros */ }
  try {
    return res.render('home', { title: 'PetAdopt', stats });
  } catch (e) { return next(e); }
});

// demás rutas…
export default router;
