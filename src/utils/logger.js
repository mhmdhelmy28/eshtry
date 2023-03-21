const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const logFormat = printf(({ timestamp, level, message, method, url, body, params, query, stack }) => {
    return `${timestamp} ${level}: ${message} - ${method} ${url} ${JSON.stringify({
      body,
      params,
      query,
    })} ${stack || ''}`;
  });

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;
