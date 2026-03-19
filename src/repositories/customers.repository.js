const {
  ConditionalCheckFailedException,
} = require('@aws-sdk/client-dynamodb');
const {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');
const env = require('../config/env');
const { INITIAL_BALANCE, ROLES } = require('../config/constants');

const createCustomerProfileItem = (principal) => ({
  PK: `CUSTOMER#${principal.customerId}`,
  SK: 'PROFILE',
  GSI1PK: `EMAIL#${principal.email || principal.customerId}`,
  GSI1SK: 'PROFILE',
  entityType: 'CUSTOMER',
  customerId: principal.customerId,
  name: principal.name || 'BTG Customer',
  email: principal.email || '',
  phone: principal.phone || '',
  notificationPreference: principal.notificationPreference,
  role: principal.role || ROLES.CUSTOMER,
  availableBalance: INITIAL_BALANCE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createCustomersRepository = ({ documentClient }) => ({
  async ensureProfile(principal) {
    const existing = await this.getById(principal.customerId);

    if (existing) {
      return existing;
    }

    const item = createCustomerProfileItem(principal);

    try {
      await documentClient.send(
        new PutCommand({
          TableName: env.fundsTableName,
          Item: item,
          ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
        }),
      );

      return item;
    } catch (error) {
      if (!(error instanceof ConditionalCheckFailedException)) {
        throw error;
      }

      return this.getById(principal.customerId);
    }
  },

  async createProfile(principal) {
    const item = createCustomerProfileItem(principal);

    await documentClient.send(
      new PutCommand({
        TableName: env.fundsTableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
      }),
    );

    return item;
  },

  async getById(customerId) {
    const result = await documentClient.send(
      new GetCommand({
        TableName: env.fundsTableName,
        Key: {
          PK: `CUSTOMER#${customerId}`,
          SK: 'PROFILE',
        },
      }),
    );

    return result.Item || null;
  },

  async queryByEmail(email) {
    const result = await documentClient.send(
      new QueryCommand({
        TableName: env.fundsTableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :sk',
        ExpressionAttributeValues: {
          ':pk': `EMAIL#${email}`,
          ':sk': 'PROFILE',
        },
      }),
    );

    return result.Items || [];
  },

  async updateNotificationPreference(customerId, preference) {
    await documentClient.send(
      new UpdateCommand({
        TableName: env.fundsTableName,
        Key: {
          PK: `CUSTOMER#${customerId}`,
          SK: 'PROFILE',
        },
        UpdateExpression:
          'SET notificationPreference = :preference, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':preference': preference,
          ':updatedAt': new Date().toISOString(),
        },
      }),
    );
  },

  async listProfiles() {
    const result = await documentClient.send(
      new ScanCommand({
        TableName: env.fundsTableName,
        FilterExpression: 'entityType = :entityType AND SK = :sk',
        ExpressionAttributeValues: {
          ':entityType': 'CUSTOMER',
          ':sk': 'PROFILE',
        },
      }),
    );

    return result.Items || [];
  },
});

module.exports = {
  createCustomersRepository,
};
