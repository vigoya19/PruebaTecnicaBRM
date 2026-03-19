const { createTransactionsService } = require('../../src/services/transactions.service');

describe('transactions service', () => {
  it('lists transactions for the authenticated customer', async () => {
    const customersRepository = {
      ensureProfile: jest.fn().mockResolvedValue({
        customerId: 'customer-1',
      }),
    };

    const transactionsRepository = {
      listByCustomer: jest.fn().mockResolvedValue([
        {
          transactionId: 'tx-1',
          type: 'OPEN',
          fundId: 1,
          fundName: 'Fund A',
          amount: 1000,
          balanceBefore: 500000,
          balanceAfter: 499000,
          notificationChannel: 'email',
          notificationStatus: 'SENT',
          createdAt: '2026-03-19T00:00:00.000Z',
          PK: 'CUSTOMER#customer-1',
          SK: 'TRANSACTION#...',
        },
      ]),
    };

    const service = createTransactionsService({
      customersRepository,
      transactionsRepository,
      authzService: {
        ensureAdmin: jest.fn(),
      },
    });

    await expect(
      service.listForUser(
        { customerId: 'customer-1', role: 'customer' },
        { limit: 10 },
      ),
    ).resolves.toEqual([
      {
        transactionId: 'tx-1',
        type: 'OPEN',
        fundId: 1,
        fundName: 'Fund A',
        amount: 1000,
        balanceBefore: 500000,
        balanceAfter: 499000,
        notificationChannel: 'email',
        notificationStatus: 'SENT',
        createdAt: '2026-03-19T00:00:00.000Z',
        updatedAt: undefined,
      },
    ]);
  });

  it('lists transactions for any customer when the principal is admin', async () => {
    const authzService = {
      ensureAdmin: jest.fn(),
    };

    const service = createTransactionsService({
      customersRepository: {
        ensureProfile: jest.fn(),
        getById: jest.fn().mockResolvedValue({
          customerId: 'customer-2',
        }),
      },
      transactionsRepository: {
        listByCustomer: jest.fn().mockResolvedValue([
          {
            transactionId: 'tx-2',
            type: 'CANCEL',
            fundId: 1,
            fundName: 'Fund A',
            amount: 1000,
            balanceBefore: 499000,
            balanceAfter: 500000,
            createdAt: '2026-03-19T00:10:00.000Z',
            PK: 'CUSTOMER#customer-2',
            SK: 'TRANSACTION#...',
          },
        ]),
      },
      authzService,
    });

    await expect(
      service.listForCustomerAsAdmin(
        { customerId: 'admin-1', role: 'admin' },
        'customer-2',
        { limit: 5 },
      ),
    ).resolves.toEqual([
      {
        transactionId: 'tx-2',
        type: 'CANCEL',
        fundId: 1,
        fundName: 'Fund A',
        amount: 1000,
        balanceBefore: 499000,
        balanceAfter: 500000,
        notificationChannel: undefined,
        notificationStatus: undefined,
        createdAt: '2026-03-19T00:10:00.000Z',
        updatedAt: undefined,
      },
    ]);

    expect(authzService.ensureAdmin).toHaveBeenCalled();
  });

  it('returns an empty list when an admin requests transactions for a missing customer', async () => {
    const service = createTransactionsService({
      customersRepository: {
        ensureProfile: jest.fn(),
        getById: jest.fn().mockResolvedValue(null),
      },
      transactionsRepository: {
        listByCustomer: jest.fn(),
      },
      authzService: {
        ensureAdmin: jest.fn(),
      },
    });

    await expect(
      service.listForCustomerAsAdmin(
        { customerId: 'admin-1', role: 'admin' },
        'missing-customer',
        { limit: 5 },
      ),
    ).resolves.toEqual([]);
  });
});
