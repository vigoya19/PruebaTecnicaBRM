const { login, register } = require('../controllers/auth.controller');

const authRoutes = async (app) => {
  app.post('/auth/register', register);
  app.post('/auth/login', login);
};

module.exports = authRoutes;
