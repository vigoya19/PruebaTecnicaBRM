class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const badRequest = (message, details) => new AppError(400, message, details);
const unauthorized = (message = 'Unauthorized') => new AppError(401, message);
const forbidden = (message = 'Forbidden') => new AppError(403, message);
const notFound = (message = 'Not Found') => new AppError(404, message);
const conflict = (message = 'Conflict') => new AppError(409, message);

module.exports = {
  AppError,
  badRequest,
  conflict,
  forbidden,
  notFound,
  unauthorized,
};
