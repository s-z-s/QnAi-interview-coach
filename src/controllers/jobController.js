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

        if (!user.cvText || user.cvText.trim().length < 50) {
            return res.status(400).json({
                message: 'Profile Incomplete: Please upload your CV/Resume in your Profile to generate personalized questions.'
            });
        }

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
        const { question, notes, audio, jobId, questionId } = req.body;

        // Transcription (Reuse ElevenLabs Client)
        const { ElevenLabsClient } = require('elevenlabs');
        const { Blob } = require('buffer');

        // Use uploaded file if present, otherwise handle error
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file uploaded' });
        }

        const elevenLabsClient = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
        const audioBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

        const scribe = await elevenLabsClient.speechToText.convert({
            file: audioBlob,
            model_id: "scribe_v2",
            tag_audio_events: true, // Changed to false for cleaner text
            language_code: "eng"
        });
        const userAnswer = scribe.text;

        // Analysis with Gemini
        const prompt = `
        Evaluate this answer to an interview question.
        
        Question: "${question}"
        User's Notes (Context/Plan): "${notes || 'None'}"
        User's Answer: "${userAnswer}"

        **IMPORTANT**: Write the feedback in **SECOND PERSON** (address the candidate as **"You"**).

        **CATEGORY EVALUATION**:
        Identify 3 key categories for this specific question (e.g., Clarity, Relevance, Depth).
        Rate the answer on each.

        Provide short, specific feedback and a score (0-100).
        Output STRICT JSON: 
        { 
            "score": 85, 
            "feedback": "Markdown supported feedback...", 
            "improvedAnswer": "Markdown supported improved answer...",
            "categories": [
                {
                    "category": "Name",
                    "score": number
                }
            ]
        }
        `;

        const text = await robustGeminiRequest(prompt, { jsonMode: true });
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanText);

        // Save to Database
        if (jobId && questionId) {
            const job = await JobApplication.findById(jobId);
            if (job) {
                const q = job.questions.id(questionId);
                if (q) {
                    q.userAnswer = userAnswer;
                    q.score = analysis.score;
                    q.aiFeedback = analysis.feedback;
                    q.improvedAnswer = analysis.improvedAnswer;
                    q.categories = analysis.categories || [];
                    q.practicedAt = new Date();
                    await job.save();
                }
            }
        }

        res.json({ userAnswer, analysis });

    } catch (error) {
        console.error("Practice Error:", error);
        res.status(500).json({ message: 'Analysis failed' });
    }
    // Removed duplicate }
    // Ensure catch closes the function correctly 
    // (This replacement replaces the entire try/catch block logic)
};

// @desc Add a manual question
// @route POST /api/jobs/:id/add-question
const addQuestion = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ message: 'Question text is required' });
        }

        const job = await JobApplication.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        job.questions.push({
            question: question,
            questionType: 'Custom'
        });

        await job.save();
        res.json(job);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJob,
    deleteJob,
    generateQuestions,
    updateQuestionNotes,
    analyzePracticeAnswer,
    addQuestion
};
