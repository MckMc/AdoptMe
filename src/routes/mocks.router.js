import { Router } from 'express';
import { mockPet, mockUser } from '../mocks/factory.js';
import { PetModel } from '../models/pet.schema.js';
import { UserModel } from '../models/user.schema.js';
import { AppError, ERRORS } from '../middlewares/error.js';

const router = Router();

//  GET /api/mocks/mockingpets?qty=100 
router.get('/mockingpets', async (req, res, next) => {
  try {
    const qty = Number(req.query.qty ?? 100);
    if (Number.isNaN(qty) || qty < 1 || qty > 1000)
      throw new AppError(ERRORS.INVALID_ARGUMENT, 'qty debe ser 1..1000');
    const items = Array.from({ length: qty }, () => mockPet());
    res.json({ count: items.length, items });
  } catch (e) { next(e); }
});

//  GET /api/mocks/mockingusers?qty=50
router.get('/mockingusers', async (req, res, next) => {
  try {
    const qty = Number(req.query.qty ?? 50);
    if (Number.isNaN(qty) || qty < 1 || qty > 1000)
      throw new AppError(ERRORS.INVALID_ARGUMENT, 'qty debe ser 1..1000');
    const items = Array.from({ length: qty }, () => mockUser());
    res.json({ count: items.length, items });
  } catch (e) { next(e); }
});

router.post('/generateData', async (req, res, next) => {
  try {
    const usersQty = Number(req.body?.users ?? 0);
    const petsQty  = Number(req.body?.pets  ?? 0);
    if ([usersQty, petsQty].some(n => Number.isNaN(n) || n < 0))
      throw new AppError(ERRORS.INVALID_ARGUMENT, 'users/pets deben ser >= 0');

    // Generar y normalizar emails únicos
    const users = [];
    const emails = new Set();
    for (let i=0; i<usersQty; i++) {
      let u = mockUser();
      while (emails.has(u.email)) u = mockUser();
      emails.add(u.email);
      users.push(u);
    }
    const pets = Array.from({ length: petsQty }, () => mockPet());

    const [uRes, pRes] = await Promise.all([
      users.length ? UserModel.insertMany(users, { ordered:false }) : [],
      pets.length  ? PetModel.insertMany(pets,  { ordered:false }) : []
    ]);

    req.logger?.info('Mock data inserted', { users: users.length, pets: pets.length });

    res.status(201).json({
      inserted: { users: uRes.length || 0, pets: pRes.length || 0 }
    });
  } catch (e) {
    if (e?.code === 11000) return next(new AppError(ERRORS.DUPLICATE_EMAIL));
    next(e);
  }
});

export default router;
