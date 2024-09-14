import { checkRegistered } from '../../../libs/checkRegistered';
import React, { ChangeEvent, useState } from 'react';
import { Input } from '../input';
import { Button } from '../button';

export const LoginPage = ({
    email,
    setInput,
    password,
    setPassword,
    handleInputChange,
    setSubmit
}) => {
    const [buttonVariant, setButtonVariant] = useState('inactive');
    const [errorMessage, setErrorMessage] = useState('');
    const [inputState, setInputState] = useState('default');
    const [passwordVariant, setPasswordVariant] = useState('inactive');

    const handleEmailChange = (event) => {
        const value = event.target.value;
        setInput(value);
        handleInputChange(event);
        setButtonVariant(event.target.value ? 'default' : 'inactive');
      };
      
    const handlePasswordChange = (event) => {
        const value = event.target.value;
        setPassword(value);
        handleInputChange(event);
        setPasswordVariant(event.target.value ? 'default' : 'inactive');
    };

    const handleSubmit = async () => {
        try {
            const message = await checkRegistered(email, 'email');
            if (message) {
                setSubmit(true);
                setErrorMessage("");
            } else {
                setErrorMessage("User has not been registered");
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    };

    const buttonInputVariant =
      passwordVariant === 'default' && 
      inputState === 'default'
        ? 'default'
        : 'inactive';
    return (
        <div className='middlecontainer'>
        <div className='inputcontainer'>
        <p className='mention'>What's your email?</p>
        <Input
          type='email'
          value={email}
          onChange={handleEmailChange}
          placeholder='Enter your email address'
        ></Input>
        <div className='inputcontainer'>
            <p className='mention'>Enter your password</p>
            <Input
            type='password'
            value={password}
            onChange={handlePasswordChange}
            placeholder='Enter your password'
            ></Input>
        </div>
        </div>
        {errorMessage && <div style={{ color: '#f06292' }}>{errorMessage}</div>}
        <Button
            variant={buttonInputVariant}
            onClick={handleSubmit}
            disabled={buttonInputVariant === 'inactive'}
        >
        Log in
        </Button>
      </div>

    )
}