const File = require('../models/File');
const uploadService = require('../services/uploadService');
const fileHelper = require('../utils/fileHelper');
const uploadConfig = require('../config/uploadConfig');
const { createReadStream } = require('fs');
const path = require('path');

/**
 * Upload Controller
 * Handles file uploads, downloads, management, and public file access
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const asyncHandler = require('express-async-handler');

/**
 * Check if user can access file
 */
function canAccessFile(user, file) {
  if (!user) return false;
  // Admin can access any file
  if (user.role === 'admin') return true;
  // User can access own files
  return file.uploadedBy.toString() === userId.toString();
}

/**
 * Get authenticated user
 */
function getAuthenticatedUser(req) {
  return req.user || null;
}

/**
 * Parse tags from JSON string
 */
function parseTags(tagsString) {
  try {
    if (!tagsString) return [];
    if (typeof tagsString === 'string') {
      return JSON.parse(tagsString);
    }
    return Array.isArray(tagsString) ? tagsString : [];
  } catch (error) {
    console.warn('Error parsing tags:', error.message);
    return [];
  }
}

// ============================================================================
// ENDPOINT 1: UPLOAD SINGLE FILE
// ============================================================================

/**
 * POST /api/upload
 * Upload single file with metadata
 */
const uploadSingle = asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const userId = user?.userId || user?._id;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check if file exists
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file provided'
    });
  }

  try {
    // Validate file
    const validation = uploadConfig.validateFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Check storage quota
    const storageUsage = await uploadService.getStorageUsage(userId);
    if (storageUsage && storageUsage.isFull) {
      return res.status(413).json({
        success: false,
        message: 'Storage quota exceeded. Please delete files or contact support.'
      });
    }

    // Parse request body
    const { isPublic = false, referenceId, referenceModel, tags: tagsString } = req.body;
    const tags = parseTags(tagsString);

    // Upload file
    const fileDoc = await uploadService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      {
        isPublic: isPublic === 'true' || isPublic === true,
        uploadedBy: userId,
        referenceId,
        referenceModel,
        tags
      }
    );

    res.status(201).json({
      success: true,
      data: fileDoc,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading single file:', error.message);
    res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
});

// ============================================================================
// ENDPOINT 2: UPLOAD MULTIPLE FILES
// ============================================================================

/**
 * POST /api/upload/multiple
 * Upload multiple files with batch processing
 */
const uploadMultiple = asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check if files exist
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files provided'
    });
  }

  // Check file limit
  if (req.files.length > uploadConfig.limits.maxFilesPerUpload) {
    return res.status(400).json({
      success: false,
      message: `Maximum ${uploadConfig.limits.maxFilesPerUpload} files per upload`
    });
  }

  try {
    // Check storage quota
    const storageUsage = await uploadService.getStorageUsage(userId);
    if (storageUsage && storageUsage.isFull) {
      return res.status(413).json({
        success: false,
        message: 'Storage quota exceeded'
      });
    }

    // Check total size of all files
    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > uploadConfig.limits.maxFileSize * uploadConfig.limits.maxFilesPerUpload) {
      return res.status(400).json({
        success: false,
        message: 'Total file size exceeds limit'
      });
    }

    // Parse body options
    const { isPublic = false, referenceId, referenceModel, tags: tagsString } = req.body;
    const tags = parseTags(tagsString);

    // Validate all files
    const validFiles = [];
    for (const file of req.files) {
      const validation = uploadConfig.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid files to upload'
      });
    }

    // Upload files
    const result = await uploadService.uploadMultiple(
      validFiles.map(file => ({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      })),
      {
        isPublic: isPublic === 'true' || isPublic === true,
        uploadedBy: userId,
        referenceId,
        referenceModel,
        tags
      }
    );

    res.status(201).json({
      success: true,
      data: result,
      message: `${result.uploaded.length} files uploaded successfully`
    });
  } catch (error) {
    console.error('Error uploading multiple files:', error.message);
    res.status(500).json({
      success: false,
      message: 'Batch upload failed'
    });
  }
});

// ============================================================================
// ENDPOINT 3: GET FILE METADATA
// ============================================================================

/**
 * GET /api/upload/:id
 * Get file metadata and information
 */
const getFile = asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const { id } = req.params;

  try {
        const file = await File.findById(id).populate('uploadedByDetails', 'name email');
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check access
    if (!canAccessFile(user, file)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('Error getting file:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving file'
    });
  }
});

