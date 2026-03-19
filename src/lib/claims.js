const { ROLES } = require('../config/constants');

const toRole = (groups) => {
  if (!groups) {
    return ROLES.CUSTOMER;
  }

  if (Array.isArray(groups)) {
    return groups.includes(ROLES.ADMIN) ? ROLES.ADMIN : ROLES.CUSTOMER;
  }

  const normalized = String(groups).toLowerCase();
  return normalized.includes(ROLES.ADMIN) ? ROLES.ADMIN : ROLES.CUSTOMER;
};

const getPrincipalFromRequest = (request) => {
  const claims =
    request.awsLambda?.event?.requestContext?.authorizer?.jwt?.claims || {};

  if (claims.sub) {
    return {
      customerId: claims.sub,
      email: claims.email || '',
      name: claims.name || claims['cognito:username'] || 'BTG Customer',
      phone: claims.phone_number || '',
      role: toRole(claims['cognito:groups']),
    };
  }

  const customerId = request.headers['x-user-id'];

  if (!customerId) {
    return null;
  }

  return {
    customerId,
    email: request.headers['x-user-email'] || '',
    name: request.headers['x-user-name'] || 'Local Customer',
    phone: request.headers['x-user-phone'] || '',
    role: toRole(request.headers['x-user-role']),
  };
};

module.exports = {
  getPrincipalFromRequest,
};
