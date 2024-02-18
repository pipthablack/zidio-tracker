const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
  ),
});

const dailyRotateFileTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

const fileTransport = new transports.File({
  filename: 'logs/error.log',
  level: 'error',
  format: format.combine(format.uncolorize(), format.simple()),
});

const logger = createLogger({
  transports: [consoleTransport, dailyRotateFileTransport, fileTransport],
  format: format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.prettyPrint(),
    logFormat,
  ),
});

module.exports = logger;
