const api = require('express').Router();
const controller = require('../../controllers/account');
const {
 validateAuthorization,
 validateUserAvailability,
 attachOriginHostToQuery,
 validateAdmin
} = require('../../middlewares'),
BodyValidator = require('../../middlewares/bodyValidator');


api.post('/signup', BodyValidator.signup, controller.createUser);

api.post('/admin/signup', BodyValidator.signup, controller.createUser);

api.get('/verify', controller.verifyAccount);

api.post('/resend-verification-email', validateAuthorization, validateUserAvailability, controller.resendVerificationEmail);

api.post('/login', attachOriginHostToQuery, BodyValidator.login, controller.login);

api.post('/change-password', validateAuthorization, validateUserAvailability, BodyValidator.changePassword, controller.changePassword);

api.post('/forgot-password', BodyValidator.forgotPassword, controller.forgotPassword);

api.post('/reset-password', BodyValidator.resetPassword, controller.resetPassword);

module.exports = api