const Joi = require('joi');

const createProductSchema = Joi.object({
  lotNumber: Joi.string().required(),
  name: Joi.string().required(),
  price: Joi.number().required(),
  availableQuantity: Joi.number().required(),
  entryDate: Joi.date().required(),
});

const updateProductSchema = Joi.object({
  lotNumber: Joi.string().required(),
  name: Joi.string().required(),
  price: Joi.number().required(),
  availableQuantity: Joi.number().required(),
  entryDate: Joi.date().required(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
};
