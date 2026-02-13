/**
 * Unit Tests - Example
 * Test utility functions with mocking
 */

const exportHelper = require('../../src/utils/exportHelper');
const searchHelper = require('../../src/utils/searchHelper');

describe('exportHelper', () => {
  describe('getExportFilename', () => {
    it('should generate filename with timestamp and user role', () => {
      const user = { _id: '123', role: 'admin' };
      const filename = exportHelper.getExportFilename('bookings', 'csv', user);
      
      expect(filename).toMatch(/^export_bookings_\d{8}_admin\.csv$/);
    });

    it('should handle missing user info gracefully', () => {
      const filename = exportHelper.getExportFilename('invoices', 'xlsx', {});
      
      expect(filename).toMatch(/^export_invoices_\d{8}_unknown\.xlsx$/);
    });

    it('should sanitize special characters in filename', () => {
      const user = { _id: '123', role: 'admin@special' };
      const filename = exportHelper.getExportFilename('test', 'pdf', user);
      
      expect(filename).not.toContain('@');
      expect(filename).toMatch(/\.pdf$/);
    });
  });

  describe('validateExportRequest', () => {
    it('should allow admin to export all types', () => {
      const user = { _id: '123', role: 'admin' };
      const result = exportHelper.validateExportRequest(user, 'financial', {});
      
      expect(result.valid).toBe(true);
    });

    it('should deny guest from exporting financial data', () => {
      const user = { _id: '123', role: 'guest' };
      const result = exportHelper.validateExportRequest(user, 'financial', {});
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('permissions');
    });

    it('should reject date range exceeding 90 days', () => {
      const user = { _id: '123', role: 'admin' };
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-04-01');
      
      const result = exportHelper.validateExportRequest(user, 'bookings', { startDate, endDate });
      
      expect(result.valid).toBe(false);
      expect(result.message).toContain('too large');
    });

    it('should accept valid date range', () => {
      const user = { _id: '123', role: 'admin' };
      const startDate = new Date();
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      const result = exportHelper.validateExportRequest(user, 'bookings', { startDate, endDate });
      
      expect(result.valid).toBe(true);
    });
  });

  describe('formatExportData', () => {
    it('should convert dates to ISO format', () => {
      const data = [{ createdAt: new Date('2025-01-01'), value: 100 }];
      const formatted = exportHelper.formatExportData(data, 'test', { dateFormat: true });
      
      expect(formatted[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should remove sensitive fields', () => {
      const data = [{ password: 'secret', email: 'test@example.com' }];
      const formatted = exportHelper.formatExportData(data, 'test', { sensitiveFields: ['password'] });
      
      expect(formatted[0]).not.toHaveProperty('password');
      expect(formatted[0]).toHaveProperty('email');
    });

    it('should convert boolean values to Yes/No', () => {
      const data = [{ active: true, deleted: false }];
      const formatted = exportHelper.formatExportData(data, 'test');
      
      expect(formatted[0].active).toBe('Yes');
      expect(formatted[0].deleted).toBe('No');
    });
  });

  describe('estimateFileSize', () => {
    it('should estimate size for CSV format', () => {
      const data = Array(100).fill({ field1: 'value', field2: 123 });
      const size = exportHelper.estimateFileSize(data, 'csv');
      
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(data.length * 1000); // rough upper bound
    });

    it('should estimate larger size for PDF than CSV', () => {
      const data = Array(50).fill({ field: 'value' });
      const csvSize = exportHelper.estimateFileSize(data, 'csv');
      const pdfSize = exportHelper.estimateFileSize(data, 'pdf');
      
      expect(pdfSize).toBeGreaterThan(csvSize);
    });
  });
});

describe('searchHelper', () => {
  describe('sanitizeSearchTerm', () => {
    it('should remove regex special characters', () => {
      const term = 'test.*+?^${}()|[\\]';
      const sanitized = searchHelper.sanitizeSearchTerm(term);
      
      expect(sanitized).not.toContain('*');
      expect(sanitized).not.toContain('+');
      expect(sanitized).not.toContain('?');
    });

    it('should limit term length to 100 chars', () => {
      const term = 'a'.repeat(200);
      const sanitized = searchHelper.sanitizeSearchTerm(term);
      
      expect(sanitized.length).toBeLessThanOrEqual(100);
    });

    it('should normalize whitespace', () => {
      const term = 'hello    world  test';
      const sanitized = searchHelper.sanitizeSearchTerm(term);
      
      expect(sanitized).not.toMatch(/\s{2,}/);
    });
  });

  describe('extractKeywords', () => {
    it('should remove stop words', () => {
      const term = 'the quick brown fox jumps';
      const keywords = searchHelper.extractKeywords(term);
      
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('quick');
      expect(keywords).toContain('brown');
      expect(keywords).toContain('fox');
    });

    it('should filter short terms', () => {
      const term = 'a an to be or room';
      const keywords = searchHelper.extractKeywords(term);
      
      keywords.forEach(kw => {
        expect(kw.length).toBeGreaterThan(2);
      });
    });

    it('should limit keywords to 10', () => {
      const term = 'room booking hotel guest service payment invoice feedback complaint maintenance';
      const keywords = searchHelper.extractKeywords(term);
      
      expect(keywords.length).toBeLessThanOrEqual(10);
    });

    it('should remove duplicates', () => {
      const term = 'booking booking booking hotel hotel';
      const keywords = searchHelper.extractKeywords(term);
      
      expect(new Set(keywords).size).toBe(keywords.length);
    });
  });

  describe('getPaginationOptions', () => {
    it('should return valid skip and limit', () => {
      const result = searchHelper.getPaginationOptions(2, 20);
      
      expect(result.skip).toBe(20);
      expect(result.limit).toBe(20);
      expect(result.page).toBe(2);
    });

    it('should enforce minimum page of 1', () => {
      const result = searchHelper.getPaginationOptions(0, 20);
      
      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it('should enforce maximum limit of 100', () => {
      const result = searchHelper.getPaginationOptions(1, 500);
      
      expect(result.limit).toBe(100);
    });

    it('should handle defaults', () => {
      const result = searchHelper.getPaginationOptions();
      
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(0);
    });
  });

  describe('buildSearchQuery', () => {
    it('should build MongoDB $or query', () => {
      const query = searchHelper.buildSearchQuery('test', ['name', 'email']);
      
      expect(query).toHaveProperty('$or');
      expect(Array.isArray(query.$or)).toBe(true);
      expect(query.$or.length).toBeGreaterThan(0);
    });

    it('should handle empty search term', () => {
      const query = searchHelper.buildSearchQuery('', ['name']);
      
      expect(query.$or).toEqual([]);
    });

    it('should support single field string', () => {
      const query = searchHelper.buildSearchQuery('test', 'email');
      
      expect(query).toHaveProperty('$or');
    });
  });

  describe('highlightMatches', () => {
    it('should wrap matches with <mark> tags', () => {
      const text = 'This is a test text';
      const highlighted = searchHelper.highlightMatches(text, 'test');
      
      expect(highlighted).toContain('<mark>test</mark>');
    });

    it('should truncate long text', () => {
      const longText = 'a'.repeat(1000);
      const highlighted = searchHelper.highlightMatches(longText, 'test', { maxLength: 100 });
      
      expect(highlighted.length).toBeLessThanOrEqual(104); // 100 + "..."
      expect(highlighted).toContain('...');
    });

    it('should escape HTML', () => {
      const text = '<script>alert("xss")</script>';
      const highlighted = searchHelper.highlightMatches(text, 'script');
      
      expect(highlighted).not.toContain('<script>');
      expect(highlighted).toContain('&lt;script&gt;');
    });
  });
});
