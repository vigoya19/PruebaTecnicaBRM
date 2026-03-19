const { forbidden } = require('../errors/app-error');
const { ROLES } = require('../config/constants');

const createAuthzService = () => ({
  ensureAdmin(principal) {
    if (principal.role !== ROLES.ADMIN) {
      throw forbidden();
    }
  },
});

module.exports = {
  createAuthzService,
};
