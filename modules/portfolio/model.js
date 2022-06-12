"use strict";
const mongoose = require('mongoose');
mongoose.set("returnOriginal", false);

// destructure mongoose.Schema and mongoose.model
const { Schema, model } = mongoose;


const portfolio = new Schema({
 user: {
   type: Schema.Types.ObjectId,
   ref: 'Profile',
   required: true,
   populate: {
     path: 'user',
   }
 },

 roadmap: Array,

 progress: {
   type: Number,
   default: 0,
   max: 100
 },

 totalProjectCreated: {
   type: Number,
    default: 0,
 },

 totalProjectCompleted:{
   type: Number,
    default: 0,
 },

  totalCapstoneCompleted:{
    type: Number,
    default: 0,
  },

 capstone: [{
   status: {
     type: String,
     enum: ['To Do', 'In Progress', 'Completed'],
     default: 'To Do'
   },
   project: {
     type: Schema.Types.ObjectId,
     ref: 'Project',
   }
 }],

 personal: [{
   status: {
     type: String,
     enum: ['To Do', 'In Progress', 'Completed'],
     default: 'To Do'
   },
   project: {
     type: Schema.Types.ObjectId,
     ref: 'Project',
   }
 }],
 
 team: [{
   status: {
     type: String,
     enum: ['To Do', 'In Progress', 'Completed'],
     default: 'To Do'
   },
   project: {
     type: Schema.Types.ObjectId,
     ref: 'Project',
   }
 }],

 myTeam: [{
   type: String,
 }],


}, {
 timestamps: true
});




module.exports = model('Portfolio', portfolio);




/*
solution  - table
createdBy - ObjectId
type - enum (personal, team)
likes -  [ user - ObjectId ]
project - ObjectId
comments - [ ObjectId ]
createdAt - date
updatedAt - date

*/