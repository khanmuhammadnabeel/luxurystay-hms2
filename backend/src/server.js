require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

/**
 * Exposed socket.io instance.
 * Use `getIO()` to obtain the initialized io after server start.
 */
let io;

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const startServer = async () => {
  try {
    console.log('Starting LuxuryStay HMS Backend...');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    await connectDB();
    
    const httpServer = http.createServer(app);

    // initialize Socket.io with the HTTP server
io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || 'http://localhost:3000'
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize socket helper
const socketHelper = require('./utils/socketHelper');
socketHelper.setIO(io);
    

    // initialize application-level socket event handlers (defined in src/socket/socketServer.js)
    try {
      const socketServer = require('./socket/socketServer');
      if (socketServer && typeof socketServer.initializeSocketEvents === 'function') {
        socketServer.initializeSocketEvents(io);  // NEEDS io PARAMETER!
      }
    } catch (err) {
      console.error('Failed to initialize socket events:', err);
    }

    httpServer.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
      console.log(`Health check: http://${HOST}:${PORT}/api/health`);
      console.log(`API Documentation: http://${HOST}:${PORT}/`);
    });

    const shutdown = () => {
      console.log('Received shutdown signal');
      httpServer.close(() => {
        console.log('Server closed gracefully');
        if (io) {
          try {
            io.close();
            console.log('Socket.io server closed');
          } catch (err) {
            console.error('Error closing Socket.io server:', err);
          }
        }
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      shutdown();
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};
// Start the export queue processor
try {
  const exportQueue = require('./services/exportQueue');
  exportQueue.startProcessor(5000); // Process queue every 5 seconds
  console.log('✅ Export queue processor started');
} catch (err) {
  console.error('❌ Failed to start export queue:', err.message);
}

startServer();

module.exports.getIO = () => io;
module.exports.startServer = startServer;