const {
  getCustomerById,
  getMyProfile,
  listCustomers,
} = require('../controllers/customers.controller');
const { requireAuth } = require('../hooks/auth');

const customersRoutes = async (app) => {
  app.get('/customers/me', { preHandler: requireAuth }, getMyProfile);
  app.get('/admin/customers', { preHandler: requireAuth }, listCustomers);
  app.get(
    '/admin/customers/:customerId',
    { preHandler: requireAuth },
    getCustomerById,
  );
};

module.exports = customersRoutes;
