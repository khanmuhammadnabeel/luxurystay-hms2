const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LuxuryStay Hotel Management System',
      version: '1.0.0',
      description: 'Comprehensive REST API for hotel booking and management',
      contact: {
        name: 'API Support',
        email: 'support@luxurystay.com'
      },
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.luxurystay.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'User ID' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            role: { type: 'string', enum: ['admin', 'manager', 'staff', 'receptionist', 'guest'], example: 'guest' },
            isActive: { type: 'boolean', default: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            bookingReference: { type: 'string', example: 'BK-20260214-001' },
            guestId: { type: 'string' },
            guestName: { type: 'string', example: 'Jane Smith' },
            roomId: { type: 'string' },
            checkInDate: { type: 'string', format: 'date-time' },
            checkOutDate: { type: 'string', format: 'date-time' },
            numberOfRooms: { type: 'integer', example: 1 },
            numberOfGuests: { type: 'integer', example: 2 },
            totalAmount: { type: 'number', example: 750.00 },
            status: { type: 'string', enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'] },
            specialRequests: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Room: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            roomNumber: { type: 'string', example: '101' },
            type: { type: 'string', enum: ['single', 'double', 'suite', 'deluxe', 'presidential'], example: 'double' },
            description: { type: 'string' },
            pricePerNight: { type: 'number', example: 150.00 },
            capacity: { type: 'integer', example: 2 },
            amenities: { type: 'array', items: { type: 'string' }, example: ['wifi', 'ac', 'tv', 'mini-bar'] },
            status: { type: 'string', enum: ['available', 'booked', 'maintenance', 'cleaning'], default: 'available' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Invoice: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            invoiceNumber: { type: 'string', example: 'INV-20260214-001' },
            bookingId: { type: 'string' },
            amount: { type: 'number', example: 750.00 },
            paidAmount: { type: 'number', default: 0 },
            status: { type: 'string', enum: ['pending', 'paid', 'overdue', 'cancelled'], default: 'pending' },
            dueDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Feedback: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            bookingId: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string' },
            title: { type: 'string', example: 'Excellent stay!' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            errors: { type: 'array', items: { type: 'object' } },
            statusCode: { type: 'integer', example: 400 }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' }
            }
          }
        }
      }
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Bookings', description: 'Booking management' },
      { name: 'Rooms', description: 'Room management' },
      { name: 'Invoices', description: 'Invoice management' },
      { name: 'Feedback', description: 'Guest feedback' },
      { name: 'Search', description: 'Global search' },
      { name: 'Exports', description: 'Data export' },
      { name: 'Uploads', description: 'File uploads' },
      { name: 'Analytics', description: 'Analytics and reports' }
    ]
  },
  apis: [path.join(__dirname, '../routes/*.js')]
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };