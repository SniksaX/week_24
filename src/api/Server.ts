import express from 'express';
import session from 'express-session';
import { Router } from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import AuthRouter from './auth/Router.Auth';
import PostRouter from './posts/Router.Post';
import { authInterceptor } from './middleware/Middleware.Auth';
import './types/Types.Session';

const router = Router();
const app = express();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    },
  }),
);
app.use(authInterceptor);

app.get('/health', (_req, res) => {
  res.send('OK');
});

router.get('/info', (_req, res) => {
  res.send({
    name: 'API',
    version: '1.0.0',
    description: 'API for the application',
  });
});

app.use('/api', router);
app.use('/api/auth', AuthRouter);
app.use('/api/posts', PostRouter);

const webDir = path.join(import.meta.dir, 'web');
app.use(express.static(webDir));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') {
    next();
    return;
  }
  const index = path.join(webDir, 'index.html');
  if (!existsSync(index)) {
    next();
    return;
  }
  res.sendFile(index);
});

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
