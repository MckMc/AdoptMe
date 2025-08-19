import { Router } from 'express';
import { listPetsMongo, getPetById } from '../services/pets.mongo.service.js';
import { PetModel } from '../models/pet.schema.js';

const router = Router();

/** Root -> Home */
router.get('/', (_req, res) => res.redirect('/home'));

/** Home: propósito + métricas + galería */
router.get('/home', async (_req, res, next) => {
  try {
    const [total, adoptadas, disponibles] = await Promise.all([
      PetModel.countDocuments({}),
      PetModel.countDocuments({ adopted: true }),
      PetModel.countDocuments({ adopted: false }),
    ]);
    res.render('home', {
      title: 'PetAdopt',
      stats: { total, adoptadas, disponibles },
    });
  } catch (e) { next(e); }
});

/** Listado de mascotas (con filtros) */
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

/** Auth (sin cambios funcionales, solo vistas) */
router.get('/login',  (_req,res)=> res.render('auth/login',    { title:'Iniciar sesión' }));
router.get('/register',(_req,res)=> res.render('auth/register', { title:'Registrarse' }));
router.get('/auth/forgot', (_req,res)=> res.render('auth/forgot', { title:'Recuperar contraseña' }));
router.get('/auth/reset', (req,res)=> {
  const { token } = req.query;
  if(!token) return res.status(400).send('Token requerido');
  res.render('auth/reset', { title:'Restablecer contraseña', token });
});

export default router;
