import { upload } from '../middlewares/upload.js';
import { Router } from 'express';
import { UserModel } from '../models/user.schema.js';
import { ensureDb } from '../db/mongo.js';

const router = Router();
router.use(ensureDb);
router.get('/', async (_req,res)=> {
  const docs = await UserModel.find({}, { password:0 }).limit(100).lean(); // oculta hash
  res.json({ count: docs.length, items: docs });
});
router.post('/:uid/documents',
  upload.fields([{ name:'documents', maxCount:10 }, { name:'pet', maxCount:1 }]),
  async (req, res) => {
    const { uid } = req.params;
    const user = await UserModel.findById(uid);
    if (!user) return res.status(404).json({ error:'User not found' });

    const docs = [];
    (req.files?.documents || []).forEach(f => {
      docs.push({ name: f.originalname, reference: `/static/documents/${f.filename}` });
    });
    // si también suben una imagen de mascota (sugerencia de la consigna)
    (req.files?.pet || []).forEach(f => {
      docs.push({ name: f.originalname, reference: `/static/pets/${f.filename}` });
    });

    user.documents.push(...docs);
    await user.save();

    res.status(201).json({ uploaded: docs.length, documents: user.documents });
  }
);
export default router;
