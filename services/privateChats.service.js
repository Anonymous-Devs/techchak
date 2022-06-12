const PrivateChatModel = require('../modules/private-chat/model.js');

class PrivateChat extends PrivateChatModel {
  static async createPrivateChat(data) {
    return await this.create({ users: data });
  }

  static async getUserPrivateChats(userId, accountId) {
    return await this.aggregate([
      {
        $match: {
          $expr: { $in: [userId, '$users'] },
        },
      },
      {
        $lookup: {
          from: 'privatechatmessages',
          let: { privateChatId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$chatId', '$$privateChatId'] },
                    { $not: { $in: [accountId, '$isReads.readByUserId'] } },
                  ],
                },
              },
            },
          ],
          as: 'messages',
        },
      },
      {
        $lookup: {
          from: 'profiles',
          let: { users: '$users' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$users'],
                },
              },
            },
            {
              $lookup: {
                from: 'accounts',
                let: { userId: '$user' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$userId'],
                      },
                    },
                  },
                ],
                as: 'user',
              },
            },
            {
              $unwind: {
                path: '$user.onlineChatStatus',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                avatar: 1,
                onlineChatStatus: {
                  $ifNull: ['$user.onlineChatStatus', 'offline'],
                },
              },
            },
          ],
          // localField: 'users',
          // foreignField: '_id',
          as: 'users',
        },
      },
      {
        $lookup: {
          from: 'privatechatmessages',
          let: { lastChatMessageId: '$lastChatMessage' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$lastChatMessageId'],
                },
              },
            },
            {
              $lookup: {
                from: 'profiles',
                let: { userId: '$sender' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ['$_id', '$$userId'],
                      },
                    },
                  },
                ],
                as: 'user',
              },
            },
          ],
          as: 'lastChatMessage',
        },
      },
      {
        $unwind: { path: '$lastChatMessage', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: {
          path: '$lastChatMessage.user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
      {
        $project: {
          unreadMessages: { $size: '$messages' },
          users: 1,
          'lastChatMessage.message': '$lastChatMessage.createdAt',
          'lastChatMessage.createdAt': '$lastChatMessage.createdAt',
          'lastChatMessage.user.firstName': '$lastChatMessage.user.firstName',
          'lastChatMessage.user.lastName': '$lastChatMessage.user.firstName',
        },
      },
    ]);
  }

  static async getSinglePrivateChat(queryData) {
    return await this.findOne(queryData).populate([
      {
        path: 'users',
        select: 'firstName lastName avatar user',
        populate: { path: 'user', select: 'onlineChatStatus' },
      },
      {
        path: 'lastChatMessage',
        select: 'message createdAt sender',
        populate: { path: 'sender', select: 'firstName lastName avatar' },
      },
    ]);
  }

  static async deletePrivateChat(id) {
    return await this.findByIdAndDelete(id);
  }

  static async updateLastChatMessage(chatId, messageId) {
    return await this.findByIdAndUpdate(chatId, { lastChatMessage: messageId });
  }
}

module.exports = PrivateChat;
