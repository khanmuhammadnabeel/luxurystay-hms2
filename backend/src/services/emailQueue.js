const EmailLog = require('../models/EmailLog');
const EmailTemplate = require('../models/EmailTemplate');

// In-memory queue storage
const queue = {
  high: [],
  normal: [],
  low: []
};

// Dead letter queue for failed emails
const deadLetterQueue = [];

// Rate limiting tracking
const recipientRateLimit = new Map(); // { email: [{ timestamp, count }] }
const categoryRateLimit = new Map(); // { category: [{ timestamp, count }] }

// Global configuration
const config = {
  maxEmailsPerMinute: 100,
  maxEmailsPerRecipientPerHour: 5,
  maxRetries: 3,
  retryBackoffMs: [1000, 5000, 15000], // 1s, 5s, 15s
  batchSize: 10,
  rateLimitCheckIntervalMs: 60000 // Clean up rate limit tracker every minute
};

// Processor state
let processorInterval = null;
let isProcessing = false;
let lastProcessTime = Date.now();

/**
 * Clean up old rate limit entries (older than 1 hour for recipients, 1 minute for global)
 */
function cleanupRateLimits() {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneMinuteAgo = now - 60 * 1000;

  // Clean recipient limits
  for (const [email, entries] of recipientRateLimit.entries()) {
    const filtered = entries.filter(e => e.timestamp > oneHourAgo);
    if (filtered.length === 0) {
      recipientRateLimit.delete(email);
    } else {
      recipientRateLimit.set(email, filtered);
    }
  }

  // Clean category limits
  for (const [category, entries] of categoryRateLimit.entries()) {
    const filtered = entries.filter(e => e.timestamp > oneMinuteAgo);
    if (filtered.length === 0) {
      categoryRateLimit.delete(category);
    } else {
      categoryRateLimit.set(category, filtered);
    }
  }
}

/**
 * Check if email can be sent based on rate limits
 */
function checkRateLimits(email, category) {
  const now = Date.now();

  // Check recipient rate limit (5 emails per hour)
  const recipientEntries = recipientRateLimit.get(email) || [];
  const recentRecipientEmails = recipientEntries.filter(
    e => e.timestamp > now - 60 * 60 * 1000
  );
  if (recentRecipientEmails.length >= config.maxEmailsPerRecipientPerHour) {
    return { allowed: false, reason: 'Recipient rate limit exceeded' };
  }

  // Check global rate limit (100 per minute)
  const globalEntries = Array.from(categoryRateLimit.values()).flat();
  const recentGlobalEmails = globalEntries.filter(e => e.timestamp > now - 60 * 1000);
  if (recentGlobalEmails.length >= config.maxEmailsPerMinute) {
    return { allowed: false, reason: 'Global rate limit exceeded' };
  }

  return { allowed: true };
}

/**
 * Record email send attempt for rate limiting
 */
function recordRateLimitEntry(email, category) {
  const now = Date.now();

  // Record recipient
  const recipientEntries = recipientRateLimit.get(email) || [];
  recipientEntries.push({ timestamp: now, count: 1 });
  recipientRateLimit.set(email, recipientEntries);

  // Record category
  const categoryEntries = categoryRateLimit.get(category) || [];
  categoryEntries.push({ timestamp: now, count: 1 });
  categoryRateLimit.set(category, categoryEntries);
}

/**
 * Add email to queue
 */
async function addToQueue(emailData, priority = 'normal') {
  try {
    if (!['high', 'normal', 'low'].includes(priority)) {
      priority = 'normal';
    }

    const { to, subject, html, text, category, templateId, metadata = {} } = emailData;

    if (!to || !subject) {
      throw new Error('Email requires "to" and "subject" fields');
    }

    // Create EmailLog entry
    const emailLog = new EmailLog({
      recipient: { email: to, name: emailData.recipientName },
      subject,
      category: category || 'alert',
      templateId,
      metadata,
      status: 'queued'
    });

    await emailLog.save();

    const queueItem = {
      id: emailLog._id,
      to,
      subject,
      html,
      text,
      category,
      templateId,
      metadata,
      attempts: 0,
      createdAt: new Date(),
      priority
    };

    queue[priority].push(queueItem);

    const totalQueued = queue.high.length + queue.normal.length + queue.low.length;

    return {
      success: true,
      queueId: emailLog._id,
      position: totalQueued,
      message: `Email queued with priority: ${priority}`
    };
  } catch (error) {
    console.error('Error adding email to queue:', error.message);
    throw error;
  }
}

/**
 * Send email using email service
 */
