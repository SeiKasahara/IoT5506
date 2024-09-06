import React, { useState } from 'react';
import ProgressBar from './progressbar';
import { Input } from '../input';
import { Button } from '../button';
import { checkUnique } from '../../../libs/checkUnique';


export const PageTwo = ({
  firstName,
  handleInputChange,
  currentStep,
  deviceName,
  setDeviceName,
  setFirstName,
  setSubmit
}) => {
  const [firstNameVariant, setFirstNameVariant] = useState('inactive');
  const [deviceNameVariant, setDeviceNameVariant] = useState('inactive');
  const [userInputState, setUserInputState] = useState('default');
  const [deviceInputState, setDeviceInputState] = useState('default');
  const [devicenameErrorMessage, setDevicenameErrorMessage] = useState('');

  const handleFirstNameChange = (event) => {
    const value = event.target.value;
    setFirstName(value);
    handleInputChange(event);
    setFirstNameVariant(value ? 'default' : 'inactive');
  };

  const handleDeviceNameChange = (event) => {
    const value = event.target.value;
    setDeviceName(value);
    handleInputChange(event);
    setDeviceNameVariant(value ? 'default' : 'inactive');
  };

  const usernameInputVariant =
    userInputState === 'default' ? 'default' : 'error';

  const deviceNameInputVariant = 
    deviceInputState === 'default' ? 'default' : 'error';

  const buttonState = 
    firstNameVariant === 'default' &&
    deviceNameVariant === 'default' ? 'default' : 'inactive';

  const handleSubmit = async () => {
    try {
      const message = await checkUnique(deviceName, 'devicename');
      if (message) {
        setDeviceInputState('error');
        setDevicenameErrorMessage(message);
      } else {
        setSubmit(true);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className='middlecontainer'>
      <ProgressBar currentStep={currentStep} />
      <div className='inputcontainer'>
        <p className='mention'>What’s your name?</p>
        <Input
          variant={usernameInputVariant}
          type='string'
          value={firstName}
          onChange={handleFirstNameChange}
          placeholder='Enter your first name'
        ></Input>
      </div>
      <div className='inputcontainer'>
        <p className='mention'>Bind your IoT device</p>
        <Input
          variant={deviceNameInputVariant}
          type='string'
          value={deviceName}
          onChange={handleDeviceNameChange}
          placeholder='Enter your device name'
        ></Input>
        {devicenameErrorMessage && (
          <div style={{ color: '#f06292' }}>{devicenameErrorMessage}</div>
        )}
      </div>
      <Button
        variant={buttonState}
        onClick={handleSubmit}
        disabled={buttonState === 'inactive'}
      >
        Next
      </Button>
    </div>
  );
};
