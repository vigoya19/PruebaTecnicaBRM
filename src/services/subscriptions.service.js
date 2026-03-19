const { randomUUID } = require('node:crypto');
const { conflict, notFound, badRequest } = require('../errors/app-error');

const createSubscriptionsService = ({
  customersRepository,
  fundsRepository,
  subscriptionsRepository,
  transactionsRepository,
  notificationsService,
}) => ({
  async openSubscription(principal, payload) {
    const customer = await customersRepository.ensureProfile(principal);
    const fund = await fundsRepository.getById(payload.fundId);

    if (!fund || !fund.isActive) {
      throw notFound('Fund not found');
    }

    const activeSubscription = await subscriptionsRepository.getByFund(
      customer.customerId,
      payload.fundId,
    );

    if (activeSubscription) {
      throw conflict('The customer already has an active subscription for this fund');
    }

    if (customer.availableBalance < fund.minimumAmount) {
      throw badRequest(
        `No tiene saldo disponible para vincularse al fondo ${fund.name}`,
      );
    }

    const transactionId = randomUUID();

    const created = await subscriptionsRepository.open({
      customer,
      fund,
      notificationPreference: payload.notificationPreference,
      transactionId,
    });

    const updatedCustomer = await customersRepository.getById(customer.customerId);
    const notificationStatus = await notificationsService.sendSubscriptionCreated({
      customer: updatedCustomer,
      fundName: fund.name,
      amount: fund.minimumAmount,
      preference: payload.notificationPreference,
    });

    await transactionsRepository.updateNotificationStatus(
      customer.customerId,
      transactionId,
      notificationStatus,
    );

    return {
      transactionId: created.transactionId,
      customerId: customer.customerId,
      fundId: created.fundId,
      fundName: created.fundName,
      amount: created.amount,
      balanceAfter: updatedCustomer.availableBalance,
      status: 'ACTIVE',
      notificationStatus,
    };
  },

  async cancelSubscription(principal, fundId) {
    const customer = await customersRepository.ensureProfile(principal);
    const activeSubscription = await subscriptionsRepository.getByFund(
      customer.customerId,
      fundId,
    );

    if (!activeSubscription) {
      throw notFound('Active subscription not found');
    }

    const transactionId = randomUUID();

    const cancelled = await subscriptionsRepository.cancel({
      customer,
      subscription: activeSubscription,
      transactionId,
    });

    const updatedCustomer = await customersRepository.getById(customer.customerId);

    return {
      transactionId: cancelled.transactionId,
      customerId: customer.customerId,
      fundId: cancelled.fundId,
      fundName: cancelled.fundName,
      amount: cancelled.amount,
      balanceAfter: updatedCustomer.availableBalance,
      status: 'CANCELLED',
    };
  },
});

module.exports = {
  createSubscriptionsService,
};
