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

const PrivateChatMessage = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.ObjectId,
      ref: 'PrivateChat',
      required: [true, 'chat id is required'],
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'Profile',
      required: [true, 'sender is required'],
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      ref: 'Profile',
      required: [true, 'receiver id required'],
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

const PrivateChatModel = mongoose.model(
  'PrivateChatMessage',
  PrivateChatMessage
);

module.exports = PrivateChatModel;
