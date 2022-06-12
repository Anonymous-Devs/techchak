const api = require('express').Router();
const controller = require('../../controllers/user');
const {
    validateAuthorization,
    validateUserAvailability,
    validateAdmin,
    validateSuperAdmin,
  } = require('../../middlewares'),
  BodyValidator = require('../../middlewares/bodyValidator');

api.get(
  '/active',
  validateAuthorization,
  validateUserAvailability,
  controller.getActiveUsers
);

api.get(
  '/all',
  validateAuthorization,
  validateUserAvailability,
  controller.getAllUsers
);

api.get(
  '/',
  validateAuthorization,
  validateUserAvailability,
  controller.getLoggedInUser
);

api.get(
  '/:id',
  validateAuthorization,
  validateUserAvailability,
  controller.getUserById
);

api.delete(
  '/:id',
  validateAuthorization,
  validateSuperAdmin,
  validateUserAvailability,
  controller.deleteUserById
);

api.put(
  '/',
  validateAuthorization,
  validateUserAvailability,
  BodyValidator.updateAccount,
  controller.updateAccount
);

api.put(
  '/upload',
  validateAuthorization,
  validateUserAvailability,
  BodyValidator.uploadAvatar,
  controller.uploadAvatar
);

api.put(
  '/uploadcv',
  validateAuthorization,
  validateUserAvailability,
  BodyValidator.uploadResume,
  controller.uploadResume
);

api.put(
  '/uploadcover',
  validateAuthorization,
  validateUserAvailability,
  BodyValidator.uploadCover,
  controller.uploadCover
);

api.put(
  '/:id',
  validateAuthorization,
  validateUserAvailability,
  BodyValidator.updateAppStatus,
  controller.updateApplicationStatus
);

api.post(
  '/enable-disable/:id',
  validateAuthorization,
  validateAdmin,
  validateUserAvailability,
  controller.toggleUserApproval
);

api.patch(
  '/upgrade/:userId',
  validateAuthorization,
  validateUserAvailability,
  validateAdmin,
  BodyValidator.upgradeUser,
  controller.upgradeUser
);

api.patch(
  '/update-online-status',
  validateAuthorization,
  validateUserAvailability,
  controller.updateUserChatStatus
);
module.exports = api;
