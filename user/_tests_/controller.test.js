const { register, login } = require('../controller');
const User = require('../model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  InternalServerError,
  Unauthorized,
} = require('../../utils/customErrors');

describe('Auth Controller', () => {
  describe('Register', () => {
    it('should register a new user', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'password',
          role: 'client',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const createdUser = {
        id: 123,
        username: 'testuser',
        password: 'hashedpassword',
        role: 'client',
        createdAt: '2024-06-27T06:28:51.908Z',
        updatedAt: '2024-06-27T06:28:51.908Z',
      };

      const createUserSpy = jest
        .spyOn(User, 'create')
        .mockResolvedValue(createdUser);
      const hashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashedpassword');

      await register(req, res, next);

      expect(createUserSpy).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'hashedpassword',
        role: 'client',
      });
      expect(hashSpy).toHaveBeenCalledWith('password', 10);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: 123,
          username: 'testuser',
          password: 'hashedpassword',
          role: 'client',
          createdAt: '2024-06-27T06:28:51.908Z',
          updatedAt: '2024-06-27T06:28:51.908Z',
        },
      });

      createUserSpy.mockRestore();
      hashSpy.mockRestore();
    });

    it('should handle errors', async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const createUserSpy = jest
        .spyOn(User, 'create')
        .mockRejectedValue(new Error('Failed to create user'));

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(InternalServerError));

      createUserSpy.mockRestore();
    });
  });

  describe('Login', () => {
    it('should login a user', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'password',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const findUserSpy = jest.spyOn(User, 'findOne').mockResolvedValue({
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        role: 'client',
      });
      const compareSpy = jest
        .spyOn(bcrypt, 'compareSync')
        .mockReturnValue(true);
      const signSpy = jest.spyOn(jwt, 'sign').mockReturnValue('mockedToken');

      await login(req, res, next);

      expect(findUserSpy).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(compareSpy).toHaveBeenCalledWith('password', 'hashedpassword');
      expect(signSpy).toHaveBeenCalledWith(
        { id: 1, role: 'client' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: 'mockedToken' });

      findUserSpy.mockRestore();
      compareSpy.mockRestore();
      signSpy.mockRestore();
    });

    it('should handle invalid credentials', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'password',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const findUserSpy = jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await login(req, res, next);

      expect(findUserSpy).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(next).toHaveBeenCalledWith(expect.any(Unauthorized));
    });
  });
});
