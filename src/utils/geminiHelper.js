const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-preview-09-2025', // User specific request
    'gemini-2.0-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite'
];

/**
 * robustGeminiRequest
 * Tries to generate content using a list of models in order.
 * Handles both single-turn (generateContent) and multi-turn (chat).
 * 
 * @param {string} prompt - The text prompt (for single turn) or new message (for chat)
 * @param {object} options - { 
 *   systemInstruction: string, 
 *   history: array (for chat), 
 *   jsonMode: boolean 
 * }
 */
const robustGeminiRequest = async (prompt, options = {}) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    let lastError = null;

    for (const modelName of MODELS) {
        try {
            console.log(`Attempting Gemini request with model: ${modelName}`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: options.jsonMode ? "application/json" : "text/plain"
                }
            });

            if (options.history) {
                // Formatting history for Gemini SDK
                const chat = model.startChat({
                    history: options.formattedHistory || options.history.map(m => ({
                        role: m.role === 'ai' ? 'model' : 'user',
                        parts: [{ text: m.content || '' }]
                    })),
                    systemInstruction: options.systemInstruction ? { role: 'system', parts: [{ text: options.systemInstruction }] } : undefined
                });

                const result = await chat.sendMessage(prompt);
                return result.response.text();
            } else {
                // Single turn
                const parts = [];
                if (options.systemInstruction) {
                    // Start with system instruction in prompt for single turn if not supported natively easily or just append
                    // Actually new SDK supports systemInstruction in getGenerativeModel, but I put it in startChat above.
                    // For single turn generateContent, we can pass it in model config too? 
                    // Let's just append it to prompt for safety unless we re-init model with sys instruct.
                    // Re-init with system instruction:
                    const modelWithSys = genAI.getGenerativeModel({
                        model: modelName,
                        systemInstruction: { role: 'system', parts: [{ text: options.systemInstruction }] },
                        generationConfig: { responseMimeType: options.jsonMode ? "application/json" : "text/plain" }
                    });
                    const result = await modelWithSys.generateContent(prompt);
                    return result.response.text();
                }

                const result = await model.generateContent(prompt);
                return result.response.text();
            }

        } catch (error) {
            console.warn(`Failed with model ${modelName}: ${error.message}`);
            lastError = error;
            // Add small delay before retry?
            // Continue to next model
        }
    }

    throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
};

module.exports = { robustGeminiRequest };
