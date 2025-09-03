// services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const { getWeatherForecast } = require('./weatherServices'); // For fetching weather data
const { sendSms } = require('./smsService'); // For sending detailed advice via SMS

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Helper function for AI interaction ---
/**
 * Common function to get AI response for agricultural advice.
 * Includes robust error logging for debugging AI failures.
 * @param {string} prompt The main prompt for the AI.
 * @param {Object} context Additional context (e.g., { userCounty: 'Kiambu', weatherForecast: '...' }).
 * @param {Array} chatHistory For multi-turn conversations.
 * @param {number} maxTokens Max tokens for AI response.
 * @returns {string} AI generated advice or "AI_ADVICE_ERROR" on failure.
 */
async function getGeminiAgriculturalAdvice(prompt, context = {}, chatHistory = [], maxTokens = 150) { // Reduced default maxTokens
    try {
        let fullPrompt = `You are an expert agricultural extension officer in ${context.userCounty}, Kenya. Provide advice relevant to the local context and farming practices in Kenya. Be as concise and direct as possible, using minimal words for actionable advice. Do not include greetings or conversational filler.`;

        // Inject dynamic context into the prompt
        if (context.weatherForecast) {
            fullPrompt += `\n\nWeather: ${context.weatherForecast}`;
        }
        if (context.soilType) {
            fullPrompt += `\n\nSoil: ${context.soilType}`;
        }
        if (context.marketInsights) {
            fullPrompt += `\n\nMarket: ${context.marketInsights}`;
        }
        fullPrompt += `\n\nRequest: ${prompt}`; // Add the specific user request last

        const chat = model.startChat({
            history: chatHistory, // Pass history for multi-turn conversations
            generationConfig: {
                maxOutputTokens: maxTokens, // Use the passed maxTokens or default
                temperature: 0.5, // Slightly lower temperature for more direct answers
            },
        });

        const result = await chat.sendMessage(fullPrompt);
        const response = await result.response;
        let text = response.text();

        // Clean-up markdown and extra characters for better USSD/SMS readability
        text = text.replace(/\*\*/g, '').replace(/###/g, '').replace(/##/g, '').replace(/\*/g, ''); // Remove common markdown bold/headers
        text = text.replace(/^-?\s*/gm, '').trim(); // Remove leading hyphens/bullets from lists, clean up leading/trailing spaces

        return text;
    } catch (error) {
        console.error('CRITICAL: Error getting Gemini agricultural advice!');
        if (error.response) {
            console.error('API Response Data:', error.response.data);
            console.error('API Response Status:', error.response.status);
            console.error('API Response Headers:', error.response.headers);
        } else if (error.message) {
            console.error('Error Message:', error.message);
        } else {
            console.error('Unknown Error:', error);
        }
        return "AI_ADVICE_ERROR"; // Unique identifier for error
    }
}

// --- Specific Inquiry Handlers ---

/**
 * Handles weather forecast inquiry and sends detailed advice via SMS.
 * @param {string} phoneNumber Farmer's phone number.
 * @param {string} userCounty Farmer's registered county.
 * @returns {string} USSD response confirming SMS or indicating failure.
 */
async function handleWeatherInquiry(phoneNumber, userCounty) {
    const weatherSummary = await getWeatherForecast(userCounty); // Get weather data

    if (weatherSummary.includes("Could not retrieve weather forecast") || weatherSummary.includes("Failed to get weather forecast")) {
        return `END ${weatherSummary}`;
    }

    // Prompt for very concise USSD response and a slightly more detailed SMS
    const aiPrompt = `Given this weather for ${userCounty}: ${weatherSummary}. Provide *only* the most critical, actionable farming recommendations. Focus on immediate actions related to planting, watering, or protection. Be very brief (max 50 words for USSD, max 100 for SMS).`;

    const aiAdviceFull = await getGeminiAgriculturalAdvice(aiPrompt, { userCounty, weatherForecast: weatherSummary }, [], 100); // Max 100 tokens for SMS details

    if (aiAdviceFull === "AI_ADVICE_ERROR") {
        return `END Failed to get farming advice. Try later.`;
    }

    // Extract a super short summary for USSD (first sentence or very condensed)
    let ussdSummary = aiAdviceFull.split('.')[0];
    if (ussdSummary.length > 80) { // Even shorter for initial USSD screen
        ussdSummary = ussdSummary.substring(0, 77) + '...';
    }

    const smsAdviceDetails = `FarmBotika Weather:\n${aiAdviceFull}\n#End`; // Added #End for clear end of message
    const smsSent = await sendSms(phoneNumber, smsAdviceDetails);

    let ussdResponse = `END ${ussdSummary}.\n`;
    if (smsSent) {
        ussdResponse += `Details SMS.`;
    } else {
        ussdResponse += `SMS send failed.`;
    }
    return ussdResponse;
}

/**
 * Handles soil information inquiry and sends detailed advice via SMS.
 * @param {string} phoneNumber Farmer's phone number.
 * @param {string} userCounty Farmer's registered county.
 * @param {string} cropType The crop the farmer is growing/planning.
 * @returns {string} USSD response confirming SMS or indicating failure.
 */
async function handleSoilInquiry(phoneNumber, userCounty, cropType) {
    if (!cropType) {
        return `CON Enter crop type for soil advice:`;
    }

    const aiPrompt = `For ${cropType} in ${userCounty}, briefly state ideal soil type, pH, and 2-3 key soil improvement tips. Max 100 words.`;
    const aiAdviceFull = await getGeminiAgriculturalAdvice(aiPrompt, { userCounty }, [], 150); // Max 150 tokens

    if (aiAdviceFull === "AI_ADVICE_ERROR") {
        return `END Failed to get soil advice. Try later.`;
    }

    let ussdSummary = aiAdviceFull.split('.')[0];
    if (ussdSummary.length > 80) {
        ussdSummary = ussdSummary.substring(0, 77) + '...';
    }

    const smsAdviceDetails = `FarmBotika Soil Advice for ${cropType}:\n${aiAdviceFull}\n#End`;
    const smsSent = await sendSms(phoneNumber, smsAdviceDetails);

    let ussdResponse = `END ${ussdSummary}.\n`;
    if (smsSent) {
        ussdResponse += `Details SMS.`;
    } else {
        ussdResponse += `SMS send failed.`;
    }
    return ussdResponse;
}

/**
 * Handles crop suitability inquiry and sends detailed advice via SMS.
 * @param {string} phoneNumber Farmer's phone number.
 * @param {string} userCounty Farmer's registered county.
 * @param {string} cropToPlant The crop the farmer is considering to plant.
 * @returns {string} USSD response confirming SMS or indicating failure.
 */
async function handleCropSuitabilityInquiry(phoneNumber, userCounty, cropToPlant) {
    if (!cropToPlant) {
        return `CON Enter crop to plant:`;
    }

    const aiPrompt = `Is ${cropToPlant} suitable for ${userCounty}? List 2-3 pros and cons, and a market outlook. Max 100 words.`;
    const aiAdviceFull = await getGeminiAgriculturalAdvice(aiPrompt, { userCounty }, [], 150); // Max 150 tokens

    if (aiAdviceFull === "AI_ADVICE_ERROR") {
        return `END Failed to get suitability advice. Try later.`;
    }

    let ussdSummary = aiAdviceFull.split('.')[0];
    if (ussdSummary.length > 80) {
        ussdSummary = ussdSummary.substring(0, 77) + '...';
    }

    const smsAdviceDetails = `FarmBotika Suitability for ${cropToPlant}:\n${aiAdviceFull}\n#End`;
    const smsSent = await sendSms(phoneNumber, smsAdviceDetails);

    let ussdResponse = `END ${ussdSummary}.\n`;
    if (smsSent) {
        ussdResponse += `Details SMS.`;
    } else {
        ussdResponse += `SMS send failed.`;
    }
    return ussdResponse;
}

/**
 * Handles crop follow-up inquiry and sends detailed advice via SMS.
 * @param {string} phoneNumber Farmer's phone number.
 * @param {string} userCounty Farmer's registered county.
 * @param {string} plantedCrop The crop the farmer wants to follow up on.
 * @returns {string} USSD response confirming SMS or indicating failure.
 */
async function handleCropFollowUpInquiry(phoneNumber, userCounty, plantedCrop) {
    if (!plantedCrop) {
        return `CON Enter crop to follow up on:`;
    }

    const aiPrompt = `For ${plantedCrop} in ${userCounty}, list 2-3 common issues (pests/diseases/deficiencies) and 1-2 concise preventative tips. Max 100 words.`;
    const aiAdviceFull = await getGeminiAgriculturalAdvice(aiPrompt, { userCounty }, [], 150); // Max 150 tokens

    if (aiAdviceFull === "AI_ADVICE_ERROR") {
        return `END Failed to get follow-up advice. Try later.`;
    }

    let ussdSummary = aiAdviceFull.split('.')[0];
    if (ussdSummary.length > 80) {
        ussdSummary = ussdSummary.substring(0, 77) + '...';
    }

    const smsAdviceDetails = `FarmBotika Follow-up for ${plantedCrop}:\n${aiAdviceFull}\n#End`;
    const smsSent = await sendSms(phoneNumber, smsAdviceDetails);

    let ussdResponse = `END ${ussdSummary}.\n`;
    if (smsSent) {
        ussdResponse += `Details SMS.`;
    } else {
        ussdResponse += `SMS send failed.`;
    }
    return ussdResponse;
}

/**
 * Handles the multi-turn report and chat flow with AI.
 * Manages session state for crop affected, symptoms, and chat history.
 * @param {string} phoneNumber Farmer's phone number.
 * @param {string} userCounty Farmer's registered county.
 * @param {string} userInput The current text input from the user.
 * @param {Object} session The current session object (will be modified directly).
 * @returns {string} USSD response for the current turn.
 */
async function handleReportAndChat(phoneNumber, userCounty, userInput, session) {
    let responseText = '';

    // First step: asking for affected crop
    if (!session.subMenu) { // This indicates the start of the report flow
        session.subMenu = 'crop_affected';
        responseText = `CON Enter crop affected:`;
    }
    // Second step: user provides crop, now ask for symptoms
    else if (session.subMenu === 'crop_affected') {
        session.data.affectedCrop = userInput;
        session.subMenu = 'symptoms_description';
        responseText = `CON Describe symptoms/issue:`;
    }
    // Third step: user provides symptoms, start initial AI diagnosis
    else if (session.subMenu === 'symptoms_description') {
        session.data.symptoms = userInput;
        // Initialize chat history for the AI conversation with the initial consolidated query
        session.chatHistory = [
            { role: "user", parts: [{ text: `I am a farmer in ${userCounty} and my ${session.data.affectedCrop} crop has these symptoms: ${session.data.symptoms}. Diagnose and recommend initial steps. Be very concise, direct, and actionable. Max 100 words.` }] }
        ];

        const initialAiResponse = await getGeminiAgriculturalAdvice(
            session.chatHistory[0].parts[0].text, // Use the prompt from the history
            { userCounty },
            session.chatHistory, // Pass initial history
            100 // Max tokens for initial chat response
        );

        if (initialAiResponse === "AI_ADVICE_ERROR") {
            return `END Failed diagnosis. Try later.`;
        }

        // Add AI's response to history
        session.chatHistory.push({ role: "model", parts: [{ text: initialAiResponse }] });

        // Ensure the USSD response is very short
        let ussdFormattedResponse = initialAiResponse.split('.')[0]; // Take the first sentence
        if (ussdFormattedResponse.length > 150) {
            ussdFormattedResponse = ussdFormattedResponse.substring(0, 147) + '...';
        }
        responseText = `CON ${ussdFormattedResponse}.\n\nAsk more or # to end.`;
        session.subMenu = 'chat_active'; // Move to active chat mode
    }
    // Subsequent steps: continuing the AI chat
    else if (session.subMenu === 'chat_active') {
        // User continues the chat with new input
        // Limit chat history to prevent exceeding token limits and keep relevant context
        const MAX_HISTORY_LENGTH = 6; // e.g., 3 user, 3 model turns for very short context
        if (session.chatHistory.length > MAX_HISTORY_LENGTH) {
            session.chatHistory = session.chatHistory.slice(session.chatHistory.length - MAX_HISTORY_LENGTH);
        }
        session.chatHistory.push({ role: "user", parts: [{ text: userInput }] });

        const ongoingAiResponse = await getGeminiAgriculturalAdvice(
            userInput, // New user input is the prompt for this turn
            { userCounty, affectedCrop: session.data.affectedCrop, symptoms: session.data.symptoms }, // Pass context again for robustness
            session.chatHistory, // Pass updated history
            100 // Max tokens for ongoing chat response
        );

        if (ongoingAiResponse === "AI_ADVICE_ERROR") {
            return `END Chat error. Try later.`;
        }

        session.chatHistory.push({ role: "model", parts: [{ text: ongoingAiResponse }] });

        let ussdFormattedResponse = ongoingAiResponse.split('.')[0]; // Take the first sentence
        if (ussdFormattedResponse.length > 150) {
            ussdFormattedResponse = ussdFormattedResponse.substring(0, 147) + '...';
        }
        responseText = `CON ${ussdFormattedResponse}.\n\nAsk more or # to end.`;
    } else {
        responseText = `END Unexpected error. Start over.`;
    }

    return responseText;
}

module.exports = {
    handleWeatherInquiry,
    handleSoilInquiry,
    handleCropSuitabilityInquiry,
    handleCropFollowUpInquiry,
    handleReportAndChat
};