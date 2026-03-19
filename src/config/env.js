require('dotenv').config();

const env = {
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  cognitoUserPoolClientId: process.env.COGNITO_USER_POOL_CLIENT_ID || '',
  cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID || '',
  dynamoDbEndpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  fundsTableName: process.env.FUNDS_TABLE_NAME || 'btg-funds-local',
  localAuthBypass: process.env.LOCAL_AUTH_BYPASS !== 'false',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  sesFromEmail: process.env.SES_FROM_EMAIL || '',
};

module.exports = env;
