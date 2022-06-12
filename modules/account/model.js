const mongoose = require('mongoose');
const crypto = require('crypto');
mongoose.set('returnOriginal', false);

const { Schema, model } = mongoose;

const accountSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 100,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 300,
    },
    defaultPassword: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    passwordArchived: [
      {
        type: String,
        trim: true,
        minlength: 8,
        maxlength: 300,
      },
    ],
    status: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
      lowercase: true,
      enum: ['active', 'inactive', 'suspended'],
      default: 'inactive',
    },
    isEnabled: {
      type: Boolean,
    },
    applicationStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
    },
    lastLogin: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    role: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
      enum: ['admin', 'superAdmin', 'fellow', 'builder'],
      default: 'fellow',
    },
    onlineChatStatus: {
      type: String,
      enum: ['online', 'offline', 'away', 'custom'],
      default: 'offline',
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({
  email: 1,
  role: 1,
  isEnabled: 1,
  applicationStatus: 1,
});

module.exports = model('Accounts', accountSchema);
