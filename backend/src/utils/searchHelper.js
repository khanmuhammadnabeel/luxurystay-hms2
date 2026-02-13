/**
 * Search Helper Utilities
 * Comprehensive search utilities for MongoDB queries with filtering, highlighting, and pagination
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const STOP_WORDS = [
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'can', 'it', 'this', 'that'
];

const SEARCHABLE_FIELDS = {
  User: ['name', 'email', 'phone', 'address'],
  Booking: ['guestName', 'email', 'bookingReference', 'specialRequests'],
  Room: ['name', 'description', 'type', 'roomNumber'],
  Invoice: ['invoiceNumber', 'description', 'reference'],
  Feedback: ['comment', 'title'],
  Service: ['name', 'description'],
  Complaint: ['title', 'description', 'resolution'],
  MaintenanceRequest: ['title', 'description', 'priority'],
  EmailLog: ['recipient.email', 'subject', 'category'],
  File: ['originalName', 'tags']
};

// ============================================================================
// 1. BUILD SEARCH QUERY
// ============================================================================

/**
 * Build MongoDB $or query from search term across multiple fields
 * Supports keyword-based search with fuzzy matching
 * @param {string} searchTerm - Search term
 * @param {string|Array} fields - Field(s) to search
 * @param {object} options - Search options
 * @param {boolean} options.exactMatch - Exact match required (default: false)
 * @param {boolean} options.caseSensitive - Case sensitive search (default: false)
 * @returns {object} MongoDB query object { $or: [...] }
 */
function buildSearchQuery(searchTerm, fields, options = {}) {
  try {
    if (!searchTerm || typeof searchTerm !== 'string') {
      return { $or: [] };
    }

    const {
      exactMatch = false,
      caseSensitive = false
    } = options;

    // Normalize fields to array
    const fieldArray = Array.isArray(fields) ? fields : [fields];

    // Sanitize search term
    const sanitized = sanitizeSearchTerm(searchTerm);
    if (!sanitized) {
      return { $or: [] };
    }

    // Get keywords
    const keywords = extractKeywords(sanitized);
    if (keywords.length === 0) {
      return { $or: [] };
    }

    // Build query conditions
    const conditions = [];

    fieldArray.forEach(field => {
      if (exactMatch) {
        // Exact match
        conditions.push({
          [field]: {
            $regex: `^${sanitized}$`,
            $options: caseSensitive ? '' : 'i'
          }
        });
      } else {
        // Contains any keyword
        keywords.forEach(keyword => {
          conditions.push({
            [field]: {
              $regex: keyword,
              $options: caseSensitive ? '' : 'i'
            }
          });
        });
        
        // Also match exact phrase
        conditions.push({
          [field]: {
            $regex: sanitized,
            $options: caseSensitive ? '' : 'i'
          }
        });
      }
    });

    return { $or: conditions };
  } catch (error) {
    console.error('Error building search query:', error.message);
    return { $or: [] };
  }
}

// ============================================================================
// 2. BUILD DATE RANGE FILTER
// ============================================================================

/**
 * Build MongoDB date range filter
 * @param {string} field - Field name
 * @param {Date|string} startDate - Start date (inclusive)
 * @param {Date|string} endDate - End date (inclusive)
 * @param {object} options - Filter options
 * @param {boolean} options.inclusive - Include boundary dates (default: true)
 * @returns {object} MongoDB filter { field: { $gte, $lte } }
 */
function buildDateRangeFilter(field, startDate, endDate, options = {}) {
  try {
    const { inclusive = true } = options;

    if (!field) return {};

    const filter = {};
    const dateFilter = {};

    // Parse dates
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Validate dates
    if (start && isNaN(start.getTime())) {
      console.warn('Invalid start date');
      return {};
    }
    if (end && isNaN(end.getTime())) {
      console.warn('Invalid end date');
      return {};
    }

    // Add date filters
    if (start) {
      dateFilter[inclusive ? '$gte' : '$gt'] = start;
    }
    if (end) {
      dateFilter[inclusive ? '$lte' : '$lt'] = end;
    }

    if (Object.keys(dateFilter).length > 0) {
      filter[field] = dateFilter;
    }

    return filter;
  } catch (error) {
    console.error('Error building date range filter:', error.message);
    return {};
  }
}

// ============================================================================
// 3. BUILD RANGE FILTER
// ============================================================================

/**
 * Build MongoDB numeric range filter
 * @param {string} field - Field name
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {object} MongoDB filter { field: { $gte, $lte } }
 */
function buildRangeFilter(field, min, max) {
  try {
    if (!field) return {};

    const filter = {};
    const rangeFilter = {};

    // Validate numbers
    const minNum = min !== null && min !== undefined ? parseFloat(min) : null;
    const maxNum = max !== null && max !== undefined ? parseFloat(max) : null;

    if (minNum !== null && !isNaN(minNum)) {
      rangeFilter.$gte = minNum;
    }
    if (maxNum !== null && !isNaN(maxNum)) {
      rangeFilter.$lte = maxNum;
    }

    if (Object.keys(rangeFilter).length > 0) {
      filter[field] = rangeFilter;
    }

    return filter;
  } catch (error) {
    console.error('Error building range filter:', error.message);
    return {};
  }
}

