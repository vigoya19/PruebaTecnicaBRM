const env = require('../config/env');
const { getPrincipalFromRequest } = require('../lib/claims');
const { unauthorized } = require('../errors/app-error');

const requireAuth = async (request) => {
  const principal = getPrincipalFromRequest(request);

  if (!principal && !env.localAuthBypass) {
    throw unauthorized();
  }

  request.principal =
    principal ||
    getPrincipalFromRequest({
      headers: {
        'x-user-id': 'local-customer',
        'x-user-email': 'local@example.com',
        'x-user-role': 'customer',
        'x-user-name': 'Local Customer',
      },
    });
};

module.exports = {
  requireAuth,
};
