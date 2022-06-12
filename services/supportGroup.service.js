const { log } = require('console');
const { user } = require('pg/lib/defaults.js');
const SupportGroupModel = require('../modules/support-group/model.js');

class SupportGroup extends SupportGroupModel {
  static async createSupportGroup(data) {
    return await this.create(data);
  }

  static async updateGroup(id, group) {
    return await this.findByIdAndUpdate(id, group);
  }

  static async getSingleGroup(id) {
    return await this.findById(id);
  }

  static async deleteGroup(id) {
    return await this.findByIdAndDelete(id);
  }

  static async getAllGroup(query) {
    return await this.find(query).sort('-updatedAt');
  }

  static async getAllGroupWithReads(query, userId) {
    return await this.aggregate([
      {
        $lookup: {
          from: 'groupchatmessages',
          let: { groupId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$group', '$$groupId'] },
                    { $not: { $in: [userId, '$isReads.readByUserId'] } },
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
          from: 'groupchatmessages',
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
          name: 1,
          description: 1,
          visibility: 1,
          'lastChatMessage.message': '$lastChatMessage.createdAt',
          'lastChatMessage.createdAt': '$lastChatMessage.createdAt',
          'lastChatMessage.user.firstName': '$lastChatMessage.user.firstName',
          'lastChatMessage.user.lastName': '$lastChatMessage.user.firstName',
        },
      },
    ]);
  }

  static async updateLastChatMessage(groupId, messageId) {
    return await this.findByIdAndUpdate(groupId, {
      lastChatMessage: messageId,
    });
  }
}

module.exports = SupportGroup;
