const {
  CognitoIdentityProviderClient,
} = require('@aws-sdk/client-cognito-identity-provider');
const { SNSClient } = require('@aws-sdk/client-sns');
const { SESv2Client } = require('@aws-sdk/client-sesv2');
const env = require('./config/env');
const { documentClient } = require('./lib/dynamodb');
const { createCustomersRepository } = require('./repositories/customers.repository');
const { createFundsRepository } = require('./repositories/funds.repository');
const {
  createSubscriptionsRepository,
} = require('./repositories/subscriptions.repository');
const {
  createTransactionsRepository,
} = require('./repositories/transactions.repository');
const { createAuthzService } = require('./services/authz.service');
const { createAuthService } = require('./services/auth.service');
const { createCustomersService } = require('./services/customers.service');
const { createFundsService } = require('./services/funds.service');
const {
  createNotificationsService,
} = require('./services/notifications.service');
const {
  createSubscriptionsService,
} = require('./services/subscriptions.service');
const { createTransactionsService } = require('./services/transactions.service');

const buildContainer = () => {
  const repositories = {
    customers: createCustomersRepository({ documentClient }),
    funds: createFundsRepository({ documentClient }),
    subscriptions: createSubscriptionsRepository({ documentClient }),
    transactions: createTransactionsRepository({ documentClient }),
  };

  const snsClient = new SNSClient({ region: env.awsRegion });
  const sesClient = new SESv2Client({ region: env.awsRegion });
  const cognitoClient = new CognitoIdentityProviderClient({
    region: env.awsRegion,
  });

  const services = {
    authz: createAuthzService(),
    auth: createAuthService({
      cognitoClient,
      customersRepository: repositories.customers,
    }),
    funds: createFundsService({
      fundsRepository: repositories.funds,
    }),
    notifications: createNotificationsService({
      sesClient,
      snsClient,
    }),
  };

  services.subscriptions = createSubscriptionsService({
    customersRepository: repositories.customers,
    fundsRepository: repositories.funds,
    subscriptionsRepository: repositories.subscriptions,
    transactionsRepository: repositories.transactions,
    notificationsService: services.notifications,
  });

  services.transactions = createTransactionsService({
    customersRepository: repositories.customers,
    transactionsRepository: repositories.transactions,
    authzService: services.authz,
  });

  services.customers = createCustomersService({
    customersRepository: repositories.customers,
    authzService: services.authz,
  });

  return {
    repositories,
    services,
  };
};

module.exports = {
  buildContainer,
};
