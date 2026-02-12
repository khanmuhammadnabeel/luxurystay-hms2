const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const File = require('../models/File');
const uploadConfig = require('../config/uploadConfig');
const fileHelper = require('../utils/fileHelper');

/**
 * Upload Service
 * Core upload functionality with provider abstraction (local/cloudinary/S3)
 * Handles file validation, storage, metadata extraction, and cleanup
 */

// ============================================================================
// OPTIONAL DEPENDENCIES
// ============================================================================

let Cloudinary = null;
let AWS = null;

try {
  Cloudinary = require('cloudinary').v2;
} catch (err) {
  console.warn('Cloudinary not installed - cloud uploads disabled');
}

try {
  AWS = require('aws-sdk');
} catch (err) {
  console.warn('AWS SDK not installed - S3 uploads disabled');
}

// Initialize AWS S3 if configured
let s3Client = null;
if (AWS && uploadConfig.isS3()) {
  try {
    s3Client = new AWS.S3({
      accessKeyId: uploadConfig.config.s3.accessKeyId,
      secretAccessKey: uploadConfig.config.s3.secretAccessKey,
      region: uploadConfig.config.s3.region
    });
  } catch (err) {
    console.warn('Failed to initialize S3 client:', err.message);
  }
}

// Initialize Cloudinary if configured
if (Cloudinary && uploadConfig.isCloudinary()) {
  try {
    Cloudinary.config({
      cloud_name: uploadConfig.config.cloudinary.cloudName,
      api_key: uploadConfig.config.cloudinary.apiKey,
      api_secret: uploadConfig.config.cloudinary.apiSecret,
      secure: uploadConfig.config.cloudinary.secure
    });
  } catch (err) {
    console.warn('Failed to initialize Cloudinary:', err.message);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename with extension
 */
function generateUniqueFilename(originalName) {
  const ext = fileHelper.getExtension(originalName);
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${random}${ext}`;
}

/**
 * Create required directories (local storage only)
 * @returns {Promise<void>}
 */
async function ensureDirectories() {
  try {
    if (!uploadConfig.isLocalStorage()) return;

    const dirs = [
      uploadConfig.getUploadDir(),
      uploadConfig.config.local.publicDir,
      uploadConfig.config.local.privateDir,
      uploadConfig.config.local.tempDir
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating directories:', error.message);
  }
}

/**
 * Save file to local storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Filename
 * @param {boolean} isPublic - Is file public
 * @returns {Promise<string>} File path
 */
async function saveLocal(fileBuffer, filename, isPublic) {
  try {
    await ensureDirectories();

    const filePath = uploadConfig.getUploadPath(filename, isPublic);
    const fullPath = path.join(uploadConfig.getUploadDir(), '..', filePath);

    await fs.writeFile(fullPath, fileBuffer);

    return filePath;
  } catch (error) {
    console.error('Error saving file to local storage:', error.message);
    throw new Error('Failed to save file');
  }
}

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Filename
 * @param {object} metadata - Additional metadata
 * @returns {Promise<object>} { publicId, url, width, height }
 */
async function uploadCloudinary(fileBuffer, filename, metadata = {}) {
  try {
    if (!Cloudinary) {
      throw new Error('Cloudinary not configured');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = Cloudinary.uploader.upload_stream(
        {
          public_id: path.parse(filename).name,
          folder: uploadConfig.config.cloudinary.folder,
          overwrite: false,
          unique_filename: true,
          resource_type: 'auto',
          ...metadata.cloudinaryOptions
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error.message);
            reject(new Error('Cloud upload failed'));
          } else {
            resolve({
              publicId: result.public_id,
              url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error.message);
    throw new Error('Failed to upload file to cloud');
  }
}

/**
 * Upload file to AWS S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Filename
 * @param {boolean} isPublic - Is file public
 * @param {string} mimeType - MIME type
 * @returns {Promise<object>} { key, url, location }
 */
async function uploadS3(fileBuffer, filename, isPublic, mimeType) {
  try {
    if (!s3Client) {
      throw new Error('S3 not configured');
    }

    const key = `${uploadConfig.config.s3.folder}/${isPublic ? 'public' : 'private'}/${filename}`;

    const params = {
      Bucket: uploadConfig.config.s3.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: isPublic ? 'public-read' : 'private'
    };

    const result = await s3Client.upload(params).promise();

    return {
      key: result.Key,
      url: result.Location,
      etag: result.ETag
    };
  } catch (error) {
    console.error('Error uploading to S3:', error.message);
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Delete file from storage
 * @param {string} filename - Filename or storage identifier
 * @param {object} file - File document with storage info
 * @returns {Promise<void>}
 */
async function deleteFromStorage(filename, file) {
  try {
    const provider = uploadConfig.getStorageProvider();

    switch (provider) {
      case 'local':
        if (file.path) {
          const fullPath = path.join(uploadConfig.getUploadDir(), '..', file.path);
          await fs.unlink(fullPath).catch(() => {
            // File might already be deleted
          });
        }
        break;

      case 'cloudinary':
        if (file.publicId && Cloudinary) {
          await Cloudinary.uploader.destroy(file.publicId).catch(() => {
            // File might not exist
          });
        }
        break;

            case 's3':
        if (file.metadata?.s3Key && s3Client) {
          await s3Client.deleteObject({
            Bucket: uploadConfig.config.s3.bucket,
            Key: file.metadata.s3Key
          }).promise().catch(() => {
            // File might not exist
          });
        }
        break;
    }
  } catch (error) {
    console.error('Error deleting from storage:', error.message);
  }
}

// ============================================================================
// 1. UPLOAD FILE (CORE FUNCTION)
// ============================================================================

/**
 * Upload single file with provider abstraction
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - MIME type
 * @param {object} options - Upload options
 * @param {boolean} options.isPublic - Is file public (default: false)
 * @param {ObjectId} options.uploadedBy - User ID (required)
 * @param {ObjectId} options.referenceId - Referenced document ID
 * @param {string} options.referenceModel - Referenced model name
 * @param {string[]} options.tags - File tags
 * @param {object} options.metadata - Additional metadata
 * @returns {Promise<object>} File document
 */
async function uploadFile(
  fileBuffer,
  originalName,
  mimeType,
  options = {}
) {
  let filename = null;

  try {
    // Step 1: Validate file
    const validation = fileHelper.validateFileStructure({
      buffer: fileBuffer,
      originalname: originalName,
      mimetype: mimeType,
      size: fileBuffer.length
    });

    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Additional validation
    const uploadValidation = uploadConfig.validateFile({
      originalname: originalName,
      mimetype: mimeType,
      size: fileBuffer.length
    });

    if (!uploadValidation.valid) {
      throw new Error(uploadValidation.error);
    }

    // Step 2: Sanitize and generate unique filename
    const sanitized = fileHelper.sanitizeFilename(originalName);
    filename = generateUniqueFilename(sanitized);

    // Step 3: Extract metadata
    const extractedMetadata = await fileHelper.extractMetadata(fileBuffer, mimeType);

    // Step 4: Store file based on provider
    let storageData = {};
    const provider = uploadConfig.getStorageProvider();

    switch (provider) {
      case 'cloudinary':
        if (Cloudinary) {
          storageData = await uploadCloudinary(fileBuffer, filename, extractedMetadata);
        } else {
          throw new Error('Cloudinary not configured');
        }
        break;

      case 's3':
        if (s3Client) {
          storageData = await uploadS3(fileBuffer, filename, options.isPublic, mimeType);
        } else {
          throw new Error('S3 not configured');
        }
        break;

      case 'local':
      default:
        const filePath = await saveLocal(fileBuffer, filename, options.isPublic);
        storageData = {
          path: filePath,
          url: options.isPublic ? uploadConfig.getPublicUrl(filename) : null
        };
    }

    // Step 5: Generate thumbnail for images
    let thumbnailUrl = null;
    if (fileHelper.isImage(mimeType) && fileHelper.hasSharp()) {
      const thumbnailResult = await fileHelper.generateThumbnail(fileBuffer, {
        width: 300,
        height: 200,
        quality: 80
      });

      if (thumbnailResult) {
        // Save thumbnail
        const thumbFilename = `thumb-${filename}`;
        if (provider === 'local') {
          const thumbPath = await saveLocal(
            thumbnailResult.buffer,
            thumbFilename,
            true
          );
          thumbnailUrl = uploadConfig.getPublicUrl(thumbFilename);
        } else if (provider === 'cloudinary' && Cloudinary) {
           const thumbResult = await uploadCloudinary(
          thumbnailResult.buffer,
          thumbFilename,
          {
            cloudinaryOptions: {
              folder: `${uploadConfig.config.cloudinary.folder}/thumbnails`,
              public_id: path.parse(thumbFilename).name
            }
          }
        );
          thumbnailUrl = thumbResult.url;
        }
      }
    }

    // Step 6: Create File document
    const fileDoc = new File({
      fileName: filename,
      originalName: originalName,
      mimeType,
      size: fileBuffer.length,
      extension: fileHelper.getExtension(originalName),
      path: storageData.path,
      url: storageData.url,
      publicId: storageData.publicId,
      uploadedBy: options.uploadedBy,
      referenceId: options.referenceId,
      referenceModel: options.referenceModel,
      tags: options.tags || [],
      metadata: {
      ...extractedMetadata,
      thumbnailUrl,
      custom: options.metadata,
      s3Key: storageData.key  // Store S3 key for deletion
    },
      isPublic: options.isPublic || false,
      status: 'ready'
    });

    await fileDoc.save();

    console.log(`File uploaded successfully: ${filename}`);
    return fileDoc;
  } catch (error) {
    console.error('Error uploading file:', error.message);

    // Cleanup on failure
    if (filename) {
      try {
        if (uploadConfig.isLocalStorage()) {
          const filePath = uploadConfig.getUploadPath(filename, options.isPublic);
          const fullPath = path.join(uploadConfig.getUploadDir(), '..', filePath);
          await fs.unlink(fullPath).catch(() => {});
        }
      } catch (cleanupErr) {
        console.error('Cleanup error:', cleanupErr.message);
      }
    }

    throw error;
  }
}

// ============================================================================
// 2. UPLOAD MULTIPLE FILES
// ============================================================================

/**
 * Upload multiple files with partial success handling
 * @param {Array} files - File objects
 * @param {object} options - Upload options
 * @returns {Promise<object>} { uploaded: [], failed: [] }
 */
async function uploadMultiple(files, options = {}) {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('Files array is required');
    }

    // Rate limit check
    if (files.length > uploadConfig.limits.maxFilesPerUpload) {
      throw new Error(
        `Cannot upload more than ${uploadConfig.limits.maxFilesPerUpload} files at once`
      );
    }

    const uploadPromises = files.map(file =>
      uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        options
      ).then(fileDoc => ({ success: true, file: fileDoc }))
        .catch(error => ({ success: false, error: error.message }))
    );

    const results = await Promise.allSettled(uploadPromises);

    const uploaded = [];
    const failed = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const data = result.value;
        if (data.success) {
          uploaded.push(data.file);
        } else {
          failed.push({
            filename: files[index].originalname,
            error: data.error
          });
        }
      } else {
        failed.push({
          filename: files[index].originalname,
          error: result.reason.message
        });
      }
    });

    return { uploaded, failed };
  } catch (error) {
    console.error('Error uploading multiple files:', error.message);
    throw error;
  }
}

// ============================================================================
// 3. DELETE FILE
// ============================================================================

/**
 * Delete file (soft delete by default)
 * @param {string} fileId - File ID
 * @param {boolean} permanent - Permanently delete (default: false)
 * @returns {Promise<object>} Updated file document
 */
async function deleteFile(fileId, permanent = false) {
  try {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    if (permanent) {
      // Remove from storage
      await deleteFromStorage(file.fileName, file);
      // Delete from database
      await File.deleteOne({ _id: fileId });
      console.log(`File permanently deleted: ${file.fileName}`);
      return file;
    } else {
      // Soft delete
      await file.markAsDeleted();
      console.log(`File soft deleted: ${file.fileName}`);
      return file;
    }
  } catch (error) {
    console.error('Error deleting file:', error.message);
    throw error;
  }
}

// ============================================================================
// 4. GET FILE URL
// ============================================================================

/**
 * Generate public URL for file
 * @param {string} fileId - File ID
 * @param {boolean} download - Add download query param
 * @returns {Promise<string|null>} Public URL or null
 */
async function getFileUrl(fileId, download = false) {
  try {
    const file = await File.findById(fileId);
    if (!file || !file.isPublic) {
      return null;
    }

    let url = file.url;
    if (!url && file.path) {
      url = uploadConfig.getPublicUrl(file.fileName, true);
    }

    if (download && url) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}download=1`;
    }

    return url;
  } catch (error) {
    console.error('Error getting file URL:', error.message);
    return null;
  }
}

