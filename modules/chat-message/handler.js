const PrivateChatService = require('../../services/privateChats.service');
const PrivateMessageService = require('../../services/privateMessage.service');

exports.createPrivateChat = async (chatData) => {
  const chat = await PrivateChatService.createPrivateChat(chatData);
  return chat;
};

exports.getUserPrivateChats = async (userId, accountId) => {
  const chats = await PrivateChatService.getUserPrivateChats(userId, accountId);
  return chats;
};

exports.getSinglePrivateChat = async (queryData) => {
  const chat = await PrivateChatService.getSinglePrivateChat(queryData);
  return chat;
};

exports.deletePrivateChat = async (chatId) => {
  const chat = await PrivateChatService.deletePrivateChat(chatId);
  return chat;
};

exports.updateLastChatMessage = async (chatId, messageId) => {
  const chat = await PrivateChatService.updateLastChatMessage(
    chatId,
    messageId
  );
  return chat;
};

// private chat messages
exports.sendPrivateChatMessage = async (messageData) => {
  const message = await PrivateMessageService.createMessage(messageData);
  return message;
};

exports.updateUserMessageReads = async (chatId, readsData) => {
  const updatedRecords = await PrivateMessageService.updateReadsRecipients(
    chatId,
    readsData
  );
  return updatedRecords;
};

exports.getPrivateChatMessages = async (chatId) => {
  const messages = await PrivateMessageService.getPrivateChatMessages(chatId);
  return messages;
};

exports.deletePrivateChatMessage = async (messageId) => {
  const message = await PrivateMessageService.deleteMessage(messageId);
  return message;
};
