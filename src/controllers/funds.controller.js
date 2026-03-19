const listFunds = async (request, reply) => {
  const funds = await request.server.container.services.funds.listFunds();
  return reply.send({ items: funds });
};

module.exports = {
  listFunds,
};