// ============================================================================
// 5. GENERATE THUMBNAIL
// ============================================================================

/**
 * Generate thumbnail for existing file
 * @param {string} fileId - File ID
 * @param {object} options - Thumbnail options
 * @returns {Promise<string|null>} Thumbnail URL
 */
async function generateThumbnail(fileId, options = {}) {
  try {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    if (!fileHelper.isImage(file.mimeType)) {
      throw new Error('Only images can have thumbnails');
    }

    // Get file buffer
    const buffer = await getFileBuffer(fileId);
    if (!buffer) {
      throw new Error('Cannot read file');
    }

    // Generate thumbnail
    const thumbResult = await fileHelper.generateThumbnail(buffer, {
      width: options.width || 300,
      height: options.height || 200,
      quality: options.quality || 80,
      format: options.format || 'webp'
    });

    if (!thumbResult) {
      throw new Error('Thumbnail generation failed');
    }

    // Save thumbnail
    const thumbFilename = `thumb-${file.fileName}`;
    const provider = uploadConfig.getStorageProvider();
    let thumbnailUrl = null;

    if (provider === 'local') {
      const thumbPath = await saveLocal(thumbResult.buffer, thumbFilename, true);
      thumbnailUrl = uploadConfig.getPublicUrl(thumbFilename);
    } else if (provider === 'cloudinary' && Cloudinary) {
      const cloudResult = await uploadCloudinary(thumbResult.buffer, thumbFilename);
      thumbnailUrl = cloudResult.url;
    }

    // Update file document
    if (thumbnailUrl) {
      file.metadata = file.metadata || {};
      file.metadata.thumbnailUrl = thumbnailUrl;
      await file.save();
    }

    return thumbnailUrl;
  } catch (error) {
    console.error('Error generating thumbnail:', error.message);
    return null;
  }
}

