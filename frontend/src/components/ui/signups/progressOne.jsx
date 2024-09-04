import React, { ChangeEvent, useState } from 'react';
import ProgressBar from './progressbar';
import { Input } from '../input';
import { Button } from '../button';
import { emailRegex } from '../../../libs/emailRegex';
import { checkUnique } from '../../../libs/checkUnique';

function isValidEmail(email) {
  return emailRegex.test(email);
}

export const PageOne = ({
  email,
  handleInputChange,
  currentStep,
  setCurrentStep,
  setInput,
  setPassword,
  setRepeatPassword,
  password,
  repeatPassword,
}) => {
  const [buttonVariant, setButtonVariant] = useState('inactive');
  const [errorMessage, setErrorMessage] = useState('');
  const [inputState, setInputState] = useState('default');
  const [passwordVariant, setPasswordVariant] = useState('inactive');
  const [repeatPasswordVariant, setRepeatPasswordVariant] =
    useState('inactive');
  const handlePasswordChange = (event) => {
    const value = event.target.value;
    setPassword(value);
    handleInputChange(event);
    setPasswordVariant(event.target.value ? 'default' : 'inactive');
  };

  const handleRepeatPasswordChange = (event) => {
    const value = event.target.value;
    setRepeatPassword(value);
    handleInputChange(event);
    setRepeatPasswordVariant(event.target.value ? 'default' : 'inactive');
    if (passwordValidation(password, value)) {
      setInputState('default');
      setErrorMessage('');
    } else {
      setInputState('error');
      setErrorMessage('Passwords do not match');
    }
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setInput(value);
    handleInputChange(event);
    setButtonVariant(event.target.value ? 'default' : 'inactive');
    if (isValidEmail(value)) {
      setInputState('default');
      setErrorMessage('');
    } else {
      setInputState('error');
      setErrorMessage('Please enter correct email');
    }
  };

  const passwordInputVariant = inputState === 'default' ? 'default' : 'error';
  /*
  const buttonVariant =
    passwordVariant === 'default' &&
    repeatPasswordVariant === 'default' &&
    passwordInputVariant === 'default'
      ? 'default'
      : 'inactive';*/

  const emailInputState = inputState === 'default' ? 'default' : 'error';
  const buttonInputVariant =
    buttonVariant === 'default' && emailInputState === 'default'
      ? 'default'
      : 'inactive';

  const handleSubmit = async () => {
    try {
      const message = await checkUnique(email, 'email');
      if (message) {
        setInputState('error');
        setErrorMessage(message);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className='middlecontainer'>
      <ProgressBar currentStep={currentStep} />
      <div className='inputcontainer'>
        <p className='mention'>What's your email?</p>
        <Input
          type='email'
          variant={emailInputState}
          value={email}
          onChange={handleEmailChange}
          placeholder='Enter your email address'
        ></Input>
        {errorMessage && <div style={{ color: '#f06292' }}>{errorMessage}</div>}
      </div>
      <div className='inputcontainer'>
        <p className='mention'>Create your password</p>
        <Input
          type='password'
          value={password}
          onChange={handlePasswordChange}
          placeholder='Enter your password'
        ></Input>
      </div>
      <div className='inputcontainer'>
        <p className='mention'>Repeat your password</p>
        <Input
          type='password'
          variant={passwordInputVariant}
          value={repeatPassword}
          onChange={handleRepeatPasswordChange}
          placeholder='Enter your password once again'
        ></Input>
        {errorMessage && <div style={{ color: '#f06292' }}>{errorMessage}</div>}
      </div>
      <Button
        variant={buttonInputVariant}
        onClick={handleSubmit}
        disabled={buttonInputVariant === 'inactive'}
      >
        Next
      </Button>
    </div>
  );
};
