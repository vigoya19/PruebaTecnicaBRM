const { BadRequest } = require('../utils/customErrors');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return next(new BadRequest(error.details[0].message));
    }
    next();
  };
};

module.exports = validate;
