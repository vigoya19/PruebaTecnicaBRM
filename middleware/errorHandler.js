const { CustomError } = require('../utils/customErrors');
const { HTTP_ERRORS } = require('../constants/httpCodes');
const { INTERNAL_SERVER_ERROR } = HTTP_ERRORS;

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof CustomError) {
    return res
      .status(err.status)
      .json({ status: err.status, message: err.message });
  } else {
    return res.status(INTERNAL_SERVER_ERROR.status).json({
      status: INTERNAL_SERVER_ERROR.status,
      message: INTERNAL_SERVER_ERROR.message,
    });
  }
};

module.exports = errorHandler;
