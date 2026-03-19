const { getHealth } = require('../controllers/health.controller');

const healthRoutes = async (app) => {
  app.get('/health', getHealth);
};

module.exports = healthRoutes;