// ============================================================================
// 4. BUILD STATUS FILTER
// ============================================================================

/**
 * Build MongoDB status filter
 * @param {string} field - Field name
 * @param {string|Array} statuses - Status value(s)
 * @returns {object} MongoDB filter { field: { $in: statuses } } or { field: status }
 */
function buildStatusFilter(field, statuses) {
  try {
    if (!field || !statuses) return {};

    // Handle empty statuses
    if (Array.isArray(statuses) && statuses.length === 0) {
      return {};
    }

    // Single status
    if (typeof statuses === 'string') {
      return { [field]: statuses };
    }

    // Multiple statuses
    if (Array.isArray(statuses)) {
      return { [field]: { $in: statuses } };
    }

    return {};
  } catch (error) {
    console.error('Error building status filter:', error.message);
    return {};
  }
}

// ============================================================================
// 5. SANITIZE SEARCH TERM
// ============================================================================

/**
 * Sanitize search term by removing special regex characters
 * @param {string} term - Raw search term
 * @returns {string} Sanitized term
 */
function sanitizeSearchTerm(term) {
  try {
    if (!term || typeof term !== 'string') return '';

    // Remove special regex characters
    const sanitized = term
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex chars
      .trim() // Remove leading/trailing whitespace
      .replace(/\s+/g, ' '); // Normalize internal spaces

    // Limit length to prevent ReDoS
    return sanitized.substring(0, 100);
  } catch (error) {
    console.error('Error sanitizing search term:', error.message);
    return '';
  }
}

// ============================================================================
// 6. EXTRACT KEYWORDS
// ============================================================================

/**
 * Extract meaningful keywords from search term
 * Removes stop words and normalizes input
 * @param {string} term - Search term
 * @returns {Array} Array of keywords
 */
function extractKeywords(term) {
  try {
    if (!term || typeof term !== 'string') return [];

    // Split by spaces and special characters
    const words = term
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 0);

    // Filter out stop words and short terms
    const keywords = words
      .filter(word => !STOP_WORDS.includes(word) && word.length > 2)
      .slice(0, 10); // Max 10 keywords to avoid performance issues

    // Remove duplicates
    return [...new Set(keywords)];
  } catch (error) {
    console.error('Error extracting keywords:', error.message);
    return [];
  }
}

// ============================================================================
// 7. HIGHLIGHT MATCHES
// ============================================================================

/**
 * Add HTML highlighting to matching text
 * @param {string} text - Text to highlight
 * @param {string} term - Search term
 * @param {object} options - Highlight options
 * @param {number} options.maxLength - Max length of returned string (default: 500)
 * @param {boolean} options.ellipsis - Add ellipsis if truncated (default: true)
 * @returns {string} HTML string with <mark> tags
 */
function highlightMatches(text, term, options = {}) {
  try {
    if (!text || !term) return text;

    const {
      maxLength = 500,
      ellipsis = true
    } = options;

    // Escape HTML
    let escaped = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Truncate if needed
    if (escaped.length > maxLength) {
      escaped = escaped.substring(0, maxLength);
      if (ellipsis) {
        escaped += '...';
      }
    }

    // Highlight term (case-insensitive)
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const highlighted = escaped.replace(regex, '<mark>$1</mark>');

    return highlighted;
  } catch (error) {
    console.error('Error highlighting matches:', error.message);
    return text;
  }
}

// ============================================================================
// 8. GET SEARCHABLE FIELDS
// ============================================================================

/**
 * Get searchable fields for a model
 * @param {string} modelName - Model name
 * @returns {Array} Array of searchable field names
 */
function getSearchableFields(modelName) {
  try {
    if (!modelName || typeof modelName !== 'string') {
      return [];
    }

    const fields = SEARCHABLE_FIELDS[modelName];
    if (!Array.isArray(fields) || fields.length === 0) {
      console.warn(`No searchable fields defined for model: ${modelName}`);
      return [];
    }
    
    return fields;
  } catch (error) {
    console.error('Error getting searchable fields:', error.message);
    return [];
  }
}

/**
 * Register custom searchable fields for a model
 * @param {string} modelName - Model name
 * @param {Array} fields - Field names
 */
function registerSearchableFields(modelName, fields) {
  try {
    if (modelName && Array.isArray(fields)) {
      SEARCHABLE_FIELDS[modelName] = fields;
    }
  } catch (error) {
    console.error('Error registering searchable fields:', error.message);
  }
}

// ============================================================================
// 9. BUILD SORT OPTIONS
// ============================================================================

