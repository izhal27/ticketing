import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import {
  currentUserRouter,
  signinRouter,
  signoutRouter,
  signupRouter,
} from './routes';
import { errorHandler, NotFoundError } from '@iztickets/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== 'test' })
);

app.use(
  '/api/users',
  currentUserRouter,
  signinRouter,
  signoutRouter,
  signupRouter
);

app.use('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
