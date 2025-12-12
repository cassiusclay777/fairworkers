const rateLimit = require('express-rate-limit');

// Strict rate limiter for authentication endpoints (5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'Příliš mnoho pokusů o přihlášení. Zkuste to znovu za 15 minut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true
});

// Moderate rate limiter for API endpoints (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Příliš mnoho požadavků. Zkuste to znovu za chvíli.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for registration (3 registrations per hour per IP)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: 'Příliš mnoho pokusů o registraci. Zkuste to znovu za hodinu.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Lenient limiter for general routes (300 requests per 15 minutes)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    error: 'Příliš mnoho požadavků. Zkuste to znovu za chvíli.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  apiLimiter,
  registerLimiter,
  generalLimiter
};
