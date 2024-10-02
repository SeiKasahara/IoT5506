import React, { useState, useEffect } from 'react';
import { Button } from '../button';
import api from '../../../libs/api';

const CustomAlert = () => {
  const [temperature, setTemperature] = useState(8);
  const [humidity, setHumidity] = useState(50);
  const [gasConcentration, setGasConcentration] = useState(10);
  const [submitVariant, setSubmitVariant] = useState('default');

  const [displayTemp, setDisplayTemp] = useState("");
  const [displayHumi, setDisplayHumi] = useState("");
  const [displayGas, setDisplayGas] = useState("");

  const fetchThresholdData = async () => {
    try {
      const response = await api.get('/api/user/set-threshold/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = response.data;
      setDisplayTemp(data.temperature);
      setDisplayHumi(data.humidity);
      setDisplayGas(data.gas_concentration);

    } catch (error) {
        console.error('Error fetching device data:', error);
    }
  }

  useEffect(() => {
    if (temperature === '' || humidity === '' || gasConcentration === '') {
      setSubmitVariant('inactive');
    } else {
      setSubmitVariant('default');
    }
  }, [temperature, humidity, gasConcentration]);

  useEffect(() => {
    fetchThresholdData();
    const interval = setInterval(fetchThresholdData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    if (displayTemp !== '' && displayHumi !== '' && displayGas === '') {
      const interval = setInterval(fetchThresholdData, 120000); // Poll every 2 minutes
      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [displayTemp, displayHumi, displayGas]);
  
  useEffect(() => {
    if (temperature === '' || humidity === '' || gasConcentration === '') {
      setSubmitVariant('inactive');
    } else {
      setSubmitVariant('default');
    }
  }, []);

  const handleThresholdSubmit = async () => {
    if (submitVariant === 'default') {
      try {
        const response = await api.put('/api/user/set-threshold/', 
        {
            temperature: temperature,
            humidity: humidity,
            gas_concentration: gasConcentration,
        },{
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        if (response.status === 200) {
          alert('Thresholds submitted successfully');
        } else {
          console.error('Failed to submit thresholds');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className='absolute top-[12%] left-[245px] w-4/5 h-auto flex flex-col items-start justify-start mt-5 bg-white rounded-lg shadow-lg p-6 mx-auto'>
      <div className='w-full space-y-3'>
        <p className='text-2xl font-bold mb-4'>Custom Temperature Alert Subscription:</p>
        <h1>If you opened the mail alert settings, you can receive alert email from system</h1>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Temperature Alert Threshold:</label>
          <input
            type='number'
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder='Set temperature'
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </div>
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Humidity Alert Threshold:</label>
          <input
            type='number'
            value={humidity}
            onChange={(e) => setHumidity(e.target.value)}
            placeholder='Set humidity'
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </div>
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Gas Concentration Alert Threshold:</label>
          <input
            type='number'
            value={gasConcentration}
            onChange={(e) => setGasConcentration(e.target.value)}
            placeholder='Set gas concentration'
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </div>
        <div className='mt-6'>
          <p className='text-xl font-semibold mb-2'>Current Subscription Values:</p>
          <h3 className='text-green-700'>Temperature: {displayGas}°C</h3>
          <h3 className='text-blue-700'>Humidity: {displayHumi}%</h3>
          <h3 className='text-red-700'>Gas Concentration: {displayTemp} ppm</h3>
        </div>
        <Button
          className={`px-4 py-2 rounded-md ${submitVariant === 'inactive' ? 'bg-gray-400' : 'bg-blue-500 text-white'}`}
          variant={submitVariant}
          onClick={handleThresholdSubmit}
          disabled={submitVariant === 'inactive'}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default CustomAlert;
