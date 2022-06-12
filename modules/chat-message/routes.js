const api = require('express').Router();
const controller = require('../../controllers/chatMessage');
const {
    validateAuthorization,
    validateUserAvailability,
  } = require('../../middlewares'),
  BodyValidator = require('../../middlewares/bodyValidator');

//   initialise private chat with user
api.post(
  '/init/:withUserId',
  validateAuthorization,
  validateUserAvailability,
  controller.initPrivateChat
);

// get user private chats
api.get(
  '/',
  validateAuthorization,
  validateUserAvailability,
  controller.getPrivateChats
);

// get single private chat
api.get(
  '/:chatId',
  validateAuthorization,
  validateUserAvailability,
  controller.getSinglePrivateChat
);

// get chat messages
api.get(
  '/:chatId/messages',
  validateAuthorization,
  validateUserAvailability,
  controller.getPrivateChatMessages
);

// send message to chat
api.post(
  '/:chatId/send-message',
  validateAuthorization,
  validateUserAvailability,
  BodyValidator.createGroupChatMessage,
  controller.createPrivateChatMessage
);

// update read message
api.put(
  '/:chatId/update-reads',
  validateAuthorization,
  validateUserAvailability,
  controller.updatePrivateChatMessageReads
);

// delete chat message
api.delete(
  '/delete/:id',
  validateAuthorization,
  validateUserAvailability,
  controller.deletePrivateChatMessage
);

// is Typing
api.post(
  '/typing/:chatId',
  validateAuthorization,
  validateUserAvailability,
  controller.setUserTyping
);

module.exports = api;
