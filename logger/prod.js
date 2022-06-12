/* jslint node:true */
// jshint esversion:8

const { format, createLogger, transports } = require("winston");
const path = require("path");

const { timestamp, combine, errors, json } = format;

const httpTransportOptions = {
  host: "http-intake.logs.datadoghq.com",
  path:
    "/api/v2/logs?dd-api-key=d49b6e89695129977e9662ff948f18c8&ddsource=nodejs&service=techchak",
  ssl: true,
};

function productionLogger() {
  return createLogger({
    exitOnError: false,
    format: combine(timestamp(), errors({ stack: true }), json()),
    defaultMeta: { service: "techchak-service" },
    transports: [
      new transports.Console(),
      new transports.File({
        filename: path.resolve("logs/server.log"),
        level: "info",
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB // 15242880 15MB
        maxFiles: 100,
        colorize: false,
        exitOnError: false,
      }),

      new transports.Http(httpTransportOptions),
    ],
  });
}

module.exports = productionLogger;