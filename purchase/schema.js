const Joi = require('joi');

const createPurchaseSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.number().required(),
        quantity: Joi.number().required(),
      }),
    )
    .required(),
});

module.exports = {
  createPurchaseSchema,
};
