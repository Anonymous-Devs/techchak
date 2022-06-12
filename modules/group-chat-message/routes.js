const api = require('express').Router();
const controller = require('../../controllers/chatMessage');
const {
  validateAuthorization,
  validateUserAvailability,
} = require('../../middlewares');
const BodyValidator = require('../../middlewares/bodyValidator');

api.get(
  '/:groupId',
  validateAuthorization,
  validateUserAvailability,
  controller.fetchGroupMessages
);

api.put(
  '/:groupId/update-reads',
  validateAuthorization,
  validateUserAvailability,
  controller.updateGroupMessageReads
);

api.post(
  '/:groupId/send-message',
  validateAuthorization,
  validateUserAvailability,
  BodyValidator.createGroupChatMessage,
  controller.createGroupMessage
);
api.delete(
  '/delete/:id',
  validateAuthorization,
  validateUserAvailability,
  controller.deleteGroupMessage
);

module.exports = api;
