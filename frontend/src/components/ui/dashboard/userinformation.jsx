import React, { useState } from 'react';

const devices = [
  { name: 'Device 1', macAddress: '00:1A:2B:3C:4D:5E' },
  { name: 'Device 2', macAddress: '01:2B:3C:4D:5E:6F' },
];

const UserInformation = () => {
  return (
    <div className="container w-[1000px] mx-auto p-4">
      <p className="text-2xl font-bold mb-4">Bound Devices</p>
      <div className="bg-white w-full shadow-md rounded-lg overflow-hidden">
        {devices.map((device, index) => (
          <div key={index} className="border-b border-gray-200 p-4">
            <p className="text-lg font-semibold">{device.name}</p>
            <p className="text-gray-600">{device.macAddress}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserInformation;


