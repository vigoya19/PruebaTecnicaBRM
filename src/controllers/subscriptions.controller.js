const { badRequest } = require('../errors/app-error');
const {
  fundIdParamSchema,
  openSubscriptionSchema,
} = require('../schemas/subscriptions.schema');

const openSubscription = async (request, reply) => {
  const parsed = openSubscriptionSchema.safeParse(request.body);

  if (!parsed.success) {
    throw badRequest('Invalid request body', parsed.error.flatten());
  }

  const result =
    await request.server.container.services.subscriptions.openSubscription(
      request.principal,
      parsed.data,
    );

  return reply.status(201).send(result);
};

const cancelSubscription = async (request, reply) => {
  const parsed = fundIdParamSchema.safeParse(request.params);

  if (!parsed.success) {
    throw badRequest('Invalid route parameters', parsed.error.flatten());
  }

  const result =
    await request.server.container.services.subscriptions.cancelSubscription(
      request.principal,
      parsed.data.fundId,
    );

  return reply.send(result);
};

module.exports = {
  cancelSubscription,
  openSubscription,
};
