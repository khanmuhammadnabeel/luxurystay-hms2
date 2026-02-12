/**
 * Upload Configuration
 * Centralized configuration for file upload system
 * Supports multiple environments and storage providers
 *
 * ENVIRONMENT VARIABLES:
 * - STORAGE_PROVIDER: 'local' | 'cloudinary' | 's3' (default: 'local')
 * - UPLOAD_DIR: Local upload directory (default: 'uploads')
 * - BASE_URL: Base URL for file access (default: 'http://localhost:5000')
 * - CLOUDINARY_CLOUD_NAME: Cloudinary cloud name
 * - CLOUDINARY_API_KEY: Cloudinary API key
 * - CLOUDINARY_API_SECRET: Cloudinary API secret
 * - VIRUS_SCAN_ENABLED: Enable virus scanning (default: false)
 * - MAX_FILE_SIZE: Max file size in bytes (default: 10MB)
 */

// ============================================================================
// CONFIGURATION OBJECT
// ============================================================================

const config = {
  // File size limits (in bytes)
  limits: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    maxFilesPerUpload: 10,
    totalStoragePerUser: 100 * 1024 * 1024, // 100MB
    thumbnailSize: 300 * 1024 // 300KB
  },

  // Allowed file types by category
  allowedMimeTypes: {
    images: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif'
    ],
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ],
    archives: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ],
    all: [] // Populated programmatically below
  },

  // Storage provider configuration
  storageProvider: (process.env.STORAGE_PROVIDER || 'local').toLowerCase(),

  // Local filesystem storage settings
  local: {
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    baseUrl: process.env.BASE_URL || 'http://localhost:5000',
    tempDir: 'uploads/temp',
    publicDir: 'uploads/public', // For public files
    privateDir: 'uploads/private' // For private files
  },

  // Cloudinary storage settings
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: 'luxurystay',
    secure: true,
    useFilename: false,
    uniqueFilename: true,
    overwrite: false,
    resourceType: 'auto'
  },

  // AWS S3 storage settings
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || '',
    endpoint: process.env.AWS_S3_ENDPOINT || null,
    acl: 'private', // private | public-read
    folder: 'luxurystay'
  },

  // Image optimization and processing
  imageProcessing: {
    enabled: true,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80, // 0-100
    format: 'webp', // Convert to WebP for web
    stripMetadata: true,
    thumbnailSizes: [
      {
        width: 150,
        height: 150,
        suffix: 'small',
        description: 'Avatar size'
      },
      {
        width: 300,
        height: 200,
        suffix: 'medium',
        description: 'Thumbnail size'
      },
      {
        width: 800,
        height: 600,
        suffix: 'large',
        description: 'Preview size'
      }
    ]
  },

  // Security settings
  security: {
    scanEnabled: process.env.VIRUS_SCAN_ENABLED === 'true' || false,
    scanProvider: process.env.VIRUS_SCAN_PROVIDER || 'clamav', // clamav | virustotal
    stripExif: true, // Remove EXIF data from images
    sanitizeFilenames: true,
    sanitizePattern: /[^a-zA-Z0-9._-]/g,
    allowedExtensions: [
      // Images
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.gif',
      '.svg',
      // Documents
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.txt',
      '.csv',
      // Archives
      '.zip',
      '.rar',
      '.7z'
    ],
    blockExecutable: true,
    executableExtensions: [
      '.exe',
      '.bat',
      '.cmd',
      '.com',
      '.pif',
      '.scr',
      '.vbs',
      '.js',
      '.jar',
      '.zip'
    ]
  },

  // Rate limiting (per user/IP)
  rateLimit: {
    uploadsPerMinute: 10,
    uploadsPerHour: 100,
    uploadsPerDay: 500,
    bytesPerDay: 500 * 1024 * 1024 // 500MB
  },

  // File retention policies
  retention: {
    tempFileExpiryDays: 7, // Auto-delete temp files
    deletedFileRetentionDays: 30, // Soft-delete retention before permanent removal
    logRetentionDays: 90 // Upload log retention
  },

  // Logging
  logging: {
    enabled: true,
    logDir: 'logs',
    logFailures: true,
    logSuccesses: false // Only log failures to reduce noise
  }
};

