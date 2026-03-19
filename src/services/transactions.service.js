const toTransactionResponse = (transaction) => ({
  transactionId: transaction.transactionId,
  type: transaction.type,
  fundId: transaction.fundId,
  fundName: transaction.fundName,
  amount: transaction.amount,
  balanceBefore: transaction.balanceBefore,
  balanceAfter: transaction.balanceAfter,
  notificationChannel: transaction.notificationChannel,
  notificationStatus: transaction.notificationStatus,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt,
});

const createTransactionsService = ({
  customersRepository,
  transactionsRepository,
  authzService,
}) => ({
  async listForUser(principal, query) {
    await customersRepository.ensureProfile(principal);
    const items = await transactionsRepository.listByCustomer(
      principal.customerId,
      query.limit,
    );

    return items.map(toTransactionResponse);
  },

  async listForCustomerAsAdmin(principal, customerId, query) {
    authzService.ensureAdmin(principal);
    const customer = await customersRepository.getById(customerId);

    if (!customer) {
      return [];
    }

    const items = await transactionsRepository.listByCustomer(
      customerId,
      query.limit,
    );

    return items.map(toTransactionResponse);
  },
});

module.exports = {
  createTransactionsService,
};
