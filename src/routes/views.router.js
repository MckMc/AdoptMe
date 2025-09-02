import { Router } from 'express';
import { listPetsMongo, getPetById } from '../services/pets.mongo.service.js';
import { PetModel } from '../models/pet.schema.js';
import { ensureDb } from '../db/mongo.js';

const router = Router();

router.use(ensureDb);

const timeout = (ms) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

/** Root -> Home */
router.get('/', (_req, res) => res.redirect('/home'));

/** Home: propósito + métricas + galería */
router.get('/home', async (_req, res, next) => {
  // valores por defecto si Atlas está lento
  let stats = { total: '–', adoptadas: '–', disponibles: '–' };

  try {
    await Promise.race([
      (async () => {
        const [total, adoptadas, disponibles] = await Promise.all([
          PetModel.countDocuments({}).maxTimeMS(2000),
          PetModel.countDocuments({ adopted: true }).maxTimeMS(2000),
          PetModel.countDocuments({ adopted: false }).maxTimeMS(2000),
        ]);
        stats = { total, adoptadas, disponibles };
      })(),
      timeout(2500),
    ]);
  } catch (e) {
    console.warn('home stats slow/timeout:', e.message);
  }

  try {
    return res.render('home', {
      title: 'PetAdopt',
      stats,
    });
  } catch (e) {
    return next(e);
  }
});

/** Listado de mascotas */
router.get('/pets', async (req, res, next) => {
  try {
    const data = await listPetsMongo(req.query);
    res.render('pets', { ...data, title: 'PetAdopt · Mascotas' });
  } catch (e) { next(e); }
});

/** Detalle de mascota */
router.get('/pets/:pid', async (req, res, next) => {
  try {
    const pet = await getPetById(req.params.pid);
    if (!pet) return res.status(404).send('Mascota no encontrada');
    res.render('pet', { title: `PetAdopt · ${pet.name}`, pet, petJson: JSON.stringify(pet) });
  } catch (e) { next(e); }
});

/** Auth  */
router.get('/login',   (_req,res)=> res.render('auth/login',    { title:'Iniciar sesión' }));
router.get('/register',(_req,res)=> res.render('auth/register', { title:'Registrarse' }));
router.get('/auth/forgot', (_req,res)=> res.render('auth/forgot', { title:'Recuperar contraseña' }));
router.get('/auth/reset', (req,res)=> {
  const { token } = req.query;
  if(!token) return res.status(400).send('Token requerido');
  res.render('auth/reset', { title:'Restablecer contraseña', token });
});

/** Evitar ruido de /favicon.ico si no lo sirve static */
router.get('/favicon.ico', (_req, res) => res.status(204).end());

export default router;
