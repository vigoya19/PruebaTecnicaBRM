const { QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const env = require('../config/env');

const createTransactionsRepository = ({ documentClient }) => ({
  async listByCustomer(customerId, limit) {
    const result = await documentClient.send(
      new QueryCommand({
        TableName: env.fundsTableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `CUSTOMER#${customerId}`,
          ':sk': 'TRANSACTION#',
        },
        ScanIndexForward: false,
        Limit: limit,
      }),
    );

    return result.Items || [];
  },

  async updateNotificationStatus(customerId, transactionId, status) {
    const result = await this.listByCustomer(customerId, 100);
    const transaction = result.find((item) => item.transactionId === transactionId);

    if (!transaction) {
      return;
    }

    await documentClient.send(
      new UpdateCommand({
        TableName: env.fundsTableName,
        Key: {
          PK: transaction.PK,
          SK: transaction.SK,
        },
        UpdateExpression:
          'SET notificationStatus = :status, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':status': status,
          ':updatedAt': new Date().toISOString(),
        },
      }),
    );
  },
});

module.exports = {
  createTransactionsRepository,
};
