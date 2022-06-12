/*jslint node: true */
// jshint esversion:8

"use strict";

const logger = require("../logger");
const { HTTP_NOT_FOUND } = require("../utils/http.response.code");

const express = require("express"),
  fileupload = require("express-fileupload"),
  fs = require("fs"),
  cors = require("cors"),
  morgan = require("morgan"),
  PlatformService = require("../services/platform.service"),
  app = express(),
  path = require("path"),
  config = require("./config"),
  database = require("./database"),
  route = require(path.resolve("routes", config.version)),
  { createStream } = require("rotating-file-stream"),
  ApiResponse = require(path.resolve("utils/http.response")),
  { HTTP_OK, HTTP_INTERNAL_SERVER_ERROR } = require(path.resolve(
    "utils/http.response.code"
  )),
  { WELCOME_MESSAGE, INTERNAL_SERVER_ERROR, ROUTE_NOT_FOUND } = require(path.resolve(
    "utils/http.response.message"
  ));

  logger.debug("Overriding 'Express' logger");
  logger.info(`Server running in ${config.env.toUpperCase()} environment`);

const filename = "access.log";
const logDirectory = path.join(__dirname, "../logs");

const accessLogStream = createStream(filename, {
  interval: "7d", // rotate weekly
  compress: "gzip", // compress rotated files
  maxFiles: 20,
  size: "30M",
  maxSize: "30M",
  mode: 0o0640,
  history: "logHistory.txt",
  path: logDirectory,
  teeToStdout: true,
});
let data;
if (config.env.toLowerCase() === "development") {
  data = morgan("combined");
} else {
  data = morgan("combined", {
    stream: accessLogStream,
  });
}
// setup the logger
app.use(data);

const configData = {
  useTempFiles: true,
  tempFileDir: path.join("uploads", "tmp"),
  preserveExtension: true,
  limits: { fileSize: config.max_file_upload },
  debug: true,
  abortOnLimit: true,
  limitHandler: (req, res, next) => {
    fs.readdirSync(path.join("uploads", "tmp")).forEach((file) => fs.unlinkSync(path.join("uploads", "tmp", file)));
    
    const data = {message: `Uploaded file must be ${helper.getFileSize({size: config.max_file_upload})} or below.`, code: 413
    }
    res.status(data.code).json(data);
  }
}
if(config.env.toLowerCase() != 'development') delete configData.debug;
// File Upload
app.use(
  fileupload(configData)
);

database.connect(config.mongodb_uri);

app.use(express.static(path.resolve(__dirname, "../public")));
app.set("view engine", "ejs");
app.set("views", path.resolve("views"));

app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

app.set("port", config.port);

const corsOption = {

  origin: (origin, callback) => {
    config.env.toLowerCase() == "development"
      ? logger.info(`Cors Request from: ${origin || config.host}`)
      : null;

    if (
      /undefined/.test(origin) ||
      /localhost:\d{1,4}$/.test(origin) ||
      /\.techchak\.com$/.test(origin)
    ) {
      callback(null, true);
    } else {
      const err = new Error("CORS rejected from origin: " + origin);
      logger.error(err);
      callback(err);
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOption));

const apiVersion = config.version;

app.get(`/${apiVersion}`, (req, res, next) => {
  logger.info({method: req.method, path: req.originalUrl});
   data = ApiResponse.gen(HTTP_OK, WELCOME_MESSAGE, {
    name: "techchak-service",
    version: "1.0.0",
  });

  res.status(data.code).json(data);
});

PlatformService.mornitorAutomation();

app.use(`/${apiVersion}`, route);

app.use('*', (req, res, next) => {
  const data = ApiResponse.gen(HTTP_NOT_FOUND, ROUTE_NOT_FOUND);
  res.status(data.code).json(data);

app.use((err, req, res, next) => {
  logger.error(err);
  res.status(HTTP_INTERNAL_SERVER_ERROR)
    .json(
      ApiResponse.gen(
        HTTP_INTERNAL_SERVER_ERROR,
        INTERNAL_SERVER_ERROR,
        err.message
      )
    );
});

})
module.exports = app;
