import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import passport from 'passport';

import './config/env.js';
import {initPassport} from './auth/passport.js';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
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
const __dirname = path.dirname(__filename);

const app = express();

/* --- core middleware --- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
app.use(requestLogger);

/* --- passport --- */
initPassport();
app.use(passport.initialize());

app.use((req, res, next) => {
  const COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'jwt';
  const JWT_SECRET  = process.env.JWT_SECRET || 'changeme';

  res.locals.isLoggedIn = false;

  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.locals.isLoggedIn = Boolean(decoded?.uid);
  } catch {
    res.locals.isLoggedIn = false;
  }
  next();
});

/* --- handlebars --- */
app.engine('handlebars', handlebars.engine({
  helpers: { json: (ctx) => JSON.stringify(ctx) }
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

/* --- swagger (opcional) --- */
mountSwagger(app);

/* --- rutas --- */
app.use('/api/carts', cartsRouter);

app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/mocks', mocksRouter);
app.use('/api', loggerRouter);
app.use('/api/adoptions', adoptionsRouter);

app.use('/', viewsRouter);

app.use(errorHandler);

export default app;
