/*
 * Errors type configuration
 */
module.exports = {
  UnauthorizedError: {
    code: 401,
    message: 'you need to be logged in to access this ressource',
  },
  ForbiddenError: {
    code: 403,
    message: 'you are not allow to access this ressource',
  },
  NotFoundError: {
    code: 404,
    message: 'page is not found',
  },
  ValidationError: {
    code: 481,
    message: 'a validation error occured',
    details: true,
  },
  UncaughtError: {
    code: 500,
    message: 'an internal error occured',
  },
  ConfigurationError: {
    code: 500,
    message: 'there is a configuration error',
  },
  NotImplementedError: {
    code: 501,
    message: 'this is not implemented yet',
  },
};
