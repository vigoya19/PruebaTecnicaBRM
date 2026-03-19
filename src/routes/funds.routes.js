const { listFunds } = require('../controllers/funds.controller');
const { requireAuth } = require('../hooks/auth');

const fundsRoutes = async (app) => {
  app.get('/funds', { preHandler: requireAuth }, listFunds);
};

module.exports = fundsRoutes;
