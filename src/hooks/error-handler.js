const { AppError } = require('../errors/app-error');

const registerErrorHandler = (app) => {
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message,
        details: error.details,
      });
    }

    return reply.status(500).send({
      message: 'Internal Server Error',
    });
  });
};

module.exports = {
  registerErrorHandler,
};
