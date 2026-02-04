require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const startServer = async () => {
  try {
    console.log('Starting LuxuryStay HMS Backend...');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    await connectDB();
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
      console.log(`Health check: http://${HOST}:${PORT}/api/health`);
      console.log(`API Documentation: http://${HOST}:${PORT}/`);
    });

    const shutdown = () => {
      console.log('Received shutdown signal');
      server.close(() => {
        console.log('Server closed gracefully');
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

startServer();