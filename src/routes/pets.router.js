import { Router } from 'express';
import { PetModel } from '../models/pet.schema.js';
import passport from 'passport';

const router = Router();

// List pets (JSON)
router.get('/', async (req, res) => {
  const { species, adopted } = req.query;
  const filter = {};
  if (species) filter.species = species;
  if (adopted === 'true') filter.adopted = true;
  if (adopted === 'false') filter.adopted = false;
  const items = await PetModel.find(filter).limit(200).lean();
  res.json({ count: items.length, items });
});

// Create pet (simple seed/demo). Requires login.
router.post('/',
  passport.authenticate('current', { session:false }),
  async (req, res) => {
    const { name, species, birthDate } = req.body || {};
    if (!name || !species || !birthDate) {
      return res.status(400).json({ error: 'name, species y birthDate son requeridos' });
    }
    const pet = await PetModel.create({ name, species, birthDate, adopted:false, owner: null });
    res.status(201).json(pet.toObject());
  }
);

export default router;
