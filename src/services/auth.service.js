const {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  InitiateAuthCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const env = require('../config/env');
const { conflict, unauthorized, badRequest } = require('../errors/app-error');
const { ROLES } = require('../config/constants');

const getAttributeValue = (attributes, name) =>
  attributes.find((attribute) => attribute.Name === name)?.Value || '';

const decodeJwtPayload = (token) => {
  const [, payload] = token.split('.');

  if (!payload) {
    throw unauthorized('Invalid authentication token');
  }

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
};

const createAuthService = ({ cognitoClient, customersRepository }) => {
  const ensureConfig = () => {
    if (!env.cognitoUserPoolId || !env.cognitoUserPoolClientId) {
      throw badRequest(
        'Cognito configuration is missing. Set COGNITO_USER_POOL_ID and COGNITO_USER_POOL_CLIENT_ID.',
      );
    }
  };

  const authenticate = async ({ email, password }) => {
    const response = await cognitoClient.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: env.cognitoUserPoolClientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      }),
    );

    const idToken = response.AuthenticationResult?.IdToken;

    if (!idToken) {
      throw unauthorized('Unable to create session');
    }

    const claims = decodeJwtPayload(idToken);

    const principal = {
      customerId: claims.sub,
      email: claims.email || email,
      name: claims.name || claims['cognito:username'] || 'BTG Customer',
      phone: claims.phone_number || '',
      role: ROLES.CUSTOMER,
    };

    const customer = await customersRepository.ensureProfile(principal);

    return {
      accessToken: response.AuthenticationResult.AccessToken,
      expiresIn: response.AuthenticationResult.ExpiresIn,
      idToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      tokenType: response.AuthenticationResult.TokenType,
      customer,
    };
  };

  return {
    async register(payload) {
      ensureConfig();

      try {
        await cognitoClient.send(
          new AdminCreateUserCommand({
            UserPoolId: env.cognitoUserPoolId,
            Username: payload.email,
            TemporaryPassword: payload.password,
            MessageAction: 'SUPPRESS',
            UserAttributes: [
              { Name: 'email', Value: payload.email },
              { Name: 'email_verified', Value: 'true' },
              { Name: 'name', Value: payload.name },
              ...(payload.phone
                ? [{ Name: 'phone_number', Value: payload.phone }]
                : []),
            ],
          }),
        );

        await cognitoClient.send(
          new AdminSetUserPasswordCommand({
            UserPoolId: env.cognitoUserPoolId,
            Username: payload.email,
            Password: payload.password,
            Permanent: true,
          }),
        );

        await cognitoClient.send(
          new AdminAddUserToGroupCommand({
            GroupName: ROLES.CUSTOMER,
            UserPoolId: env.cognitoUserPoolId,
            Username: payload.email,
          }),
        );
      } catch (error) {
        if (error.name === 'UsernameExistsException') {
          throw conflict('A customer with this email already exists');
        }

        throw error;
      }

      const user = await cognitoClient.send(
        new AdminGetUserCommand({
          UserPoolId: env.cognitoUserPoolId,
          Username: payload.email,
        }),
      );

      const principal = {
        customerId: getAttributeValue(user.UserAttributes || [], 'sub'),
        email: getAttributeValue(user.UserAttributes || [], 'email'),
        name: getAttributeValue(user.UserAttributes || [], 'name') || payload.name,
        phone:
          getAttributeValue(user.UserAttributes || [], 'phone_number') ||
          payload.phone ||
          '',
        notificationPreference: payload.notificationPreference,
        role: ROLES.CUSTOMER,
      };

      try {
        await customersRepository.createProfile(principal);
      } catch (error) {
        if (error.name !== 'ConditionalCheckFailedException') {
          throw error;
        }
      }

      const session = await authenticate({
        email: payload.email,
        password: payload.password,
      });

      return {
        message: 'Customer registered successfully',
        ...session,
      };
    },

    async login(payload) {
      ensureConfig();
      return authenticate(payload);
    },
  };
};

module.exports = {
  createAuthService,
};
