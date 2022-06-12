const { format, createLogger, transports } = require("winston");

const { timestamp, combine, printf, colorize, errors } = format;

const loggerFormat = printf(({ level, message, timestamp, stack }) => {
  
    if(message instanceof Object) message = Object.keys(message).map(d => `${d} = ${message[d]}`);

  return `${timestamp} ${level}: ${stack || message}`;
});

function developmentLogger() {
  return createLogger({
    level: "debug",
    format: combine(
      colorize(),
      timestamp({
        format: "HH:MM:SS",
      }),
      errors({ stack: true }),
      loggerFormat
    ),
    transports: [new transports.Console()],
  });
}

module.exports = developmentLogger; 