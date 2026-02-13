/**
 * exportHelper.js
 * Utilities for generating exports (CSV, Excel, PDF, JSON, ZIP) with streaming support
 */

const { PassThrough } = require('stream');
const os = require('os');
const path = require('path');
const { stringify } = (() => {
  try {
    return require('csv-stringify');
  } catch (e) {
    // minimal fallback
    return { stringify: (records, opts, cb) => {
      try {
        const delim = (opts && opts.delimiter) || ',';
        const headers = opts && opts.headers ? opts.headers : null;
        const rows = [];
        if (headers) rows.push(headers.join(delim));
        records.forEach(rec => {
          const vals = headers ? headers.map(h => JSON.stringify(rec[h] != null ? String(rec[h]) : '')) : Object.values(rec).map(v => JSON.stringify(v));
          rows.push(vals.join(delim));
        });
        cb(null, rows.join('\n'));
      } catch (err) { cb(err); }
    }};
  }
})();

let xlsx;
try { xlsx = require('xlsx'); } catch (e) { xlsx = null; }

let PDFDocument;
try { PDFDocument = require('pdfkit'); } catch (e) { PDFDocument = null; }

let archiver;
try { archiver = require('archiver'); } catch (e) { archiver = null; }

const DEFAULT_MAX_EXPORT_DAYS = 90; // for validateExportRequest

// Helper: flatten nested objects
function flattenObject(obj, prefix = '', res = {}) {
  if (obj === null || obj === undefined) return res;
  if (typeof obj !== 'object' || obj instanceof Date) {
    res[prefix] = obj;
    return res;
  }
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !(val instanceof Date) && !Array.isArray(val)) {
      flattenObject(val, newKey, res);
    } else {
      res[newKey] = val;
    }
  });
  return res;
}

// Helper: sanitize filename
function sanitizeFilename(name) {
  return String(name).replace(/[^a-z0-9-_\.]/gi, '_');
}

// 1. generateCSV
async function generateCSV(data = [], options = {}) {
  const headers = options.headers || null;
  const delimiter = options.delimiter || ',';
  const quoteStrings = options.quoteStrings !== false; // default true

  // Flatten objects and collect headers if not provided
  const rows = data.map(item => {
    if (typeof item === 'object') {
      return flattenObject(item);
    }
    return { value: item };
  });

  let hdrs = headers;
  if (!hdrs) {
    const keys = new Set();
    rows.forEach(r => Object.keys(r).forEach(k => keys.add(k)));
    hdrs = Array.from(keys);
  }

  return new Promise((resolve, reject) => {
    stringify(rows.map(r => hdrs.map(h => r[h] != null ? r[h] : '')), { header: !!headers, columns: hdrs, delimiter, quoted: quoteStrings }, (err, output) => {
      if (err) return reject(err);
      const filename = options.filename || `export_${Date.now()}.csv`;
      const buffer = Buffer.from(output, options.encoding || 'utf8');
      resolve({ csv: output, buffer, filename: sanitizeFilename(filename), size: buffer.length });
    });
  });
}

// 2. generateExcel
async function generateExcel(data = [], options = {}) {
  if (!xlsx) {
    throw new Error('xlsx library not installed');
  }

  const workbook = xlsx.utils.book_new();

  // Support multiple sheets via options.sheets: [{ name, data }]
  const sheets = options.sheets || [{ name: options.sheetName || 'Sheet1', data }];

  sheets.forEach(sheet => {
    let rows = sheet.data || [];
    // flatten and convert to array of objects
    const flat = rows.map(r => typeof r === 'object' ? flattenObject(r) : { value: r });
    const keys = options.columns || Array.from(flat.reduce((s, r) => { Object.keys(r).forEach(k => s.add(k)); return s; }, new Set()));
    const wsData = [keys, ...flat.map(r => keys.map(k => r[k] != null ? r[k] : ''))];
    const ws = xlsx.utils.aoa_to_sheet(wsData);

    // Apply column widths if provided
    if (options.columnWidths && Array.isArray(options.columnWidths)) {
      ws['!cols'] = options.columnWidths.map(w => ({ wch: w }));
    }

    xlsx.utils.book_append_sheet(workbook, ws, sanitizeFilename(sheet.name || 'Sheet'));
  });

  const buffer = xlsx.write(workbook, { bookType: options.bookType || 'xlsx', type: 'buffer' });
  const filename = options.filename || `export_${Date.now()}.xlsx`;
  return { buffer, filename: sanitizeFilename(filename), size: buffer.length };
}

