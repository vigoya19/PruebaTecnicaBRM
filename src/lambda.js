const awsLambdaFastify = require('@fastify/aws-lambda');
const { buildApp } = require('./app');

const app = buildApp();
const proxy = awsLambdaFastify(app);

const handler = async (event, context) => proxy(event, context);

module.exports = {
  handler,
};
