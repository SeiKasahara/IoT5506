import React, { useState } from 'react';
import SensorChart from './SensorChart';

function Board() {
  const [activeSensor, setActiveSensor] = useState("");

  // Function to handle chart click
  const handleSensorClick = (sensorKey) => {
    setActiveSensor(sensorKey === activeSensor ? null : sensorKey); // Toggle back to all charts if clicked again
  };

  return (
    <div>
      <div className="board-container">
        {/* Conditionally render each SensorChart based on activeSensor state */}
        {(!activeSensor || activeSensor === 'temperature') && (
          <div 
            className={`bg-gray-100 rounded-lg p-5 shadow-md ${activeSensor ? 'w-full' : 'w-1/3'} h-130 flex items-start justify-start`}
            onClick={() => handleSensorClick('temperature')}
            style={{ cursor: 'pointer' }}
          >
            <SensorChart 
              dataKey="sensor_temperature" 
              label="°C" 
              color="#82ca9d" 
            />
          </div>
        )}

        {(!activeSensor || activeSensor === 'humidity') && (
          <div 
            className={`bg-gray-100 rounded-lg p-5 shadow-md ${activeSensor ? 'w-full' : 'w-1/3'} h-130 flex items-start justify-start ml-5`}
            onClick={() => handleSensorClick('humidity')}
            style={{ cursor: 'pointer' }}
          >
            <SensorChart 
              dataKey="sensor_humidity" 
              label="%" 
              color="#8884d8" 
            />
          </div>
        )}

        {(!activeSensor || activeSensor === 'gas') && (
          <div 
            className={`bg-gray-100 rounded-lg p-5 shadow-md ${activeSensor ? 'w-full' : 'w-1/3'} h-130 flex items-start justify-start ml-5`}
            onClick={() => handleSensorClick('gas')}
            style={{ cursor: 'pointer' }}
          >
            <SensorChart 
              dataKey="sensor_gas" 
              label="ppm" 
              color="#ffc658" 
            />
          </div>
        )}
      </div>
    </div>
  );
}


export default Board;
