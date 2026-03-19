const { createSubscriptionsService } = require('../../src/services/subscriptions.service');

const buildDependencies = (overrides = {}) => {
  const customersRepository = {
    ensureProfile: jest.fn().mockResolvedValue({
      customerId: 'customer-1',
      availableBalance: 500000,
      email: 'customer@example.com',
    }),
    getById: jest.fn().mockResolvedValue({
      customerId: 'customer-1',
      availableBalance: 425000,
      email: 'customer@example.com',
    }),
  };

  const fundsRepository = {
    getById: jest.fn().mockResolvedValue({
      fundId: 1,
      name: 'FPV_BTG_PACTUAL_RECAUDADORA',
      minimumAmount: 75000,
      isActive: true,
    }),
  };

  const subscriptionsRepository = {
    getByFund: jest.fn().mockResolvedValue(null),
    open: jest.fn().mockResolvedValue({
      transactionId: 'tx-123',
      fundId: 1,
      fundName: 'FPV_BTG_PACTUAL_RECAUDADORA',
      amount: 75000,
    }),
    cancel: jest.fn(),
    listByCustomer: jest.fn().mockResolvedValue([]),
  };

  const transactionsRepository = {
    updateNotificationStatus: jest.fn().mockResolvedValue(undefined),
  };

  const notificationsService = {
    sendSubscriptionCreated: jest.fn().mockResolvedValue('SIMULATED'),
  };

  return {
    customersRepository,
    fundsRepository,
    subscriptionsRepository,
    transactionsRepository,
    notificationsService,
    ...overrides,
  };
};

describe('subscriptions service', () => {
  it('opens a subscription when the customer has enough balance', async () => {
    const dependencies = buildDependencies();
    const service = createSubscriptionsService(dependencies);

    const result = await service.openSubscription(
      {
        customerId: 'customer-1',
        email: 'customer@example.com',
        role: 'customer',
      },
      {
        fundId: 1,
        notificationPreference: 'email',
      },
    );

    expect(dependencies.subscriptionsRepository.open).toHaveBeenCalled();
    expect(result).toMatchObject({
      customerId: 'customer-1',
      fundId: 1,
      amount: 75000,
      status: 'ACTIVE',
      notificationStatus: 'SIMULATED',
    });
  });

  it('fails when the customer does not have enough balance', async () => {
    const dependencies = buildDependencies({
      customersRepository: {
        ensureProfile: jest.fn().mockResolvedValue({
          customerId: 'customer-1',
          availableBalance: 50000,
        }),
      },
    });

    const service = createSubscriptionsService(dependencies);

    await expect(
      service.openSubscription(
        {
          customerId: 'customer-1',
          role: 'customer',
        },
        {
          fundId: 1,
          notificationPreference: 'email',
        },
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      message:
        'No tiene saldo disponible para vincularse al fondo FPV_BTG_PACTUAL_RECAUDADORA',
    });
  });

  it('keeps the subscription successful when notification delivery fails', async () => {
    const dependencies = buildDependencies({
      notificationsService: {
        sendSubscriptionCreated: jest.fn().mockResolvedValue('FAILED'),
      },
    });

    const service = createSubscriptionsService(dependencies);

    const result = await service.openSubscription(
      {
        customerId: 'customer-1',
        email: 'customer@example.com',
        role: 'customer',
      },
      {
        fundId: 1,
        notificationPreference: 'email',
      },
    );

    expect(dependencies.transactionsRepository.updateNotificationStatus).toHaveBeenCalledWith(
      'customer-1',
      expect.any(String),
      'FAILED',
    );
    expect(result).toMatchObject({
      status: 'ACTIVE',
      notificationStatus: 'FAILED',
    });
  });

  it('fails when the fund does not exist', async () => {
    const dependencies = buildDependencies({
      fundsRepository: {
        getById: jest.fn().mockResolvedValue(null),
      },
    });

    const service = createSubscriptionsService(dependencies);

    await expect(
      service.openSubscription(
        {
          customerId: 'customer-1',
          email: 'customer@example.com',
          role: 'customer',
        },
        {
          fundId: 999,
          notificationPreference: 'email',
        },
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: 'Fund not found',
    });
  });

  it('fails when there is already an active subscription for the fund', async () => {
    const dependencies = buildDependencies({
      subscriptionsRepository: {
        getByFund: jest.fn().mockResolvedValue({
          fundId: 1,
          fundName: 'FPV_BTG_PACTUAL_RECAUDADORA',
          amount: 75000,
        }),
        open: jest.fn(),
        cancel: jest.fn(),
        listByCustomer: jest.fn().mockResolvedValue([]),
      },
    });

    const service = createSubscriptionsService(dependencies);

    await expect(
      service.openSubscription(
        {
          customerId: 'customer-1',
          email: 'customer@example.com',
          role: 'customer',
        },
        {
          fundId: 1,
          notificationPreference: 'email',
        },
      ),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'The customer already has an active subscription for this fund',
    });
  });

  it('cancels an active subscription and returns the updated balance', async () => {
    const dependencies = buildDependencies({
      customersRepository: {
        ensureProfile: jest.fn().mockResolvedValue({
          customerId: 'customer-1',
          availableBalance: 425000,
          email: 'customer@example.com',
        }),
        getById: jest.fn().mockResolvedValue({
          customerId: 'customer-1',
          availableBalance: 500000,
          email: 'customer@example.com',
        }),
      },
      subscriptionsRepository: {
        getByFund: jest.fn().mockResolvedValue({
          fundId: 1,
          fundName: 'FPV_BTG_PACTUAL_RECAUDADORA',
          amount: 75000,
        }),
        open: jest.fn(),
        cancel: jest.fn().mockResolvedValue({
          transactionId: 'tx-cancel',
          fundId: 1,
          fundName: 'FPV_BTG_PACTUAL_RECAUDADORA',
          amount: 75000,
        }),
        listByCustomer: jest.fn().mockResolvedValue([]),
      },
    });

    const service = createSubscriptionsService(dependencies);

    const result = await service.cancelSubscription(
      {
        customerId: 'customer-1',
        email: 'customer@example.com',
        role: 'customer',
      },
      1,
    );

    expect(dependencies.subscriptionsRepository.cancel).toHaveBeenCalled();
    expect(result).toMatchObject({
      customerId: 'customer-1',
      fundId: 1,
      amount: 75000,
      balanceAfter: 500000,
      status: 'CANCELLED',
    });
  });

  it('fails when trying to cancel a subscription that does not exist', async () => {
    const dependencies = buildDependencies({
      subscriptionsRepository: {
        getByFund: jest.fn().mockResolvedValue(null),
        open: jest.fn(),
        cancel: jest.fn(),
        listByCustomer: jest.fn().mockResolvedValue([]),
      },
    });

    const service = createSubscriptionsService(dependencies);

    await expect(
      service.cancelSubscription(
        {
          customerId: 'customer-1',
          email: 'customer@example.com',
          role: 'customer',
        },
        1,
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: 'Active subscription not found',
    });
  });
});
