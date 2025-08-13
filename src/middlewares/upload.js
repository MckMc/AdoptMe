import multer from 'multer';
import fs from 'fs';
import path from 'path';

function ensureDir(p){ fs.mkdirSync(p, { recursive:true }); }

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    const folder = file.fieldname === 'pet' ? 'pets' : 'documents';
    const dest = path.join(process.cwd(), 'uploads', folder);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9._-]/g,'');
    cb(null, `${Date.now()}_${safe}`);
  }
});

export const upload = multer({ storage });
