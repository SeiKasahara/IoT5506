import React, { useState } from 'react';

const UserInformation = () => {
  const [deviceName, setDeviceName] = useState('');
  
  return (
    <div>
      <h1>User Information</h1>
      <p>This is the user information page.</p>
    </div>
  );
}

export default UserInformation;
