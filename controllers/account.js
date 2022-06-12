const path = require("path"),
  accountHandler = require(path.resolve("modules", "account", "handler"));
  const {
    ADMIN,
    FELLOW
  } =  require(path.resolve("utils", "role"));

exports.createUser = async (req, res, next) => {
  
  try {
    const account = await accountHandler.createUser(res.locals.validatedBody);
    res.status(account.code).json(account);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.login = async (req, res, next) => {
  logger.info({
    method: req.method,
    path: req.originalUrl
  });
  try {
    let referrer = req.headers.referer,
    host;

    if(referrer.indexOf(ADMIN) > -1) host = ADMIN;
    else if(referrer.indexOf('localhost') > -1) host = 'same-origin';
    else host = FELLOW
    
    const data = await accountHandler.login(res.locals.validatedBody, host);
    res.status(data.code).json(data);
  } catch (err) {
    // logger.error(err);
    res.status(err.code).json(err);
  }
};

exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const {
      id,
      pid
    } = res.locals.user;
    const result = await accountHandler.resendVerificationEmail(id, pid);
    res.status(result.code).json(result);
  } catch (err) {
    logger.error(err);
  }
}

exports.verifyAccount = async (req, res, next) => {
  logger.info({
    method: req.method,
    path: req.originalUrl
  });
  try {
    const secure = req.query.secure;
    const result = await accountHandler.verifyAccount(secure);
    res.status(result.code).json(result);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.changePassword = async (req, res, next) => {
  logger.info({
    method: req.method,
    path: req.originalUrl
  });
  try {
    const {
      id
    } = res.locals.user;

    const result = await accountHandler.changePassword(id, res.locals.validatedBody);
    res.status(result.code).json(result);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}

exports.forgotPassword = async (req, res, next) => {
  logger.info({
    method: req.method,
    path: req.originalUrl
  });
  try {
    const forgot = await accountHandler.forgotPassword(res.locals.validatedBody.email);
    res.status(forgot.code).json(forgot);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err)
  }
}

exports.resetPassword = async (req, res, next) => {
  logger.info({
    method: req.method,
    path: req.originalUrl
  });
  try {
    const secure = req.query.secure;
    if (!Object.keys(req.query).includes('secure') || !req.query.secure) throw {
      code: 403,
      message: 'Invalid secure token'
    };

    const result = await accountHandler.resetPassword(secure, res.locals.validatedBody);
    res.status(result.code).json(result);
  } catch (err) {
    logger.error(err);
    res.status(err.code).json(err);
  }
}