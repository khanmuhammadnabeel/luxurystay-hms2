/**
 * Integration Tests - Booking
 * Test CRUD operations, permissions, and validation
 */

const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Booking = require('../../src/models/Booking');
const Room = require('../../src/models/Room');

// Mock app
const app = require('../../src/app');

describe('Booking Routes', () => {
  let guestToken;
  let adminToken;
  let guestId;
  let adminId;
  let roomId;
  let bookingId;

  const guestUser = {
    name: 'Guest User',
    email: 'guest@example.com',
    password: 'SecurePassword123!',
    phone: '+1234567890',
    role: 'guest'
  };

  const adminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    phone: '+0987654321',
    role: 'admin'
  };

  const testRoom = {
    roomNumber: '101',
    type: 'double',
    description: 'Luxury double room',
    pricePerNight: 150,
    capacity: 2,
    amenities: ['wifi', 'ac', 'tv', 'mini-bar'],
    status: 'available'
  };

  const testBooking = {
    guestName: 'John Doe',
    checkInDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    checkOutDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    numberOfRooms: 1,
    numberOfGuests: 2,
    roomType: 'double',
    totalAmount: 750,
    status: 'pending'
  };

  // ============================================================================
  // SETUP
  // ============================================================================

  beforeAll(async () => {
    // Create users
    const guest = await User.create(guestUser);
    const admin = await User.create(adminUser);
    guestId = guest._id;
    adminId = admin._id;

    // Create room
    const room = await Room.create(testRoom);
    roomId = room._id;

    // Login and get tokens
    let response = await request(app)
      .post('/api/auth/login')
      .send({ email: guestUser.email, password: guestUser.password });
    guestToken = response.body.data.token;

    response = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });
    adminToken = response.body.data.token;
  });

  // ============================================================================
  // CREATE BOOKING TESTS
  // ============================================================================

  describe('POST /api/bookings', () => {
    it('should create a booking successfully', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ ...testBooking, roomId, guestId })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('bookingReference');
      expect(response.body.data.status).toBe('pending');

      bookingId = response.body.data._id;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ guestName: 'John' }) // missing other required fields
        .expect(400);

      expect(response.body.message).toContain('error');
    });

    it('should reject invalid date range', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          ...testBooking,
          roomId,
          checkInDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          checkOutDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // checkOut before checkIn
        })
        .expect(400);

      expect(response.body.message).toContain('date');
    });

    it('should reject past check-in dates', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          ...testBooking,
          roomId,
          checkInDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // yesterday
        })
        .expect(400);

      expect(response.body.message).toContain('past');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .send({ ...testBooking, roomId })
        .expect(401);

      expect(response.body.message).toContain('token');
    });
  });

  // ============================================================================
  // GET BOOKING TESTS
  // ============================================================================

  describe('GET /api/bookings', () => {
    beforeEach(async () => {
      // Create a test booking
      const booking = await Booking.create({
        ...testBooking,
        guestId,
        roomId,
        bookingReference: 'TEST-001'
      });
      bookingId = booking._id;
    });

    it('should list guest bookings', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/bookings?page=1&limit=10')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/bookings?status=pending')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      response.body.data.forEach(booking => {
        expect(booking.status).toBe('pending');
      });
    });

    it('should allow admin to see all bookings', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should restrict guest to own bookings', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      response.body.data.forEach(booking => {
        expect(booking.guestId.toString()).toBe(guestId.toString());
      });
    });
  });

  // ============================================================================
  // GET SINGLE BOOKING TESTS
  // ============================================================================

  describe('GET /api/bookings/:id', () => {
    beforeEach(async () => {
      const booking = await Booking.create({
        ...testBooking,
        guestId,
        roomId,
        bookingReference: 'TEST-002'
      });
      bookingId = booking._id;
    });

    it('should return booking details', async () => {
      const response = await request(app)
        .get(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('bookingReference');
      expect(response.body.data._id).toBe(bookingId.toString());
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/bookings/${fakeId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should reject invalid booking ID', async () => {
      const response = await request(app)
        .get('/api/bookings/invalid-id')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  // ============================================================================
  // UPDATE BOOKING TESTS
  // ============================================================================

  describe('PUT /api/bookings/:id', () => {
    beforeEach(async () => {
      const booking = await Booking.create({
        ...testBooking,
        guestId,
        roomId,
        bookingReference: 'TEST-003'
      });
      bookingId = booking._id;
    });

    it('should update booking status', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.status).toBe('confirmed');
    });

    it('should prevent guest from canceling others bookings', async () => {
      // Create booking by admin
      const otherBooking = await Booking.create({
        ...testBooking,
        guestId: adminId,
        roomId,
        bookingReference: 'TEST-004'
      });

      const response = await request(app)
        .put(`/api/bookings/${otherBooking._id}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ status: 'cancelled' })
        .expect(403);

      expect(response.body.message).toContain('permission');
    });

    it('should allow guest to update own booking details', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ numberOfGuests: 3, specialRequests: 'No smoking' })
        .expect(200);

      expect(response.body.data.numberOfGuests).toBe(3);
      expect(response.body.data.specialRequests).toBe('No smoking');
    });

    it('should validate status field', async () => {
      const response = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.message).toContain('error');
    });
  });

  // ============================================================================
  // DELETE BOOKING TESTS
  // ============================================================================

  describe('DELETE /api/bookings/:id', () => {
    beforeEach(async () => {
      const booking = await Booking.create({
        ...testBooking,
        guestId,
        roomId,
        bookingReference: 'TEST-005'
      });
      bookingId = booking._id;
    });

    it('should cancel booking (soft delete)', async () => {
      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify booking still exists but is cancelled
      const booking = await Booking.findById(bookingId);
      expect(booking.status).toBe('cancelled');
    });

    it('should prevent canceling already cancelled bookings', async () => {
      // First delete
      await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${guestToken}`);

      // Try to delete again
      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(400);

      expect(response.body.message).toContain('already');
    });

    it('should prevent canceling completed checkouts', async () => {
      // Update booking status to checked-out
      await Booking.findByIdAndUpdate(bookingId, { status: 'checked-out' });

      const response = await request(app)
        .delete(`/api/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(400);

      expect(response.body.message).toContain('cannot');
    });
  });

  // ============================================================================
  // AVAILABILITY TESTS
  // ============================================================================

  describe('GET /api/bookings/availability/:roomId', () => {
    it('should return room availability', async () => {
      const response = await request(app)
        .get(`/api/bookings/availability/${roomId}`)
        .query({
          startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('available');
    });

    it('should detect conflicts with existing bookings', async () => {
      // Create a booking
      const booking = await Booking.create({
        ...testBooking,
        guestId,
        roomId,
        bookingReference: 'TEST-006'
      });

      // Check availability for overlapping period
      const response = await request(app)
        .get(`/api/bookings/availability/${roomId}`)
        .query({
          startDate: booking.checkInDate,
          endDate: booking.checkOutDate
        })
        .expect(200);

      expect(response.body.data.available).toBe(false);
    });
  });
});