// 3. generatePDF
async function generatePDF(data = [], options = {}) {
  if (!PDFDocument) throw new Error('pdfkit not installed');

  const doc = new PDFDocument({ size: options.pageSize || 'A4', layout: options.orientation || 'portrait', margins: options.margins || { top: 40, left: 40, right: 40, bottom: 40 } });
  const stream = new PassThrough();
  const chunks = [];
  doc.pipe(stream);
  stream.on('data', c => chunks.push(c));

  // Header
  if (options.title) {
    // After creating doc, register a fallback font
doc.registerFont('Noto', 'path/to/noto.ttf'); // You'd need to include this
doc.font('Noto');
doc.fontSize(16).text(options.title, { align: 'center' });
    doc.moveDown();
  }

  // Basic table rendering (simple)
  if (Array.isArray(data) && data.length > 0) {
    const flat = data.map(r => (typeof r === 'object') ? flattenObject(r) : { value: r });
    const keys = options.columns || Array.from(flat.reduce((s, r) => { Object.keys(r).forEach(k => s.add(k)); return s; }, new Set()));

    // Column headers
    doc.fontSize(10);
    keys.forEach(k => doc.text(String(k), { continued: true, width: 100 }));
    doc.moveDown(0.5);

    // Rows (simple, no table grid)
    flat.forEach(row => {
      keys.forEach(k => doc.text(String(row[k] != null ? row[k] : ''), { continued: true, width: 100 }));
      doc.moveDown(0.5);
    });
  } else {
    doc.fontSize(10).text(JSON.stringify(data, null, 2));
  }

  // Footer
  doc.moveDown();
  doc.fontSize(8).text(options.footer || '', { align: 'center' });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const filename = options.filename || `export_${Date.now()}.pdf`;
      resolve({ buffer, filename: sanitizeFilename(filename), size: buffer.length });
    });
    stream.on('error', err => reject(err));
  });
}

// 4. generateJSON
async function generateJSON(data = [], options = {}) {
  const pretty = options.pretty !== false;
  const replacer = options.replacer || null;
  const space = pretty ? 2 : 0;
  const json = JSON.stringify(data, replacer, space);
  const buffer = Buffer.from(json, options.encoding || 'utf8');
  const filename = options.filename || `export_${Date.now()}.json`;
  return { json, buffer, filename: sanitizeFilename(filename), size: buffer.length };
}

// 5. generateZIP
async function generateZIP(files = [], options = {}) {
  if (!archiver) throw new Error('archiver not installed');

  const archive = archiver('zip', { zlib: { level: options.compression || 9 } });
  const passthrough = new PassThrough();
  const chunks = [];
  archive.pipe(passthrough);
  passthrough.on('data', c => chunks.push(c));

  files.forEach(file => {
    // file: { name, buffer or path }
    if (file.buffer) {
      archive.append(file.buffer, { name: sanitizeFilename(file.name) });
    } else if (file.path) {
      archive.file(file.path, { name: sanitizeFilename(file.name) });
    }
  });

  archive.finalize();

  return new Promise((resolve, reject) => {
    passthrough.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const filename = options.filename || `export_${Date.now()}.zip`;
      resolve({ buffer, filename: sanitizeFilename(filename), size: buffer.length });
    });
    passthrough.on('error', err => reject(err));
  });
}

// 6. formatExportData
function formatExportData(data = [], exportType, options = {}) {
  // Transform each record: format dates, currency, booleans, remove sensitive
  const role = options.userRole || 'guest';
  const sensitiveFields = options.sensitiveFields || ['password', 'ssn', 'token', 'creditCard'];

  return data.map(rec => {
    const out = {};
    const flat = typeof rec === 'object' ? flattenObject(rec) : { value: rec };
    Object.keys(flat).forEach(k => {
      let v = flat[k];
      if (v instanceof Date) {
        v = options.dateFormat ? new Date(v).toISOString() : new Date(v).toISOString();
      }
      if (typeof v === 'boolean') v = v ? 'Yes' : 'No';
      if (typeof v === 'number' && options.currencyFields && options.currencyFields.includes(k)) {
        v = (options.currencyFormatter || (n => n.toFixed(2)))(v);
      }
      // Skip sensitive
      if (sensitiveFields.includes(k) || (options.removeFields && options.removeFields.includes(k))) return;
      out[k] = v;
    });

    // Role-based removal
    if (role !== 'admin' && options.removePrivateForNonAdmin) {
      // drop fields marked private
      (options.privateFields || []).forEach(pf => delete out[pf]);
    }

    return out;
  });
}

