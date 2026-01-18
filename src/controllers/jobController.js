const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const { robustGeminiRequest } = require('../utils/geminiHelper');
const { ElevenLabsClient } = require('elevenlabs');
const { Blob } = require('buffer');

// @desc Create new Job Application
// @route POST /api/jobs
const createJob = async (req, res) => {
    try {
        const { company, jobTitle, description } = req.body;

        const job = await JobApplication.create({
            userId: req.user.id,
            company,
            jobTitle,
            description
        });

        res.status(201).json(job);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc Get all user jobs
// @route GET /api/jobs
const getJobs = async (req, res) => {
    try {
        const jobs = await JobApplication.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc Get single job
// @route GET /api/jobs/:id
const getJob = async (req, res) => {
    try {
        const job = await JobApplication.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        res.json(job);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc Delete job
// @route DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
    try {
        const job = await JobApplication.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await job.deleteOne();
        res.json({ message: 'Job removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc Generate Questions (AI)
// @route POST /api/jobs/:id/generate-questions
const generateQuestions = async (req, res) => {
    try {
        const job = await JobApplication.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const user = await User.findById(req.user.id);

        const prompt = `
        Generate 10 highly probable interview questions for this specific role, taking into account the candidate's CV and Job Description.
        
        Candidate Context:
        - Goal: ${user.purpose}
        - CV: ${user.cvText}

        Job/Context Description: ${job.description}
        Role Title: ${job.jobTitle} at ${job.company}

        Output STRICT JSON array:
        [
            { "question": "Question text...", "aiExpectedAnswer": "Short hint on what a good answer includes" }
        ]
        `;

        const text = await robustGeminiRequest(prompt, { jsonMode: true });
        // Cleanup markdown if helper didn't handle it perfectly (jsonMode usually handles it but removal is safe)
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let questions = JSON.parse(cleanText);

        // Append to existing questions or replace? User request implies "list of questions... can be edited".
        // Let's append new ones to the list.
        job.questions = [...job.questions, ...questions.map(q => ({ ...q, notes: '' }))];
        await job.save();

        res.json(job);

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ message: 'Failed to generate questions' });
    }
};

// @desc Update Question Notes
// @route PUT /api/jobs/:id/questions
const updateQuestionNotes = async (req, res) => {
    try {
        const { questionId, notes } = req.body;
        const job = await JobApplication.findById(req.params.id);

        if (!job) return res.status(404).json({ message: 'Job not found' });

        const question = job.questions.id(questionId);
        if (question) {
            question.notes = notes;
            await job.save();
            res.json(job);
        } else {
            res.status(404).json({ message: 'Question not found' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc Analyze Practice Answer (Single Shot)
// @route POST /api/jobs/practice
const analyzePracticeAnswer = async (req, res) => {
    try {
        const { question, notes, audio } = req.body;
        // Audio handling middleware puts file in req.file, need to handle here just like interviewController
        // Actually, let's assume express-fileupload or multer usage.
        // Wait, route receives formData.

        // REUSE TRANSCRIPTION LOGIC? 
        // I need to import transcribeAudio from interviewController or move it to a service.
        // It's not exported. I should probably move AI logic to utils.
        // For speed, I'll duplicate the simple transcription call or export it.
        // Let's modify interviewController to export its helpers or just Quick Fix:

        // Actually, let's create a dedicated service: `src/services/aiService.js`?
        // Or just require the controller and access? No.

        // I will implement it here using clean imports.
        const { ElevenLabsClient } = require('elevenlabs');
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const { Blob } = require('buffer');

        // Transcription
        const elevenLabsClient = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
        const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        const scribe = await elevenLabsClient.speechToText.convert({
            file: audioBlob,
            model_id: "scribe_v2",
            tag_audio_events: true,
            language_code: "eng"
        });
        const userAnswer = scribe.text;

        // Analysis
        const prompt = `
        Evaluate this answer to an interview question.
        Question: "${question}"
        User's Notes (Context/Plan): "${notes || 'None'}"
        User's Answer: "${userAnswer}"

        Provide short, specific feedback and a score (0-100).
        Output JSON: { "score": 85, "feedback": "...", "improvedAnswer": "..." }
        `;

        const text = await robustGeminiRequest(prompt, { jsonMode: true });
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanText);

        res.json({ userAnswer, analysis });

    } catch (error) {
        console.error("Practice Error:", error);
        res.status(500).json({ message: 'Analysis failed' });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJob,
    deleteJob,
    generateQuestions,
    updateQuestionNotes,
    analyzePracticeAnswer
};
