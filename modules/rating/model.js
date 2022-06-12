const mongoose = require('mongoose');
mongoose.set("returnOriginal", false);

// destructure mongoose.Schema and mongoose.model
const {
 Schema,
 model
} = mongoose;


const ratings = new Schema({
 type: {
  type: String,
  required: true,
  trim: true,
  enum: ['video', 'project', 'wiki'],
 },
 data: [{
  user: {
   type: Schema.Types.ObjectId,
   ref: 'Profile',
  },
  weight: {
   type: Number,
   default: 0
  },
 }],
 averageRating: {
  type: Number,
  default: 0
 },
 project: {
  type: Schema.Types.ObjectId,
  ref: 'Projects'
 },
 video: {
  type: Schema.Types.ObjectId,
  ref: 'Videos'
 },
 wiki: {
  type: Schema.Types.ObjectId,
  ref: 'Wikis'
 },

}, {
 timestamps: true
})

module.exports = model('Rating', ratings);