// 7. getExportFilename
function getExportFilename(exportType = 'export', format = 'csv', user = {}) {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const ts = `${y}${m}${d}`;
  const userId = user.role ? sanitizeFilename(user.role) : (user.id || user._id || 'unknown');
  const base = `export_${exportType}_${ts}_${userId}`;
  return `${base}.${format}`;
}

// 8. validateExportRequest
function validateExportRequest(user = {}, exportType = '', filters = {}) {
  // Basic permission checks
  const role = user.role || 'guest';
  const allowedByRole = {
    admin: ['bookings', 'invoices', 'financial', 'guests', 'search', 'analytics', 'custom'],
    manager: ['bookings', 'invoices', 'guests', 'search', 'analytics', 'custom'],
    staff: ['bookings', 'search', 'custom'],
    guest: ['bookings', 'search']
  };

  if (!allowedByRole[role] || !allowedByRole[role].includes(exportType)) {
    return { valid: false, message: 'Insufficient permissions for this export type' };
  }

  // Date range validation
  if (filters && filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { valid: false, message: 'Invalid date range' };
    const diffDays = Math.ceil((end - start) / (24 * 60 * 60 * 1000));
    if (diffDays > DEFAULT_MAX_EXPORT_DAYS) return { valid: false, message: `Date range too large. Max ${DEFAULT_MAX_EXPORT_DAYS} days` };
  }

  // Rate limiting placeholder (caller should enforce real limits)
  if (user._dailyExportCount && user._dailyExportCount > 50) {
    return { valid: false, message: 'Daily export limit reached' };
  }

  return { valid: true };
}

// 9. streamToResponse
async function streamToResponse(data, format, res, options = {}) {
  // format: csv, excel, pdf, json, zip
  // For large datasets, prefer streaming libraries. For now, we generate buffer and stream.
  if (!res || typeof res.setHeader !== 'function') throw new Error('Invalid response object');

  const lower = String(format || 'csv').toLowerCase();
  if (lower === 'csv') {
    const { buffer, filename, size } = await generateCSV(data, options);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', size);
    return res.send(buffer);
  }

  if (lower === 'excel' || lower === 'xlsx') {
    const { buffer, filename, size } = await generateExcel(data, options);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', size);
    return res.send(buffer);
  }

  if (lower === 'pdf') {
    const { buffer, filename, size } = await generatePDF(data, options);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', size);
    return res.send(buffer);
  }

  if (lower === 'json') {
    const { buffer, filename, size } = await generateJSON(data, options);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', size);
    return res.send(buffer);
  }

  if (lower === 'zip') {
    const { buffer, filename, size } = await generateZIP(data, options);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', size);
    return res.send(buffer);
  }

  throw new Error('Unsupported export format');
}

// 10. estimateFileSize
function estimateFileSize(data = [], format = 'csv') {
  // crude estimations
  const count = Array.isArray(data) ? data.length : 1;
  const avgFields = count ? Object.keys(flattenObject(data[0] || {})).length : 5;
  const avgLen = 20; // avg chars per field
  const bytesPerRecord = avgFields * avgLen;
  const total = bytesPerRecord * (count || 0);
  switch (String(format).toLowerCase()) {
    case 'csv': return Math.ceil(total * 1.1);
    case 'json': return Math.ceil(total * 1.5);
    case 'excel': return Math.ceil(total * 2);
    case 'pdf': return Math.ceil(total * 2.5);
    case 'zip': return Math.ceil(total * 0.6);
    default: return total;
  }
}

module.exports = {
  generateCSV,
  generateExcel,
  generatePDF,
  generateJSON,
  generateZIP,
  formatExportData,
  getExportFilename,
  validateExportRequest,
  streamToResponse,
  estimateFileSize
};
