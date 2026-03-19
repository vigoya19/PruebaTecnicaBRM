const { notFound } = require('../errors/app-error');

const toCustomerResponse = (customer) => ({
  customerId: customer.customerId,
  email: customer.email,
  name: customer.name,
  phone: customer.phone,
  notificationPreference: customer.notificationPreference,
  availableBalance: customer.availableBalance,
  role: customer.role,
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt,
});

const createCustomersService = ({ customersRepository, authzService }) => ({
  async getMyProfile(principal) {
    const customer = await customersRepository.ensureProfile(principal);
    return toCustomerResponse(customer);
  },

  async listCustomersForAdmin(principal) {
    authzService.ensureAdmin(principal);
    const customers = await customersRepository.listProfiles();
    return customers.map(toCustomerResponse);
  },

  async getCustomerByIdForAdmin(principal, customerId) {
    authzService.ensureAdmin(principal);
    const customer = await customersRepository.getById(customerId);

    if (!customer) {
      throw notFound('Customer not found');
    }

    return toCustomerResponse(customer);
  },
});

module.exports = {
  createCustomersService,
};
