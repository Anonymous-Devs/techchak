const mongoose = require('mongoose');
mongoose.set('returnOriginal', false);

const { Schema, model } = mongoose;

const userProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'Accounts',
      required: true,
      populate: {
        path: 'user',
        select: '-password -passwordArchived',
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 100,
    },
    firstName: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    lastName: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    preferredName: {
      type: String,
      trim: true,
      minlength: 1,
      maxlength: 300,
    },
    number: {
      type: String,
      trim: true,
      minlength: 10,
      maxlength: 100,
    },
    country: {
      type: String,
      trim: true,
      minlength: 3,
    },
    state: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    portfolioLink: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    skillset: [
      {
        type: String,
        trim: true,
      },
    ],
    jobTitle: {
      type: String,
      trim: true,
    },
    certification: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceLevel: {
      type: String,
      trim: true,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner',
    },
    resume: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
      default:
        'https://res.cloudinary.com/remilekunelijah/image/upload/v1652023362/Learno/techchak-01_2.jpg',
    },
    coverImage: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
    },
    socialLinks: {
      type: {
        facebook: {
          type: String,
          trim: true,
        },
        twitter: {
          type: String,
          trim: true,
        },
        linkedin: {
          type: String,
          trim: true,
        },
        instagram: {
          type: String,
          trim: true,
        },
        youtube: {
          type: String,
          trim: true,
        },
      },
    },
    reasonForJoining: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

exports.userProfileModel = model('Profile', userProfileSchema);