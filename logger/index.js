const config = require("../configs/config");
const developmentLogger = require("./dev");
const productionLogger = require("./prod");

let logger;
if (config.env.toLowerCase() === "development") {
  logger = developmentLogger();
} else logger = productionLogger();

module.exports = logger;