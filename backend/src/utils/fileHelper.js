const crypto = require('crypto');
const uploadConfig = require('../config/uploadConfig');
const fileHelper = require('../utils/fileHelper');

/**
 * File Utility Helper Functions
 * Provides utility functions for file handling, metadata extraction, and validation
 * All functions have graceful error handling and return null/undefined on failure
 */

// ============================================================================
// OPTIONAL DEPENDENCIES
// These are loaded on demand and gracefully fallback if not installed
// ============================================================================

let sharp = null;
let exifr = null;
let pdfParse = null;

try {
  sharp = require('sharp');
} catch (err) {
  // Sharp not installed - image processing disabled
}

try {
  exifr = require('exifr');
} catch (err) {
  // Exifr not installed - EXIF extraction disabled
}

try {
  pdfParse = require('pdf-parse');
} catch (err) {
  // PDF-parse not installed - PDF metadata disabled
}

// ============================================================================
// 1. FORMAT BYTES
// ============================================================================

/**
 * Convert bytes to human-readable format
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted size string (e.g., "1.5 MB")
 */
function formatBytes(bytes, decimals = 2) {
  try {
    if (!bytes || bytes === 0) return '0 Bytes';
    if (bytes < 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  } catch (error) {
    console.error('Error formatting bytes:', error.message);
    return '0 Bytes';
  }
}

// ============================================================================
// 2. GET FILE ICON
// ============================================================================

/**
 * Get appropriate icon emoji/class for file type
 * @param {string} mimeType - MIME type of file
 * @param {string} filename - Filename (optional)
 * @returns {object} { emoji, icon, description }
 */
function getFileIcon(mimeType, filename = '') {
  try {
    // Image files
    if (uploadConfig.isImage(mimeType)) {
      return {
        emoji: '🖼️',
        icon: 'image',
        description: 'Image file'
      };
    }

    // PDF files
    if (mimeType === 'application/pdf') {
      return {
        emoji: '📄',
        icon: 'pdf',
        description: 'PDF document'
      };
    }

    // Word documents
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return {
        emoji: '📝',
        icon: 'word',
        description: 'Word document'
      };
    }

    // Excel spreadsheets
    if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      return {
        emoji: '📊',
        icon: 'excel',
        description: 'Spreadsheet'
      };
    }

    // Archives
    if (uploadConfig.isArchive(mimeType)) {
      return {
        emoji: '📦',
        icon: 'archive',
        description: 'Archive file'
      };
    }

    // Plain text
    if (mimeType === 'text/plain' || mimeType === 'text/csv') {
      return {
        emoji: '📋',
        icon: 'text',
        description: 'Text file'
      };
    }

    // Video files
    if (mimeType.startsWith('video/')) {
      return {
        emoji: '🎥',
        icon: 'video',
        description: 'Video file'
      };
    }

    // Audio files
    if (mimeType.startsWith('audio/')) {
      return {
        emoji: '🎵',
        icon: 'audio',
        description: 'Audio file'
      };
    }

    // Default
    return {
      emoji: '📎',
      icon: 'file',
      description: 'File'
    };
  } catch (error) {
    console.error('Error getting file icon:', error.message);
    return {
      emoji: '📎',
      icon: 'file',
      description: 'File'
    };
  }
}

// ============================================================================
// 3. EXTRACT METADATA
// ============================================================================

/**
 * Extract metadata from file buffer
 * Supports EXIF from images, page count from PDFs, etc.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - MIME type
 * @returns {Promise<object|null>} Metadata object or null
 */
