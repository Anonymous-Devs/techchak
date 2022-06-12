const mongoose = require('mongoose');
mongoose.set('returnOriginal', false);

// destructure mongoose.Schema and mongoose.model
const { Schema, model } = mongoose;

const SupportGroupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 5,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 300,
    },
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'public',
    },
    isEnabled: {
      type: Boolean,
    },
    lastChatMessage: {
      type: mongoose.Schema.ObjectId,
      ref: 'GroupChatMessage',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model('SupportGroup', SupportGroupSchema);
