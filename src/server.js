const { buildApp } = require('./app');
const env = require('./config/env');
const logger = require('./lib/logger');

const start = async () => {
  const app = buildApp();

  try {
    await app.listen({ port: env.port, host: '0.0.0.0' });
    logger.info(`Server listening on port ${env.port}`);
  } catch (error) {
    logger.error('Unable to start server', error);
    process.exit(1);
  }
};

start();
