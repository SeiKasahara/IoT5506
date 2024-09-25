import '../styles/login.css';

import React, { useEffect, useState } from 'react';
import api from '../libs/api';
import LoginTitle from '../components/ui/login/logintitle';
import { useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { LoginPage } from '../components/ui/login/loginPage';

const DASHBOARD_URL = '/dashboard';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submit, setSubmit] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (event) => {
        switch (event.target.name) {
          case 'email':
            setEmail(event.target.value);
            break;
          case 'password':
            setPassword(event.target.value);
            break;
          default:
            break;
        }
    };
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        navigate('/dashboard');
      }
    }, [navigate]);
  

    useEffect(() => {
      const onFinish = async () => {
          const data = {
            email: email,
            password: password,
          };
          console.log(data);
    
          try {
            const response = await api.post('/login/', data);
    
            if (response.status === 200) {
              setEmail('');
              setPassword('');
              const token = response.data.access;
              localStorage.setItem("token", token);
    
              console.log("Successfully log in");
              window.location.href = DASHBOARD_URL;
            } else if (response.status % 400 < 100) {
              setErrorMessage('Login failed, please check your email or password')
            } else {
              console.log('There is an issue when sending a message');
            }
          } catch (error) {
            console.error('Error occurs when ', error);
            setErrorMessage('Login failed due to internal server error');
          }
    
      };
      if (submit) {
        onFinish();
        setSubmit(false);
      }
    }, [submit]);
    return (
      <div className='container'>
      <LoginTitle />
      <LoginPage
        email = {email}
        setInput = {setEmail}
        password={password}
        setPassword = {setPassword}
        handleInputChange = {handleInputChange}
        setSubmit={setSubmit}
      />
      {errorMessage && <div style={{ color: '#f06292' }}>{errorMessage}</div>}
      </div>
    );
};

export default Login;