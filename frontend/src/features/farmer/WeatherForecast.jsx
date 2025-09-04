import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const WeatherForecast = () => {
  const [city, setCity] = useState("");
  const [baseLocation, setBaseLocation] = useState("");
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  const apiKey = import.meta.env.VITE_OPENWEATHER_KEY;

  // Fetch profile location on mount
  useEffect(() => {
    const fetchLocationFromProfile = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user && user.user_metadata?.location) {
        const location = user.user_metadata.location;
        setBaseLocation(location);
        if (!city) {
          fetchForecast(location);
        }
      }
    };
    fetchLocationFromProfile();
  }, []);

  const fetchForecast = async (targetCity) => {
    setError("");
    setForecast([]);
    const location = targetCity || city || baseLocation;
    if (!location) {
      setError("Please enter a city or set location in your profile.");
      return;
    }

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&cnt=24&appid=${apiKey}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch forecast.");
        return;
      }

      const dailyForecast = {};
      data.list.forEach((entry) => {
        const date = entry.dt_txt.split(" ")[0];
        if (!dailyForecast[date]) {
          dailyForecast[date] = {
            temp: entry.main.temp,
            condition: entry.weather[0].description,
            humidity: entry.main.humidity,
          };
        }
      });

      const first3Days = Object.entries(dailyForecast).slice(0, 3);
      setForecast(first3Days);
    } catch {
      setError("Unable to load weather data.");
    }
  };

  return (
    <div className="bg-white border border-green-200 rounded-xl shadow-lg p-6 max-w-xl">
      <h2 className="text-lg font-bold text-green-800 mb-4">
        Weather Forecast
      </h2>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder={`Enter city or use saved: ${baseLocation || "none"}`}
        className="w-full px-4 py-2 border border-green-300 rounded-full text-black text-sm mb-3"
      />
      <button
        onClick={() => fetchForecast(city || baseLocation)}
        className="bg-green-700 text-white px-4 py-2 rounded-full text-sm hover:bg-green-800 transition"
      >
        Get Forecast
      </button>

      {error && (
        <p className="mt-4 text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded">
          ❌ {error}
        </p>
      )}

      {forecast.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecast.map(([date, info]) => (
            <div
              key={date}
              className="bg-green-50 border border-green-200 p-4 rounded shadow"
            >
              <p className="text-sm font-semibold text-green-700">{date}</p>
              <p className="text-black text-sm">🌡️ Temp: {info.temp}°C</p>
              <p className="text-black text-sm">☁️ {info.condition}</p>
              <p className="text-black text-sm">
                💧 Humidity: {info.humidity}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherForecast;
