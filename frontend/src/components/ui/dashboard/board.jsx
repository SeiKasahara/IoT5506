import React, { useEffect, useState } from 'react';
//import { Line } from 'react-chartjs-2';
//import { Chart as ChartJS } from 'chart.js/auto';

function Dashboard() {
  const [sensorData, setSensorData] = useState([]);
  /*
  const data = {
    labels: sensorData.map(item => item.timestamp),
    datasets: [
      {
        label: 'Sensor Value',
        data: sensorData.map(item => item.value),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };*/

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}

export default Dashboard;
