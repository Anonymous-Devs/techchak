const joi = require('joi');

const password = joi.string().min(8).max(20).required();
const email = joi.string().email();
const oldPassword = joi.string().min(8).max(20).required();

// profile
const firstName = joi.string().min(3).max(100);
const lastName = joi.string().min(3).max(100);
const number = joi.string().min(10).max(15);
const avatar = joi.string();
const image = joi.string();
const preferredName = joi.string().max(300).allow('');

const country = joi.string().min(3);
const state = joi.string().min(3).max(100);
const portfolioLink = joi.string().allow('');
const certification = joi.array().items(joi.string());
const department = joi.string().min(2).max(200);
const area = joi.string().min(2).max(200);
const skillset = joi.array().items(joi.string().min(2).max(150));
const resume = joi.string().allow('');
const experienceLevel = joi
  .string()
  .min(3)
  .max(100)
  .valid('Beginner', 'Intermediate', 'Advanced', 'Expert');
const portfolioProjectStatus = joi
  .string()
  .min(3)
  .max(100)
  .valid('In Progress', 'Completed', 'To Do');
const jobTitle = joi.string().min(3).max(100);
const bio = joi.string().min(3);
const socialLinks = joi.object().keys({
  linkedin: joi.string().min(3).max(500),
  github: joi.string().min(3).max(400),
  twitter: joi.string().min(3).max(400),
  facebook: joi.string().min(3).max(400),
  instagram: joi.string().min(3).max(400),
  youtube: joi.string().min(3).max(400),
});
const fullName = joi.string().min(3).max(100);

const { ADMIN, SUPERADMIN, FELLOW, BUILDER } = require('./role.js');

exports.accountSchema = joi.object({
  email,
  password,
  type: joi.string().valid(ADMIN, SUPERADMIN, FELLOW, BUILDER),
});

exports.userSignupSchema = joi.object({
  firstName: firstName.required(),
  lastName: lastName.required(),
  jobTitle,
  number: number.required(),
  avatar,
  email: email.required(),
  preferredName,
  country,
  state,
  portfolioLink,
  department: department.required(),
  area: area.required(),
  skillset,
  resume,
  experienceLevel,
  certification,
  defaultPassword: password,
  reasonForJoining: joi.string().max(1000).allow(""),
  type: joi.string().valid(FELLOW, BUILDER),
});

exports.adminSignupSchema = joi.object({
  number: number.required(),
  email: email.required(),
  password,
  fullName: fullName.required(),
  confirmPassword: joi.ref('password'),
  type: joi.string().valid(ADMIN, SUPERADMIN, BUILDER),
});

exports.changePasswordSchema = joi.object({
  oldPassword,
  password,
});

exports.updateAppStatusSchema = joi.object({
  status: joi.string().valid('accepted', 'rejected', 'pending'),
});

exports.profileSchema = joi.object({
  firstName,
  lastName,
  number,
  avatar,
  email,
  preferredName,
  country,
  experienceLevel,
  state,
  portfolioLink,
  department,
  area,
  certification,
  skillset,
  resume,
  jobTitle,
  bio,
  socialLinks,
});

const title = joi.string().min(3).max(500),
  eta = joi.number(),
  level = joi.string().min(3).max(100),
  description = joi.string().min(3),
  prerequisites = joi.string().min(3),
  hints = joi.string().min(3),
  type = joi.string(),
  tags = joi.array().items(joi.string()),
  file = joi.string(),
  isVisible = joi.boolean().valid(true, false);

exports.projectSchema = joi.object({
  title: title.required(),
  eta: eta.required(),
  level: level.required(),
  department: department.required(),
  area,
  description: description.required(),
  prerequisites,
  hints,
  type: type.required(),
  tags,
  file,
  attachments: joi.any().allow(),
  isVisible,
});

exports.updateProjectSchema = joi.object({
  title,
  eta,
  level,
  department,
  area,
  description,
  prerequisites,
  hints,
  type,
  tags,
  file,
  attachments: joi.any().allow(),
  isVisible,
});

exports.createWikiSchema = joi.object({
  title: title.required(),
  type: type.required(),
  tags: tags.required(),
  department: department.required(),
  area: area.required(),
  image: image.required(),
  body: description.required(),
});

exports.updateWikiSchema = joi.object({
  title,
  type,
  tags,
  department,
  area,
  image,
  body: description,
});

exports.createVideoSchema = joi.object({
  title: title.required(),
  type: joi.string().valid('tutorial', 'solution', 'onboarding'),
  videoType: joi.string().valid('raw', 'link'),
  description: description.required(),
  file: joi.any().allow(),
  tags,
  department: department.required(),
  area: area.required(),
});

exports.updateVideoSchema = joi.object({
  title,
  type,
  videoType: joi.string().valid('raw', 'link'),
  description: description,
  tags,
  department,
  area,
});

exports.projectDeletionSchema = joi.object({
  reason: joi.string().min(3).max(1000).required(),
});

exports.imageSchema = joi.object({
  file,
  fileName: joi.string(),
});

exports.cvSchema = joi.object({
  file,
});

exports.cImageSchema = joi.object({
  file: file.required(),
});

exports.cc = joi.object({
  comment: joi.string().min(3).max(1000).required(),
});

exports.portfolioProjectStatusSchema = joi.object({
  status: portfolioProjectStatus.required(),
});

exports.supportGroupSchema = joi.object({
  name: joi.string().min(3).max(50).required(),
  description: joi.string().min(20).max(300).required(),
  visibility: joi.string().valid('private', 'public').required(),
  isEnabled: joi.boolean(),
});

exports.forgotPasswordSchema = joi.object({
  email,
});

exports.resetPasswordSchema = joi.object({
  password,
});

exports.supportGroupChatSchema = joi.object({
  message: joi.string().min(1).max(1500).required(),
  file,
  fileName: joi.string(),
});

exports.testimonySchema = joi.object({
  testimony: joi.string().min(3).max(1000).required(),
});

exports.upgradeUserSchema = joi.object({
  type: joi.string().valid(FELLOW, BUILDER, ADMIN, SUPERADMIN),
});

exports.joinWaitlist = joi.object({
  email: email.required(),
  fullName: fullName.required(),
  number: number.required(),
  country: country.required(),
});
