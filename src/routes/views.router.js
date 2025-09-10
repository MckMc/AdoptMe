import { Router } from 'express';

// ---- si vas a usar productos/carrito:
import { listProductsMongo } from '../services/products.mongo.service.js';
import { getCart } from '../services/carts.mongo.service.js';

// ---- adopciones
import { listPetsMongo, getPetById } from '../services/pets.mongo.service.js';
import { PetModel } from '../models/pet.schema.js';
import { isConnected } from '../db/mongo.js';

const router = Router();

// util: timeout duro para que nada espere más de X ms
const withTimeout = (p, ms) =>
  Promise.race([ p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms)) ]);

// Root: elegí **una** sola redirección
router.get('/', (_req, res) => res.redirect('/home'));
// si preferís products, cambiá la línea de arriba por:
// router.get('/', (_req, res) => res.redirect('/products'));

// ---------- HOME (con cache y fallback si no hay DB)
const STATS_TTL = 60_000;
let cachedStats = { ts: 0, data: { total: 0, adoptadas: 0, disponibles: 0 } };

router.get('/home', async (_req, res, next) => {
  try {
    // cache hit rápido
    if (Date.now() - cachedStats.ts < STATS_TTL) {
      return res.render('home', { title: 'PetAdopt', stats: cachedStats.data });
    }

    // si no hay DB, render igual con ceros
    if (!isConnected()) {
      return res.render('home', { title: 'PetAdopt', stats: { total: 0, adoptadas: 0, disponibles: 0 } });
    }

    const [t, a, d] = await Promise.allSettled([
      withTimeout(PetModel.countDocuments({}).maxTimeMS(1200), 1500),
      withTimeout(PetModel.countDocuments({ adopted: true }).maxTimeMS(1200), 1500),
      withTimeout(PetModel.countDocuments({ adopted: false }).maxTimeMS(1200), 1500),
    ]);

    const stats = {
      total:       t.status === 'fulfilled' ? t.value : 0,
      adoptadas:   a.status === 'fulfilled' ? a.value : 0,
      disponibles: d.status === 'fulfilled' ? d.value : 0,
    };

    cachedStats = { ts: Date.now(), data: stats };
    return res.render('home', { title: 'PetAdopt', stats });
  } catch (e) { return next(e); }
});

// ---------- PRODUCTS (opcional, ahora sí BIEN CERRADO)
router.get('/products', async (req, res, next) => {
  try {
    const data = await listProductsMongo(req.query);
    return res.render('home', { ...data, title: 'Productos' });
  } catch (e) { return next(e); }
});

// ---------- CART (opcional)
router.get('/carts/:cid', async (req, res) => {
  const cart = await getCart(req.params.cid);
  if (!cart) return res.status(404).send('Cart not found');
  return res.render('cart', {
    title: 'Carrito',
    cart,
    cartJson: JSON.stringify(cart.products),
  });
});

// ---------- PETS (con fallback si DB está mal)
router.get('/pets', async (req, res, next) => {
  try {
    if (!isConnected()) {
      return res.render('pets', { title: 'PetAdopt · Mascotas', items: [], total: 0, page: 1, pages: 1 });
    }
    const data = await withTimeout(listPetsMongo(req.query), 2000);
    return res.render('pets', { ...data, title: 'PetAdopt · Mascotas' });
  } catch (e) { return next(e); }
});

router.get('/pets/:pid', async (req, res, next) => {
  try {
    if (!isConnected()) return res.status(503).send('DB no disponible, probá en unos segundos.');
    const pet = await withTimeout(getPetById(req.params.pid), 2000);
    if (!pet) return res.status(404).send('Mascota no encontrada');
    return res.render('pet', { title: `PetAdopt · ${pet.name}`, pet, petJson: JSON.stringify(pet) });
  } catch (e) { return next(e); }
});

// ---------- AUTH (una sola vez, no duplicar)
router.get('/login',     (_req,res) => res.render('auth/login',    { title:'Iniciar sesión' }));
router.get('/register',  (_req,res) => res.render('auth/register', { title:'Registrarse' }));
router.get('/auth/forgot', (_req,res)=> res.render('auth/forgot',  { title:'Recuperar contraseña' }));
router.get('/auth/reset', (req,res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Token requerido');
  res.render('auth/reset', { title:'Restablecer contraseña', token });
});

export default router;