// services/smsService.js
const africastalking = require('africastalking');
const dotenv = require('dotenv');
dotenv.config();

// Initialize Africa's Talking
const sms = africastalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME
}).SMS;

/**
 * Sends an SMS message using Africa's Talking.
 * @param {string} to The recipient's phone number in E.164 format (e.g., +254712345678).
 * @param {string} message The content of the SMS message.
 * @returns {boolean} True if SMS was sent successfully, false otherwise.
 */
async function sendSms(to, message) {
    try {
        // Ensure the number is in E.164 format if not already (Africa's Talking often expects this)
        // Basic check, might need more robust validation depending on your user base
        const formattedTo = to.startsWith('+') ? to : `+${to}`; 

        const options = {
            to: formattedTo,
            message: message,
            // Optional: from: 'YOUR_SENDER_ID' // Uncomment and replace if you have a custom sender ID configured
        };

        console.log(`Attempting to send SMS to ${formattedTo} with message: "${message.substring(0, Math.min(message.length, 50))}..."`);
        const response = await sms.send(options);
        console.log('SMS sent successfully:', response);
        return true;
    } catch (error) {
        console.error('Error sending SMS:', error);
        if (error.response && error.response.data) {
            // Log specific error data from Africa's Talking API
            console.error('AT API Error Details:', error.response.data);
        } else if (error.message) {
            console.error('Error Message:', error.message);
        } else {
            console.error('Unknown SMS sending error:', error);
        }
        return false;
    }
}

module.exports = {
    sendSms
};