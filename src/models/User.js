const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password_hash: {
        type: String,
        required: true
    },
    cvText: {
        type: String,
        default: ''
    },
    jobDescription: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
