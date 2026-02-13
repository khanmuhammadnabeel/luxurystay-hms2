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
    publicDir: 'uploads/public',
    privateDir: 'uploads/private'
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
    acl: 'private',
    folder: 'luxurystay'
  },

  // Image optimization and processing
  imageProcessing: {
    enabled: true,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80,
    format: 'webp',
    stripMetadata: true,
    thumbnailSizes: [
      { width: 150, height: 150, suffix: 'small', description: 'Avatar size' },
      { width: 300, height: 200, suffix: 'medium', description: 'Thumbnail size' },
      { width: 800, height: 600, suffix: 'large', description: 'Preview size' }
    ]
  },

  // Security settings
  security: {
    scanEnabled: process.env.VIRUS_SCAN_ENABLED === 'true' || false,
    scanProvider: process.env.VIRUS_SCAN_PROVIDER || 'clamav',
    stripExif: true,
    sanitizeFilenames: true,
    sanitizePattern: /[^a-zA-Z0-9._-]/g,
    allowedExtensions: [
      '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv',
      '.zip', '.rar', '.7z'
    ],
    blockExecutable: true,
    executableExtensions: ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.zip']
  },

  // Rate limiting (per user/IP)
  rateLimit: {
    uploadsPerMinute: 10,
    uploadsPerHour: 100,
    uploadsPerDay: 500,
    bytesPerDay: 500 * 1024 * 1024
  },

  // File retention policies
  retention: {
    tempFileExpiryDays: 7,
    deletedFileRetentionDays: 30,
    logRetentionDays: 90
  },

  // Logging
  logging: {
    enabled: true,
    logDir: 'logs',
    logFailures: true,
    logSuccesses: false
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

function isImage(mimeType) {
  return config.allowedMimeTypes.images.includes(mimeType);
}

function isDocument(mimeType) {
  return config.allowedMimeTypes.documents.includes(mimeType);
}

function isArchive(mimeType) {
  return config.allowedMimeTypes.archives.includes(mimeType);
}

function isAllowedMimeType(mimeType) {
  return config.allowedMimeTypes.all.includes(mimeType);
}

function getAllowedMimeTypes() {
  return config.allowedMimeTypes.all;
}

function getMaxFileSize() {
  return config.limits.maxFileSize;
}

function getMaxFileSizeFormatted() {
  const bytes = config.limits.maxFileSize;
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getStorageProvider() {
  return config.storageProvider;
}

function isLocalStorage() {
  return config.storageProvider === 'local';
}

function isCloudinary() {
  return config.storageProvider === 'cloudinary';
}

function isS3() {
  return config.storageProvider === 's3';
}

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

function getUploadDir() {
  return config.local.uploadDir;
}

function getUploadPath(filename, isPublic = false) {
  const dir = isPublic ? config.local.publicDir : config.local.privateDir;
  return `${dir}/${filename}`;
}

function getPublicUrl(filename, isPublic = true) {
  if (!isPublic) return null;
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

function getFileExtension(filename) {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase();
}

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

function sanitizeFilename(filename) {
  if (!config.security.sanitizeFilenames) return filename;
  let sanitized = filename.replace(/[\/\\:*?"<>|]/g, '_');
  sanitized = sanitized.replace(config.security.sanitizePattern, '_');
  sanitized = sanitized.replace(/_+/g, '_');
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const ext = getFileExtension(sanitized);
    const name = sanitized.substring(0, maxLength - ext.length);
    sanitized = name + ext;
  }
  return sanitized;
}

function isExecutableFile(filename) {
  if (!config.security.blockExecutable) return false;
  const ext = getFileExtension(filename);
  return config.security.executableExtensions.includes(ext);
}

function isAllowedExtension(filename) {
  const ext = getFileExtension(filename);
  return config.security.allowedExtensions.includes(ext);
}

// ✅ THIS IS THE FIX - validateFile function is defined here!
function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > config.limits.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${getMaxFileSizeFormatted()}`
    };
  }

  if (!isAllowedMimeType(file.mimetype)) {
    return {
      valid: false,
      error: 'File type not allowed'
    };
  }

  if (!isAllowedExtension(file.originalname)) {
    return {
      valid: false,
      error: 'File extension not allowed'
    };
  }

  if (isExecutableFile(file.originalname)) {
    return {
      valid: false,
      error: 'Executable files are not allowed'
    };
  }

  return { valid: true };
}

function generateFilename(originalname) {
  const crypto = require('crypto');
  const ext = getFileExtension(originalname);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
}

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
// EXPORTS - THIS MUST BE AT THE VERY BOTTOM
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
  validateFile, // ✅ NOW IT'S DEFINED AND EXPORTED
  generateFilename,
  getStorageSummary
};