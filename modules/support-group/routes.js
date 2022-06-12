const api = require('express').Router();
const controller = require('../../controllers/supportgroup');
const {
    validateAuthorization,
    validateUserAvailability,
    validateAdmin,
  } = require('../../middlewares'),
  BodyValidator = require('../../middlewares/bodyValidator');

api.get(
  '/',
  validateAuthorization,
  validateUserAvailability,
  validateAdmin,
  controller.fetchGroups
);

api.get(
  '/reads',
  validateAuthorization,
  validateUserAvailability,
  controller.fetchGroupsWithReads
);

api.post(
  '/create',
  validateAuthorization,
  validateUserAvailability,
  validateAdmin,
  BodyValidator.createSupportGroup,
  controller.createGroup
);
api.put(
  '/update/:id',
  validateAuthorization,
  validateUserAvailability,
  validateAdmin,
  BodyValidator.updateSupportGroup,
  controller.updateGroup
);
api.get(
  '/:id',
  validateAuthorization,
  validateUserAvailability,
  controller.getSingleGroup
);
api.delete(
  '/delete/:id',
  validateAuthorization,
  validateUserAvailability,
  validateAdmin,
  controller.deleteGroup
);

module.exports = api;
