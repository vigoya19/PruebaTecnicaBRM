const { badRequest } = require('../errors/app-error');
const { loginSchema, registerSchema } = require('../schemas/auth.schema');

const register = async (request, reply) => {
  const parsed = registerSchema.safeParse(request.body);

  if (!parsed.success) {
    throw badRequest('Invalid request body', parsed.error.flatten());
  }

  const result = await request.server.container.services.auth.register(parsed.data);
  return reply.status(201).send(result);
};

const login = async (request, reply) => {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    throw badRequest('Invalid request body', parsed.error.flatten());
  }

  const result = await request.server.container.services.auth.login(parsed.data);
  return reply.send(result);
};

module.exports = {
  login,
  register,
};
