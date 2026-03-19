const {
  AppError,
  badRequest,
  conflict,
  forbidden,
  notFound,
  unauthorized,
} = require('../../src/errors/app-error');

describe('app errors', () => {
  it('creates a base AppError with details', () => {
    const error = new AppError(418, 'Teapot', { traceId: '1' });

    expect(error).toMatchObject({
      name: 'AppError',
      statusCode: 418,
      message: 'Teapot',
      details: { traceId: '1' },
    });
  });

  it('creates helper errors with the expected status codes', () => {
    expect(badRequest('Bad')).toMatchObject({ statusCode: 400, message: 'Bad' });
    expect(unauthorized()).toMatchObject({
      statusCode: 401,
      message: 'Unauthorized',
    });
    expect(forbidden()).toMatchObject({ statusCode: 403, message: 'Forbidden' });
    expect(notFound()).toMatchObject({ statusCode: 404, message: 'Not Found' });
    expect(conflict()).toMatchObject({ statusCode: 409, message: 'Conflict' });
  });
});
