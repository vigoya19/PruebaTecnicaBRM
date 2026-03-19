const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const env = require('../config/env');

const client = new DynamoDBClient({
  region: env.awsRegion,
  endpoint: env.dynamoDbEndpoint,
});

const documentClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

module.exports = {
  documentClient,
};