/**
 * Build MongoDB sort object
 * @param {string} sortBy - Field to sort by (default: createdAt)
 * @param {string} sortOrder - Sort order: asc|desc (default: desc)
 * @returns {object} MongoDB sort object { field: 1|-1 }
 */
function buildSortOptions(sortBy = 'createdAt', sortOrder = 'desc') {
  try {
    // Validate inputs
    if (typeof sortBy !== 'string' || !sortBy.trim()) {
      sortBy = 'createdAt';
    }

    const validOrders = ['asc', 'ascending', '1'];
    const isAscending = validOrders.includes(String(sortOrder).toLowerCase());
    const sortValue = isAscending ? 1 : -1;

    return {
      [sortBy]: sortValue
    };
  } catch (error) {
    console.error('Error building sort options:', error.message);
    return { createdAt: -1 };
  }
}

// ============================================================================
// 10. GET PAGINATION OPTIONS
// ============================================================================

/**
 * Calculate pagination skip and limit
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20, max: 100)
 * @returns {object} { skip, limit, page, totalPages } (totalPages needs total count)
 */
function getPaginationOptions(page = 1, limit = 20) {
  try {
    // Validate and normalize inputs
    let pageNum = parseInt(page);
    let limitNum = parseInt(limit);

    // Ensure positive integers
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 20;

    // Enforce maximum limit
    const maxLimit = 100;
    if (limitNum > maxLimit) limitNum = maxLimit;

    // Calculate skip
    const skip = (pageNum - 1) * limitNum;

    return {
      skip,
      limit: limitNum,
      page: pageNum
    };
  } catch (error) {
    console.error('Error getting pagination options:', error.message);
    return { skip: 0, limit: 20, page: 1 };
  }
}

/**
 * Calculate total pages
 * @param {number} total - Total document count
 * @param {number} limit - Items per page
 * @returns {number} Total pages
 */
function calculateTotalPages(total, limit) {
  try {
    const totalNum = parseInt(total) || 0;
    const limitNum = parseInt(limit) || 20;

    if (limitNum <= 0) return 0;
    return Math.ceil(totalNum / limitNum);
  } catch (error) {
    console.error('Error calculating total pages:', error.message);
    return 0;
  }
}

// ============================================================================
// ADVANCED SEARCH BUILDER
// ============================================================================

/**
 * Build complete search query with all filters
 * Combines search, date range, status, and range filters
 * @param {object} options - Search options
 * @param {string} options.searchTerm - Search term
 * @param {Array} options.searchFields - Fields to search
 * @param {string} options.dateField - Date field for range filter
 * @param {Date} options.startDate - Start date
 * @param {Date} options.endDate - End date
 * @param {string} options.statusField - Status field
 * @param {Array} options.statuses - Status values
 * @param {string} options.rangeField - Range field
 * @param {number} options.minValue - Min value
 * @param {number} options.maxValue - Max value
 * @returns {object} Combined MongoDB query filter
 */
function buildAdvancedSearchQuery(options = {}) {
  try {
    const filters = [];

    // Add search query
    if (options.searchTerm && options.searchFields) {
      const searchQuery = buildSearchQuery(
        options.searchTerm,
        options.searchFields,
        options.searchOptions
      );
      if (Object.keys(searchQuery.$or).length > 0) {
        filters.push(searchQuery);
      }
    }

    // Add date range filter
    if (options.dateField) {
      const dateFilter = buildDateRangeFilter(
        options.dateField,
        options.startDate,
        options.endDate,
        options.dateOptions
      );
      if (Object.keys(dateFilter).length > 0) {
        filters.push(dateFilter);
      }
    }

    // Add status filter
    if (options.statusField && options.statuses) {
      const statusFilter = buildStatusFilter(options.statusField, options.statuses);
      if (Object.keys(statusFilter).length > 0) {
        filters.push(statusFilter);
      }
    }

    // Add range filter
    if (options.rangeField) {
      const rangeFilter = buildRangeFilter(
        options.rangeField,
        options.minValue,
        options.maxValue
      );
      if (Object.keys(rangeFilter).length > 0) {
        filters.push(rangeFilter);
      }
    }

    // Combine all filters with $and
    if (filters.length === 0) {
      return {};
    }
    if (filters.length === 1) {
      return filters[0];
    }

    return { $and: filters };
  } catch (error) {
    console.error('Error building advanced search query:', error.message);
    return {};
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Core search functions
  buildSearchQuery,
  buildDateRangeFilter,
  buildRangeFilter,
  buildStatusFilter,
  sanitizeSearchTerm,
  extractKeywords,
  highlightMatches,
  getSearchableFields,
  registerSearchableFields,
  buildSortOptions,
  getPaginationOptions,
  calculateTotalPages,

  // Advanced functions
  buildAdvancedSearchQuery,

  // Constants
  STOP_WORDS,
  SEARCHABLE_FIELDS
};
