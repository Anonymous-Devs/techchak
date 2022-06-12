// "use strict";
const mongoose = require('mongoose');
mongoose.set("returnOriginal", false);

// destructure mongoose.Schema and mongoose.model
const {
  Schema,
  model
} = mongoose;


//model.sta

const wikiSchema = new Schema({

  type: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
    // required: true,
    trim: true,
    minlength: 3,
  },
  body: {
    type: String,
    // required: true,
    trim: true,
    minlength: 3,
  },
  image: {
    type: String,
    default: 'https://res.cloudinary.com/remilekunelijah/image/upload/v1652023373/Learno/techchak-01_1.jpg'
  },
  tags: [{
    type: String,
    trim: true,
    default: [],
  }],
  department: {
    type: String,
    trim: true,
  },
  area: {
    type: String,
    trim: true,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    default: [],
    populate: {
      path: 'likes',
    }
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comments',
    default: [],
  }],
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    populate: {
      path: 'createdBy'
    }
  },
  isApproved: {
    type: Boolean,
    default: true,
  },
  isDraft: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});

wikiSchema.index({
  title: 1,
  type: 1,
  createdBy: 1,
  project: 1,
  department: 1,
  area: 1,
  isDraft: 1,
  isApproved: 1,
  createdAt: 1,
});
module.exports = model('wikis', wikiSchema);
