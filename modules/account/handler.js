const path = require('path');
const AccountService = require(path.resolve('services', 'account.service'));

exports.createUser = async (body) => {
  
  const account = await AccountService.createAccount(body);
  return account;
}

exports.login = async (body, referrer) => {
  const data = await AccountService.login(body, referrer);
  return data;
}

exports.resendVerificationEmail = async (id, pid) => {

  const result = await AccountService.resendVerificationEmail(id, pid);
  return result;
};

exports.verifyAccount = async (secure) => {
  const result = await AccountService.verifyAccount(secure);
  return result;
}

exports.changePassword = async (id, body) => {
  const result = await AccountService.changePassword(id, body);
  return result;
}

exports.forgotPassword = async (email) => {
  const result = await AccountService.forgotPassword(email);
  return result;
}

exports.resetPassword = async (secure, body) => {
  body.secure = secure;
  const result = await AccountService.resetPassword(body);
  return result;
}