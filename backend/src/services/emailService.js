const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');
const EmailTemplate = require('../models/EmailTemplate');
const EmailLog = require('../models/EmailLog');

// Register Handlebars helpers
registerHandlebarsHelpers();

// Transporter configuration
let transporter = null;
let isConnected = false;
let connectionError = null;

/**
 * Initialize transporter based on environment
 */
async function initializeTransporter() {
  try {
    const nodeEnv = process.env.NODE_ENV || 'development';
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpSecure = process.env.SMTP_SECURE === 'true';
    const emailFrom = process.env.EMAIL_FROM || 'noreply@luxurystay.com';
    const emailFromName = process.env.EMAIL_FROM_NAME || 'LuxuryStay Hotel';

    let config = {};

    if (nodeEnv === 'production' && smtpHost && smtpUser && smtpPass) {
      // Production SMTP
      config = {
        host: smtpHost,
        port: parseInt(smtpPort) || 587,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        pool: {
          maxConnections: 10,
          maxMessages: 100,
          rateDelta: 1000,
          rateLimit: 50
        }
      };
      console.log('Email service: Using production SMTP');
    } else if ((smtpHost || process.env.SENDGRID_API_KEY) && nodeEnv !== 'development') {
      // Alternative SMTP or SendGrid
      config = {
        host: smtpHost || 'smtp.sendgrid.net',
        port: parseInt(smtpPort) || 587,
        secure: smtpSecure,
        auth: {
          user: smtpUser || 'apikey',
          pass: smtpPass || process.env.SENDGRID_API_KEY
        }
      };
      console.log('Email service: Using alternative SMTP/SendGrid');
    } else {
      // Development: use Ethereal (fake SMTP service)
      const testAccount = await nodemailer.createTestAccount();
      config = {
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      };
      console.log('Email service: Using Ethereal test account for development');
      console.log('Preview URL will be available at:', testAccount.web);
    }

    transporter = nodemailer.createTransport(config);

    // Verify connection
    await transporter.verify();
    isConnected = true;
    connectionError = null;
    console.log('Email service: Transporter verified and ready');

    return { success: true, message: 'Email transporter initialized' };
  } catch (error) {
    isConnected = false;
    connectionError = error.message;
    console.error('Email service initialization error:', error.message);
    transporter = null;
    return { success: false, error: error.message };
  }
}

/**
 * Register Handlebars helpers
 */
function registerHandlebarsHelpers() {
  // Format date helper
  Handlebars.registerHelper('formatDate', function (date, format = 'DD MMM YYYY') {
    if (!date) return '';
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');

    const formats = {
      'DD MMM YYYY': `${pad(d.getDate())} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear()}`,
      'YYYY-MM-DD': `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      'DD/MM/YYYY': `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
    };

    return formats[format] || d.toISOString();
  });

  // Format currency helper
  Handlebars.registerHelper('formatCurrency', function (amount, currency = 'PKR') {
    if (!amount) return '';
    const symbols = { PKR: 'Rs.', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
    const symbol = symbols[currency] || currency;
    return `${symbol} ${parseFloat(amount).toFixed(2)}`;
  });

  // Pluralize helper
  Handlebars.registerHelper('pluralize', function (count, word) {
    return count === 1 ? word : word + 's';
  });

  // Uppercase helper
  Handlebars.registerHelper('uppercase', function (str) {
    return str ? str.toUpperCase() : '';
  });

  // Lowercase helper
  Handlebars.registerHelper('lowercase', function (str) {
    return str ? str.toLowerCase() : '';
  });

  // If comparison helper
  Handlebars.registerHelper('ifEq', function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this);
  });

  // Math helper
  Handlebars.registerHelper('add', function (a, b) {
    return a + b;
  });
}

/**
 * Sanitize email input to prevent injection
 */
function sanitizeEmailInput(input) {
  if (typeof input !== 'string') return input;
  // Remove suspicious characters that could be used in email injection
  return input.replace(/[\r\n%0a%0d]/g, '').slice(0, 500);
}

/**
 * Send raw email
 */
