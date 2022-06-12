const SupportGroupChatModel = require('../modules/group-chat-message/model.js');

class GroupChatService extends SupportGroupChatModel {
  static async createMessage(data) {
    return await this.create(data);
  }

  static async getGroupMessages(groupId) {
    return await this.find({ group: groupId }).populate([
      { path: 'user', select: 'firstName lastName' },
    ]);
  }

  static async updateReadsRecipients(groupId, readsData) {
    return await this.updateMany(
      {
        group: groupId,
        'isReads.readByUserId': { $ne: readsData.readByUserId },
      },
      {
        $push: { isReads: readsData },
      }
    );
  }

  static async deleteMessage(id, userId) {
    const message = await this.findOne({ _id: id, user: userId });
    if (message) {
      await message.delete();
      return message._doc;
    } else {
      return null;
    }
  }
}

module.exports = GroupChatService;
