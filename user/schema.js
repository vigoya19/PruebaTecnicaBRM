const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Username should be a type of text',
    'string.empty': 'Username cannot be empty',
    'string.min': 'Username should have a minimum length of {#limit}',
    'string.max': 'Username should have a maximum length of {#limit}',
    'any.required': 'Username is required',
  }),
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .required()
    .messages({
      'string.pattern.base':
        'Password should be alphanumeric and between 3 to 30 characters',
      'string.empty': 'Password cannot be empty',
      'any.required': 'Password is required',
    }),
  role: Joi.string().valid('admin', 'client').required().messages({
    'any.only': 'Role must be either admin or client',
    'string.empty': 'Role cannot be empty',
    'any.required': 'Role is required',
  }),
});

const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'Username cannot be empty',
    'any.required': 'Username is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required',
  }),
});

module.exports = { userSchema, loginSchema };
