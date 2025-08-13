import winston from 'winston';

const customLevels = {
  levels: { debug:0, http:1, info:2, warning:3, error:4, fatal:5 },
  colors: { debug:'cyan', http:'blue', info:'green', warning:'yellow', error:'red', fatal:'magenta' }
};
winston.addColors(customLevels.colors);

const isProd = process.env.NODE_ENV === 'production';

const transports = [
  new winston.transports.Console({
    level: isProd ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.colorize({ all: !isProd }),
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp, ...meta }) =>
        `[${timestamp}] ${level} ${message}${Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''}`
      )
    )
  })
];

if (isProd) {
  transports.push(
    new winston.transports.File({
      filename: 'errors.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

export const logger = winston.createLogger({
  levels: customLevels.levels,
  transports
});


export const requestLogger = (req, _res, next) => {
  req.logger = logger;
  logger.http(`➡ ${req.method} ${req.originalUrl}`);
  next();
};
