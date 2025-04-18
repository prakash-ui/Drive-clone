const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [3,'Username must be atleast 3 characters'],
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [13,'Email must be atleast of 13 characters'],
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: [5,'Password must be atleast of 5 characters'],
    }
})

const User = mongoose.model('user', userSchema)

module.exports = User;