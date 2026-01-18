const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['Job Interview', 'College Interview', 'Scholarship Interview', 'General Practice'],
        default: 'Job Interview'
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
