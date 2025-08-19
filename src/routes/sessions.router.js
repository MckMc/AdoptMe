import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import passport from 'passport';
import { UserModel } from '../models/user.schema.js';
import { CartModel } from '../models/cart.schema.js';
import nodemailer from 'nodemailer';
import { toUserDTO } from '../dtos/user.dto.js';


const router = Router();

const signJWT = (uid) => jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn:'24h' });
const signReset = (uid) => jwt.sign({ uid }, process.env.RESET_SECRET, { expiresIn:'1h' });
let cachedMailer = null;
let isEthereal = false;

async function getMailer() {
  if (cachedMailer) return cachedMailer;

  // Forzar Ethereal si USE_ETHEREAL=true
  if (process.env.USE_ETHEREAL === 'true' || !process.env.MAIL_USER) {
    const test = await nodemailer.createTestAccount();
    cachedMailer = nodemailer.createTransport({
      host: test.smtp.host,
      port: test.smtp.port,
      secure: test.smtp.secure,
      auth: { user: test.user, pass: test.pass }
    });
    isEthereal = true;
    return cachedMailer;
  }

  // Gmail real
  cachedMailer = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    tls: { minVersion: 'TLSv1.2' }
  });
  return cachedMailer;
}

// REGISTER
router.post('/register', async (req,res) => {
  const { first_name, last_name, email, age, password } = req.body;
  const exists = await UserModel.findOne({ email });
  if (exists) return res.status(400).json({ error:'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const cart = await CartModel.create({ products: [] });
  const user = await UserModel.create({ first_name, last_name, email, age, password: hash, cart: cart._id });

  const token = signJWT(user._id);
  res.cookie('jwt', token, { httpOnly:true, sameSite:'lax' });
  res.status(201).json({ status:'ok', user: { id:user._id, email:user.email, role:user.role }});
});

// LOGIN
router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ error:'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ error:'Invalid credentials' });

  await UserModel.updateOne(
    { _id: user._id },
    { $set: { last_connection: new Date() } }
  );

  const token = signJWT(user._id);
  res.cookie('jwt', token, { httpOnly:true, sameSite:'lax' });
  res.json({ status:'ok', user: { id:user._id, email:user.email, role:user.role }});
});

// CURRENT
router.get('/current', passport.authenticate('current', { session:false }), (req,res) => {
  res.json(toUserDTO(req.user));
});

// LOGOUT
router.post('/logout',
  passport.authenticate('current', { session:false }),
  async (req,res) => {
    await UserModel.updateOne(
      { _id: req.user._id },
      { $set: { last_connection: new Date() } }
    );

    res.clearCookie('jwt');
    res.json({ status:'ok' });
  }
);

//RESET PASSWORD
router.post('/password/request', async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });

  let link = null;
  if (user) {
    const token = signReset(user._id); // expira en 1h
    link = `${process.env.BASE_URL}/auth/reset?token=${token}`;

    try {
      const mailer = await getMailer();
      const info = await mailer.sendMail({
        to: email,
        subject: 'Restablecer contraseña',
        html: `<p>Usa este enlace (expira en 1 hora): <a href="${link}">${link}</a></p>`
      });

      const previewUrl = isEthereal ? nodemailer.getTestMessageUrl(info) : undefined;
      return res.json({ status: 'ok', link, previewUrl });
    } catch (err) {
      console.error('Mailer error:', err.message);
      // Igual devolvemos el link
      return res.json({ status: 'ok', link });
    }
  }

  // Si el mail no existe, respondemos ok
  res.json({ status: 'ok' });
});


// VERIFY
router.get('/password/reset', (req,res) => {
  res.json({ token: req.query.token });
});

// RESET PASSWORD
router.post('/password/reset', async (req,res) => {
  const { token, newPassword } = req.body;
  try {
    const { uid } = jwt.verify(token, process.env.RESET_SECRET);
    const user = await UserModel.findById(uid);
    if (!user) return res.status(400).json({ error:'Invalid token' });

    const same = bcrypt.compareSync(newPassword, user.password);
    if (same) return res.status(400).json({ error:'New password must be different' });

    user.password = bcrypt.hashSync(newPassword, 10);
    user.pwdChangedAt = new Date();
    await user.save();
    res.json({ status:'ok' });
  } catch (e) {
    res.status(400).json({ error:'Expired or invalid token' });
  }
});

export default router;
