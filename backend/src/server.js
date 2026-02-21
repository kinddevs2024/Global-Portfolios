require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { createSocketServer } = require('./sockets/socketServer');
const { getEnv } = require('./config/env');
const logger = require('./services/logger');

const { port: PORT } = getEnv();

const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    createSocketServer(server);

    server.listen(PORT, () => {
      logger.info('Backend server started', { port: PORT });
    });
  } catch (error) {
    logger.error('Failed to start server', { message: error.message });
    process.exit(1);
  }
};

startServer();
