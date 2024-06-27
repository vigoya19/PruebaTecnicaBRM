const { CustomError } = require('../../utils/customErrors');
const { HTTP_ERRORS } = require('../../constants/httpCodes');
const errorHandler = require('../../middleware/errorHandler');

describe('errorHandler middleware', () => {
  it('should handle CustomError correctly', () => {
    const err = new CustomError(HTTP_ERRORS.BAD_REQUEST, 'Bad Request');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false,
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_ERRORS.BAD_REQUEST.status);
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_ERRORS.BAD_REQUEST.status,
      message: 'Bad Request',
    });
  });

  it('should handle general errors correctly', () => {
    const err = new Error('Something went wrong');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false,
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(
      HTTP_ERRORS.INTERNAL_SERVER_ERROR.status,
    );
    expect(res.json).toHaveBeenCalledWith({
      status: HTTP_ERRORS.INTERNAL_SERVER_ERROR.status,
      message: HTTP_ERRORS.INTERNAL_SERVER_ERROR.message,
    });
  });

  it('should call next if headers are already sent', () => {
    const err = new Error('Something went wrong');
    const req = {};
    const res = {
      headersSent: true,
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it('should log the error to console', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const err = new Error('Something went wrong');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false,
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(err);

    consoleSpy.mockRestore();
  });
});
