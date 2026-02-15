import api from './api';

// -----------------------------------------------------------------------------
// Endpoints
// -----------------------------------------------------------------------------
const endpoints = {
  bookings: '/api/exports/bookings',
  invoices: '/api/exports/invoices',
  financial: '/api/exports/financial',
  guests: '/api/exports/guests',
  search: '/api/exports/search',
  analytics: '/api/exports/analytics',
  download: (jobId) => `/api/exports/${jobId}/download`,
  history: '/api/exports/history',
  status: (jobId) => `/api/exports/${jobId}/status`,
};

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
 * exportBookings(format, filters, options)
 * POST /api/exports/bookings. Body: { format, filters, options }.
 * Returns { success, jobId }.
 */
export async function exportBookings(format = 'csv', filters = {}, options = {}) {
  try {
    const response = await api.post(endpoints.bookings, {
      format,
      filters,
      options,
    });
    return {
      success: response?.success ?? true,
      jobId: response?.jobId ?? response?.job_id ?? response?.id,
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to export bookings';
    throw new Error(message);
  }
}

/**
 * exportInvoices(format, filters, options)
 * POST /api/exports/invoices. Body: { format, filters, options }.
 * Returns { success, jobId }.
 */
export async function exportInvoices(format = 'csv', filters = {}, options = {}) {
  try {
    const response = await api.post(endpoints.invoices, {
      format,
      filters,
      options,
    });
    return {
      success: response?.success ?? true,
      jobId: response?.jobId ?? response?.job_id ?? response?.id,
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to export invoices';
    throw new Error(message);
  }
}

/**
 * exportFinancial(format, filters, options)
 * POST /api/exports/financial. Body: { format, filters, options }.
 * Returns { success, jobId }.
 */
export async function exportFinancial(format = 'csv', filters = {}, options = {}) {
  try {
    const response = await api.post(endpoints.financial, {
      format,
      filters,
      options,
    });
    return {
      success: response?.success ?? true,
      jobId: response?.jobId ?? response?.job_id ?? response?.id,
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to export financial data';
    throw new Error(message);
  }
}

/**
 * exportGuests(format, filters, options)
 * POST /api/exports/guests. Body: { format, filters, options }.
 * Returns { success, jobId }.
 */
export async function exportGuests(format = 'csv', filters = {}, options = {}) {
  try {
    const response = await api.post(endpoints.guests, {
      format,
      filters,
      options,
    });
    return {
      success: response?.success ?? true,
      jobId: response?.jobId ?? response?.job_id ?? response?.id,
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to export guests';
    throw new Error(message);
  }
}

/**
 * exportSearch(format, searchQuery, filters, options)
 * POST /api/exports/search. Body: { format, searchQuery, filters, options }.
 * Returns { success, jobId }.
 */
export async function exportSearch(
  format = 'csv',
  searchQuery,
  filters = {},
  options = {}
) {
  try {
    const response = await api.post(endpoints.search, {
      format,
      searchQuery,
      filters,
      options,
    });
    return {
      success: response?.success ?? true,
      jobId: response?.jobId ?? response?.job_id ?? response?.id,
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to export search results';
    throw new Error(message);
  }
}

/**
 * exportAnalytics(format, period, metrics, options)
 * POST /api/exports/analytics. Body: { format, period, metrics, options }.
 * Returns { success, jobId }.
 */
export async function exportAnalytics(
  format = 'csv',
  period = 'month',
  metrics = [],
  options = {}
) {
  try {
    const response = await api.post(endpoints.analytics, {
      format,
      period,
      metrics,
      options,
    });
    return {
      success: response?.success ?? true,
      jobId: response?.jobId ?? response?.job_id ?? response?.id,
    };
  } catch (error) {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to export analytics';
    throw new Error(message);
  }
}

/**
 * downloadExport(jobId)
 * GET /api/exports/:jobId/download. responseType: 'blob'.
 * Returns Blob (binary file data).
 */
export async function downloadExport(jobId) {
  try {
    const blob = await api.get(endpoints.download(jobId), {
      responseType: 'blob',
    });
    return blob instanceof Blob ? blob : new Blob([blob]);
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Export file not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to download export';
    throw new Error(message);
  }
}

/**
 * File download helper: get blob from API, create object URL, trigger browser download, clean up.
 */
export async function downloadExportFile(jobId, filename = null) {
  const blob = await downloadExport(jobId);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? `export-${jobId}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * getExportHistory(filters = {})
 * GET /api/exports/history. Query: page, limit, status, exportType.
 * Returns { data: jobs[], pagination }.
 */
export async function getExportHistory(filters = {}) {
  try {
    const params = buildParams({
      page: filters.page,
      limit: filters.limit,
      status: filters.status,
      exportType: filters.exportType,
    });
    const response = await api.get(endpoints.history, { params });
    return {
      data: response?.data ?? response?.jobs ?? response?.history ?? [],
      pagination: response?.pagination ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { data: [], pagination: null };
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to fetch export history';
    throw new Error(message);
  }
}

/**
 * checkExportStatus(jobId)
 * GET /api/exports/:jobId/status. Returns { status, progress, fileInfo, error }.
 */
export async function checkExportStatus(jobId) {
  try {
    const response = await api.get(endpoints.status(jobId));
    return {
      status: response?.status ?? response?.state ?? null,
      progress: response?.progress ?? response?.percent ?? null,
      fileInfo: response?.fileInfo ?? response?.file_info ?? response?.file ?? null,
      error: response?.error ?? null,
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error('Export job not found');
    }
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Failed to check export status';
    throw new Error(message);
  }
}