async function sendEmail(options) {
  try {
    if (!transporter) {
      throw new Error('Email transporter not initialized. Check SMTP configuration.');
    }

    const { to, subject, html, text, from, attachments = [], headers = {}, replyTo } = options;

    // Validate required fields
    if (!to || !subject) {
      throw new Error('Email requires "to" and "subject" fields');
    }

    // Sanitize inputs
    const sanitizedTo = sanitizeEmailInput(to);
    const sanitizedSubject = sanitizeEmailInput(subject);

    const mailOptions = {
      from: from || `${process.env.EMAIL_FROM_NAME || 'LuxuryStay'} <${process.env.EMAIL_FROM || 'noreply@luxurystay.com'}>`,
      to: sanitizedTo,
      subject: sanitizedSubject,
      html: html || text,
      text: text || html,
      attachments,
      headers
    };

    if (replyTo) {
      mailOptions.replyTo = sanitizeEmailInput(replyTo);
    }

    // Send email
    const response = await transporter.sendMail(mailOptions);

    const messageId = response.messageId || response.id;

    // Log successful send
    if (options.emailLogId) {
      await EmailLog.markSent(options.emailLogId, messageId);
    }

    // For Ethereal (development), provide preview URL
    let previewUrl = null;
    if (process.env.NODE_ENV !== 'production' && nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(response);
    }

    return {
      success: true,
      messageId,
      response,
      previewUrl,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Error sending email:', error.message);

    // Log failure
    if (options.emailLogId) {
      await EmailLog.findByIdAndUpdate(options.emailLogId, {
        status: 'failed',
        error: {
          message: error.message,
          code: error.code || 'SEND_ERROR'
        }
      });
    }

    return {
      success: false,
      error: error.message,
      message: 'Failed to send email'
    };
  }
}

/**
 * Send templated email with variable interpolation
 */
async function sendTemplatedEmail(templateName, recipientEmail, data = {}) {
  try {
    // Load template from database
    const template = await EmailTemplate.getByName(templateName);
    if (!template) {
      throw new Error(`Email template "${templateName}" not found`);
    }

    // Prepare template data with standard variables
    const templateData = {
      hotelName: process.env.HOTEL_NAME || 'LuxuryStay Hotel',
      hotelEmail: process.env.HOTEL_EMAIL || 'contact@luxurystay.com',
      hotelPhone: process.env.HOTEL_PHONE || '+1-800-LUXURY',
      hotelWebsite: process.env.HOTEL_WEBSITE || 'www.luxurystay.com',
      year: new Date().getFullYear(),
      ...data
    };

    // Compile and render template
    const htmlTemplate = Handlebars.compile(template.content?.html || '');
  const textTemplate = Handlebars.compile(template.content?.text || template.content?.html || '');

    const html = htmlTemplate(templateData);
    const text = textTemplate(templateData);

    // Compile subject
    const subjectTemplate = Handlebars.compile(template.subject);
    const subject = subjectTemplate(templateData);

    // Create email log entry
    const emailLog = new EmailLog({
      templateId: template._id,
      recipient: { email: recipientEmail },
      subject,
      category: template.category,
      metadata: data.metadata || {}
    });

    await emailLog.save();

    // Send email
    const result = await sendEmail({
      to: recipientEmail,
      subject,
      html,
      text,
      emailLogId: emailLog._id
    });

    if (result.success) {
      // Increment template usage
      template.incrementUsage().catch(err => {
        console.error('Error incrementing template usage:', err.message);
      });
    }

    return {
      ...result,
      emailLogId: emailLog._id,
      templateId: template._id
    };
  } catch (error) {
    console.error('Error sending templated email:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send templated email'
    };
  }
}

/**
 * Verify SMTP connection
 */
async function verifyConnection() {
  try {
    if (!transporter) {
      throw new Error('Transporter not initialized');
    }

    await transporter.verify();
    isConnected = true;
    connectionError = null;

    return {
      success: true,
      message: 'SMTP connection verified',
      connected: true
    };
  } catch (error) {
    isConnected = false;
    connectionError = error.message;

    return {
      success: false,
      message: `SMTP connection failed: ${error.message}`,
      connected: false,
      error: error.message
    };
  }
}

/**
 * Get transporter status
 */
function getTransporterStatus() {
  return {
    success: true,
    data: {
      isConnected,
      transporterReady: !!transporter,
      connectionError,
      poolStatus: transporter && transporter.transporter ? 'active' : 'inactive',
      environment: process.env.NODE_ENV || 'development'
    }
  };
}

/**
 * Initialize on module load (non-blocking)
 */
initializeTransporter().catch(err => {
  console.error('Email service initialization failed:', err.message);
});

module.exports = {
  // Core functions
  sendEmail,
  sendTemplatedEmail,

  // Connection management
  verifyConnection,
  getTransporterStatus,
  initializeTransporter,

  // Helpers
  registerHandlebarsHelpers,
  sanitizeEmailInput
};
