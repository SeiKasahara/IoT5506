import React, { useEffect, useState } from 'react';
import api from '../libs/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
      useEffect(() => {
        const onFinish = async () => {
          const data = {
            email: email,
            password: password,
          };
    
          try {
            const response = await api.post('/login/', data);
    
            if (response.status === 200) {
              console.log('Successfully sent the message');
            } else if (response.status === 201) {
              setEmail('');
              setPassword('');
              const token = response.data.access_token;
              localStorage.setItem("token", token);
    
              console.log("Successfully log in");
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
          setSubmit(false);
        }
      }, [submit]);
    return;
};

export default Login;