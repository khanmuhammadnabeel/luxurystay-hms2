const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['booking', 'payment', 'feedback', 'auth', 'promotional', 'alert', 'report'],
    required: [true, 'Category is required']
  },
  design: {
    type: String,
    enum: ['mjml', 'html', 'text'],
    default: 'mjml'
  },
  content: {
    html: String,
    mjml: String,
    text: String
  },
  variables: [
    {
      type: String,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9_]+$/.test(v);
        },
        message: 'Variables must be alphanumeric with underscores only'
      }
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    version: { type: Number, default: 1 },
    lastUsed: Date,
    usageCount: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
// emailTemplateSchema.index({ name: 1 });
emailTemplateSchema.index({ category: 1 });
emailTemplateSchema.index({ isActive: 1 });

// Ensure virtuals are returned
emailTemplateSchema.set('toObject', { virtuals: true });
emailTemplateSchema.set('toJSON', { virtuals: true });

// Virtual field for creator details
emailTemplateSchema.virtual('createdByDetails', {
  ref: 'User',
  localField: 'createdBy',
  foreignField: '_id',
  justOne: true
});

// Pre-save hook: validate content, update updatedAt, extract variables
emailTemplateSchema.pre('save', function (next) {
  const self = this;

  // Update updatedAt
  this.updatedAt = Date.now();

  // Validate: at least one content field must be present
  if (!this.content.html && !this.content.mjml && !this.content.text) {
    return next(new Error('At least one content field (html, mjml, or text) is required'));
  }

  // Validate design vs content
  if (this.design === 'mjml' && !this.content.mjml) {
    return next(new Error('MJML content is required when design is set to mjml'));
  }

  if (this.design === 'html' && !this.content.html) {
    return next(new Error('HTML content is required when design is set to html'));
  }

// Auto-extract variables from template content
const contentStr = this.content.html || this.content.mjml || this.content.text || '';
const variablePattern = /\{\{\s*([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\s*\}\}/g;
const extracted = new Set();
let match;

while ((match = variablePattern.exec(contentStr)) !== null) {
  // Get the base variable name before any dot notation
  const fullMatch = match[1];
  const baseVariable = fullMatch.split('.')[0];
  extracted.add(baseVariable);
}

this.variables = Array.from(extracted);

  next();
});

// Instance method: render template with data
emailTemplateSchema.methods.render = function (data) {
  const template = this;
  const content = template.content.html || template.content.mjml || template.content.text || '';

  let rendered = content;

  // Replace variables in content
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    rendered = rendered.replace(regex, String(value));
  }

  // Replace subject variables
  let renderedSubject = template.subject;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    renderedSubject = renderedSubject.replace(regex, String(value));
  }

  return {
    subject: renderedSubject,
    html: template.content.html ? rendered : null,
    text: template.content.text ? rendered : null
  };
};

// Instance method: increment usage
emailTemplateSchema.methods.incrementUsage = async function () {
  this.metadata.usageCount += 1;
  this.metadata.lastUsed = new Date();
  return this.save();
};

// Static method: get template by name
emailTemplateSchema.statics.getByName = function (name) {
  return this.findOne({ name, isActive: true });
};

// Static method: get templates by category
emailTemplateSchema.statics.getByCategory = function (category) {
  return this.find({ category, isActive: true })
    .sort({ name: 1 })
    .lean();
};

// Static method: render template by name with data
emailTemplateSchema.statics.render = async function (templateName, data) {
  const template = await this.getByName(templateName);
  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }

  const rendered = template.render(data);

  // Use Promise.resolve to handle asynchronously without blocking
setImmediate(() => {
  template.incrementUsage().catch(err => 
    console.error(`Error incrementing usage for template ${template.name}:`, err)
  );
});

  return rendered;
};

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

module.exports = EmailTemplate;
