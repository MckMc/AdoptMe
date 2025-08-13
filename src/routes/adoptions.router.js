import { Router } from 'express';
import { PetModel } from '../models/pet.schema.js';
import { AppError, ERRORS } from '../middlewares/error.js';
import passport from 'passport';

const router = Router();

// POST
router.post('/:pid',
  passport.authenticate('current', { session:false }),
  async (req, res, next) => {
    try{
      const { pid } = req.params;
      const pet = await PetModel.findById(pid);
      if(!pet) throw new AppError(ERRORS.NOT_FOUND, 'Pet not found');
      if(pet.adopted) throw new AppError(ERRORS.INVALID_ARGUMENT, 'Pet already adopted');

      pet.adopted = true;
      pet.owner = req.user._id;
      await pet.save();

      res.json({ petId: pet._id, ownerId: req.user._id, adoptedAt: new Date() });
    }catch(e){ next(e); }
  }
);

export default router;
