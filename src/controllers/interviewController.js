const Session = require('../models/Session');
const User = require('../models/User');
const { ElevenLabsClient } = require('elevenlabs');

const { robustGeminiRequest } = require('../utils/geminiHelper');
// const { GoogleGenerativeAI } = require('@google/genai'); // Removed direct import

const elevenLabsClient = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

// Initialize Gemini
// Note: Adapting to whatever "Gemini 3 Pro" entails. If it's a specific model name, I'll use "gemini-1.5-pro-latest" or similar as placeholder if "gemini-3-pro" isn't standard yet, or stick to user request if they are sure.
// User request: "Use Gemini 3 Pro (@google/genai) ... system instruction: ..."
// Assuming the model name to pass is something like "gemini-3-pro" or "gemini-pro-experimental".
// I will use "gemini-1.5-pro" as a safe robust default if 3 is not out, but I should try to use the name "gemini-3-pro" if that's what they mean. 
// ACTUALLY, "Gemini 3 Pro" in 2026 (current time in prompt is 2026!) is likely real. I will use "gemini-3-pro".

// New SDK usage might differ slightly, but I'll stick to a common pattern or the one for @google/genai if I knew it.
// Since I can't browse docs effectively for a 2026 SDK, I'll use a generic wrapper approach.

// Node.js < 20 might need explicit import, but let's try standard global or 'buffer'
const { Blob } = require('buffer');

// **TRANSCRIPTION FUNCTION**
async function transcribeAudio(audioBuffer, mimetype) {
    try {
        // Convert Buffer to Blob for the SDK
        const audioBlob = new Blob([audioBuffer], { type: mimetype });

        console.log(`Transcribing audio size: ${audioBuffer.length}, mime: ${mimetype}`);

        const response = await elevenLabsClient.speechToText.convert({
            file: audioBlob,
            model_id: "scribe_v2",
            tag_audio_events: true,
            language_code: "eng"
        });
        return response.text;
    } catch (error) {
        console.error("Transcription Error:", error);
        // Throw the actual error message so we can see it in the response
        throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
}

// **TTS FUNCTION**
// **TTS FUNCTION**
async function generateAudio(text) {
    try {
        const audioStream = await elevenLabsClient.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
            output_format: "mp3_44100_128",
            model_id: "eleven_turbo_v2_5", // Low latency model
            text: text
        });

        // Convert stream to Buffer/Base64
        const chunks = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);
        return audioBuffer.toString('base64');
    } catch (error) {
        console.error("TTS Error:", error);
        // We don't want to crash the whole response if audio fails, just return null audio
        return null;
    }
}

// **GEMINI FUNCTION**
async function getAIResponse(history, latestUserMessage, cvText, jobDescription) {
    try {
        const systemInstruction = "You are an empathetic interview coach. Keep questions short. Analyze the user's answer for content and tone before asking the next question.";
        const context = `
      Context:
      CV: ${cvText}
      Job Description: ${jobDescription}
    `;

        // Format history for helper? 
        // Helper expects [{role: 'ai'|'user', content: '...'}]
        // internal history is [{role: 'ai', content: '...'}]. 
        // So we can pass it directly and let helper map it.
        const responseText = await robustGeminiRequest(`${context}\nUser Answer: ${latestUserMessage}`, {
            history: history,
            systemInstruction: systemInstruction
        });

        return responseText;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "I'm having trouble connecting to my brain right now. Please continue.";
    }
}

// ** CONTROLLERS **

