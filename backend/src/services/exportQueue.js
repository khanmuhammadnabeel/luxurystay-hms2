/**
 * exportQueue.js
 * Background queue processor for export jobs.
 * - In-memory priority queue with concurrency control
 * - Retry/backoff, temporary file handling
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const ExportJob = require('../models/ExportJob');
const exportHelper = require('../utils/exportHelper');

const DEFAULT_CONCURRENCY = 2;
const RETRY_DELAYS = [1000, 5000, 15000];
const MAX_ATTEMPTS = 3;

// In-memory queue structures
const queues = { high: [], normal: [], low: [] };

let processingCount = 0;
let _processorInterval = null;
let _intervalMs = 5000;
let _stopped = true;
const processingSet = new Set();
const deadLetter = [];

function _enqueueInMemory(item, priority = 'normal') {
  const q = queues[priority] || queues.normal;
  q.push(item);
}

function _dequeueInMemory() {
  if (queues.high.length) return queues.high.shift();
  if (queues.normal.length) return queues.normal.shift();
  if (queues.low.length) return queues.low.shift();
  return null;
}

async function _saveTempFile(bufferOrPath, filename) {
  if (!bufferOrPath) throw new Error('No file content');
  const tmpDir = path.join(os.tmpdir(), 'luxurystay_exports');
  await fs.promises.mkdir(tmpDir, { recursive: true });
  const filePath = path.join(tmpDir, sanitizeFilename(filename || `export_${Date.now()}`));

  if (Buffer.isBuffer(bufferOrPath)) {
    await fs.promises.writeFile(filePath, bufferOrPath);
  } else if (typeof bufferOrPath === 'string') {
    await fs.promises.copyFile(bufferOrPath, filePath);
  } else {
    throw new Error('Unsupported file content');
  }

  return filePath;
}

function sanitizeFilename(name) {
  return String(name).replace(/[^a-z0-9-_.]/gi, '_');
}

async function _moveToFinalStorage(tempPath, destPath) {
  const destDir = path.dirname(destPath);
  await fs.promises.mkdir(destDir, { recursive: true });
  await fs.promises.rename(tempPath, destPath);
  return destPath;
}

async function addToQueue(jobId, exportType, format, filters = {}, options = {}, priority = 'normal') {
  if (!['high', 'normal', 'low'].includes(priority)) priority = 'normal';

  try {
    await ExportJob.findOneAndUpdate({ jobId }, { status: 'pending', progress: 0 }, { new: true });
  } catch (e) {}

  const item = { jobId, exportType, format, filters, options, attempts: 0, maxAttempts: MAX_ATTEMPTS, priority };
  _enqueueInMemory(item, priority);
  return { queued: true, jobId };
}

async function _processJobItem(item) {
  const { jobId, exportType, format, filters, options } = item;
  if (!jobId) return;
  if (processingSet.has(jobId)) return;

  processingSet.add(jobId);
  processingCount++;

  try {
    await ExportJob.findOneAndUpdate({ jobId }, { status: 'processing', startedAt: new Date(), progress: 5 }, { new: true });

    const fmt = String(format || 'csv').toLowerCase();
    
    // Fetch data based on exportType
    let inputData = [];
    try {
      if (exportType === 'bookings') {
        const Booking = require('../models/Booking');
        inputData = await Booking.find(filters || {}).lean();
      } else if (exportType === 'invoices') {
        const Invoice = require('../models/Invoice');
        inputData = await Invoice.find(filters || {}).lean();
      } else if (exportType === 'guests') {
        const User = require('../models/User');
        inputData = await User.find({ role: 'guest', ...filters }).lean();
      } else if (exportType === 'financial') {
        const Payment = require('../models/Payment');
        inputData = await Payment.find(filters || {}).lean();
      } else {
        inputData = options.data || [];
      }
    } catch (fetchErr) {
      console.error(`Error fetching data for export ${jobId}:`, fetchErr.message);
      throw new Error(`Failed to fetch export data: ${fetchErr.message}`);
    }

    // Generate export based on format
    let result;
    if (fmt === 'csv') {
      result = await exportHelper.generateCSV(inputData, { 
        filename: options.filename || `export_${jobId}.csv`,
        headers: options.headers,
        delimiter: options.delimiter
      });
    } else if (fmt === 'json') {
      result = await exportHelper.generateJSON(inputData, { 
        filename: options.filename || `export_${jobId}.json`,
        pretty: options.pretty
      });
    } else if (fmt === 'xlsx' || fmt === 'excel') {
      result = await exportHelper.generateExcel(inputData, { 
        filename: options.filename || `export_${jobId}.xlsx`,
        sheets: options.sheets,
        columns: options.columns
      });
    } else if (fmt === 'pdf') {
      result = await exportHelper.generatePDF(inputData, { 
        title: options.title,
        filename: options.filename || `export_${jobId}.pdf`
      });
    } else {
      result = await exportHelper.generateJSON(inputData, { 
        filename: options.filename || `export_${jobId}.json` 
      });
    }

    const finalFilename = options.filename || result.filename || `export_${jobId}.${format}`;
    const tempPath = await _saveTempFile(result.buffer || result.csv || result.json || result, finalFilename);

    const storageDir = options.storageDir || path.join(process.cwd(), 'exports');
    const finalPath = path.join(storageDir, sanitizeFilename(finalFilename));
    await _moveToFinalStorage(tempPath, finalPath);

    const fileInfo = {
      filename: path.basename(finalPath),
      path: finalPath,
      size: (await fs.promises.stat(finalPath)).size,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    await ExportJob.findOneAndUpdate(
      { jobId },
      { status: 'completed', progress: 100, fileInfo, completedAt: new Date(), expiresAt: fileInfo.expiresAt }
    );

    processingSet.delete(jobId);
    processingCount--;
    return { success: true, jobId };
  } catch (err) {
    console.error(`Error processing export ${jobId}:`, err.message);
    
    item.attempts = (item.attempts || 0) + 1;

    if (item.attempts < MAX_ATTEMPTS) {
      await ExportJob.findOneAndUpdate(
        { jobId },
        { 'metadata.errorMessage': err.message, progress: 0 }
      );
      const delay = RETRY_DELAYS[Math.min(item.attempts - 1, RETRY_DELAYS.length - 1)];
      setTimeout(() => {
        _enqueueInMemory(item, item.priority || 'normal');
      }, delay);
    } else {
      deadLetter.push({ item, error: err.message });
      await ExportJob.findOneAndUpdate(
        { jobId },
        { status: 'failed', 'metadata.errorMessage': err.message, progress: 0 }
      );
    }

    processingSet.delete(jobId);
    processingCount--;
    return { success: false, jobId, error: err.message };
  }
}

async function processQueue() {
  if (processingCount >= DEFAULT_CONCURRENCY) return;

  const next = _dequeueInMemory();
  if (!next) return;
  
  _processJobItem(next).catch(err => {
    console.error('Export queue processing error:', err.message);
  });
}

function startProcessor(intervalMs = 5000) {
  if (!_stopped) return;
  _stopped = false;
  _intervalMs = intervalMs;
  _processorInterval = setInterval(() => {
    for (let i = 0; i < (DEFAULT_CONCURRENCY - processingCount); i++) {
      processQueue().catch(() => {});
    }
  }, _intervalMs);
  
}

function stopProcessor() {
  if (_processorInterval) clearInterval(_processorInterval);
  _processorInterval = null;
  _stopped = true;
}

async function getQueueStatus() {
  const queued = queues.high.length + queues.normal.length + queues.low.length;
  const processing = processingCount;
  const completed = await ExportJob.countDocuments({ status: 'completed' }).catch(() => 0);
  const failed = await ExportJob.countDocuments({ status: 'failed' }).catch(() => 0);
  return { queued, processing, completed, failed, deadLetterCount: deadLetter.length };
}

module.exports = {
  addToQueue,
  processQueue,
  startProcessor,
  stopProcessor,
  getQueueStatus,
  _queues: queues,
  _deadLetter: deadLetter
};