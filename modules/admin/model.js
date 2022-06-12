const mongoose = require('mongoose');
mongoose.set("returnOriginal", false);

const { Schema, model } = mongoose;

// create admin schema
const adminSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
});

const Admin = model('Admins', adminSchema);
// export admin model
module.exports = Admin;