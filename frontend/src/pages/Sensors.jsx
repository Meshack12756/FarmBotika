import React, { useState } from "react";
import useSensorData from "../hooks/useSensorData";
import SensorCard from "../components/cards/SensorCard";

const Sensors = () => {
  const [refresh, setRefresh] = useState(false);
  const data = useSensorData(refresh);

  const handleRefresh = () => {
    setRefresh((r) => !r); // Toggle to retrigger the hook
  };

  return (
    <section className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-green-800">
          Live Sensor Readings
        </h2>
        <button
          onClick={handleRefresh}
          className="text-sm px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 transition"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {data.length > 0 ? (
          data.map((sensor, i) => (
            <SensorCard
              key={i}
              label={sensor.label}
              value={sensor.value}
              unit={sensor.unit}
              icon={sensor.icon}
              alert={sensor.value < sensor.threshold}
            />
          ))
        ) : (
          <p className="text-gray-500">Loading sensor data...</p>
        )}
      </div>
    </section>
  );
};

export default Sensors;
