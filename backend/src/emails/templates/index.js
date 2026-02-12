const fs = require('fs');
const path = require('path');
const mjml2html = require('mjml');
const Handlebars = require('handlebars');

/**
 * Template cache to store compiled MJML templates
 */
const templateCache = new Map();

/**
 * List of available MJML templates
 */
const TEMPLATES = {
  'booking-confirmation': 'booking-confirmation.mjml',
  'checkin-reminder': 'checkin-reminder.mjml',
  'feedback-request': 'feedback-request.mjml',
  'password-reset': 'password-reset.mjml',
  'welcome-email': 'welcome-email.mjml',
  'payment-confirmation': 'payment-confirmation.mjml',
  'invoice-attached': 'invoice-attached.mjml',
  'booking-cancellation': 'booking-cancellation.mjml'
};

/**
 * Load and compile an MJML template
 * @param {string} templateName - Name of the template to load
 * @returns {object} Compiled template object with mjml and text
 * @throws {Error} If template not found
 */
function loadTemplate(templateName) {
  // Check cache first
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName);
  }

  // Validate template name
  if (!TEMPLATES[templateName]) {
    throw new Error(`Template "${templateName}" not found. Available templates: ${Object.keys(TEMPLATES).join(', ')}`);
  }

  try {
    // Read MJML file
    const templatePath = path.join(__dirname, TEMPLATES[templateName]);
    const mjmlContent = fs.readFileSync(templatePath, 'utf-8');

    // Compile MJML to HTML
    const { html: compiledHtml } = mjml2html(mjmlContent);

    // Store in cache
    const compiledTemplate = {
      name: templateName,
      mjmlPath: templatePath,
      mjmlContent,
      compiledHtml,
      lastLoaded: new Date()
    };

    templateCache.set(templateName, compiledTemplate);

    return compiledTemplate;
  } catch (error) {
    throw new Error(`Error loading template "${templateName}": ${error.message}`);
  }
}

/**
 * Render a template with provided data
 * @param {string} templateName - Name of the template to render
 * @param {object} data - Data object for template interpolation
 * @returns {object} Object containing html and text versions
 * @throws {Error} If template not found or rendering fails
 */
function renderTemplate(templateName, data = {}) {
  try {
    // Load template
    const template = loadTemplate(templateName);

    // Compile the HTML with Handlebars
    const htmlTemplate = Handlebars.compile(template.compiledHtml);
    const html = htmlTemplate(data);

    // Extract text version (simple version)
    // This removes HTML tags to create a text-only version
    const text = html
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();

    return {
      success: true,
      templateName,
      html,
      text,
      renderedAt: new Date()
    };
  } catch (error) {
    return {
      success: false,
      templateName,
      error: error.message
    };
  }
}

/**
 * Get list of available templates
 * @returns {array} Array of available template names
 */
function getAvailableTemplates() {
  return Object.keys(TEMPLATES);
}

/**
 * Clear template cache
 * Useful for development or when templates are updated
 */
function clearCache() {
  templateCache.clear();
}

/**
 * Get template cache statistics
 * @returns {object} Cache statistics
 */
function getCacheStats() {
  return {
    cachedCount: templateCache.size,
    cacheSize: new Map([...templateCache.entries()].map(([key, value]) => [
      key,
      {
        mjmlSize: value.mjmlContent.length,
        htmlSize: value.compiledHtml.length
      }
    ])),
    lastUpdated: new Date()
  };
}

/**
 * Preload all templates into cache
 * Useful for improving performance on startup
 * @returns {object} Result of preload operation
 */
function preloadAllTemplates() {
  const results = {
    success: [],
    failed: [],
    timestamp: new Date()
  };

  Object.keys(TEMPLATES).forEach(templateName => {
    try {
      loadTemplate(templateName);
      results.success.push(templateName);
    } catch (error) {
      results.failed.push({
        template: templateName,
        error: error.message
      });
    }
  });

  return results;
}

// Preload templates on module load for better performance
preloadAllTemplates().then(result => {
  if (result.failed.length > 0) {
    console.warn('Some email templates failed to load:', result.failed);
  } else {
    console.log(`✓ All ${result.success.length} email templates preloaded successfully`);
  }
}).catch(err => {
  console.error('Error preloading email templates:', err.message);
});

module.exports = {
  // Core template functions
  loadTemplate,
  renderTemplate,
  
  // Utility functions
  getAvailableTemplates,
  clearCache,
  getCacheStats,
  preloadAllTemplates,
  
  // Constants
  TEMPLATES
};
