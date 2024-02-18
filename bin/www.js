const http = require('http');
const app = require('../index');
const config = require('../config/connectDb');
const logger = require('../utils /logger');

const PORT = process.env.PORT || '8081';
const server = http.createServer(app);

//Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(err.name, err.message);
  logger.error('Uncaught Exception occurred! Shutting down...');
  shutdown();
});

// Handle server errors
function onError(error) {
  if (error.syscall !== 'listen') {
    logger.error(error);
    return;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      break;
    default:
      logger.error(error);
  }

  shutdown();
}

server.on('error', onError);

// Start the application
const startApp = async () => {
  try {
    // Connect to the database
    await config.connectDb();
    logger.info(`\x1b[32mDB:\x1b[0m MongoDB Connected`);
    logger.info(`\x1b[36mServer:\x1b[0m Starting server...`);

    // Start the server
    server.listen(PORT, () => {
      logger.info(`\x1b[36mServer:\x1b[0m Server started onto port ${PORT}`);
    });
  } catch (error) {
    logger.error(` ${error.message}`);
    shutdown();
  }
};

startApp();

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error(err.name, err.message);
  logger.error('Unhandled rejection occurred! Shutting down...');
  shutdown();
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.errror('SIGTERM received. Shutting down gracefully');
  shutdown();
});

function shutdown() {
  server.close(() => {
    logger.info('Closed out remaining connections');
    process.exit(1);
  });
}

module.exports = {
  server,
};
