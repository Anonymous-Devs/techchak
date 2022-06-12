const PrivateChatMessageModel = require('../modules/chat-message/model');

class PrivateChatMessage extends PrivateChatMessageModel {
  static async createMessage(data) {
    return await this.create(data);
  }

  static async getPrivateChatMessages(chatId) {
    // console.log(chatId);
    return await this.find({ chatId }).populate([
      { path: 'sender', select: 'firstName lastName avatar' },
      { path: 'receiver', select: 'firstName lastName avatar' },
    ]);
  }

  static async updateReadsRecipients(chatId, readsData) {
    return await this.updateMany(
      {
        chatId: chatId,
        'isReads.readByUserId': { $ne: readsData.readByUserId },
      },
      {
        $push: { isReads: readsData },
      }
    );
  }

  static async deleteMessage(id) {
    const message = await this.findOne({ _id: id });
    if (message) {
      await message.delete();
      return message._doc;
    } else {
      return null;
    }
  }
}

module.exports = PrivateChatMessage;
