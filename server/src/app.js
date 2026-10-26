const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1); // Render sits behind a proxy

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [...new Set([env.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'])];
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin/no-origin tools (curl, health checks) and configured origins.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
  }),
);

app.use(express.json({ limit: '100kb' }));

// Global API rate limit (generous for local dev, protective in production).
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } },
});
app.use('/api/v1', apiLimiter);

// Stricter limiter for credential endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again in a few minutes.' } },
});
app.use('/api/v1/auth', authLimiter);

app.use('/api/v1', routes);

app.get('/', (req, res) => {
  res.json({ name: 'REDSTOCKS API', docs: '/api/v1/health' });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
