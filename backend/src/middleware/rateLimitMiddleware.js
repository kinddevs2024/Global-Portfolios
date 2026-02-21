const rateLimit = require('express-rate-limit');
const { getEnv } = require('../config/env');

const { rateLimitWindowMs, rateLimitMax } = getEnv();

const apiRateLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  limit: rateLimitMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Too many requests, please try again later.',
  },
});

module.exports = {
  apiRateLimiter,
};