// ============================================================================
// 6. GET FILE BUFFER
// ============================================================================

/**
 * Retrieve file buffer from storage
 * Used for download, preview, or processing
 * @param {string} fileId - File ID
 * @returns {Promise<Buffer|null>} File buffer or null
 */
async function getFileBuffer(fileId) {
  try {
    const file = await File.findById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    const provider = uploadConfig.getStorageProvider();

    switch (provider) {
      case 'local':
        if (file.path) {
          const fullPath = path.join(
            uploadConfig.getUploadDir(),
            '..',
            file.path
          );
          return await fs.readFile(fullPath);
        }
        break;

      case 'cloudinary':
        if (file.url && Cloudinary) {
          // For Cloudinary, return the URL instead of buffer
          // Actual buffer retrieval would require HTTP request
          console.warn('Buffer retrieval from Cloudinary not implemented');
          return null;
        }
        break;

      case 's3':
        if (file.url && s3Client) {
          // For S3, we'd need to implement signed URL or GetObject
          console.warn('Buffer retrieval from S3 not implemented');
          return null;
        }
        break;
    }

    throw new Error('Cannot retrieve file');
  } catch (error) {
    console.error('Error getting file buffer:', error.message);
    return null;
  }
}

// ============================================================================
// 7. CLEANUP TEMP FILES
// ============================================================================

