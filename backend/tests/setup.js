/**
 * Test Setup
 * Configure test environment, database, and utilities
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connect to test database
 */
async function setupDatabase() {
  // Use in-memory MongoDB for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

/**
 * Disconnect from test database
 */
async function teardownDatabase() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

/**
 * Clear all collections
 */
async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

/**
 * Clear specific collection
 */
async function clearCollection(modelName) {
  if (mongoose.connection.collections[modelName]) {
    await mongoose.connection.collections[modelName].deleteMany({});
  }
}

/**
 * Setup hooks
 */
beforeAll(async () => {
  await setupDatabase();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

/**
 * Global test timeout
 */
jest.setTimeout(10000);

/**
 * Mock environment variables
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only-32chars!!';
process.env.JWT_EXPIRY = '1d';
process.env.REFRESH_TOKEN_EXPIRY = '7d';
process.env.EMAIL_ENABLED = 'false';
process.env.STORAGE_PROVIDER = 'local';
process.env.CORS_ORIGINS = 'http://localhost:3000';
process.env.PORT = '5000';

module.exports = {
  setupDatabase,
  teardownDatabase,
  clearDatabase,
  clearCollection
};
