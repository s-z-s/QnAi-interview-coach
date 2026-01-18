const mongoose = require('mongoose');

const jobApplicationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    company: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    description: {
        type: String, // Job Description text
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Archived', 'Interviewing', 'Offer', 'Rejected'],
        default: 'Active'
    },
    questions: [{
        question: String,
        notes: String, // User's notes
        aiExpectedAnswer: String, // Optional AI hint
        // Practice Session Data
        userAnswer: String,
        aiFeedback: String,
        score: Number,
        improvedAnswer: String,
        practicedAt: Date
    }]
}, {
    timestamps: true
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication;
