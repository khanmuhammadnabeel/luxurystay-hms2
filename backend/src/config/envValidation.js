/**
 * Environment Variable Validation
 * Validates all required environment variables at startup
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate required string variable
 */
function validateRequired(varName, value) {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${varName} is required and must be a non-empty string`);
  }
  return value.trim();
}

/**
 * Validate URL format
 */
function validateUrl(varName, value) {
  try {
    new URL(value);
    return value;
  } catch (e) {
    throw new Error(`${varName} must be a valid URL. Received: ${value}`);
  }
}

/**
 * Validate port number
 */
function validatePort(varName, value) {
  const port = parseInt(value, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`${varName} must be a valid port number (1-65535). Received: ${value}`);
  }
  return port;
}

/**
 * Validate boolean
 */
function validateBoolean(varName, value) {
  if (value === 'true' || value === '1' || value === true) return true;
  if (value === 'false' || value === '0' || value === false) return false;
  throw new Error(`${varName} must be a boolean (true/false). Received: ${value}`);
}

/**
 * Validate email format
 */
function validateEmail(varName, value) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error(`${varName} must be a valid email. Received: ${value}`);
  }
  return value;
}

/**
 * Validate enum value
 */
function validateEnum(varName, value, allowedValues) {
  if (!allowedValues.includes(value)) {
    throw new Error(`${varName} must be one of: ${allowedValues.join(', ')}. Received: ${value}`);
  }
  return value;
}

/**
 * Optional variable with default
 */
function validateOptional(varName, value, defaultValue = null, validator = null) {
  if (!value) return defaultValue;
  if (validator && typeof validator === 'function') {
    return validator(varName, value);
  }
  return value;
}

// ============================================================================
// MAIN VALIDATION
// ============================================================================

function validateEnv() {
  const errors = [];
  const config = {};

  // Helper to accumulate errors instead of throwing immediately
  const addError = (message) => {
    errors.push(message);
  };

  const tryValidate = (fn, varName, value, ...args) => {
    try {
      return fn(varName, value, ...args);
    } catch (e) {
      addError(e.message);
      return null;
    }
  };

  try {
    // ========================================================================
    // CORE ENVIRONMENT
    // ========================================================================

    config.nodeEnv = validateEnum('NODE_ENV', process.env.NODE_ENV || 'development', ['development', 'staging', 'production', 'test']);
    config.port = tryValidate(validatePort, 'PORT', process.env.PORT || '5000');
    config.apiUrl = process.env.API_URL || `http://localhost:${config.port}`;

    // ========================================================================
    // DATABASE
    // ========================================================================

    if (!isTest) {
      config.mongoUri = tryValidate(validateRequired, 'MONGO_URI', process.env.MONGO_URI);
      if (!config.mongoUri) {
        addError('MONGO_URI is required for non-test environments');
      }
    } else {
      config.mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/luxurystay-test';
    }

    config.mongoDebug = validateOptional('MONGO_DEBUG', process.env.MONGO_DEBUG, false, validateBoolean);

    // ========================================================================
    // JWT & SECURITY
    // ========================================================================

        config.jwtSecret = process.env.JWT_SECRET;
    if (!config.jwtSecret) {
      if (isProduction) {
        addError('JWT_SECRET is required in production');
      } else {
        config.jwtSecret = 'dev-jwt-secret-key-for-testing-only-12345';
        console.warn('⚠️  JWT_SECRET not set. Using development fallback.');
      }
    } else if (config.jwtSecret.length < 32 && isProduction) {
      addError('JWT_SECRET must be at least 32 characters in production');
    }

    config.jwtExpiry = validateOptional('JWT_EXPIRY', process.env.JWT_EXPIRY, '7d');
    config.refreshTokenExpiry = validateOptional('REFRESH_TOKEN_EXPIRY', process.env.REFRESH_TOKEN_EXPIRY, '30d');

    // ========================================================================
    // CORS
    // ========================================================================

    const corsOrigin = process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173';
    config.corsOrigins = corsOrigin.split(',').map(o => o.trim());
    
    if (isProduction && config.corsOrigins.some(o => o.startsWith('http://localhost'))) {
      addError('CORS_ORIGINS must not contain localhost in production');
    }

    // ========================================================================
    // EMAIL
    // ========================================================================

    config.emailEnabled = validateOptional('EMAIL_ENABLED', process.env.EMAIL_ENABLED, true, validateBoolean);

    if (config.emailEnabled) {
      config.emailService = tryValidate(validateEnum, 'EMAIL_SERVICE', process.env.EMAIL_SERVICE || 'gmail', ['gmail', 'sendgrid', 'aws-ses', 'mailgun']);
      config.emailFrom = tryValidate(validateEmail, 'EMAIL_FROM', process.env.EMAIL_FROM);
      config.emailFromName = validateOptional('EMAIL_FROM_NAME', process.env.EMAIL_FROM_NAME, 'LuxuryStay HMS');

      // Service-specific credentials
      if (config.emailService === 'gmail') {
        config.gmailUser = tryValidate(validateRequired, 'GMAIL_USER', process.env.GMAIL_USER);
        config.gmailPassword = tryValidate(validateRequired, 'GMAIL_PASSWORD', process.env.GMAIL_PASSWORD);
      } else if (config.emailService === 'sendgrid') {
        config.sendgridApiKey = tryValidate(validateRequired, 'SENDGRID_API_KEY', process.env.SENDGRID_API_KEY);
      } else if (config.emailService === 'mailgun') {
        config.mailgunDomain = tryValidate(validateRequired, 'MAILGUN_DOMAIN', process.env.MAILGUN_DOMAIN);
        config.mailgunApiKey = tryValidate(validateRequired, 'MAILGUN_API_KEY', process.env.MAILGUN_API_KEY);
      }
    }

    // ========================================================================
    // STORAGE
    // ========================================================================

    config.storageProvider = validateOptional('STORAGE_PROVIDER', process.env.STORAGE_PROVIDER, 'local', (n, v) => validateEnum(n, v, ['local', 'cloudinary', 's3', 'gcs']));
    config.uploadDir = validateOptional('UPLOAD_DIR', process.env.UPLOAD_DIR, './uploads');
    config.maxFileSize = validateOptional('MAX_FILE_SIZE', process.env.MAX_FILE_SIZE, 52428800); // 50MB default

    if (config.storageProvider === 'cloudinary') {
      config.cloudinaryName = tryValidate(validateRequired, 'CLOUDINARY_NAME', process.env.CLOUDINARY_NAME);
      config.cloudinaryApiKey = tryValidate(validateRequired, 'CLOUDINARY_API_KEY', process.env.CLOUDINARY_API_KEY);
      config.cloudinaryApiSecret = tryValidate(validateRequired, 'CLOUDINARY_API_SECRET', process.env.CLOUDINARY_API_SECRET);
    } else if (config.storageProvider === 's3') {
      config.awsAccessKeyId = tryValidate(validateRequired, 'AWS_ACCESS_KEY_ID', process.env.AWS_ACCESS_KEY_ID);
      config.awsSecretAccessKey = tryValidate(validateRequired, 'AWS_SECRET_ACCESS_KEY', process.env.AWS_SECRET_ACCESS_KEY);
      config.awsRegion = tryValidate(validateRequired, 'AWS_REGION', process.env.AWS_REGION || 'us-east-1');
      config.awsBucket = tryValidate(validateRequired, 'AWS_BUCKET', process.env.AWS_BUCKET);
    } else if (config.storageProvider === 'gcs') {
      config.gcsProjectId = tryValidate(validateRequired, 'GCS_PROJECT_ID', process.env.GCS_PROJECT_ID);
      config.gcsBucket = tryValidate(validateRequired, 'GCS_BUCKET', process.env.GCS_BUCKET);
      config.gcsKeyFile = tryValidate(validateRequired, 'GCS_KEY_FILE', process.env.GCS_KEY_FILE);
    }

    // ========================================================================
    // LOGGING & MONITORING
    // ========================================================================

    config.logLevel = validateOptional('LOG_LEVEL', process.env.LOG_LEVEL, 'info', (n, v) => validateEnum(n, v, ['error', 'warn', 'info', 'debug']));
    config.skipRateLimit = validateOptional('SKIP_RATE_LIMIT', process.env.SKIP_RATE_LIMIT, isDevelopment, validateBoolean);

    // ========================================================================
    // OPTIONAL INTEGRATIONS
    // ========================================================================

    config.redisUrl = validateOptional('REDIS_URL', process.env.REDIS_URL);
    config.sentryDsn = validateOptional('SENTRY_DSN', process.env.SENTRY_DSN);

    // ========================================================================
    // FEATURE FLAGS
    // ========================================================================

    config.enableTwoFactor = validateOptional('ENABLE_TWO_FACTOR', process.env.ENABLE_TWO_FACTOR, false, validateBoolean);
    config.enableAnalytics = validateOptional('ENABLE_ANALYTICS', process.env.ENABLE_ANALYTICS, true, validateBoolean);
    config.enableExports = validateOptional('ENABLE_EXPORTS', process.env.ENABLE_EXPORTS, true, validateBoolean);

    // ========================================================================
    // CUSTOM / ADDITIONAL
    // ========================================================================

    config.appName = validateOptional('APP_NAME', process.env.APP_NAME, 'LuxuryStay HMS');
    config.appVersion = validateOptional('APP_VERSION', process.env.APP_VERSION, '1.0.0');

  } catch (e) {
    addError(`Unexpected error during validation: ${e.message}`);
  }

  // ============================================================================
  // ERROR REPORTING
  // ============================================================================

  if (errors.length > 0) {
    console.error('\n❌ Environment Variable Validation Failed:\n');
    errors.forEach((err, i) => {
      console.error(`${i + 1}. ${err}`);
    });
    console.error(`\nTotal errors: ${errors.length}\n`);

    if (isProduction) {
      process.exit(1);
    } else if (errors.some(e => e.includes('required'))) {
      console.warn('⚠️  Some required variables are missing. The app may not work correctly.\n');
    }
  } else {
    console.log('✅ Environment variables validated successfully\n');
  }

  return {
    ...config,
    isDevelopment,
    isProduction,
    isTest,
    validationErrors: errors
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

const validatedConfig = validateEnv();

module.exports = validatedConfig;
