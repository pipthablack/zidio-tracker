const httpStatus = require('http-status');
const dotenv = require('dotenv');
const ApiError = require('../utils /ApiError');
const logger = require('../utils /logger');

dotenv.config();

const errorConverter = (err, req, res, next) => {
  if (!(err instanceof ApiError)) {
    const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = err.message || httpStatus[statusCode];
    err = new ApiError(statusCode, message, false);
  }
  next(err);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    error: 'error',
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      originalError: err,
    }),
  };

  if (process.env.NODE_ENV === 'development') {
    logger.error(err);
  }

  res.setHeader('Content-Type', 'application/json');
  return res.status(statusCode).json(response);
};

module.exports = { errorConverter, errorHandler };
