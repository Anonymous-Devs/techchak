const mongoose = require('mongoose');

const {
 Schema,
 model
} = mongoose;

const NotificationSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
 
},
{
 timestamps: true
})

module.exports = model('notification', NotificationSchema)