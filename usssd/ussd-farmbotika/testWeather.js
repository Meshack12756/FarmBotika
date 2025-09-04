// testWeather.js
const { getWeatherForecast } = require('./services/weatherServices');

async function test() {
    const location = "Kiambu"; // Or "Nairobi", "Eldoret", etc.
    const forecast = await getWeatherForecast(location);
    if (forecast) {
        console.log("Weather Forecast:\n", forecast);
    } else {
        console.log("Failed to get weather forecast.");
    }
}

test();