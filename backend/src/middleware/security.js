/**
 * Security Middleware Configuration
 * Includes Helmet, CORS, Rate Limiting, Sanitization, and Compression
 */

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

// ============================================================================
// HELMET CONFIGURATION
// ============================================================================

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      childSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: true,
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  permittedCrossDomainPolicies: false
});

// ============================================================================
// RATE LIMITERS
// ============================================================================

// Authentication endpoints: 5 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      statusCode: 429
    });
  }
});

// General API endpoints: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again after 15 minutes.',
      statusCode: 429
    });
  }
});

// Export endpoints: 10 requests per 15 minutes
const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: 'Too many export requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  keyGenerator: (req) => req.user?._id || req.ip, // Rate limit by user ID if authenticated
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Export limit exceeded. Maximum 10 exports per 15 minutes.',
      statusCode: 429
    });
  }
});

// Upload endpoints: 20 requests per 15 minutes
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per windowMs
  message: 'Too many uploads, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  keyGenerator: (req) => req.user?._id || req.ip, // Rate limit by user ID if authenticated
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Upload limit exceeded. Maximum 20 uploads per 15 minutes.',
      statusCode: 429
    });
  }
});

// Search endpoints: 50 requests per 15 minutes
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per windowMs
  message: 'Too many search requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Search limit exceeded. Maximum 50 searches per 15 minutes.',
      statusCode: 429
    });
  }
});

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
    
    // Allow requests with no origin (like mobile apps)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 24 * 60 * 60 // 24 hours
};

const corsMiddleware = cors(corsOptions);

// ============================================================================
// SANITIZATION MIDDLEWARE
// ============================================================================

// MongoDB NoSQL Injection Prevention
const mongoSanitizeMiddleware = mongoSanitize({
  onSanitize: ({ req, key }) => {
    console.warn(`Potential NoSQL injection attempt detected in ${key}`);
  }
});

// XSS Prevention
const xssMiddleware = xss();

// HTTP Parameter Pollution Prevention
const hppMiddleware = hpp({
  whitelist: [
    'sort',
    'fields',
    'page',
    'limit',
    'search',
    'status',
    'type',
    'role',
    'startDate',
    'endDate',
    'format',
    'filters',
    'options'
  ]
});

// ============================================================================
// COMPRESSION MIDDLEWARE
// ============================================================================

const compressionMiddleware = compression({
  level: 6, // Balance between compression and speed
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  }
});

// ============================================================================
// SECURITY HEADERS MIDDLEWARE
// ============================================================================

const securityHeadersMiddleware = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Content Security Policy (handled by Helmet)
  // Strict Transport Security (handled by Helmet)
  
    // Referrer Policy is handled by Helmet config - remove this line
  
  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  // Cache Control for sensitive endpoints
  if (req.path.includes('/api/auth') || req.path.includes('/api/admin')) {
    res.setHeader('Cache-Control', 'no-store, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

// ============================================================================
// APPLY ALL SECURITY MIDDLEWARE
// ============================================================================

const applySecurityMiddleware = (app) => {
  // Helmet (must be before other middleware)
  app.use(helmetConfig);

  // CORS
  app.use(corsMiddleware);

  // Compression
  app.use(compressionMiddleware);

  // Sanitization (before parsing JSON)
  app.use(mongoSanitizeMiddleware);
  app.use(xssMiddleware);
  app.use(hppMiddleware);

  // Security Headers
  app.use(securityHeadersMiddleware);

  // Rate Limiting (after authentication middleware is applied)
  // These are applied per-route in route definitions
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  helmetConfig,
  authLimiter,
  apiLimiter,
  exportLimiter,
  uploadLimiter,
  searchLimiter,
  corsOptions,
  corsMiddleware,
  mongoSanitizeMiddleware,
  xssMiddleware,
  hppMiddleware,
  compressionMiddleware,
  securityHeadersMiddleware,
  applySecurityMiddleware
};
