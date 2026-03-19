const {
  cancelSubscription,
  openSubscription,
} = require('../controllers/subscriptions.controller');
const { requireAuth } = require('../hooks/auth');

const subscriptionsRoutes = async (app) => {
  app.post(
    '/customers/me/subscriptions',
    { preHandler: requireAuth },
    openSubscription,
  );

  app.delete(
    '/customers/me/subscriptions/:fundId',
    { preHandler: requireAuth },
    cancelSubscription,
  );
};

module.exports = subscriptionsRoutes;
