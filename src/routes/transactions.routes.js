const {
  listTransactions,
  listTransactionsByCustomer,
} = require('../controllers/transactions.controller');
const { requireAuth } = require('../hooks/auth');

const transactionsRoutes = async (app) => {
  app.get(
    '/customers/me/transactions',
    { preHandler: requireAuth },
    listTransactions,
  );
  app.get(
    '/admin/customers/:customerId/transactions',
    { preHandler: requireAuth },
    listTransactionsByCustomer,
  );
};

module.exports = transactionsRoutes;
