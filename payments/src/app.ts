import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import {
  errorHandler,
  NotFoundError,
  currentUser,
  requireAuth,
} from '@iztickets/common';
import { createChargerRouter } from './routes';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' })
);

app.use(currentUser, requireAuth);

app.use('/api', createChargerRouter);

app.use('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
