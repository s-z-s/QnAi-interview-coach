const mongoose = require('mongoose');

const sessionSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    jobApplicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplication',
        required: false // Optional for backward compatibility or general practice
    },
    cvText: {
        type: String,
        required: false
    },
    jobDescription: {
        type: String,
        required: false // Now optional as it lives in JobApplication
    },
    messages: [{
        role: {
            type: String, // 'ai' or 'user'
            required: true
        },
        content: {
            type: String,
            required: true
        },
        audio: {
            type: String // Storing Base64 audio for MVP
        }
    }],
    analysis: {
        type: Object, // Stores full JSON analysis
        default: null
    },
    score: {
        type: Number,
        default: 0
    },
    hiringProbability: {
        type: String, // e.g., "High", "Medium", "Low"
        default: 'Unknown'
    }
}, {
    timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
