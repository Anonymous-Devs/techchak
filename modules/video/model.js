"use strict";
const mongoose = require('mongoose');
mongoose.set("returnOriginal", false);

// destructure mongoose.Schema and mongoose.model
const {
  Schema,
  model
} = mongoose;

const videoSchema = new Schema({

 type: {
  type: String,
  trim: true,
 },
 videoType: {
  type: String,
   trim: true,
},
 title: {
  type: String,
  required: true,
  trim: true,
  minlength: 3,
 },
 description: {
  type: String,
  required: true,
  trim: true,
  minlength: 3,
 },
 file: {
  type: String,
  required: true,
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
 }],
 comments: [{
  type: Schema.Types.ObjectId,
  ref: 'Comments',
  default: [],
 }],
 isVisible: {
  type: Boolean,
  default: true,
 },
 views: {
  type: Number,
  default: 0
 },
 createdBy: {
  type: Schema.Types.ObjectId,
  ref: 'Profile',
  required: true
 },
 createdAt: {
  type: Date,
  default: Date.now,
 },
 updatedAt: {
  type: Date,
  default: Date.now,
 }

});


module.exports = model('videos', videoSchema);