// @desc Start a new interview session
// @route POST /api/interview/session
// @route POST /api/interview/session
const startSession = async (req, res) => {
    try {
        const { jobId } = req.body;
        let jobDescription = req.user.jobDescription;
        let jobApplicationId = null;

        // 1. Resolve Context (Job or Profile)
        if (jobId) {
            const JobApplication = require('../models/JobApplication');
            const job = await JobApplication.findById(jobId);
            if (job) {
                jobDescription = job.description;
                jobApplicationId = job._id;
            }
        }

        // Fallback or validation
        if (!jobDescription) {
            // Try user profile if legacy
            if (!req.user.jobDescription) {
                // It's allowed to start without JD? Maybe generic interview.
                // But typically we want one. Let's proceed but warn or generic.
            }
        }

        // 2. Generate Initial Greeting
        const initialGreeting = "Hello! I've reviewed your CV and the job details. I'm ready to start. Please tell me a little about yourself.";
        let audioBase64 = null;
        try {
            audioBase64 = await generateAudio(initialGreeting);
        } catch (e) {
            console.error("Initial Audio Generation Failed:", e);
        }

        // 3. Create Session
        const session = await Session.create({
            userId: req.user.id,
            cvText: req.user.cvText,
            jobDescription: jobDescription || '',
            jobApplicationId: jobApplicationId,
            messages: [{
                role: 'ai',
                content: initialGreeting,
                audio: audioBase64 // Schema stores string, good.
            }]
        });

        // 4. Return Session
        // Ensure audio is sent (if not stored in DB, we'd attach it here, but we stored it in messages[0].audio)
        res.status(201).json(session);

    } catch (error) {
        console.error("Start Session Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc Get existing session
// @route GET /api/interview/session/:id
const getSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Check ownership
        if (session.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc Process Answer (Audio -> Text -> AI -> Text)
// @route POST /api/interview/answer
const handleAnswer = async (req, res) => {
    try {
        const { sessionId } = req.body;

        // 1. Get Session
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        if (session.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // 2. Transcribe Audio
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file uploaded' });
        }

        console.log("Starting transcription...");
        // Transcribe
        const userText = await transcribeAudio(req.file.buffer, req.file.mimetype);
        console.log("Transcription result:", userText);

        // Save User Message
        session.messages.push({
            role: 'user',
            content: userText,
            // audioUrl: ... (We could upload to S3/Cloudinary here, but skipping for MVP as requested just "handle audio")
        });

        // 3. Get AI Response
        console.log("Preparing AI response...");
        const history = session.messages.slice(0, -1); // All except the new one

        // Use the simplified getAIResponse function which now uses the robust helper
        const aiText = await getAIResponse(history, userText, session.cvText, session.jobDescription);

        // 4. Generate AI Audio (TTS)
        console.log("Generating AI Audio...");
        const aiAudioBase64 = await generateAudio(aiText);

        // 5. Save AI Response
        session.messages.push({
            role: 'ai',
            content: aiText,
            audio: aiAudioBase64
        });

        await session.save();

        res.json({
            userText,
            aiText,
            aiAudio: aiAudioBase64, // Send base64 back to client
            history: session.messages
        });

    } catch (error) {
        console.error("Handle Answer Error:", error);
        res.status(500).json({
            message: 'Server Error processing answer',
            error: error.message,
            stack: error.stack
        });
    }
};



// @desc End Session and Generate Analysis
// @route POST /api/interview/end
const endSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await Session.findById(sessionId);

        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (session.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        console.log(`Ending session ${sessionId} for user ${req.user.id}`);

        // Generate Analysis with Gemini
        // We removed local GoogleGenerativeAI require as we use helper now

        const historyText = session.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
        const cvTextSafe = session.cvText || "No CV provided";
        const jdTextSafe = session.jobDescription || "No Job Description provided";

        const prompt = `
        Analyze this interview session based on the candidate's CV and Job Description.
        
        CV: ${cvTextSafe}
        Job Description: ${jdTextSafe}
        
        Interview Transcript:
        ${historyText}
        
        Provide the output in STRICT JSON format:
        {
            "score": number (0-100),
            "hiringProbability": "High" | "Medium" | "Low",
            "feedback": "Overall concise feedback summary",
            "strengths": ["point 1", "point 2"],
            "improvements": ["point 1", "point 2"],
            "questions": [
                {
                    "question": "The question asked by AI",
                    "answer": "The user's answer (summary calls out specific mistakes)",
                    "score": number (0-100),
                    "feedback": "Specific feedback on this answer",
                    "improvement": "How to answer better based on CV"
                }
            ]
        }
        `;

        const responseText = await robustGeminiRequest(prompt, { jsonMode: true });
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        let analysisData;
        try {
            analysisData = JSON.parse(responseText);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback
            analysisData = { score: 0, hiringProbability: "Unknown", feedback: "Could not parse analysis. " + responseText };
        }

        session.analysis = analysisData;
        session.score = analysisData.score || 0;
        session.hiringProbability = analysisData.hiringProbability || "Unknown";

        await session.save();
        res.json(session);

    } catch (error) {
        console.error("End Session Error:", error);
        res.status(500).json({ message: 'Analysis Failed', error: error.message });
    }
};

// @desc Get User History
// @route GET /api/interview/history
const getHistory = async (req, res) => {
    try {
        const sessions = await Session.aggregate([
            { $match: { userId: req.user._id } },
            {
                $project: {
                    createdAt: 1,
                    score: 1,
                    hiringProbability: 1,
                    messageCount: { $size: "$messages" },
                    analysis: 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc Delete Session
// @route DELETE /api/interview/session/:id
const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (session.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await session.deleteOne();
        res.json({ message: 'Session removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    startSession,
    getSession,
    handleAnswer,
    endSession,
    getHistory,
    deleteSession
};
