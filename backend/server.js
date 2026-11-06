const app = require('./app');
const config = require('./config/environment');
const { testConnection } = require('./config/db');

async function startServer() {
  console.log('----------------------------------------------------');
  console.log('Starting MediConnect Backend Server...');
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Configured Port: ${config.port}`);

  // Test database connection
  const dbStatus = await testConnection();
  if (dbStatus.success) {
    if (dbStatus.mode === 'mysql') {
      console.log(' Connected to MySQL database successfully.');
    } else {
      console.log(' Operating in Self-Contained In-Memory Dev Store (MySQL not running on localhost:3306).');
    }
  } else {
    console.warn(' Database check note:', dbStatus.error || dbStatus.hint);
  }

  const server = app.listen(config.port, () => {
    console.log(` MediConnect API Server is running on port ${config.port}`);
    console.log(` REST API Base: http://localhost:${config.port}/api`);
    console.log(` Health Check:  http://localhost:${config.port}/api/health`);
    console.log('----------------------------------------------------');
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\nShutting down MediConnect server gracefully...');
    server.close(() => {
      console.log('Server terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
