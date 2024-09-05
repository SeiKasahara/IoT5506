import React, { ChangeEvent, useState } from 'react';
import ProgressBar from './progressbar';
import { Input } from '../input';
import { Button } from '../button';
import { checkUnique } from '../../../libs/checkUnique';


export const PageTwo = ({
  firstName,
  handleInputChange,
  currentStep,
  setCurrentStep,
  setFirstName,
  setSubmit
}) => {
  const [firstNameVariant, setFirstNameVariant] = useState('inactive');
  const [inputState, setInputState] = useState('default');
  const [userInputState, setUserInputState] = useState('default');
  const [errorMessage, setErrorMessage] = useState('');
  const [usernameErrorMessage, setUsernameErrorMessage] = useState('');

  const handleFirstNameChange = (event) => {
    const value = event.target.value;
    setFirstName(value);
    handleInputChange(event);
    setFirstNameVariant(value ? 'default' : 'inactive');
  };

  const usernameInputVariant =
    userInputState === 'default' ? 'default' : 'error';

  const handleSubmit = async () => {
    try {
      const message = await checkUnique(firstName, 'username');
      if (message) {
        setUserInputState('error');
        setUsernameErrorMessage(message);
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
        <p className='mention'>What’s your first name?</p>
        <Input
          variant={usernameInputVariant}
          type='string'
          value={firstName}
          onChange={handleFirstNameChange}
          placeholder='Enter your first name'
        ></Input>
        {usernameErrorMessage && (
          <div style={{ color: '#f06292' }}>{usernameErrorMessage}</div>
        )}
      </div>
      <Button
        variant={firstNameVariant}
        onClick={handleSubmit}
        disabled={firstNameVariant === 'inactive'}
      >
        Next
      </Button>
    </div>
  );
};
