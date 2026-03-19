const { notFound } = require('../errors/app-error');

const createCustomersService = ({ customersRepository, authzService }) => ({
  async getMyProfile(principal) {
    return customersRepository.ensureProfile(principal);
  },

  async listCustomersForAdmin(principal) {
    authzService.ensureAdmin(principal);
    return customersRepository.listProfiles();
  },

  async getCustomerByIdForAdmin(principal, customerId) {
    authzService.ensureAdmin(principal);
    const customer = await customersRepository.getById(customerId);

    if (!customer) {
      throw notFound('Customer not found');
    }

    return customer;
  },
});

module.exports = {
  createCustomersService,
};
