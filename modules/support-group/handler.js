const path = require('path');
const SupportGroupService = require('../../services/supportGroup.service');

exports.createGroup = async (body) => {
  const group = await SupportGroupService.createSupportGroup(body);
  return group;
};

exports.updateGroup = async (id, data) => {
  const group = await SupportGroupService.updateGroup(id, data);
  return group;
};

exports.getSingleGroup = async (id) => {
  const group = await SupportGroupService.getSingleGroup(id);
  return group;
};

exports.deleteGroup = async (id) => {
  const result = await SupportGroupService.deleteGroup(id);
  return result;
};

exports.fetchGroups = async (id) => {
  const result = await SupportGroupService.getAllGroup(id);
  return result;
};

exports.fetchGroupsWithReads = async (id, userId) => {
  const result = await SupportGroupService.getAllGroupWithReads(id, userId);
  return result;
};

exports.updateLastChatMessage = async (id, message) => {
  const result = await SupportGroupService.updateLastChatMessage(id, message);
  return result;
};
