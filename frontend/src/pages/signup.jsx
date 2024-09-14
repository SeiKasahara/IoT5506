import '../styles/signup.css';

import { CSSTransition } from 'react-transition-group';
import React, { useEffect, useState } from 'react';
import SignupTitle from '../components/ui/signups/signuptitle';

import { PageOne } from '../components/ui/signups/progressOne';
import { PageTwo } from '../components/ui/signups/progressTwo';

import api from '../libs/api';
//import encryptPassword from '../libs/encrypt';

const DASHBOARD_URL = '/dashboard';


const Signup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [submit, setSubmit] = useState(false);
  const [deviceName, setDeviceName] = useState('');

  const handleInputChange = (event) => {
    switch (event.target.name) {
      case 'email':
        setEmail(event.target.value);
        break;
      case 'firstName':
        setFirstName(event.target.value);
        break;
      case 'password':
        setPassword(event.target.value);
        break;
      case 'repeatPassword':
        setRepeatPassword(event.target.value);
        break;
      case 'device':
        setDeviceName(event.target.value);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const onFinish = async () => {
      const data = {
        email: email,
        username: firstName,
        password: password, //encryptPassword
        devicename: deviceName,
      };

      try {
        const response = await api.post('/signup/', data);
        if (response.status === 200) {
          console.log('Successfully sent the message');
        } else if (response.status === 201) {
          setEmail('');
          setFirstName('');
          setPassword('');
          setRepeatPassword('');
          const token = response.data.access;
          localStorage.setItem("token", token);

          console.log("Successfully created a new user");
          window.location.href = DASHBOARD_URL;
        } else {
          console.log('There is an issue when sending a message');
        }
      } catch (error) {
        console.error('Error occurs when ', error);
      }

    };
    if (submit) {
      onFinish();
      setSubmit(false); // Reset the submit state after onFinish has been called
    }
  }, [submit]); // onFinish will be called whenever `submit` state changes

  return (
    <div className='container'>
      <SignupTitle />
      <CSSTransition
        in={currentStep === 1}
        timeout={300}
        classNames='fade'
        unmountOnExit
      >
        <PageOne
          email={email}
          handleInputChange={handleInputChange}
          currentStep={currentStep}
          password={password}
          repeatPassword={repeatPassword}
          setPassword={setPassword}
          setRepeatPassword={setRepeatPassword}
          setCurrentStep={setCurrentStep}
          setInput={setEmail}
        />
      </CSSTransition>
      <CSSTransition
        in={currentStep === 2}
        timeout={300}
        classNames='fade'
        unmountOnExit
      >
        <PageTwo
          firstName={firstName}
          handleInputChange={handleInputChange}
          currentStep={currentStep}
          deviceName={deviceName}
          setDeviceName={setDeviceName}
          setFirstName={setFirstName}
          setSubmit={setSubmit}
        />
      </CSSTransition>
    </div>
  );
};

export default Signup;