/**
 * Remove temporary files older than retention period
 * Also clean up soft-deleted files
 * @returns {Promise<object>} { deletedFiles, deletedDirs }
 */
async function cleanupTempFiles() {
  try {
    const results = {
      deletedFiles: 0,
      deletedDirs: 0,
      errors: []
    };

    // Only cleanup for local storage
    if (!uploadConfig.isLocalStorage()) {
      return results;
    }

    const tempDir = uploadConfig.config.local.tempDir;
    const retentionDays = uploadConfig.config.retention.tempFileExpiryDays;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const files = await fs.readdir(tempDir);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          results.deletedFiles++;
        }
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        results.errors.push(`Temp cleanup error: ${err.message}`);
      }
    }

    // Cleanup soft-deleted database records
    try {
      const cleanupResult = await File.cleanupDeleted(
        uploadConfig.config.retention.deletedFileRetentionDays
      );
      results.deletedFiles += cleanupResult.deletedCount;
    } catch (err) {
      results.errors.push(`Database cleanup error: ${err.message}`);
    }

    console.log(`Cleanup completed: ${results.deletedFiles} files deleted`);
    return results;
  } catch (error) {
    console.error('Error in cleanup:', error.message);
    return { deletedFiles: 0, deletedDirs: 0, errors: [error.message] };
  }
}

// ============================================================================
// 8. GET STORAGE USAGE
// ============================================================================

/**
 * Calculate user's total storage usage
 * @param {string} userId - User ID
 * @returns {Promise<object>} { totalSize, fileCount, percentageUsed, remainingSize }
 */
async function getStorageUsage(userId) {
  try {
    const stats = await File.getUsageStats(userId);
    const maxStorage = uploadConfig.limits.totalStoragePerUser;
    const percentageUsed = (stats.totalSize / maxStorage * 100).toFixed(2);
    const remainingSize = Math.max(0, maxStorage - stats.totalSize);

    return {
      totalSize: stats.totalSize,
      totalSizeFormatted: stats.sizeFormatted,
      fileCount: stats.fileCount,
      maxSize: maxStorage,
      maxSizeFormatted: fileHelper.formatBytes(maxStorage),
      percentageUsed: parseFloat(percentageUsed),
      remainingSize,
      remainingSizeFormatted: fileHelper.formatBytes(remainingSize),
      isNearLimit: percentageUsed >= 90,
      isFull: stats.totalSize >= maxStorage
    };
  } catch (error) {
    console.error('Error getting storage usage:', error.message);
    return null;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  uploadFile,
  uploadMultiple,
  deleteFile,
  getFileUrl,
  generateThumbnail,
  getFileBuffer,
  cleanupTempFiles,
  getStorageUsage,

  // Check provider status
  isStorageConfigured: uploadConfig.isStorageConfigured,
  getStorageProvider: uploadConfig.getStorageProvider
};
