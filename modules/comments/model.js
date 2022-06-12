const mongoose = require('mongoose');
mongoose.set("returnOriginal", false);

// destructure mongoose.Schema and mongoose.model
const {
 Schema,
 model
} = mongoose;

const schema = new Schema({
 type: {
  type: String,
  required: true,
  trim: true,
  enum: ['video', 'project', 'wiki'],
 },
 createdBy: {
  type: Schema.Types.ObjectId,
  ref: 'Profile',
  required: true,
  populate: {
   path: 'createdBy'
  }
 },
 project: {
  type: Schema.Types.ObjectId,
  ref: 'Projects',
  populate: {
   path: 'project'
  },
 },
 video: {
  type: Schema.Types.ObjectId,
  ref: 'Videos',
  populate: {
   path: 'video'
  }
 },
 wiki: {
  type: Schema.Types.ObjectId,
  ref: 'Wikis',
  populate: {
   path: 'wiki'
  }
 },

 comment: {
  type: String,
  required: true,
  trim: true,
  minlength: 1
 },
 likes: [{
  type: Schema.Types.ObjectId,
  ref: 'Profile',
  default: [],
}],
}, {
 timestamps: true
});

module.exports = model('Comments', schema);

/*
comments - table
type - enum (solution, project, wiki, video)
user - ObjectId
project - ObjectId || solution - ObjectId || video - ObjectId || wiki - ObjectId
comment - text
createdAt - date
updatedAt - date
*/