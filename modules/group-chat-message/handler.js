const path = require('path');
const GroupChatService = require('../../services/groupChats.service');

exports.sendMessage = async (messageData) => {
  const message = await GroupChatService.createMessage(messageData);
  return message;
};

exports.getMessages = async (groupId) => {
  const messages = await GroupChatService.getGroupMessages(groupId);
  return messages;
};

exports.updateUserMessageReads = async (groupId, readsData) => {
  const updatedRecords = await GroupChatService.updateReadsRecipients(
    groupId,
    readsData
  );
  return updatedRecords;
};

exports.deleteMessage = async (messageId, userId) => {
  const message = await GroupChatService.deleteMessage(messageId, userId);
  return message;
};
