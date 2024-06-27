const jwt = require('jsonwebtoken');
const { authenticate } = require('../authValidator');
const User = require('../../user/model');
const { Unauthorized } = require('../../utils/customErrors');

jest.mock('jsonwebtoken');
jest.mock('../../user/model');

describe('authenticate middleware', () => {
  it('should return Unauthorized if no token is provided', async () => {
    const req = {
      header: jest.fn().mockReturnValue(''),
    };
    const res = {};
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Unauthorized));
  });

  it('should return Unauthorized if token is invalid', async () => {
    const req = {
      header: jest.fn().mockReturnValue('Bearer invalidtoken'),
    };
    const res = {};
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Unauthorized));
  });

  it('should return Unauthorized if user is not found', async () => {
    const req = {
      header: jest.fn().mockReturnValue('Bearer validtoken'),
    };
    const res = {};
    const next = jest.fn();

    jwt.verify.mockReturnValue({ id: 1 });
    User.findByPk.mockResolvedValue(null);

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Unauthorized));
  });

  it('should call next if token and user are valid', async () => {
    const req = {
      header: jest.fn().mockReturnValue('Bearer validtoken'),
    };
    const res = {};
    const next = jest.fn();

    jwt.verify.mockReturnValue({ id: 1 });
    User.findByPk.mockResolvedValue({ id: 1, username: 'testuser' });

    await authenticate(req, res, next);

    expect(req.user).toEqual({ id: 1 });
    expect(next).toHaveBeenCalled();
  });
});
