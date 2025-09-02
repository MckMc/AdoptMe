import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import handlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import './config/env.js';
import { initPassport } from './auth/passport.js';

import viewsRouter from './routes/views.router.js';
import sessionsRouter from './routes/sessions.router.js';
import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import mocksRouter from './routes/mocks.router.js';
import adoptionsRouter from './routes/adoptions.router.js';
import loggerRouter from './routes/logger.router.js';

import { requestLogger } from './logger/index.js';
import { errorHandler } from './middlewares/error.js';
import { mountSwagger } from './docs/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
app.use(requestLogger);

initPassport();
app.use(passport.initialize());

// Flag de sesión para SSR
app.use((req, res, next) => {
  const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'jwt';
  const JWT_SECRET  = process.env.JWT_SECRET || 'changeme';
  res.locals.isLoggedIn = false;
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.locals.isLoggedIn = !!decoded?.uid;
  } catch {}
  next();
});

app.engine('handlebars', handlebars.engine({
  helpers: { json: (ctx) => JSON.stringify(ctx) }
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.set('trust proxy', 1);

mountSwagger(app);

// Rutas API
app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/mocks', mocksRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api', loggerRouter);

// Vistas
app.use('/', viewsRouter);

// Errores al final
app.use(errorHandler);

export default app;
