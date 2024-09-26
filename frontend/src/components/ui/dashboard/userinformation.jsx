import React, { useState } from 'react';

const UserInformation = () => {
  const [deviceName, setDeviceName] = useState('');
  
  return (
    <div>
      <h1>User Information</h1>
      <p>This is the user information page.</p>
      <div>
        <p className='mention'>Use token to bind your device</p>
        <Input
          variant={deviceNameInputVariant}
          type='string'
          value={deviceName}
          onChange={handleDeviceNameChange}
          placeholder='Enter your device token'
        ></Input>
        {devicenameErrorMessage && (
          <div style={{ color: '#f06292' }}>{devicenameErrorMessage}</div>
        )}
      </div>
    </div>
  );
}

export default UserInformation;
