const mongoose = require('mongoose');
mongoose.set("returnOriginal", false);

const {
 Schema,
 model
} = mongoose;


const settingsSchema = new Schema({
 name: {
  type: String,
  trim: true,
 },
 logo: {
  type: String,
  trim: true,
  default: "https://res.cloudinary.com/remilekunelijah/image/upload/v1648212327/Learno/techchak.jpg"
 },
 automate_app_acceptance: {
  type: Boolean,
  default: false
 },
 automate_app_acceptance_days: {
  type: String,
  default: '0'
 },
 automate_app_rejection: {
  type: Boolean,
  default: false
 },
 automate_app_rejection_days: {
  type: String,
  default: '0'
 },

 additional_settings: {
  type: Object,
  default: {}
 }

}, {
 timestamps: true
})



const departmentSchema = new Schema({
 name: {
  type: String,
  trim: true,
  required: true,
  unique: true
 },
});

const areaSchema = new Schema({
 department: {
  type: String,
  trim: true,
  required: true,
 },
 name: {
  type: String,
  trim: true,
  required: true,
  unique: true
 }
});

const skillsetSchema = new Schema({
 name: {
  type: String,
  trim: true,
  required: true,
  unique: true
 }
});

const CertificationsSchema = new Schema({
 name: {
  type: String,
  trim: true,
  required: true,
  unique: true
 }
});

const Settings = model('platform_Settings', settingsSchema),
 Departments = model('department', departmentSchema),
 Areas = model('area', areaSchema),
 Skillsets = model('Skillset', skillsetSchema),
 Certifications = model('certification', CertificationsSchema);

 module.exports = {
  Settings,
  Departments,
  Areas,
  Skillsets,
  Certifications
 }