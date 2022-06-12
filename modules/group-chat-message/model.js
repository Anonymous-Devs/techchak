const mongoose = require('mongoose');
mongoose.set('returnOriginal', false);

const readByRecipientSchema = new mongoose.Schema(
  {
    _id: false,
    readByUserId: { type: mongoose.Schema.ObjectId, ref: 'Accounts' },
    readAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: false,
  }
);

const GroupChat = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'Profile',
      required: [true, 'sender is required'],
    },
    group: {
      type: mongoose.Schema.ObjectId,
      ref: 'SupportGroup',
      required: [true, 'support id required'],
    },
    message: {
      type: String,
      required: [true, 'message is required'],
    },
    assetUrl: {
      type: String,
      default: null,
    },
    isReads: [readByRecipientSchema],
  },
  { timestamps: true }
);

const GroupChatModel = mongoose.model('GroupChatMessage', GroupChat);

module.exports = GroupChatModel;
