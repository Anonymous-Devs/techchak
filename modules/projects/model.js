const mongoose = require('mongoose');
mongoose.set("returnOriginal", false);

// destructure mongoose.Schema and mongoose.model
const {
  Schema,
  model
} = mongoose;

const projectSchema = new Schema({
  title: {
    type: String,
    trim: true,
    // minlength: 3,
  },
  description: {
    type: String,
    // required: true,
    trim: true,
    // minlength: 3,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    default: [],
  }],
  department: {
    type: String,
    // enum: ['IT', 'HR', 'Sales', 'Marketing', '', ''],
    required: true,
    trim: true,
  },
  area: {
    type: String,
    // enum: ['IT', 'HR', 'Sales', 'Marketing', '', ''],
    // required: true,
    trim: true,
  },
  eta: {
    type: Number,
    // required: true,
    trim: true,
  },
  image: {
    type: String,
    trim: true
  },
  attachments: {
    type: [Object],
    default: []
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    // required: true,
    trim: true,
  },
  prerequisites: {
    type: String,
    // required: true,
    trim: true,
  },
  hints: {
    type: String,
    // required: true,
    trim: true,
  },
  type: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
    default: [],
  }],
  solutions: [{
    type: Schema.Types.ObjectId,
    ref: 'Wikis',
    // required: true,
    trim: true,
    default: [],
    populate: [{
      path: 'solutions',
    }],
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comments',
    // required: true,
    trim: true,
    default: [],
    populate: {
      path: 'comments'
    },
  }],
  ratings: [{
    type: Schema.Types.ObjectId,
    ref: 'Rating',
    trim: true,
    default: [],
    populate: {
      path: 'ratings'
    },
  }],
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
    trim: true,
    populate: {
      path: 'createdBy'
    }
  },
  
  isVisible: {
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

projectSchema.index({
  title: 1,
  type: 1,
  createdBy: 1,
  solutions: 1,
  department: 1,
  area: 1,
  isDraft: 1,
  isVisible: 1,
  level: 1,
  createdAt: 1,
});
exports.projectModel = model('Project', projectSchema);
/*

project - table
likes - [ user - ObjectId ]
title - text
timeline - date
department - enum
level - enum
description - text
prerequisites - text
tips  - text
type - text
tags - [ text ]
solutions - [ ObjectId ]
comments - [ ObjectId ]
participants - [ ObjectId ]
createdBy - objetId
createdAt - date
updatedAt - date
*/