async function sendEmail(emailItem) {
  try {
    // Rate limit check BEFORE sending
    const rateLimitCheck = checkRateLimits(emailItem.to, emailItem.category);
    if (!rateLimitCheck.allowed) {
      throw new Error(`Rate limit: ${rateLimitCheck.reason}`);
    }

    // Record the send attempt
    recordRateLimitEntry(emailItem.to, emailItem.category);

    // Call email service
    try {
      const emailService = require('./emailService');
      const result = await emailService.sendEmail({
        to: emailItem.to,
        subject: emailItem.subject,
        html: emailItem.html,
        text: emailItem.text,
        category: emailItem.category,
        metadata: emailItem.metadata
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Email service returned failure');
      }
      
      // Update EmailLog
      await EmailLog.markSent(emailItem.id, result.messageId);
      
      // Simulate delivery after a short delay
      setTimeout(() => {
        EmailLog.markDelivered(emailItem.id).catch(err => {
          console.error('Error marking email as delivered:', err.message);
        });
      }, 2000);

      return { success: true, messageId: result.messageId };
    } catch (error) {
      // If emailService doesn't exist yet (during development), fallback to simulation
      if (error.code === 'MODULE_NOT_FOUND') {
        console.warn('emailService not found, using simulation mode');
        
        // Simulate success with 95% probability
        const isSuccess = Math.random() < 0.95;
        
        if (!isSuccess) {
          throw new Error('Simulated email send failure');
        }
        
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await EmailLog.markSent(emailItem.id, messageId);
        
        setTimeout(() => {
          EmailLog.markDelivered(emailItem.id).catch(err => {
            console.error('Error marking email as delivered:', err.message);
          });
        }, 2000);
        
        return { success: true, messageId };
      }
      
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Process next batch of emails from queue
 */
async function processQueue(batchSize = config.batchSize) {
  if (isProcessing) {
    console.log('Queue processor already running');
    return { success: false, message: 'Already processing' };
  }

  isProcessing = true;
  const processed = { sent: 0, failed: 0, retried: 0 };

  try {
    // Cleanup rate limits before processing
    cleanupRateLimits();

    let emailsToSend = [];

    // Collect emails from high priority first, then normal, then low
    for (const priority of ['high', 'normal', 'low']) {
      if (emailsToSend.length >= batchSize) break;
      const available = Math.min(batchSize - emailsToSend.length, queue[priority].length);
      emailsToSend = emailsToSend.concat(queue[priority].splice(0, available));
    }

    console.log(`Processing ${emailsToSend.length} emails from queue`);

    // Process each email
    for (const emailItem of emailsToSend) {
      try {
        await sendEmail(emailItem);
        processed.sent++;
      } catch (error) {
        console.error(`Error sending email ${emailItem.id}:`, error.message);

        emailItem.attempts += 1;

        if (emailItem.attempts < config.maxRetries) {
          // Schedule retry with backoff
          const backoffMs = config.retryBackoffMs[emailItem.attempts - 1];
          console.log(`Scheduled retry for ${emailItem.id} after ${backoffMs}ms (attempt ${emailItem.attempts}/${config.maxRetries})`);

          setTimeout(() => {
            // Re-add to normal priority queue for retry
            queue.normal.push(emailItem);
          }, backoffMs);

          processed.retried++;
        } else {
          // Max retries exceeded - move to dead letter queue
          console.error(`Email ${emailItem.id} failed after ${config.maxRetries} attempts, moving to dead letter queue`);

          await EmailLog.findByIdAndUpdate(emailItem.id, {
            status: 'failed',
            error: {
              message: error.message,
              code: 'MAX_RETRIES_EXCEEDED',
              stack: error.stack
            }
          });

          deadLetterQueue.push({ ...emailItem, failedAt: new Date(), error: error.message });
          processed.failed++;
        }
      }
    }

    lastProcessTime = Date.now();

    return {
      success: true,
      processed,
      queueLength: queue.high.length + queue.normal.length + queue.low.length,
      deadLetterQueueLength: deadLetterQueue.length
    };
  } catch (error) {
    console.error('Fatal error in queue processor:', error.message);
    return {
      success: false,
      message: error.message,
      processed
    };
  } finally {
    isProcessing = false;
  }
}

/**
 * Start automatic queue processor
 */
function startProcessor(intervalMs = 5000) {
  if (processorInterval) {
    console.warn('Processor already running');
    return { success: false, message: 'Processor already started' };
  }

  processorInterval = setInterval(() => {
    processQueue().catch(err => {
      console.error('Uncaught error in queue processor:', err.message);
    });
  }, intervalMs);

  console.log(`Email queue processor started with ${intervalMs}ms interval`);

  return {
    success: true,
    message: 'Processor started',
    interval: intervalMs
  };
}

/**
 * Stop automatic queue processor
 */
function stopProcessor() {
  if (!processorInterval) {
    return { success: false, message: 'Processor not running' };
  }

  clearInterval(processorInterval);
  processorInterval = null;

  console.log('Email queue processor stopped');

  return { success: true, message: 'Processor stopped' };
}

/**
 * Get current queue status
 */
function getQueueStatus() {
  const totalQueued = queue.high.length + queue.normal.length + queue.low.length;
  const nextRetry = queue.normal.length > 0 ? queue.normal[0].createdAt : null;

  return {
    success: true,
    data: {
      queued: {
        total: totalQueued,
        high: queue.high.length,
        normal: queue.normal.length,
        low: queue.low.length
      },
      deadLetterQueue: deadLetterQueue.length,
      isProcessing,
      lastProcessedAt: lastProcessTime,
      rateLimiting: {
        uniqueRecipients: recipientRateLimit.size,
        categories: Array.from(categoryRateLimit.keys())
      },
      config
    }
  };
}

/**
 * Get dead letter queue items
 */
function getDeadLetterQueue(limit = 50) {
  return {
    success: true,
    data: deadLetterQueue.slice(-limit),
    count: deadLetterQueue.length
  };
}

/**
 * Clear dead letter queue
 */
function clearDeadLetterQueue() {
  const count = deadLetterQueue.length;
  deadLetterQueue.length = 0;
  return { success: true, message: `Cleared ${count} items from dead letter queue` };
}

module.exports = {
  // Queue operations
  addToQueue,
  processQueue,

  // Processor control
  startProcessor,
  stopProcessor,

  // Status and monitoring
  getQueueStatus,
  getDeadLetterQueue,
  clearDeadLetterQueue,

  // Configuration
  config
};
