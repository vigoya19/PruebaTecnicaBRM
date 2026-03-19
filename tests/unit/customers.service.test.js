const { createCustomersService } = require('../../src/services/customers.service');

describe('customers service', () => {
  it('returns the authenticated customer profile', async () => {
    const customersRepository = {
      ensureProfile: jest.fn().mockResolvedValue({
        customerId: 'customer-1',
        email: 'customer@example.com',
        name: 'Customer One',
        phone: '+573001112233',
        notificationPreference: 'email',
        availableBalance: 500000,
        role: 'customer',
        PK: 'CUSTOMER#customer-1',
        SK: 'PROFILE',
      }),
    };

    const service = createCustomersService({
      customersRepository,
      authzService: {
        ensureAdmin: jest.fn(),
      },
    });

    await expect(
      service.getMyProfile({
        customerId: 'customer-1',
        role: 'customer',
      }),
    ).resolves.toMatchObject({
      customerId: 'customer-1',
      availableBalance: 500000,
    });
  });

  it('lists customers for an admin principal', async () => {
    const authzService = {
      ensureAdmin: jest.fn(),
    };

    const customersRepository = {
      ensureProfile: jest.fn(),
      listProfiles: jest.fn().mockResolvedValue([
        {
          customerId: 'customer-1',
          email: 'customer@example.com',
          name: 'Customer One',
          availableBalance: 500000,
          role: 'customer',
          PK: 'CUSTOMER#customer-1',
          SK: 'PROFILE',
        },
      ]),
      getById: jest.fn(),
    };

    const service = createCustomersService({
      customersRepository,
      authzService,
    });

    await expect(
      service.listCustomersForAdmin({
        customerId: 'admin-1',
        role: 'admin',
      }),
    ).resolves.toEqual([
      {
        customerId: 'customer-1',
        email: 'customer@example.com',
        name: 'Customer One',
        phone: undefined,
        notificationPreference: undefined,
        availableBalance: 500000,
        role: 'customer',
        createdAt: undefined,
        updatedAt: undefined,
      },
    ]);

    expect(authzService.ensureAdmin).toHaveBeenCalled();
  });

  it('returns a specific customer for an admin principal', async () => {
    const authzService = {
      ensureAdmin: jest.fn(),
    };

    const customersRepository = {
      ensureProfile: jest.fn(),
      listProfiles: jest.fn(),
      getById: jest.fn().mockResolvedValue({
        customerId: 'customer-2',
        email: 'customer2@example.com',
        name: 'Customer Two',
        availableBalance: 425000,
        role: 'customer',
        PK: 'CUSTOMER#customer-2',
        SK: 'PROFILE',
      }),
    };

    const service = createCustomersService({
      customersRepository,
      authzService,
    });

    await expect(
      service.getCustomerByIdForAdmin(
        {
          customerId: 'admin-1',
          role: 'admin',
        },
        'customer-2',
      ),
    ).resolves.toEqual({
      customerId: 'customer-2',
      email: 'customer2@example.com',
      name: 'Customer Two',
      phone: undefined,
      notificationPreference: undefined,
      availableBalance: 425000,
      role: 'customer',
      createdAt: undefined,
      updatedAt: undefined,
    });
  });

  it('fails when an admin requests a missing customer', async () => {
    const service = createCustomersService({
      customersRepository: {
        ensureProfile: jest.fn(),
        listProfiles: jest.fn(),
        getById: jest.fn().mockResolvedValue(null),
      },
      authzService: {
        ensureAdmin: jest.fn(),
      },
    });

    await expect(
      service.getCustomerByIdForAdmin(
        {
          customerId: 'admin-1',
          role: 'admin',
        },
        'missing-customer',
      ),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: 'Customer not found',
    });
  });
});
