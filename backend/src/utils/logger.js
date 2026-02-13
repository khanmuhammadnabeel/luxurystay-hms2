/**
 * Logger Utility
 * Winston-based logging system with Morgan HTTP request logging
 */

const winston = require('winston');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ============================================================================
// WINSTON LOGGER CONFIGURATION
// ============================================================================

const logLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue'
  }
};

// Development format: colorized, pretty-printed
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Production format: JSON for structured logging
const prodFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Transports
const transports = [
  // Console output for all environments
  new winston.transports.Console({
    format: isDev ? devFormat : prodFormat
  }),

  // Combined log file (all levels)
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    format: prodFormat
  }),

  // Error log file (errors and warnings only)
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    format: prodFormat
  })
];

// Development: add debug file
if (isDev) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'debug.log'),
      level: 'debug',
      maxsize: 10485760,
      maxFiles: 3,
      format: prodFormat
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  levels: logLevels.levels,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: prodFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: prodFormat
    })
  ]
});

winston.addColors(logLevels.colors);

// ============================================================================
// MORGAN HTTP REQUEST LOGGING
// ============================================================================

// Custom Morgan stream that writes to Winston
const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Custom Morgan format
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

const morganMiddleware = morgan(morganFormat, {
  stream: morganStream,
  skip: (req, res) => {
    // Skip health check endpoints and static files
    const skipPaths = ['/api/health', '/health', '/favicon.ico', '/public'];
    return skipPaths.some(path => req.url.startsWith(path));
  }
});

// ============================================================================
// LOGGER FUNCTIONS
// ============================================================================

/**
 * Log info level messages
 */
function info(message, meta = {}) {
  logger.info(message, meta);
}

/**
 * Log error level messages
 */
function error(message, err = null, meta = {}) {
  const logMeta = {
    ...meta,
    ...(err && {
      error: {
        message: err.message,
        stack: isDev ? err.stack : undefined,
        code: err.code,
        statusCode: err.statusCode
      }
    })
  };
  logger.error(message, logMeta);
}

/**
 * Log warning level messages
 */
function warn(message, meta = {}) {
  logger.warn(message, meta);
}

/**
 * Log debug level messages
 */
function debug(message, meta = {}) {
  logger.debug(message, meta);
}

/**
 * Log HTTP request details
 */
function logRequest(req, res, responseTime = 0) {
  const meta = {
    method: req.method,
    url: req.url,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('user-agent'),
    userId: req.user?._id || 'anonymous',
    ip: req.ip || req.connection.remoteAddress
  };

  const message = `${req.method} ${req.url} - ${res.statusCode}`;
  
  if (res.statusCode >= 400) {
    warn(message, meta);
  } else {
    info(message, meta);
  }
}

/**
 * Log error with request context
 */
function logError(err, req = null, meta = {}) {
  const logMeta = {
    ...meta,
    error: {
      message: err.message,
      stack: isDev ? err.stack : undefined,
      code: err.code,
      statusCode: err.statusCode
    }
  };

  if (req) {
    logMeta.request = {
      method: req.method,
      url: req.url,
      userId: req.user?._id || 'anonymous',
      ip: req.ip || req.connection.remoteAddress
    };
  }

  error(`Error: ${err.message}`, null, logMeta);
}

/**
 * Create a child logger for specific modules
 */
function getLogger(module) {
  return logger.child({ module });
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  logger,
  morganMiddleware,
  morganStream,
  info,
  error,
  warn,
  debug,
  logRequest,
  logError,
  getLogger,
  isDev,
  isProduction
};
