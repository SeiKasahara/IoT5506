import React, { ChangeEvent, useState } from 'react';
import ProgressBar from './progressbar';
import { Input } from '../input';
import { Button } from '../button';
import { emailRegex } from '../../../libs/regex';
import { pwRegex } from '../../../libs/regex';
import { checkUnique } from '../../../libs/checkUnique';

function isValidEmail(email) {
  return emailRegex.test(email);
}

function passwordValidation(password, repeatPassword) {
  if (repeatPassword != password) {
    return false;
  }
  return true;
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
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [inputState, setInputState] = useState('default');
  const [passwordVariant, setPasswordVariant] = useState('inactive');
  const [repeatPasswordVariant, setRepeatPasswordVariant] =
    useState('inactive');


  function inputCheck(password, hook) {
    if (password.length < 8) {
      setPasswordErrorMessage(
        "This password is too short. It must contain at least 8 characters.",
      );
      hook("inactive");
      return false;
    } else if (pwRegex.test(password)) {
      setPasswordErrorMessage("This password is entirely numeric.");
      hook("inactive");
      return false;
    } else {
      setPasswordErrorMessage('');
      hook("default");
      return true;
    }
  }

  const handlePasswordChange = (event) => {
    const value = event.target.value;
    setPassword(value);
    handleInputChange(event);
    setPasswordVariant(event.target.value ? 'default' : 'inactive');
    if (!passwordValidation(repeatPassword, value)) {
      setPasswordErrorMessage("Passwords do not match");
      setPasswordVariant("inactive");
    } else {
      setPasswordErrorMessage('');
      setPasswordVariant("default");
    }
  };

  const handleRepeatPasswordChange = (event) => {
    const value = event.target.value;
    setRepeatPassword(value);
    handleInputChange(event);
    setRepeatPasswordVariant(event.target.value ? 'default' : 'inactive');
    if (!passwordValidation(password, value)) {
      setPasswordErrorMessage("Passwords do not match");
      setRepeatPasswordVariant("inactive");
    } else if (!inputCheck(password, setPasswordVariant)) {
      inputCheck(password, setPasswordVariant);
    } else {
      setPasswordErrorMessage('');
      setRepeatPasswordVariant("default");
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

  const passwordInputVariant = 'default' ? 'default' : 'error';
  const emailInputState =  'default' ? 'default' : 'error';
  const buttonInputVariant =
    passwordVariant === 'default' &&
    repeatPasswordVariant === 'default' &&
    passwordInputVariant === 'default' && 
    emailInputState === 'default'
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
        {passwordErrorMessage && <div style={{ color: '#f06292' }}>{passwordErrorMessage}</div>}
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
