import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config, validateEnv } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import apiRoutes from './routes';

// Validate environment variables
validateEnv();

const app = express();

// ─── Security Middleware ────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ──────────────────────────────────────
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// ─── Body Parsing ───────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ────────────────────────────────────────────
app.use(morgan('dev'));

// ─── API Routes ─────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Error Handling ─────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────
app.listen(config.port, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🎬  AnimeSeries Watchlog API                   ║
║   📡  Running on http://localhost:${config.port}         ║
║   🌍  Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                                  ║
╚══════════════════════════════════════════════════╝
  `);
});

export default app;
