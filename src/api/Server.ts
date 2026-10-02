import express, { Router } from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import AuthRouter from './auth/Router.Auth';
import PostRouter from './posts/Router.Post';
import PaymentRouter from './payments/Router.Payment';
import PaymentController from './payments/Controller.Payment';
import { authInterceptor } from './middleware/Middleware.Auth';
import { PORT } from './Config';

const router = Router();
const app = express();

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.webhook,
);

app.use(express.json());
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
app.use('/api/payments', PaymentRouter);

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;