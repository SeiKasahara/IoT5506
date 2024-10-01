import React, { useState, useEffect } from 'react';
import api from '../../../libs/api';

const UserInformation = () => {
  const [devices, setDevices] = useState([]);
  const [isFireBeetleActive, setIsFireBeetleActive] = useState('Getting..');
  const [isXiaoActive, setIsXiaoActive] = useState('Getting..');

  const fetchDeviceData = async () => {
    try {
      const response = await api.get('/api/user-device-info/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = response.data;

      setIsFireBeetleActive(data.is_fire_beetle_active === null ? 'Inactive' : data.is_fire_beetle_active ? 'Online' : 'Offline');
      setIsXiaoActive(data.is_xiao_active === null ? 'Inactive' : data.is_xiao_active ? 'Online' : 'Offline');

      const updatedDevices = [
        {
          name: 'FireBeetle32',
          macAddress: data.fire_beetle_mac_address,
          username: data.username,
          status: data.is_fire_beetle_active === null ? 'Inactive' : data.is_fire_beetle_active ? 'Online' : 'Offline',
        },
        {
          name: 'XIAO ESP32S3',
          macAddress: data.xiao_mac_address,
          username: data.username,
          status: data.is_xiao_active === null ? 'Inactive' : data.is_xiao_active ? 'Online' : 'Offline',
        },
      ];

      setDevices(updatedDevices);
    } catch (error) {
      console.error('Error fetching device data:', error);
    }
  };

  useEffect(() => {
    fetchDeviceData();
    const interval = setInterval(fetchDeviceData, 6000); // Poll every 6 seconds initially
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  useEffect(() => {
    if (isFireBeetleActive !== 'Getting..' && isXiaoActive !== 'Getting..') {
      const interval = setInterval(fetchDeviceData, 120000); // Poll every 2 minutes
      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [isFireBeetleActive, isXiaoActive]);

  return (
    <div className="absolute top-[12%] left-[245px] w-[80%] h-auto flex flex-row items-start justify-start mt-[20px] bg-volt-background-light-mode rounded-lg container w-[1000px] mx-auto p-4">
      <p className="text-2xl font-bold mb-4">Bound Devices</p>
      <div className="bg-white w-full shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Device Name</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">MAC Address</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Device Owner</th>
              <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{device.name}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{device.macAddress}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{device.username}</td>
                <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                  {device.status}
                  <span
                    className={`ml-2 inline-block w-2 h-2 rounded-full ${
                      device.status === 'Online' ? 'bg-green-500' : device.status === 'Offline' ? 'bg-red-500' : 'bg-gray-500'
                    }`}
                  ></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserInformation;
