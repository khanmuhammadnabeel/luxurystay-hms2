/**
 * ExportJob Model
 * Tracks export requests, background processing state, and downloadable results
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ExportJobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: String, required: true, unique: true }, // REMOVE index: true,

  exportType: {
    type: String,
    enum: ['bookings', 'invoices', 'financial', 'guests', 'search', 'analytics', 'custom'],
    required: true
  },

  format: {
    type: String,
    enum: ['csv', 'excel', 'pdf', 'json', 'zip'],
    required: true
  },

  filters: { type: mongoose.Schema.Types.Mixed, default: {} },
  options: { type: mongoose.Schema.Types.Mixed, default: {} },

  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'expired'], default: 'pending' }, // REMOVE index: true

  progress: { type: Number, min: 0, max: 100, default: 0 },

  fileInfo: {
    filename: { type: String },
    path: { type: String },
    size: { type: Number },
    mimeType: { type: String },
    expiresAt: { type: Date }
  },

  metadata: {
    recordCount: { type: Number, default: 0 },
    processingTimeMs: { type: Number, default: 0 },
    errorMessage: { type: String },
    errorStack: { type: String }
  },

  scheduledAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  expiresAt: { type: Date },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
ExportJobSchema.index({ user: 1, createdAt: -1 });
ExportJobSchema.index({ jobId: 1 }, { unique: true });  // ← ONLY ONE jobId index
ExportJobSchema.index({ status: 1 });
ExportJobSchema.index({ exportType: 1 });
ExportJobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save update timestamp
ExportJobSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtuals
ExportJobSchema.virtual('timeElapsed').get(function () {
  if (!this.startedAt) return 0;
  const start = new Date(this.startedAt).getTime();
  const now = this.completedAt ? new Date(this.completedAt).getTime() : Date.now();
  return Math.max(0, now - start);
});

ExportJobSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > new Date(this.expiresAt);
});



ExportJobSchema.virtual('downloadUrl').get(function () {
  // Return direct path if it's already a URL, otherwise provide a placeholder route
  if (this.fileInfo && this.fileInfo.path) {
    const path = String(this.fileInfo.path);
    if (/^https?:\/\//i.test(path)) return path;
    // Local/dev download path - replace with signed URL generation in download service
    return `/api/exports/download/${this.jobId}`;
  }
  return null;
});

// toJSON transform - hide internal fields and convert ObjectIds to strings
ExportJobSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = String(ret._id);
    ret.user = ret.user ? String(ret.user) : null;
    delete ret._id;
    delete ret.__v;
    // Don't expose full error stack to clients by default
    if (ret.metadata && ret.metadata.errorStack) {
      delete ret.metadata.errorStack;
    }
    return ret;
  }
});

// Static methods
ExportJobSchema.statics.createJob = async function (userId, exportType, format, filters = {}, options = {}) {
  const jobId = uuidv4();
  const job = new this({
    user: userId,
    jobId,
    exportType,
    format,
    filters,
    options,
    status: 'pending',
    progress: 0
  });
  await job.save();
  return job;
};

ExportJobSchema.statics.getJobsForUser = function (userId, limit = 20) {
  const lim = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(lim);
};

ExportJobSchema.statics.cleanupExpired = async function () {
  const now = new Date();
  // Find expired jobs (expiresAt in past) and remove them
  const expired = await this.find({ expiresAt: { $lte: now } });
  const ids = expired.map(d => d._id);
  if (ids.length === 0) return { removed: 0 };

  // NOTE: Actual file removal from storage should be handled by a storage service.
  const res = await this.deleteMany({ _id: { $in: ids } });
  return { removed: res.deletedCount || 0 };
};

// Instance methods
ExportJobSchema.methods.updateProgress = async function (percent) {
  const pct = Math.max(0, Math.min(100, Number(percent) || 0));
  this.progress = pct;
  if (pct > 0 && this.status === 'pending') this.status = 'processing';
  if (!this.startedAt) this.startedAt = new Date();
  if (pct === 100) this.status = 'completed';
  await this.save();
  return this;
};

ExportJobSchema.methods.markComplete = async function (fileInfo = {}) {
  this.status = 'completed';
  this.progress = 100;
  this.fileInfo = this.fileInfo || {};
  Object.assign(this.fileInfo, fileInfo);
  if (!this.startedAt) this.startedAt = new Date();
  this.completedAt = new Date();

  // Set expiresAt to 7 days after completion unless provided
  if (!this.expiresAt && !(fileInfo && fileInfo.expiresAt)) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    this.expiresAt = expires;
    if (!this.fileInfo.expiresAt) this.fileInfo.expiresAt = expires;
  } else if (fileInfo && fileInfo.expiresAt) {
    this.expiresAt = new Date(fileInfo.expiresAt);
  }

  await this.save();
  return this;
};

ExportJobSchema.methods.markFailed = async function (error) {
  this.status = 'failed';
  this.progress = 0;
  this.metadata = this.metadata || {};
  this.metadata.errorMessage = error ? (error.message || String(error)) : 'Unknown error';
  this.metadata.errorStack = error && error.stack ? String(error.stack) : undefined;
  this.completedAt = new Date();
  await this.save();
  return this;
};

ExportJobSchema.methods.getDownloadUrl = function (opts = {}) {
  // If fileInfo.path is an absolute URL, return it directly.
  if (this.fileInfo && this.fileInfo.path) {
    const p = String(this.fileInfo.path);
    if (/^https?:\/\//i.test(p)) return p;
    // Otherwise, return an internal download route
    return `/api/exports/download/${this.jobId}`;
  }
  return null;
};

const ExportJob = mongoose.model('ExportJob', ExportJobSchema);
module.exports = ExportJob;
