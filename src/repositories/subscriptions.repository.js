const {
  DeleteCommand,
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb');
const env = require('../config/env');
const { TRANSACTION_TYPES } = require('../config/constants');

const createSubscriptionsRepository = ({ documentClient }) => ({
  async getByFund(customerId, fundId) {
    const result = await documentClient.send(
      new GetCommand({
        TableName: env.fundsTableName,
        Key: {
          PK: `CUSTOMER#${customerId}`,
          SK: `SUBSCRIPTION#${fundId}`,
        },
      }),
    );

    return result.Item || null;
  },

  async listByCustomer(customerId) {
    const result = await documentClient.send(
      new QueryCommand({
        TableName: env.fundsTableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `CUSTOMER#${customerId}`,
          ':sk': 'SUBSCRIPTION#',
        },
      }),
    );

    return (result.Items || []).sort((left, right) =>
      left.openedAt.localeCompare(right.openedAt),
    );
  },

  async open({
    customer,
    fund,
    transactionId,
    notificationPreference,
  }) {
    const now = new Date().toISOString();

    await documentClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: env.fundsTableName,
              Key: {
                PK: `CUSTOMER#${customer.customerId}`,
                SK: 'PROFILE',
              },
              UpdateExpression:
                'SET availableBalance = availableBalance - :amount, notificationPreference = :preference, updatedAt = :updatedAt',
              ConditionExpression: 'availableBalance >= :amount',
              ExpressionAttributeValues: {
                ':amount': fund.minimumAmount,
                ':preference': notificationPreference,
                ':updatedAt': now,
              },
            },
          },
          {
            Put: {
              TableName: env.fundsTableName,
              Item: {
                PK: `CUSTOMER#${customer.customerId}`,
                SK: `SUBSCRIPTION#${fund.fundId}`,
                entityType: 'SUBSCRIPTION',
                customerId: customer.customerId,
                fundId: fund.fundId,
                fundName: fund.name,
                amount: fund.minimumAmount,
                status: 'ACTIVE',
                openedAt: now,
              },
              ConditionExpression:
                'attribute_not_exists(PK) AND attribute_not_exists(SK)',
            },
          },
          {
            Put: {
              TableName: env.fundsTableName,
              Item: {
                PK: `CUSTOMER#${customer.customerId}`,
                SK: `TRANSACTION#${now}#${transactionId}`,
                entityType: 'TRANSACTION',
                customerId: customer.customerId,
                transactionId,
                type: TRANSACTION_TYPES.OPEN,
                fundId: fund.fundId,
                fundName: fund.name,
                amount: fund.minimumAmount,
                balanceBefore: customer.availableBalance,
                balanceAfter: customer.availableBalance - fund.minimumAmount,
                notificationChannel: notificationPreference,
                notificationStatus: 'PENDING',
                createdAt: now,
              },
            },
          },
        ],
      }),
    );

    return {
      amount: fund.minimumAmount,
      fundId: fund.fundId,
      fundName: fund.name,
      notificationChannel: notificationPreference,
      transactionId,
    };
  },

  async cancel({ customer, subscription, transactionId }) {
    const now = new Date().toISOString();

    await documentClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: env.fundsTableName,
              Key: {
                PK: `CUSTOMER#${customer.customerId}`,
                SK: 'PROFILE',
              },
              UpdateExpression:
                'SET availableBalance = availableBalance + :amount, updatedAt = :updatedAt',
              ExpressionAttributeValues: {
                ':amount': subscription.amount,
                ':updatedAt': now,
              },
            },
          },
          {
            Delete: {
              TableName: env.fundsTableName,
              Key: {
                PK: `CUSTOMER#${customer.customerId}`,
                SK: `SUBSCRIPTION#${subscription.fundId}`,
              },
              ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
            },
          },
          {
            Put: {
              TableName: env.fundsTableName,
              Item: {
                PK: `CUSTOMER#${customer.customerId}`,
                SK: `TRANSACTION#${now}#${transactionId}`,
                entityType: 'TRANSACTION',
                customerId: customer.customerId,
                transactionId,
                type: TRANSACTION_TYPES.CANCEL,
                fundId: subscription.fundId,
                fundName: subscription.fundName,
                amount: subscription.amount,
                balanceBefore: customer.availableBalance,
                balanceAfter: customer.availableBalance + subscription.amount,
                createdAt: now,
              },
            },
          },
        ],
      }),
    );

    return {
      amount: subscription.amount,
      fundId: subscription.fundId,
      fundName: subscription.fundName,
      transactionId,
    };
  },
});

module.exports = {
  createSubscriptionsRepository,
};
