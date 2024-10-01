import React, { useState, useEffect } from 'react';
import api from '../../../libs/api';
import { Button } from '../button';

const GenerateToken = () => {
  const [firebeetleToken, setFirebeetleToken] = useState('');
  const [xiaoToken, setXiaoToken] = useState('');
  const [firebeetleIno, setFirebeetleIno] = useState('');
  const [xiaoIno, setXiaoIno] = useState('');
  const [Xiaomessage, setXiaoMessage] = useState('');
  const [FBmessage, setFBMessage] = useState('');
  const [isFBVerified, setIsFBVerified] = useState(false);
  const [isXiaoVerified, setIsXiaoVerified] = useState(false);

  const handleGenerate = async () => {
    try {
      const response = await api.get('/api/generate-tokens/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      setFirebeetleToken(response.data.firebeetle_token);
      setXiaoToken(response.data.xiao_token);
      setFirebeetleIno(response.data.firebeetle_ino);
      setXiaoIno(response.data.xiao_ino);
    } catch (error) {
      console.error("Error generating tokens:", error);
    }
  };
  

  const downloadFile = (filename, content) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
  };

  useEffect(() => {
    const pollXiaoVerify = async () => {
        try {
            const response = await api.get(`/api/poll_xiao_verify?token=${xiaoToken}`);
            if (response.status === 200) {
                setXiaoMessage('Xiao verified');
                alert('Xiao verification successful!');
                setIsXiaoVerified(true);
            } else {
                setXiaoMessage('');
            }
        } catch (error) {
            console.error('Error polling Xiao verify:', error);
        }
    };

    const pollFirebeetleVerify = async () => {
        try {
            const response = await api.get(`/api/poll_firebeetle_verify?token=${firebeetleToken}`);
            console.log(response.status);
            if (response.status === 200) {
                setFBMessage('Firebeetle verified');
                alert('Firebeetle verification successful!');
                setIsFBVerified(true);
            } else {
                setFBMessage('');
            }
        } catch (error) {
            console.error('Error polling Firebeetle verify:', error);
        }
    };

    const intervalId = setInterval(() => {
        if (!isXiaoVerified && !isFBVerified) {
            pollXiaoVerify();
            pollFirebeetleVerify();
        }
    }, 30000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
    }, [xiaoToken, firebeetleToken, isXiaoVerified, isFBVerified]);

  return (
    <div className="p-6 bg-volt-background-light-mode w-[1000px] h-full rounded-md shadow-md">
    <p className="text-xl font-bold mb-4">Bind your IOT device</p>
    <h2>Generate Binding Tokens for your ESP32 and ESP32 Camera</h2>
    <div className="separator h-0.5 w-full mt-2 mb-5 bg-gray-300 mx-1 self-center"></div>
    <div className='mb-6 space-y-10'>

      <Button className="w-1/3 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={handleGenerate}>Generate Tokens</Button>

      {firebeetleToken && (
        <div className='flex justify-between items-center'>
          <h3>FireBeetle ESP32 Token: <div style={{ color: '#f06292' }}>{firebeetleToken}</div></h3>
          {FBmessage && <div style={{ color: '#5ed062' }}>{FBmessage}</div>}
          <Button className="w-1/3 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => downloadFile("FireBeetleESP32.ino", firebeetleIno)}>Download FireBeetleESP32.ino</Button>
        </div>
      )}
      {xiaoToken && (
        <div className='flex justify-between items-center'>
          <h3>XIAO ESP32 Camera Token: <div style={{ color: '#f06292' }}>{xiaoToken}</div></h3>
          {Xiaomessage && <div style={{ color: '#5ed062' }}>{Xiaomessage}</div>}
          <Button className="w-1/3 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={() => downloadFile("XIAOESP32Camera.ino", xiaoIno)}>Download XIAOESP32Camera.ino</Button>
        </div>
      )}

    </div>
    </div>
  );
};

export default GenerateToken;