const User = require('./model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const {
  InternalServerError,
  Unauthorized,
  BadRequest,
} = require('../utils/customErrors');
const { SUCCESS } = require('../constants/httpCodes');
const { CREATED, OK } = SUCCESS;

require('dotenv').config();

const { JWT_SECRET } = process.env;

const register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    const userExits = await User.findOne({ where: { username } });
    if (userExits) {
      next(new BadRequest('User already exist'));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      role,
    });
    res.status(CREATED.status).json({ user });
  } catch (error) {
    logger.error(error);
    next(new InternalServerError());
  }
};
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      next(new Unauthorized('Invalid Credentials'));
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '1h',
    });
    res.status(OK.status).json({ token });
  } catch (error) {
    next(new InternalServerError());
  }
};

module.exports = {
  register,
  login,
};
