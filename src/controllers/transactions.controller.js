const { badRequest } = require('../errors/app-error');
const { transactionsQuerySchema } = require('../schemas/transactions.schema');

const listTransactions = async (request, reply) => {
  const parsed = transactionsQuerySchema.safeParse(request.query || {});

  if (!parsed.success) {
    throw badRequest('Invalid query parameters', parsed.error.flatten());
  }

  const items = await request.server.container.services.transactions.listForUser(
    request.principal,
    parsed.data,
  );

  return reply.send({ items });
};

const listTransactionsByCustomer = async (request, reply) => {
  const parsed = transactionsQuerySchema.safeParse(request.query || {});

  if (!parsed.success) {
    throw badRequest('Invalid query parameters', parsed.error.flatten());
  }

  const items =
    await request.server.container.services.transactions.listForCustomerAsAdmin(
      request.principal,
      request.params.customerId,
      parsed.data,
    );

  return reply.send({ items });
};

module.exports = {
  listTransactionsByCustomer,
  listTransactions,
};
