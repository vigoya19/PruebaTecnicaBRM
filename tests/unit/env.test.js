const loadEnvModule = () => {
  jest.resetModules();
  jest.doMock('dotenv', () => ({
    config: jest.fn(),
  }));

  return require('../../src/config/env');
};

describe('env config', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
    jest.unmock('dotenv');
  });

  it('uses defaults when variables are not defined', () => {
    delete process.env.AWS_REGION;
    delete process.env.COGNITO_USER_POOL_CLIENT_ID;
    delete process.env.COGNITO_USER_POOL_ID;
    delete process.env.DYNAMODB_ENDPOINT;
    delete process.env.FUNDS_TABLE_NAME;
    delete process.env.LOCAL_AUTH_BYPASS;
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.SES_FROM_EMAIL;

    const env = loadEnvModule();

    expect(env).toMatchObject({
      awsRegion: 'us-east-1',
      cognitoUserPoolClientId: '',
      cognitoUserPoolId: '',
      dynamoDbEndpoint: undefined,
      fundsTableName: 'btg-funds-local',
      localAuthBypass: true,
      nodeEnv: 'development',
      port: 3000,
      sesFromEmail: '',
    });
  });

  it('uses provided variables when they exist', () => {
    process.env.AWS_REGION = 'us-west-2';
    process.env.COGNITO_USER_POOL_CLIENT_ID = 'client-id';
    process.env.COGNITO_USER_POOL_ID = 'pool-id';
    process.env.DYNAMODB_ENDPOINT = 'http://localhost:8000';
    process.env.FUNDS_TABLE_NAME = 'custom-table';
    process.env.LOCAL_AUTH_BYPASS = 'false';
    process.env.NODE_ENV = 'test';
    process.env.PORT = '9090';
    process.env.SES_FROM_EMAIL = 'sender@example.com';

    const env = loadEnvModule();

    expect(env).toMatchObject({
      awsRegion: 'us-west-2',
      cognitoUserPoolClientId: 'client-id',
      cognitoUserPoolId: 'pool-id',
      dynamoDbEndpoint: 'http://localhost:8000',
      fundsTableName: 'custom-table',
      localAuthBypass: false,
      nodeEnv: 'test',
      port: 9090,
      sesFromEmail: 'sender@example.com',
    });
  });

  it('falls back to defaults when values are blank strings', () => {
    process.env.AWS_REGION = '';
    process.env.FUNDS_TABLE_NAME = '';
    process.env.PORT = '';
    process.env.SES_FROM_EMAIL = '';

    const env = loadEnvModule();

    expect(env.awsRegion).toBe('us-east-1');
    expect(env.fundsTableName).toBe('btg-funds-local');
    expect(env.port).toBe(3000);
    expect(env.sesFromEmail).toBe('');
  });
});
