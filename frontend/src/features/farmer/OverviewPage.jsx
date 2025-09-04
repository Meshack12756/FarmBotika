import React from "react";
import WeatherForecast from "./WeatherForecast";
import SensorMonitor from "./SensorMonitor";
import CommunityChatCard from "./CommunityChatCard";
import ChatBot from "../ai-assistant/ChatBot";

const OverviewPage = () => {
  return (
    <div className="overflow-y-auto h-[calc(100vh-4rem)] px-4">
      <div className="p-6 md:p-10 max-w-7xl mx-auto font-poppins space-y-10">
        {/* Header */}
        <div className="bg-white border border-green-300 rounded-xl shadow p-6 text-center">
          <h1 className="text-3xl font-bold text-green-800"> Welcome Back</h1>
          <p className="text-green-700 text-sm mt-2">
            Your smart farmer dashboard — live data, advice, and connection all
            in one place.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weather Forecast */}
          <div className="bg-white border border-green-300 rounded-xl shadow p-6">
            <WeatherForecast />
          </div>

          {/* Sensor Monitor */}
          <div className="bg-white border border-green-300 rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Pest & Disease
            </h2>
            <SensorMonitor />
          </div>

          {/* AI Assistant */}
          <div className="bg-white border border-green-300 rounded-xl shadow p-6 col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              Ask AI
            </h2>
            <ChatBot />
          </div>

          {/* Farmer Community */}
          <div className="bg-white border border-green-300 rounded-xl shadow p-6 col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              👥 Farmer Community
            </h2>
            <CommunityChatCard />
            <p className="text-sm text-green-700 mt-2">
              Share questions, tips, and success stories with others across
              Kenya.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
