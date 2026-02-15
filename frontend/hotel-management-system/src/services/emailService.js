import api from './api';

// -----------------------------------------------------------------------------
// Endpoints
// -----------------------------------------------------------------------------
const endpoints = {
  send: '/api/email/send',
  bulk: '/api/email/bulk',
  logs: '/api/email/logs',
  stats: '/api/email/stats',
  preview: (templateName) => `/api/email/preview/${templateName}`,
  templates: '/api/email/templates',
  trackOpen: (id) => `/api/email/track/open/${id}`,
  trackClick: (id) => `/api/email/track/click/${id}`,
};

const baseURL = api.defaults.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Build query params – omit empty/undefined values
 */
function buildParams(params) {
  const result = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = Array.isArray(value) ? value.join(',') : value;
    }
  }
  return result;
}

/**
 * sendEmail(templateName, recipient, data, priority)
 * POST /api/email/send. Body: { templateName, recipient, data, priority }.
 * Returns { success, jobId, queued }.
 */
export async function sendEmail(
  templateName,
  recipient,
  data = {},
  priority = 'normal'
) {
  try {
    const response = await api.post(endpoints.send, {
      templateName,
      recipient,
      data,
      priority,
    });
    return {
      success: response?.success ?? true,
      jobId: response?.jobId ?? response?.job_id ?? response?.id,
      queued: response?.queued ?? response?.queuedAt ?? true,
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to send email';
    throw new Error(message);
  }
}

/**
 * sendBulkEmail(templateName, recipients, data, scheduleDate)
 * POST /api/email/bulk. Body: { templateName, recipients, data, scheduleDate }.
 * Returns { success, batchId, queuedCount }.
 */
export async function sendBulkEmail(
  templateName,
  recipients,
  data = {},
  scheduleDate = null
) {
  try {
    const body = { templateName, recipients, data };
    if (scheduleDate != null) {
      body.scheduleDate = scheduleDate;
    }
    const response = await api.post(endpoints.bulk, body);
    return {
      success: response?.success ?? true,
      batchId: response?.batchId ?? response?.batch_id ?? response?.id,
      queuedCount: response?.queuedCount ?? response?.queued_count ?? recipients?.length ?? 0,
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to send bulk email';
    throw new Error(message);
  }
}

/**
 * getEmailLogs(filters = {})
 * GET /api/email/logs. Query: status, category, page, limit, startDate, endDate.
 * Returns { data: logs[], pagination, summary }.
 */
export async function getEmailLogs(filters = {}) {
  try {
    const params = buildParams({
      status: filters.status,
      category: filters.category,
      page: filters.page,
      limit: filters.limit,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
    const response = await api.get(endpoints.logs, { params });
    return {
      data: response?.data ?? response?.logs ?? [],
      pagination: response?.pagination ?? null,
      summary: response?.summary ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null, summary: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch email logs';
    throw new Error(message);
  }
}

/**
 * getEmailStats(period = 'month')
 * GET /api/email/stats. Query: { period }.
 * Returns { metrics, rates, chartData }.
 */
export async function getEmailStats(period = 'month') {
  try {
    const params = buildParams({ period });
    const response = await api.get(endpoints.stats, { params });
    return {
      metrics: response?.metrics ?? response?.data ?? {},
      rates: response?.rates ?? {},
      chartData: response?.chartData ?? response?.chart ?? [],
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { metrics: {}, rates: {}, chartData: [] };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch email stats';
    throw new Error(message);
  }
}

/**
 * previewTemplate(templateName, data = {})
 * GET /api/email/preview/:templateName. Query: { data: JSON.stringify(data) }.
 * Returns { html, subject, variables }.
 */
export async function previewTemplate(templateName, data = {}) {
  try {
    const params = buildParams({
      data: Object.keys(data).length ? JSON.stringify(data) : undefined,
    });
    const response = await api.get(endpoints.preview(templateName), { params });
    return {
      html: response?.html ?? response?.body ?? '',
      subject: response?.subject ?? '',
      variables: response?.variables ?? response?.vars ?? [],
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Template not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to preview template';
    throw new Error(message);
  }
}

/**
 * getEmailTemplates()
 * GET /api/email/templates. Returns { data: templates[] }.
 */
export async function getEmailTemplates() {
  try {
    const response = await api.get(endpoints.templates);
    const data = response?.data ?? response?.templates ?? response;
    return {
      data: Array.isArray(data) ? data : [],
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [] };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch templates';
    throw new Error(message);
  }
}

/**
 * trackOpenPixel(id)
 * Returns the full URL for the open-tracking pixel (use in img tags).
 * GET to this URL returns a 1x1 image and records the open.
 */
export function trackOpenPixel(id) {
  const path = endpoints.trackOpen(id);
  return `${baseURL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * trackClickLink(id, url)
 * Returns the full URL for click tracking (use as href). User hits this URL, server records click and redirects to destination.
 * GET to endpoints.trackClick(id) with query { url }.
 */
export function trackClickLink(id, url) {
  const path = endpoints.trackClick(id);
  const fullPath = `${path.startsWith('/') ? path : `/${path}`}?url=${encodeURIComponent(url)}`;
  return `${baseURL.replace(/\/$/, '')}${fullPath}`;
}
