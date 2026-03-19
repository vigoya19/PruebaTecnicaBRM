const buildCognitoClient = (responses) => {
  const queue = [...responses];

  return {
    send: jest.fn().mockImplementation(() => {
      const next = queue.shift();

      if (next instanceof Error) {
        return Promise.reject(next);
      }

      return Promise.resolve(next);
    }),
  };
};

describe('auth service', () => {
  afterEach(() => {
    delete process.env.COGNITO_USER_POOL_ID;
    delete process.env.COGNITO_USER_POOL_CLIENT_ID;
  });

  it('registers a user, creates the customer profile and returns tokens', async () => {
    process.env.COGNITO_USER_POOL_ID = 'pool-id';
    process.env.COGNITO_USER_POOL_CLIENT_ID = 'client-id';

    jest.resetModules();
    const { createAuthService: createFreshAuthService } = require('../../src/services/auth.service');

    const cognitoClient = buildCognitoClient([
      {},
      {},
      {},
      {
        UserAttributes: [
          { Name: 'sub', Value: 'customer-1' },
          { Name: 'email', Value: 'customer@example.com' },
          { Name: 'name', Value: 'Demo Customer' },
        ],
      },
      {
        AuthenticationResult: {
          AccessToken: 'access',
          IdToken:
            'header.eyJzdWIiOiJjdXN0b21lci0xIiwiZW1haWwiOiJjdXN0b21lckBleGFtcGxlLmNvbSIsIm5hbWUiOiJEZW1vIEN1c3RvbWVyIn0.signature',
          RefreshToken: 'refresh',
          ExpiresIn: 3600,
          TokenType: 'Bearer',
        },
      },
    ]);

    const customersRepository = {
      createProfile: jest.fn().mockResolvedValue(undefined),
      ensureProfile: jest.fn().mockResolvedValue({
        customerId: 'customer-1',
        email: 'customer@example.com',
        name: 'Demo Customer',
        availableBalance: 500000,
      }),
    };

    const service = createFreshAuthService({
      cognitoClient,
      customersRepository,
    });

    const result = await service.register({
      email: 'customer@example.com',
      password: 'Temp1234!',
      name: 'Demo Customer',
      notificationPreference: 'email',
    });

    expect(customersRepository.createProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'customer-1',
        email: 'customer@example.com',
        notificationPreference: 'email',
      }),
    );
    expect(result).toMatchObject({
      message: 'Customer registered successfully',
      idToken:
        'header.eyJzdWIiOiJjdXN0b21lci0xIiwiZW1haWwiOiJjdXN0b21lckBleGFtcGxlLmNvbSIsIm5hbWUiOiJEZW1vIEN1c3RvbWVyIn0.signature',
      customer: {
        customerId: 'customer-1',
      },
    });
  });

  it('logs in an existing user and ensures a business profile', async () => {
    process.env.COGNITO_USER_POOL_ID = 'pool-id';
    process.env.COGNITO_USER_POOL_CLIENT_ID = 'client-id';

    jest.resetModules();
    const { createAuthService: createFreshAuthService } = require('../../src/services/auth.service');

    const cognitoClient = buildCognitoClient([
      {
        AuthenticationResult: {
          AccessToken: 'access',
          IdToken:
            'header.eyJzdWIiOiJjdXN0b21lci0yIiwiZW1haWwiOiJsb2dpbkBleGFtcGxlLmNvbSIsIm5hbWUiOiJMb2dpbiBDdXN0b21lciJ9.signature',
          RefreshToken: 'refresh',
          ExpiresIn: 3600,
          TokenType: 'Bearer',
        },
      },
    ]);

    const customersRepository = {
      ensureProfile: jest.fn().mockResolvedValue({
        customerId: 'customer-2',
        email: 'login@example.com',
        name: 'Login Customer',
        availableBalance: 500000,
      }),
    };

    const service = createFreshAuthService({
      cognitoClient,
      customersRepository,
    });

    const result = await service.login({
      email: 'login@example.com',
      password: 'Temp1234!',
    });

    expect(customersRepository.ensureProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'customer-2',
        email: 'login@example.com',
      }),
    );
    expect(result).toMatchObject({
      accessToken: 'access',
      customer: {
        customerId: 'customer-2',
      },
    });
  });

  it('fails when Cognito configuration is missing', async () => {
    delete process.env.COGNITO_USER_POOL_ID;
    delete process.env.COGNITO_USER_POOL_CLIENT_ID;

    jest.resetModules();
    const { createAuthService: createFreshAuthService } = require('../../src/services/auth.service');

    const service = createFreshAuthService({
      cognitoClient: buildCognitoClient([]),
      customersRepository: {
        ensureProfile: jest.fn(),
      },
    });

    await expect(
      service.login({
        email: 'login@example.com',
        password: 'Temp1234!',
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('fails login when Cognito does not return an idToken', async () => {
    process.env.COGNITO_USER_POOL_ID = 'pool-id';
    process.env.COGNITO_USER_POOL_CLIENT_ID = 'client-id';

    jest.resetModules();
    const { createAuthService: createFreshAuthService } = require('../../src/services/auth.service');

    const service = createFreshAuthService({
      cognitoClient: buildCognitoClient([
        {
          AuthenticationResult: {
            AccessToken: 'access',
          },
        },
      ]),
      customersRepository: {
        ensureProfile: jest.fn(),
      },
    });

    await expect(
      service.login({
        email: 'login@example.com',
        password: 'Temp1234!',
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Unable to create session',
    });
  });

  it('fails login when the token payload is invalid', async () => {
    process.env.COGNITO_USER_POOL_ID = 'pool-id';
    process.env.COGNITO_USER_POOL_CLIENT_ID = 'client-id';

    jest.resetModules();
    const { createAuthService: createFreshAuthService } = require('../../src/services/auth.service');

    const service = createFreshAuthService({
      cognitoClient: buildCognitoClient([
        {
          AuthenticationResult: {
            AccessToken: 'access',
            IdToken: 'invalid-token',
          },
        },
      ]),
      customersRepository: {
        ensureProfile: jest.fn(),
      },
    });

    await expect(
      service.login({
        email: 'login@example.com',
        password: 'Temp1234!',
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid authentication token',
    });
  });

  it('fails register when the email already exists in Cognito', async () => {
    process.env.COGNITO_USER_POOL_ID = 'pool-id';
    process.env.COGNITO_USER_POOL_CLIENT_ID = 'client-id';

    jest.resetModules();
    const { createAuthService: createFreshAuthService } = require('../../src/services/auth.service');

    const usernameExists = new Error('exists');
    usernameExists.name = 'UsernameExistsException';

    const service = createFreshAuthService({
      cognitoClient: buildCognitoClient([usernameExists]),
      customersRepository: {
        createProfile: jest.fn(),
        ensureProfile: jest.fn(),
      },
    });

    await expect(
      service.register({
        email: 'customer@example.com',
        password: 'Temp1234!',
        name: 'Demo Customer',
        notificationPreference: 'email',
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: 'A customer with this email already exists',
    });
  });

  it('ignores duplicate profile creation and completes registration', async () => {
    process.env.COGNITO_USER_POOL_ID = 'pool-id';
    process.env.COGNITO_USER_POOL_CLIENT_ID = 'client-id';

    jest.resetModules();
    const { createAuthService: createFreshAuthService } = require('../../src/services/auth.service');

    const duplicateProfileError = new Error('duplicate');
    duplicateProfileError.name = 'ConditionalCheckFailedException';

    const cognitoClient = buildCognitoClient([
      {},
      {},
      {},
      {
        UserAttributes: [
          { Name: 'sub', Value: 'customer-1' },
          { Name: 'email', Value: 'customer@example.com' },
        ],
      },
      {
        AuthenticationResult: {
          AccessToken: 'access',
          IdToken:
            'header.eyJzdWIiOiJjdXN0b21lci0xIiwiZW1haWwiOiJjdXN0b21lckBleGFtcGxlLmNvbSJ9.signature',
          RefreshToken: 'refresh',
          ExpiresIn: 3600,
          TokenType: 'Bearer',
        },
      },
    ]);

    const customersRepository = {
      createProfile: jest.fn().mockRejectedValue(duplicateProfileError),
      ensureProfile: jest.fn().mockResolvedValue({
        customerId: 'customer-1',
        email: 'customer@example.com',
        availableBalance: 500000,
      }),
    };

    const service = createFreshAuthService({
      cognitoClient,
      customersRepository,
    });

    await expect(
      service.register({
        email: 'customer@example.com',
        password: 'Temp1234!',
        name: 'Demo Customer',
        notificationPreference: 'email',
      }),
    ).resolves.toMatchObject({
      message: 'Customer registered successfully',
      customer: {
        customerId: 'customer-1',
      },
    });
  });

  it('rethrows unexpected Cognito errors during register', async () => {
    process.env.COGNITO_USER_POOL_ID = 'pool-id';
    process.env.COGNITO_USER_POOL_CLIENT_ID = 'client-id';

    jest.resetModules();
    const { createAuthService: createFreshAuthService } = require('../../src/services/auth.service');

    const genericError = new Error('cognito-down');

    const service = createFreshAuthService({
      cognitoClient: buildCognitoClient([genericError]),
      customersRepository: {
        createProfile: jest.fn(),
        ensureProfile: jest.fn(),
      },
    });

    await expect(
      service.register({
        email: 'customer@example.com',
        password: 'Temp1234!',
        name: 'Demo Customer',
        notificationPreference: 'email',
      }),
    ).rejects.toThrow('cognito-down');
  });

  it('rethrows unexpected repository errors during register', async () => {
    process.env.COGNITO_USER_POOL_ID = 'pool-id';
    process.env.COGNITO_USER_POOL_CLIENT_ID = 'client-id';

    jest.resetModules();
    const { createAuthService: createFreshAuthService } = require('../../src/services/auth.service');

    const repositoryError = new Error('repository-down');

    const cognitoClient = buildCognitoClient([
      {},
      {},
      {},
      {
        UserAttributes: [
          { Name: 'sub', Value: 'customer-1' },
          { Name: 'email', Value: 'customer@example.com' },
        ],
      },
    ]);

    const service = createFreshAuthService({
      cognitoClient,
      customersRepository: {
        createProfile: jest.fn().mockRejectedValue(repositoryError),
        ensureProfile: jest.fn(),
      },
    });

    await expect(
      service.register({
        email: 'customer@example.com',
        password: 'Temp1234!',
        name: 'Demo Customer',
        notificationPreference: 'email',
      }),
    ).rejects.toThrow('repository-down');
  });
});