async function extractMetadata(buffer, mimeType) {
  try {
    if (!buffer) return null;

    // Extract image metadata (EXIF, dimensions)
    if (uploadConfig.isImage(mimeType)) {
      const metadata = {};

      // Get dimensions
      if (sharp) {
        try {
          const imageMetadata = await sharp(buffer).metadata();
          metadata.width = imageMetadata.width;
          metadata.height = imageMetadata.height;
          metadata.format = imageMetadata.format;
          metadata.colorSpace = imageMetadata.space;
          metadata.hasAlpha = imageMetadata.hasAlpha;
          metadata.orientation = imageMetadata.orientation;
        } catch (err) {
          console.warn('Error extracting image metadata:', err.message);
        }
      }

      // Get EXIF data
      if (exifr) {
        try {
          const exifData = await exifr.parse(buffer);
          if (exifData) {
            // Sanitize sensitive EXIF data
            metadata.exif = {
              make: exifData.Make,
              model: exifData.Model,
              dateTime: exifData.DateTime,
              orientation: exifData.Orientation,
              // Don't include GPS data for privacy
            };
          }
        } catch (err) {
          console.warn('Error extracting EXIF data:', err.message);
        }
      }

      return Object.keys(metadata).length > 0 ? metadata : null;
    }

    // Extract PDF metadata
    if (mimeType === 'application/pdf' && pdfParse) {
      try {
        const pdfData = await pdfParse(buffer);
        return {
          pages: pdfData.numpages,
          title: pdfData.info?.Title || null,
          author: pdfData.info?.Author || null,
          subject: pdfData.info?.Subject || null,
          creator: pdfData.info?.Creator || null
        };
      } catch (err) {
        console.warn('Error extracting PDF metadata:', err.message);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting metadata:', error.message);
    return null;
  }
}

// ============================================================================
// 4. GET IMAGE DIMENSIONS
// ============================================================================

/**
 * Get image dimensions from buffer
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise<object|null>} { width, height, aspectRatio } or null
 */
async function getImageDimensions(buffer) {
  try {
    if (!buffer || !sharp) return null;

    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) return null;

    const aspectRatio = (metadata.width / metadata.height).toFixed(2);

    return {
      width: metadata.width,
      height: metadata.height,
      aspectRatio: parseFloat(aspectRatio),
      format: metadata.format
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error.message);
    return null;
  }
}

// ============================================================================
// 5. GENERATE THUMBNAIL
// ============================================================================

/**
 * Generate thumbnail from image buffer
 * @param {Buffer} buffer - Image buffer
 * @param {object} options - Options { width, height, fit, quality, format }
 * @returns {Promise<object|null>} { buffer, width, height } or null
 */
async function generateThumbnail(buffer, options = {}) {
  try {
    if (!buffer || !sharp) return null;

    const {
      width = 300,
      height = 300,
      fit = 'cover',
      quality = 80,
      format = 'webp'
    } = options;

    let transformer = sharp(buffer)
      .resize(width, height, { fit, position: 'center' })
      .withMetadata(false); // Remove metadata for smaller size

    // Apply format conversion
    if (format === 'webp') {
      transformer = transformer.webp({ quality });
    } else if (format === 'jpeg') {
      transformer = transformer.jpeg({ quality });
    } else if (format === 'png') {
      transformer = transformer.png({ compressionLevel: Math.ceil(quality / 10) });
    }

    const thumbnailBuffer = await transformer.toBuffer();

    // Get final dimensions
    const metadata = await sharp(thumbnailBuffer).metadata();

    return {
      buffer: thumbnailBuffer,
      width: metadata.width,
      height: metadata.height,
      format,
      size: thumbnailBuffer.length
    };
  } catch (error) {
    console.error('Error generating thumbnail:', error.message);
    return null;
  }
}

// ============================================================================
// 6. DETECT MIME TYPE
// ============================================================================

/**
 * Detect MIME type from buffer magic numbers
 * Includes fallback to filename-based detection
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Filename (fallback)
 * @returns {string|null} MIME type or null
 */
function detectMimeType(buffer, filename = '') {
  try {
    if (!buffer || buffer.length === 0) {
      // Fallback to filename-based detection
      return uploadConfig.getMimeTypeFromFilename(filename) || null;
    }

    // Magic numbers for common file types
    const magicNumbers = {
      // Images
      'FFD8FF': 'image/jpeg',
      '89504E47': 'image/png',
      '47494638': 'image/gif',
      '52494646': 'image/webp', // Check WEBP more carefully
      // PDF
      '25504446': 'application/pdf',
      // Office files (ZIP-based)
      '504B0304': 'application/zip', // Generic ZIP
      // Text files
      'EFBBBF': 'text/plain' // UTF-8 BOM
    };

    const hex = buffer.toString('hex', 0, 4).toUpperCase();

    // Check for common magic numbers
    for (const [magic, mimeType] of Object.entries(magicNumbers)) {
      if (hex.startsWith(magic)) {
        // Special handling for ZIP (could be docx, xlsx, etc.)
        if (mimeType === 'application/zip') {
          if (hex.includes('504B0304')) {
            // Check filename for Office formats
            const lowerFilename = filename.toLowerCase();
            if (lowerFilename.includes('.docx')) {
              return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            }
            if (lowerFilename.includes('.xlsx')) {
              return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            }
          }
          continue; // Skip generic ZIP match
        }
        return mimeType;
      }
    }

    // Fallback to filename-based detection
    return uploadConfig.getMimeTypeFromFilename(filename) || null;
  } catch (error) {
    console.error('Error detecting MIME type:', error.message);
    return uploadConfig.getMimeTypeFromFilename(filename) || null;
  }
}

// ============================================================================
// 7. SANITIZE FILENAME
// ============================================================================

/**
 * Sanitize filename (remove special characters, path separators)
 * Uses config settings from uploadConfig
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
function sanitizeFilename(filename) {
  try {
    if (!filename || typeof filename !== 'string') return 'file';

    // Use uploadConfig sanitization
    return uploadConfig.sanitizeFilename(filename);
  } catch (error) {
    console.error('Error sanitizing filename:', error.message);
    return 'file';
  }
}

// ============================================================================
// 8. IS FILE TYPE ALLOWED
// ============================================================================

/**
 * Check if file type is allowed
 * @param {string} mimeType - MIME type
 * @param {string} category - Optional category filter (image|document|archive)
 * @returns {boolean}
 */
function isFileTypeAllowed(mimeType, category = null) {
  try {
    if (!mimeType) return false;

    // Check against config allowed types
    if (!uploadConfig.isAllowedMimeType(mimeType)) {
      return false;
    }

    // If category specified, check category match
    if (category) {
      switch (category.toLowerCase()) {
        case 'image':
          return uploadConfig.isImage(mimeType);
        case 'document':
          return uploadConfig.isDocument(mimeType);
        case 'archive':
          return uploadConfig.isArchive(mimeType);
        default:
          return true;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking file type:', error.message);
    return false;
  }
}

// ============================================================================
// 9. CALCULATE CHECKSUM
// ============================================================================

/**
 * Generate checksum/hash for file integrity verification
 * Uses SHA256 (fallback to MD5)
 * @param {Buffer} buffer - File buffer
 * @param {string} algorithm - Hash algorithm (md5|sha256)
 * @returns {string|null} Hex checksum or null
 */
function calculateChecksum(buffer, algorithm = 'sha256') {
  try {
    if (!buffer) return null;

    const validAlgorithms = ['md5', 'sha256', 'sha1'];
    if (!validAlgorithms.includes(algorithm)) {
      algorithm = 'sha256';
    }

    const hash = crypto.createHash(algorithm);
    hash.update(buffer);
    return hash.digest('hex');
  } catch (error) {
    console.error('Error calculating checksum:', error.message);
    return null;
  }
}

// ============================================================================
// 10. GET FILE CATEGORY
// ============================================================================

/**
 * Get file category from MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} Category: 'image'|'document'|'archive'|'video'|'audio'|'other'
 */
function getFileCategory(mimeType) {
  try {
    if (!mimeType) return 'other';

    if (uploadConfig.isImage(mimeType)) return 'image';
    if (uploadConfig.isDocument(mimeType)) return 'document';
    if (uploadConfig.isArchive(mimeType)) return 'archive';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';

    return 'other';
  } catch (error) {
    console.error('Error getting file category:', error.message);
    return 'other';
  }
}

/**
 * Check if file is an image
 * @param {string} mimeType - MIME type
 * @returns {boolean}
 */
function isImage(mimeType) {
  return uploadConfig.isImage(mimeType);
}

// ============================================================================
// ADDITIONAL UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if file has valid structure (basic validation)
 * @param {object} file - File object { buffer, originalname, mimetype, size }
 * @returns {object} { valid: boolean, errors: [] }
 */
function validateFileStructure(file) {
  const errors = [];

  if (!file) {
    errors.push('File object is required');
    return { valid: false, errors };
  }

  if (!file.buffer || !(file.buffer instanceof Buffer)) {
    errors.push('Valid file buffer is required');
  }

  if (!file.originalname || typeof file.originalname !== 'string') {
    errors.push('Original filename is required');
  }

  if (!file.mimetype || typeof file.mimetype !== 'string') {
    errors.push('MIME type is required');
  }

  if (typeof file.size !== 'number' || file.size < 0) {
    errors.push('Valid file size is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} Extension with dot (e.g., '.jpg')
 */
function getExtension(filename) {
  try {
    return uploadConfig.getFileExtension(filename);
  } catch (error) {
    console.error('Error getting extension:', error.message);
    return '';
  }
}

/**
 * Check if buffer matches MIME type
 * @param {Buffer} buffer - File buffer
 * @param {string} expectedMimeType - Expected MIME type
 * @returns {boolean}
 */
function bufferMatchesMimeType(buffer, expectedMimeType) {
  try {
    const detectedMimeType = detectMimeType(buffer);
    return detectedMimeType === expectedMimeType;
  } catch (error) {
    console.error('Error matching MIME type:', error.message);
    return false;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Core functions
  formatBytes,
  getFileIcon,
  extractMetadata,
  getImageDimensions,
  generateThumbnail,
  detectMimeType,
  isImage,
  sanitizeFilename,
  isFileTypeAllowed,
  calculateChecksum,
  getFileCategory,

  // Additional utilities
  validateFileStructure,
  getExtension,
  bufferMatchesMimeType,

  // Check library availability
  hasSharp: () => !!sharp,
  hasExifr: () => !!exifr,
  hasPdfParse: () => !!pdfParse
};
