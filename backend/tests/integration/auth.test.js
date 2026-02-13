/**
 * Integration Tests - Authentication
 * Test register, login, and protected routes
 */

const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

// Mock app - in real scenario, import from src/app.js
const app = require('../../src/app');

describe('Authentication Routes', () => {
  let authToken;
  let refreshToken;
  let userId;

  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'SecurePassword123!',
    phone: '+1234567890',
    role: 'guest'
  };

  // ============================================================================
  // REGISTER TESTS
  // ============================================================================

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');

      // Verify user in database
      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(testUser.name);
    });

    it('should reject duplicate email', async () => {
      // Create user first
      await User.create(testUser);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('email');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' }) // missing name, password, phone
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalid-email' })
        .expect(400);

      expect(response.body.message).toContain('invalid');
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, password: 'weak' })
        .expect(400);

      expect(response.body.message).toContain('password');
    });

    it('should hash password before saving', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const user = await User.findOne({ email: testUser.email });
      expect(user.password).not.toBe(testUser.password);
      expect(user.password).not.toContain('SecurePassword');
    });
  });

  // ============================================================================
  // LOGIN TESTS
  // ============================================================================

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await User.create(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(testUser.email);

      authToken = response.body.data.token;
      refreshToken = response.body.data.refreshToken;
      userId = response.body.data.user._id || response.body.data.userId;
    });

    it('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword123!' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('invalid');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: testUser.password })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email }) // missing password
        .expect(400);

      expect(response.body.message).toContain('password');
    });

    it('should return valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      const token = response.body.data.token;
      const decoded = jwt.decode(token);

      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('email', testUser.email);
      expect(decoded).toHaveProperty('role', testUser.role);
    });
  });

  // ============================================================================
  // PROTECTED ROUTES TESTS
  // ============================================================================

  describe('Protected Routes', () => {
    beforeEach(async () => {
      const user = await User.create(testUser);
      userId = user._id;

      // Get token
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      authToken = response.body.data.token;
    });

    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('token');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject requests with expired token', async () => {
      // Create expired token
      const expiredToken = jwt.sign(
        { userId, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('expired');
    });

    it('should allow requests with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('email', testUser.email);
    });
  });

  // ============================================================================
  // LOGOUT TESTS
  // ============================================================================

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      const user = await User.create(testUser);
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      authToken = response.body.data.token;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject further requests with same token after logout', async () => {
      // First logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      // Try to use token again
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  // ============================================================================
  // REFRESH TOKEN TESTS
  // ============================================================================

  describe('POST /api/auth/refresh', () => {
    beforeEach(async () => {
      const user = await User.create(testUser);
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      authToken = response.body.data.token;
      refreshToken = response.body.data.refreshToken;
    });

    it('should generate new token from refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.token).not.toBe(authToken); // Should be new
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid.refresh.token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  // ============================================================================
  // PASSWORD RESET TESTS
  // ============================================================================

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await User.create(testUser);
    });

    it('should handle password reset request', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('email');
    });

    it('should accept non-existent email gracefully (security)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200); // Don't reveal if email exists

      expect(response.body).toHaveProperty('success', true);
    });
  });
});
