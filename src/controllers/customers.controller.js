const getMyProfile = async (request, reply) => {
  const profile = await request.server.container.services.customers.getMyProfile(
    request.principal,
  );

  return reply.send(profile);
};

const listCustomers = async (request, reply) => {
  const items =
    await request.server.container.services.customers.listCustomersForAdmin(
      request.principal,
    );

  return reply.send({ items });
};

const getCustomerById = async (request, reply) => {
  const customer =
    await request.server.container.services.customers.getCustomerByIdForAdmin(
      request.principal,
      request.params.customerId,
    );

  return reply.send(customer);
};

module.exports = {
  getCustomerById,
  getMyProfile,
  listCustomers,
};
