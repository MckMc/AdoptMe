import { Router } from 'express';
import { ensureDb } from '../db/mongo.js';
import { listPetsMongo, getPetById } from '../services/pets.mongo.service.js';
import { PetModel } from '../models/pet.schema.js';

const router = Router();

/** RUTAS RÁPIDAS (sin DB) */
router.get('/', (_req, res) => res.redirect('/home'));
router.get('/home', (_req, res) => res.send('ok home')); // puedes dejar esto liviano

router.use(ensureDb);

/** Home con métricas (con tope de tiempo por consulta) */
router.get('/home', async (_req, res, next) => {
  try {
    const withTimeout = (p) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 2000))]);
    const [total, adoptadas, disponibles] = await Promise.all([
      withTimeout(PetModel.countDocuments({}).maxTimeMS(2000)),
      withTimeout(PetModel.countDocuments({ adopted: true }).maxTimeMS(2000)),
      withTimeout(PetModel.countDocuments({ adopted: false }).maxTimeMS(2000)),
    ]);
    res.render('home', { title: 'PetAdopt', stats: { total, adoptadas, disponibles } });
  } catch (e) { next(e); }
});

/** Listado y detalle (usan DB) */
router.get('/pets', async (req, res, next) => {
  try {
    const data = await listPetsMongo(req.query);
    res.render('pets', { ...data, title: 'PetAdopt · Mascotas' });
  } catch (e) { next(e); }
});

router.get('/pets/:pid', async (req, res, next) => {
  try {
    const pet = await getPetById(req.params.pid);
    if (!pet) return res.status(404).send('Mascota no encontrada');
    res.render('pet', { title: `PetAdopt · ${pet.name}`, pet, petJson: JSON.stringify(pet) });
  } catch (e) { next(e); }
});

export default router;
