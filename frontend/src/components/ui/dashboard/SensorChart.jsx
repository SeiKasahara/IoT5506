import React, { useEffect, useState } from 'react';
import api from '../../../libs/api';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TIME = import.meta.env.DATA_UPDATE_TIME || 300000;
const DATA_AMOUNT = 10;

const SensorChart = ({ dataKey, label, color }) => {
  const [currentValue, setCurrentValue] = useState(null);
  const [data, setData] = useState([]);
  const [isLineChart, setIsLineChart] = useState(false);

  const fetchData = async () => {
    try {
      const response = await api.get('iot/sensor_data/');
      const formattedData = response.data.map(item => ({
        timestamp: new Date(item.timestamp).toLocaleString(),
        sensor_humidity: item.sensor_humidity,
        sensor_temperature: item.sensor_temperature,
        sensor_gas: item.sensor_gas,
      }));
      const recentData = formattedData.slice(-DATA_AMOUNT);
      setData(recentData);
      
      // Get the latest value for the circular progress bar
      if (response.data.length > 0) {
        const latestData = response.data.reduce((latest, current) => {
          return new Date(latest.timestamp) > new Date(current.timestamp) ? latest : current;
        });
        setCurrentValue(latestData[dataKey]);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, TIME);
    return () => clearInterval(interval);
  }, []);

  const getDomain = () => {
    const values = data.map(item => item[dataKey]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return [min - 1.5, max + 1.5];
  };

  const handleToggle = () => {
    setIsLineChart(prev => !prev);
  };

  return (
    <div onClick={handleToggle} style={{ cursor: 'pointer', width: 200, height: 200 }}>
      {isLineChart ? (
        <ResponsiveContainer width={800} height={200}>
          <LineChart data={data} margin={{ top: 0, right: 70, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
            <YAxis 
              domain={getDomain()} 
              tick={{ fontSize: 10 }} 
              label={{ value: label, angle: -90, position: 'insideLeft', dy: 50 }} 
            />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke={color} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <CircularProgressbar
          value={currentValue}
          text={`${currentValue}${label}`}
          styles={buildStyles({
            pathColor: color,
            textColor: '#f88',
            trailColor: '#d6d6d6',
            backgroundColor: '#3e98c7',
          })}
        />
      )}
    </div>
  );
};

export default SensorChart;
