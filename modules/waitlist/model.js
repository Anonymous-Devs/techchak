"use strict";
const mongoose = require('mongoose');
mongoose.set("returnOriginal", false);

// destructure mongoose.Schema and mongoose.model
const {
 Schema,
 model
} = mongoose;

const schema = new Schema({
 fullName: {
  type: String,
  required: true
 },
 number: {
  type: String,
  required: true
 },
 email: {
  type: String,
  required: true,
  unique: true
 },
 country: {
  type: String
 },
}, {
 timestamps: true
});

module.exports = new model('waitlist', schema);