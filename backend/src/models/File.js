const mongoose = require('mongoose');

/**
 * File Model - Professional file tracking for hotel management system
 * Supports images, documents, invoices, and attachments with full metadata
 */

const FileSchema = new mongoose.Schema(
  {
    // File identification
    fileName: {
      type: String,
      required: [true, 'Generated filename is required'],
      unique: true,
      index: true
    },
    originalName: {
      type: String,
      required: [true, 'Original filename is required']
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      enum: {
        values: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/zip',
          'text/plain',
          'text/csv'
        ],
        message: '{VALUE} is not a supported file type'
      }
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      validate: {
        validator: function (value) {
          const maxSize = process.env.MAX_FILE_SIZE || 10485760; // 10MB default
          return value <= maxSize;
        },
        message: 'File size exceeds maximum limit of 10MB'
      }
    },
    extension: {
      type: String,
      lowercase: true
      // Auto-extracted from fileName or mimeType
    },

    // Storage information
    path: {
      type: String
      // Local filesystem path (development)
    },
    url: {
      type: String
      // Public URL (production)
    },
    publicId: {
      type: String
      // Cloudinary/S3 public identifier
    },

    // Relationships
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader information is required'],
      index: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
      // Related document (Booking, Room, Invoice, etc.)
    },
    referenceModel: {
      type: String,
      enum: ['Booking', 'Room', 'User', 'Complaint', 'Invoice', 'EmailLog', 'MaintenanceRequest'],
      index: true
      // Type of referenced document
    },

    // Categorization
    tags: [
      {
        type: String,
        lowercase: true,
        maxlength: 50
      }
    ],

    // Extended metadata
    metadata: {
      // Image dimensions
      width: Number,
      height: Number,
      // Video/audio duration in seconds
      duration: Number,
      // Generated thumbnail URL
      thumbnailUrl: String,
      // Stripped EXIF data for images
      exif: mongoose.Schema.Types.Mixed,
      // Additional custom metadata
      custom: mongoose.Schema.Types.Mixed
    },

    // File status tracking
    status: {
      type: String,
      enum: {
        values: ['uploading', 'processing', 'ready', 'failed', 'deleted'],
        message: '{VALUE} is not a valid file status'
      },
      default: 'uploading',
      index: true
    },

    // Visibility and deletion
    isPublic: {
      type: Boolean,
      default: false
      // Public file (accessible without auth)
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
      // Soft delete flag
    },
    deletedAt: {
      type: Date
      // Soft delete timestamp
    },

    // Audit timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: -1
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// ============================================================================
// INDEXES
// ============================================================================

FileSchema.index({ referenceId: 1, referenceModel: 1 });
FileSchema.index({ mimeType: 1 });
FileSchema.index({ tags: 1 });
FileSchema.index({ isPublic: 1, isDeleted: 1 });
FileSchema.index({ fileName: 1, isDeleted: 1 });

// ============================================================================
// VIRTUAL FIELDS
// ============================================================================

/**
 * Human-readable file size
 */
FileSchema.virtual('sizeFormatted').get(function () {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

/**
 * File type category
 */
FileSchema.virtual('fileCategory').get(function () {
  const mimeType = this.mimeType;
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'document';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('zip')) return 'archive';
  return 'file';
});

/**
 * Uploader details (populated)
 */
FileSchema.virtual('uploadedByDetails', {
  ref: 'User',
  localField: 'uploadedBy',
  foreignField: '_id',
  justOne: true
});

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Find all files for a specific reference
 * @param {ObjectId} referenceId - Reference document ID
 * @param {string} referenceModel - Reference model name
 * @returns {Promise<Array>} Files for the reference
 */
FileSchema.statics.findByReference = function (referenceId, referenceModel) {
  return this.find({
    referenceId,
    referenceModel,
    isDeleted: false
  }).sort({ createdAt: -1 });
};

/**
 * Get cumulative file storage usage per user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Object>} { totalSize, fileCount, sizeFormatted }
 */
FileSchema.statics.getUsageStats = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: {
      uploadedBy: new mongoose.Types.ObjectId(userId),
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        totalSize: { $sum: '$size' },
        fileCount: { $sum: 1 },
        byMimeType: {
          $push: {
            mimeType: '$mimeType',
            size: '$size'
          }
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalSize: 0,
      fileCount: 0,
      sizeFormatted: '0 Bytes',
      byMimeType: []
    };
  }

  const result = stats[0];
  const bytes = result.totalSize;
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const sizeFormatted = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];

  return {
    totalSize: result.totalSize,
    fileCount: result.fileCount,
    sizeFormatted,
    byMimeType: result.byMimeType
  };
};

/**
 * Cleanup soft-deleted files older than 30 days
 * Permanently removes files from database
 * @param {number} days - Days to keep (default: 30)
 * @returns {Promise<Object>} { deletedCount }
 */
