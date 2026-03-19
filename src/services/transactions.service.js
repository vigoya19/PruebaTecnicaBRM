const createTransactionsService = ({
  customersRepository,
  transactionsRepository,
  authzService,
}) => ({
  async listForUser(principal, query) {
    await customersRepository.ensureProfile(principal);
    return transactionsRepository.listByCustomer(
      principal.customerId,
      query.limit,
    );
  },

  async listForCustomerAsAdmin(principal, customerId, query) {
    authzService.ensureAdmin(principal);
    const customer = await customersRepository.getById(customerId);

    if (!customer) {
      return [];
    }

    return transactionsRepository.listByCustomer(customerId, query.limit);
  },
});

module.exports = {
  createTransactionsService,
};
