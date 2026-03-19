const { PutCommand, ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const env = require('../config/env');

const createFundsRepository = ({ documentClient }) => ({
  async getById(fundId) {
    const result = await documentClient.send(
      new GetCommand({
        TableName: env.fundsTableName,
        Key: {
          PK: `FUND#${fundId}`,
          SK: 'METADATA',
        },
      }),
    );

    return result.Item || null;
  },

  async list() {
    const result = await documentClient.send(
      new ScanCommand({
        TableName: env.fundsTableName,
        FilterExpression: 'entityType = :entityType',
        ExpressionAttributeValues: {
          ':entityType': 'FUND',
        },
      }),
    );

    return (result.Items || []).sort((left, right) => left.fundId - right.fundId);
  },

  async seed(funds) {
    await Promise.all(
      funds.map((fund) =>
        documentClient.send(
          new PutCommand({
            TableName: env.fundsTableName,
            Item: {
              PK: `FUND#${fund.fundId}`,
              SK: 'METADATA',
              entityType: 'FUND',
              fundId: fund.fundId,
              name: fund.name,
              category: fund.category,
              minimumAmount: fund.minimumAmount,
              isActive: true,
            },
          }),
        ),
      ),
    );
  },
});

module.exports = {
  createFundsRepository,
};