// ============================================================================
// ENDPOINT 4: DELETE FILE
// ============================================================================

/**
 * DELETE /api/upload/:id
 * Soft delete or permanently delete file
 */
const deleteFile = asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const { id } = req.params;
  const { permanent } = req.query;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  try {
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check access
    if (!canAccessFile(user, file)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file
    const isPermanent = permanent === 'true' || permanent === true;
    const result = await uploadService.deleteFile(id, isPermanent);

    res.status(200).json({
      success: true,
      data: result,
      message: isPermanent
        ? 'File permanently deleted'
        : 'File deleted (can be restored within 30 days)'
    });
  } catch (error) {
    console.error('Error deleting file:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
});

// ============================================================================
// ENDPOINT 5: DOWNLOAD FILE
// ============================================================================

/**
 * GET /api/upload/:id/download
 * Download file with streaming
 */
const downloadFile = asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const { id } = req.params;

  try {
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check access
    if (!canAccessFile(user, file)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check file status
    if (file.isDeleted) {
      return res.status(410).json({
        success: false,
        message: 'File has been deleted'
      });
    }

    if (file.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: 'File is not ready for download'
      });
    }

        // Get file buffer
    let fileBuffer = await uploadService.getFileBuffer(id);
    
    // For Cloudinary/S3, getFileBuffer may return null - fallback to URL redirect
    if (!fileBuffer) {
      if (file.url) {
        return res.redirect(302, file.url);
      }
      return res.status(500).json({
        success: false,
        message: 'Cannot retrieve file'
      });
    }

    // Set response headers
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.originalName)}"`
    );
    res.setHeader('Content-Length', fileBuffer.length);

    // Send file
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading file:', error.message);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Download failed'
      });
    }
  }
});

// ============================================================================
// ENDPOINT 6: GET PUBLIC FILE
// ============================================================================

/**
 * GET /api/upload/public/:filename
 * PUBLIC endpoint - serve public files without authentication
 * No authorization check needed - file must be explicitly marked public
 */
const getPublicFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  try {
    // Find file by filename and verify it's public
    const file = await File.findOne({
      fileName: filename,
      isPublic: true,
      isDeleted: false,
      status: 'ready'
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Get file buffer
    const fileBuffer = await uploadService.getFileBuffer(file._id);
    if (!fileBuffer) {
      return res.status(500).json({
        success: false,
        message: 'Cannot retrieve file'
      });
    }

        // Set response headers
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable'); // 24 hour cache
    res.setHeader('Content-Length', fileBuffer.length);
    
    // Add ETag for caching
    const etag = require('crypto').createHash('md5').update(fileBuffer).digest('hex');
    res.setHeader('ETag', etag);
    
    // Send file
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error serving public file:', error.message);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error serving file'
      });
    }
  }
});

// ============================================================================
// ENDPOINT 7: GET USER'S FILES
// ============================================================================

/**
 * GET /api/upload/user/:userId
 * Get all files for a specific user with pagination
 */
const getUserFiles = asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  console.log('getUserFiles - User from token:', user);
  console.log('getUserFiles - userId param:', req.params.userId);
  
  const { userId } = req.params;
  const { page = 1, limit = 20, mimeType, referenceModel } = req.query;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check authorization
  // Handle both _id and userId from token
  const userIdFromToken = userId || user.userId;
  if (!userIdFromToken) {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
  const isOwnProfile = userIdFromToken.toString() === userId;

  const isAdmin = user.role === 'admin';
  if (!isOwnProfile && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const pageLimit = Math.min(parseInt(limit), 100);

    // Build filter
    const filter = {
      uploadedBy: userId,
      isDeleted: false
    };

    if (mimeType) {
      filter.mimeType = mimeType;
    }
    if (referenceModel) {
      filter.referenceModel = referenceModel;
    }

    // Get files
    const files = await File.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .select('-__v');

    const total = await File.countDocuments(filter);

    // Get storage usage
    const storageUsage = await uploadService.getStorageUsage(userId);

    res.status(200).json({
      success: true,
      data: {
        files,
        pagination: {
          page: parseInt(page),
          limit: pageLimit,
          total,
          pages: Math.ceil(total / pageLimit)
        },
        storage: storageUsage
      }
    });
  } catch (error) {
    console.error('Error getting user files:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving files'
    });
  }
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  uploadSingle,
  uploadMultiple,
  getFile,
  deleteFile,
  downloadFile,
  getPublicFile,
  getUserFiles
};
