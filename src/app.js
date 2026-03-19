const Fastify = require('fastify');
const { buildContainer } = require('./container');
const authRoutes = require('./routes/auth.routes');
const customersRoutes = require('./routes/customers.routes');
const { registerErrorHandler } = require('./hooks/error-handler');
const healthRoutes = require('./routes/health.routes');
const fundsRoutes = require('./routes/funds.routes');
const subscriptionsRoutes = require('./routes/subscriptions.routes');
const transactionsRoutes = require('./routes/transactions.routes');

const buildApp = () => {
  const app = Fastify({
    logger: true,
  });

  app.decorate('container', buildContainer());

  registerErrorHandler(app);

  app.register(authRoutes);
  app.register(customersRoutes);
  app.register(healthRoutes);
  app.register(fundsRoutes);
  app.register(subscriptionsRoutes);
  app.register(transactionsRoutes);

  return app;
};

module.exports = {
  buildApp,
};
