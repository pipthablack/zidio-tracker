/* eslint-disable no-unused-vars */
const express = require('express');
require('dotenv').config();
//const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const httpStatus = require('http-status');
const { transports, format } = require('winston');
const expressWinston = require('express-winston');
const createError = require('http-errors');
const logger = require('morgan');
const morgan = require('./utils /morgan');
const { errorConverter, errorHandler } = require('./middleware/errorHandler');
const ApiError = require('./utils /ApiError');

const app = express();

// Logger middleware
app.use(logger('dev'));

// Set security HTTP headers
app.use(helmet());

// Parse JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors());
app.options('*', cors());

// Morgan middleware in production
if (process.env.NODE_ENV !== 'development') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// // Error handling middleware
app.use(errorHandler);
app.use(errorConverter);

// Default route
app.get('/', (req, res) => {
  logger.info('This is an informational log message');
  res.send('Hello World and Welcome !');
});

// Handle unknown routes
app.all('*', (req, res, next) => {
  next(
    new ApiError(
      `Can't find ${req.originalUrl} on this server!`,
      httpStatus.NOT_FOUND,
    ),
  );
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// // Generic error handler
app.use((err, req, res, next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  res.status(statusCode).json({ error: err.message });
});

const myFormat = format.printf(
  ({ level, meta, timestamp }) => `${timestamp} ${level}: ${meta.message}`,
);

app.use(
  expressWinston.errorLogger({
    transports: [
      new transports.File({
        filename: 'logs/error.log',
      }),
    ],
    format: format.combine(format.json(), format.timestamp(), myFormat),
  }),
);

module.exports = app;
