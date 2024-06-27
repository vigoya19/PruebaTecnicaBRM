const { HTTP_ERRORS } = require('../constants/httpCodes');

class CustomError extends Error {
  constructor(httpError, customMessage) {
    super(customMessage || httpError.message);
    this.status = httpError.status;
  }
}

class ConflictError extends CustomError {
  constructor(message) {
    super(HTTP_ERRORS.CONFLIT_ERROR, message);
  }
}

class BadRequest extends CustomError {
  constructor(message) {
    super(HTTP_ERRORS.BAD_REQUEST, message);
  }
}

class Unauthorized extends CustomError {
  constructor(message) {
    super(HTTP_ERRORS.UNAUTHORIZED, message);
  }
}

class Forbidden extends CustomError {
  constructor(message) {
    super(HTTP_ERRORS.FORBIDDEN, message);
  }
}

class NotFound extends CustomError {
  constructor(message) {
    super(HTTP_ERRORS.NOT_FOUND, message);
  }
}

class InternalServerError extends CustomError {
  constructor(message) {
    super(HTTP_ERRORS.INTERNAL_SERVER_ERROR, message);
  }
}

module.exports = {
  CustomError,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  ConflictError,
  InternalServerError,
};