// Populate all allowed MIME types
config.allowedMimeTypes.all = [
  ...config.allowedMimeTypes.images,
  ...config.allowedMimeTypes.documents,
  ...config.allowedMimeTypes.archives
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if MIME type is an image
 * @param {string} mimeType - MIME type to check
 * @returns {boolean}
 */
function isImage(mimeType) {
  return config.allowedMimeTypes.images.includes(mimeType);
}

/**
 * Check if MIME type is a document
 * @param {string} mimeType - MIME type to check
 * @returns {boolean}
 */
function isDocument(mimeType) {
  return config.allowedMimeTypes.documents.includes(mimeType);
}

/**
 * Check if MIME type is an archive
 * @param {string} mimeType - MIME type to check
 * @returns {boolean}
 */
function isArchive(mimeType) {
  return config.allowedMimeTypes.archives.includes(mimeType);
}

/**
 * Check if MIME type is allowed
 * @param {string} mimeType - MIME type to check
 * @returns {boolean}
 */
function isAllowedMimeType(mimeType) {
  return config.allowedMimeTypes.all.includes(mimeType);
}

/**
 * Get all allowed MIME types
 * @returns {Array} Array of allowed MIME types
 */
function getAllowedMimeTypes() {
  return config.allowedMimeTypes.all;
}

/**
 * Get maximum file size in bytes
 * @returns {number}
 */
function getMaxFileSize() {
  return config.limits.maxFileSize;
}

/**
 * Get maximum file size formatted
 * @returns {string} Human-readable size
 */
function getMaxFileSizeFormatted() {
  const bytes = config.limits.maxFileSize;
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get storage provider
 * @returns {string} Storage provider name
 */
function getStorageProvider() {
  return config.storageProvider;
}

/**
 * Check if using local storage
 * @returns {boolean}
 */
function isLocalStorage() {
  return config.storageProvider === 'local';
}

/**
 * Check if using Cloudinary
 * @returns {boolean}
 */
function isCloudinary() {
  return config.storageProvider === 'cloudinary';
}

/**
 * Check if using AWS S3
 * @returns {boolean}
 */
function isS3() {
  return config.storageProvider === 's3';
}

/**
 * Check if storage provider is configured
 * @returns {boolean}
 */
function isStorageConfigured() {
  switch (config.storageProvider) {
    case 'cloudinary':
      return !!(config.cloudinary.cloudName && config.cloudinary.apiKey);
    case 's3':
      return !!(config.s3.accessKeyId && config.s3.secretAccessKey && config.s3.bucket);
    case 'local':
      return !!config.local.uploadDir;
    default:
      return false;
  }
}

/**
 * Get upload directory path (local storage only)
 * @returns {string}
 */
function getUploadDir() {
  return config.local.uploadDir;
}

/**
 * Get full file path for local storage
 * @param {string} filename - Filename
 * @param {boolean} isPublic - Is file public
 * @returns {string} Full file path
 */
function getUploadPath(filename, isPublic = false) {
  const dir = isPublic ? config.local.publicDir : config.local.privateDir;
  return `${dir}/${filename}`;
}

/**
 * Get public URL for file
 * @param {string} filename - Filename
 * @param {boolean} isPublic - Is file public
 * @returns {string} Public URL
 */
function getPublicUrl(filename, isPublic = true) {
  if (!isPublic) {
    return null; // Private files should not have public URLs
  }

  switch (config.storageProvider) {
    case 'cloudinary':
      return `https://res.cloudinary.com/${config.cloudinary.cloudName}/image/upload/${filename}`;
    case 's3':
      return `https://${config.s3.bucket}.s3.${config.s3.region}.amazonaws.com/${filename}`;
    case 'local':
    default:
      return `${config.local.baseUrl}/${config.local.publicDir}/${filename}`;
  }
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} File extension with dot
 */
function getFileExtension(filename) {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase();
}

/**
 * Get MIME type from filename
 * @param {string} filename - Filename
 * @returns {string|null} MIME type or null
 */
function getMimeTypeFromFilename(filename) {
  const ext = getFileExtension(filename);
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.zip': 'application/zip'
  };
  return mimeTypes[ext] || null;
}

/**
 * Sanitize filename (remove special characters)
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  if (!config.security.sanitizeFilenames) {
    return filename;
  }

  // Remove path separators and null bytes
  let sanitized = filename.replace(/[\/\\:*?"<>|]/g, '_');

  // Remove special characters except dots, hyphens, underscores
  sanitized = sanitized.replace(config.security.sanitizePattern, '_');

  // Remove multiple consecutive underscores
  sanitized = sanitized.replace(/_+/g, '_');

  // Limit length
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const ext = getFileExtension(sanitized);
    const name = sanitized.substring(0, maxLength - ext.length);
    sanitized = name + ext;
  }

  return sanitized;
}

/**
 * Check if file extension is executable/dangerous
 * @param {string} filename - Filename
 * @returns {boolean}
 */
function isExecutableFile(filename) {
  if (!config.security.blockExecutable) {
    return false;
  }
  const ext = getFileExtension(filename);
  return config.security.executableExtensions.includes(ext);
}

/**
 * Check if file extension is allowed
 * @param {string} filename - Filename
 * @returns {boolean}
 */
function isAllowedExtension(filename) {
  const ext = getFileExtension(filename);
  return config.security.allowedExtensions.includes(ext);
}

/**
 * Validate file upload
 * @param {object} file - File object { originalname, mimetype, size }
 * @returns {object} { valid: boolean, error?: string }
 */
function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > config.limits.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${getMaxFileSizeFormatted()}`
    };
  }

  // Check MIME type
  if (!isAllowedMimeType(file.mimetype)) {
    return {
      valid: false,
      error: 'File type not allowed'
    };
  }

  // Check extension
  if (!isAllowedExtension(file.originalname)) {
    return {
      valid: false,
      error: 'File extension not allowed'
    };
  }

  // Check for executable files
  if (isExecutableFile(file.originalname)) {
    return {
      valid: false,
      error: 'Executable files are not allowed'
    };
  }

  return { valid: true };
}

/**
 * Generate random filename with extension
 * @param {string} originalname - Original filename
 * @returns {string} Generated filename (UUID + extension)
 */
function generateFilename(originalname) {
  const crypto = require('crypto');
  const ext = getFileExtension(originalname);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
}

/**
 * Get storage usage summary
 * @returns {object} Configuration summary
 */
function getStorageSummary() {
  return {
    provider: config.storageProvider,
    maxFileSize: getMaxFileSizeFormatted(),
    maxFilesPerUpload: config.limits.maxFilesPerUpload,
    totalStoragePerUser: `${(config.limits.totalStoragePerUser / 1024 / 1024).toFixed(0)}MB`,
    allowedFormats: config.allowedMimeTypes.all.length,
    imageOptimization: config.imageProcessing.enabled,
    virusScan: config.security.scanEnabled
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Configuration object
  config,

  // Helper functions
  isImage,
  isDocument,
  isArchive,
  isAllowedMimeType,
  getAllowedMimeTypes,
  getMaxFileSize,
  getMaxFileSizeFormatted,
  getStorageProvider,
  isLocalStorage,
  isCloudinary,
  isS3,
  isStorageConfigured,
  getUploadDir,
  getUploadPath,
  getPublicUrl,
  getFileExtension,
  getMimeTypeFromFilename,
  sanitizeFilename,
  isExecutableFile,
  isAllowedExtension,
  validateFile,
  generateFilename,
  getStorageSummary
};
