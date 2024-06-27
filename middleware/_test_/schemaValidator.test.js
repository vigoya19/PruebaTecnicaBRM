const Joi = require('joi');
const { BadRequest } = require('../../utils/customErrors');
const validate = require('../../middleware/schemaValidator');

describe('validate middleware', () => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  it('should call next without errors if validation passes', () => {
    const req = {
      body: {
        username: 'testuser',
        password: 'password',
      },
    };
    const res = {};
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(BadRequest));
  });

  it('should call next with BadRequest error if validation fails', () => {
    const req = {
      body: {
        username: 'testuser',
      },
    };
    const res = {};
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequest));
    const error = next.mock.calls[0][0];
    expect(error.message).toBe('"password" is required');
  });

  it('should call next with BadRequest error and appropriate message', () => {
    const req = {
      body: {
        username: '',
        password: 'password',
      },
    };
    const res = {};
    const next = jest.fn();

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(BadRequest));
    const error = next.mock.calls[0][0];
    expect(error.message).toBe('"username" is not allowed to be empty');
  });
});