FileSchema.statics.cleanupDeleted = async function (days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await this.deleteMany({
    isDeleted: true,
    deletedAt: { $lt: cutoffDate }
  });

  return {
    deletedCount: result.deletedCount
  };
};

/**
 * Get files by status
 * @param {string} status - File status
 * @param {number} limit - Maximum results
 * @returns {Promise<Array>} Files with specified status
 */
FileSchema.statics.findByStatus = function (status, limit = 100) {
  return this.find({
    status,
    isDeleted: false
  })
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Get storage quota statistics
 * @returns {Promise<Object>} Statistics across all users
 */
FileSchema.statics.getStorageStats = async function () {
  const stats = await this.aggregate([
    {
      $match: { isDeleted: false }
    },
    {
      $group: {
        _id: null,
        totalStorageUsed: { $sum: '$size' },
        totalFiles: { $sum: 1 },
        averageFileSize: { $avg: '$size' },
        largestFile: { $max: '$size' },
        smallestFile: { $min: '$size' },
        byStatus: {
          $push: {
            status: '$status',
            count: { $sum: 1 }
          }
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalStorageUsed: 0,
      totalFiles: 0,
      averageFileSize: 0
    };
  }

  return stats[0];
};

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Soft delete a file
 * @returns {Promise<Object>} Updated file document
 */
FileSchema.methods.markAsDeleted = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.status = 'deleted';
  return this.save();
};

/**
 * Restore a soft-deleted file
 * @returns {Promise<Object>} Updated file document
 */
FileSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.status = 'ready';
  return this.save();
};

/**
 * Permanently delete a file
 * Also removes from cloud storage (handled by controller)
 * @returns {Promise<void>}
 */
FileSchema.methods.permanentlyDelete = async function () {
  // Controller should handle cloud storage deletion
  return this.deleteOne();
};

/**
 * Update file status
 * @param {string} newStatus - New status value
 * @param {string} reason - Optional reason for status change
 * @returns {Promise<Object>} Updated file document
 */
FileSchema.methods.updateStatus = async function (newStatus, reason = null) {
  const validStatuses = ['uploading', 'processing', 'ready', 'failed', 'deleted'];
if (!validStatuses.includes(newStatus)) {
  throw new Error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
}
  this.status = newStatus;
  if (reason && newStatus === 'failed') {
    this.metadata = this.metadata || {};
    this.metadata.failureReason = reason;
  }
  return this.save();
};

/**
 * Get file type display name
 * @returns {string} Human-readable file type
 */
FileSchema.methods.getFileType = function () {
  const category = this.fileCategory;
  return category.charAt(0).toUpperCase() + category.slice(1);
};

/**
 * Check if file is an image
 * @returns {boolean}
 */
FileSchema.methods.isImage = function () {
  return this.mimeType.startsWith('image/');
};

/**
 * Check if file is a document
 * @returns {boolean}
 */
FileSchema.methods.isDocument = function () {
  return this.fileCategory === 'document';
};

/**
 * Check if file is publicly accessible
 * @returns {boolean}
 */
FileSchema.methods.isAccessible = function () {
  return this.isPublic && !this.isDeleted && this.status === 'ready';
};

/**
 * Generate public access URL (if applicable)
 * @returns {string|null} Public URL or null
 */
FileSchema.methods.getPublicUrl = function () {
  if (!this.isPublic || this.isDeleted) return null;
  return this.url || this.path || null;
};

/**
 * Custom JSON serialization
 * @returns {Object} Sanitized file object
 */
FileSchema.methods.toJSON = function () {
  const obj = this.toObject();

  // Remove sensitive fields
  delete obj.__v;

  // Include virtuals
  obj.sizeFormatted = this.sizeFormatted;
  obj.fileCategory = this.fileCategory;

  // Remove path from non-admin responses (handled by controller)
  if (!this.isPublic) {
    delete obj.path;
  }

  // Remove technical identifiers from public response
  if (this.isPublic) {
    delete obj.uploadedBy;
    delete obj.referenceId;
    delete obj.referenceModel;
  }

  return obj;
};

// ============================================================================
// HOOKS/MIDDLEWARE
// ============================================================================

/**
 * Auto-populate uploadedBy on retrieval
 */
// FileSchema.pre(/^find/, function (next) {
//   if (this.options._recursed) {
//     return next();
//   }
//   this.populate({
//     path: 'uploadedBy',
//     select: 'name email role -password',
//     options: { _recursed: true }
//   });
//   next();
// });

/**
 * Update timestamps on save
 */
FileSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Prevent direct query of deleted files
 */
FileSchema.query.notDeleted = function () {
  return this.where({ isDeleted: false });
};

/**
 * Only active files
 */
FileSchema.query.active = function () {
  return this.where({ isDeleted: false, status: 'ready' });
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = mongoose.model('File', FileSchema);
