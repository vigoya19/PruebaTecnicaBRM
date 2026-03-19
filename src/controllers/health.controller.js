const getHealth = async (request, reply) => {
  return reply.send({
    service: 'btg-funds-platform',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
};
