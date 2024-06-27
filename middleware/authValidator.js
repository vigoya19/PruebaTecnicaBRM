const jwt = require('jsonwebtoken');
const User = require('../user/model');
const { Unauthorized, Forbidden } = require('../utils/customErrors');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    next(new Unauthorized('Access denied. No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      next(new Unauthorized('invalid credential'));
    }
    next();
  } catch (error) {
    next(new Unauthorized('invalid token'));
  }
};

const authorize = (role) => {
  return (req, res, next) => {
    console.log('User role:', req.user.role);
    if (req.user.role !== role) {
      next(new Forbidden('Access denied.'));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
