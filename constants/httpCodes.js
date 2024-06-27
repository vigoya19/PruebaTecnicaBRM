const HTTP_ERRORS = {
  BAD_REQUEST: {
    status: 400,
    message: 'Bad Request',
  },
  UNAUTHORIZED: {
    status: 401,
    message: 'Unauthorized',
  },
  FORBIDDEN: {
    status: 403,
    message: 'Forbidden',
  },
  NOT_FOUND: {
    status: 404,
    message: 'Not Found',
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    message: 'Internal Server Error',
  },
  CONFLIT_ERROR: {
    status: 409,
    message: 'Conflit Error',
  },
};

const SUCCESS = {
  OK: {
    status: 200,
    message: 'OK',
  },
  CREATED: {
    status: 201,
    message: 'Created',
  },
  ACCEPTED: {
    status: 202,
    message: 'Accepted',
  },
  ALREADY_REPORTED: {
    status: 208,
    message: 'Already Reported',
  },
  IM_USED: {
    status: 226,
    message: 'IM Used',
  },
  MULTIPLE_CHOICES: {
    status: 300,
    message: 'Multiple Choices',
  },
  DELETED: {
    status: 204,
    message: 'Delete',
  },
};

module.exports = { HTTP_ERRORS, SUCCESS };
