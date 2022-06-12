const mongoose = require('mongoose');
mongoose.set("returnOriginal", false);

const {
 Schema,
 model
} = mongoose;

const Testimonial = new Schema({
 name: {
  type: String,
  trim: true,
  required: true,
  unique: [true, 'You have already given your testimony'],
 },
 department: {
  type: String,
  trim: true,
  required: true,
 },
 area: {
  type: String,
  trim: true,
  required: true,
 },
 testimony: {
  type: String,
  trim: true,
  required: true,
 },
 image: {
  type: String,
  trim: true,
  required: true,
  default: "https://res.cloudinary.com/remilekunelijah/image/upload/v1652023362/Learno/techchak-01_2.jpg"
 },
 createdBy: {
  type: Schema.Types.ObjectId,
  ref: 'Profile',
  required: true,
  trim: true,
  populate: {
   path: 'createdBy'
  }
 }
}, {
 timestamps: true
})

const Testimonials = model('testimonial', Testimonial);

module.exports = Testimonials;