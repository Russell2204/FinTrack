import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import env from './config/env';
import { applySchema } from './db/applySchema';
import seedCategories from './db/seed';
import { errorHandler, notFoundHandler } from './middleware/error';

import authRoutes from './modules/auth/routes';
import incomeSourcesRoutes from './modules/income-sources/routes';
import incomesRoutes from './modules/incomes/routes';
import categoriesRoutes from './modules/categories/routes';
import expensesRoutes from './modules/expenses/routes';
import summaryRoutes from './modules/summary/routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: { code: 'RATE_LIMIT', message: 'Слишком много запросов, попробуйте позже' } },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/income-sources', incomeSourcesRoutes);
app.use('/api/incomes', incomesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/summary', summaryRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

let initialized = false;

const initialize = async () => {
  if (initialized) return;
  initialized = true;
  try {
    await applySchema();
    await seedCategories();
  } catch (err) {
    console.error('DB init error:', err);
  }
};

// Vercel serverless: export app, init DB on first request
app.use(async (_req, _res, next) => {
  await initialize();
  next();
});

// Local development: start server
if (!process.env.VERCEL) {
  initialize().then(() => {
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  });
}

export default app;
