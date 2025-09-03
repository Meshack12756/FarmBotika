// services/weatherService.js
const axios = require('axios'); // Import axios for making HTTP requests
const dotenv = require('dotenv'); // Import dotenv to load environment variables
dotenv.config(); // Load variables from .env file

// Get the API key from environment variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
// Base URL for OpenWeatherMap's 5-day / 3-hour forecast API
const WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5/forecast";
// Base URL for OpenWeatherMap's Geocoding API (to convert location name to coordinates)
const GEOCODING_BASE_URL = "http://api.openweathermap.org/geo/1.0/direct";

/**
 * Fetches a concise weather forecast for a given location.
 * @param {string} location - The city or county name (e.g., "Nairobi", "Kiambu County").
 * @returns {Promise<string|null>} A string summary of the weather or null if an error occurs/location not found.
 */
async function getWeatherForecast(location) {
    try {
        // Step 1: Geocoding - Convert location name (e.g., "Kiambu") to latitude and longitude
        const geoResponse = await axios.get(`${GEOCODING_BASE_URL}?q=${location}&limit=1&appid=${WEATHER_API_KEY}`);
        if (geoResponse.data.length === 0) {
            console.warn(`Location not found for geocoding: ${location}`);
            return null; // Location not found, cannot proceed
        }
        const { lat, lon } = geoResponse.data[0]; // Extract latitude and longitude

        // Step 2: Fetch Weather Forecast using the obtained coordinates
        const response = await axios.get(WEATHER_BASE_URL, {
            params: {
                lat: lat,
                lon: lon,
                appid: WEATHER_API_KEY,
                units: 'metric' // Request temperature in Celsius. Use 'imperial' for Fahrenheit.
            }
        });

        const data = response.data;
        const forecast = data.list; // This is an array of forecast data, typically every 3 hours

        // Step 3: Process the forecast data into a concise summary for USSD
        let summary = `Weather for ${location}:\n`;
        const uniqueDays = new Set(); // To track unique days and avoid duplicate entries
        let daysCount = 0; // Counter for how many days we've summarized

        // Loop through the forecast items
        for (const item of forecast) {
            const date = new Date(item.dt * 1000); // OpenWeatherMap 'dt' is in seconds, convert to milliseconds
            const day = date.toDateString(); // Get a string like "Mon Jul 14 2025"

            // Only add forecast for a new day, up to 3 days
            if (!uniqueDays.has(day) && daysCount < 3) {
                uniqueDays.add(day);
                daysCount++;
                // Append day, main weather description, and temperature
                summary += `${day.substring(0, 3)}: ${item.weather[0].description}, Temp: ${Math.round(item.main.temp)}°C.\n`;
            }
            if (daysCount >= 3) break; // Stop after summarizing 3 unique days
        }

        // The summary will be passed to the AI for further advice on actions
        return summary.trim(); // Remove any trailing newline

    } catch (error) {
        // Log any errors during API calls or processing
        console.error("Error fetching weather forecast:", error.message);
        return null; // Return null to indicate failure
    }
}

// Export the function so it can be used by other modules (e.g., aiService.js)
module.exports = { getWeatherForecast };