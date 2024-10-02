import React, { useEffect, useState } from "react";
import api from "../../../libs/api";
const TIME = 60000; // Polling interval in milliseconds (e.g., 60 seconds)

export const Monitor = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const fetchLatestImage = async () => {
    try {
      const userId = localStorage.getItem('userId'); // Assuming user ID is stored in local storage
      const response = await api.get(`/api/latest-image/${userId}`, {
        responseType: 'blob', // Important for handling binary data
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      const imageBlob = response.data;
      const imageObjectURL = URL.createObjectURL(imageBlob);
      const now = new Date();
  
      const year = now.getFullYear();
      const month = ('0' + (now.getMonth() + 1)).slice(-2);
      const day = ('0' + now.getDate()).slice(-2);
      const hours = ('0' + now.getHours()).slice(-2);
      const minutes = ('0' + now.getMinutes()).slice(-2);
      const seconds = ('0' + now.getSeconds()).slice(-2);
  
      const formattedTime = year + "/" + month + "/" + day + " " + hours + ":" + minutes + ":" + seconds;
  
      setTimestamp(formattedTime);
      setImageUrl(imageObjectURL);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setImageUrl("");
        console.error("Access forbidden: You do not have permission to access.");
      } else {
        console.error("Error fetching the latest image:", error);
      }
    }
  };
  

  useEffect(() => {
    fetchLatestImage();
    const interval = setInterval(fetchLatestImage, TIME);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute left-[245px] w-[80%] h-auto flex flex-row items-start justify-start mt-[20px] bg-volt-background-light-mode rounded-lg container w-[1100px] mx-auto p-4">
    <div className="bg-gray-100 rounded-lg p-5 shadow-md w-full h-130 flex items-start justify-start ml-5">
      {imageUrl ? (
        <>
        <img 
          src={imageUrl} 
          alt="Latest" 
          className="w-[640px] h-[480px] object-cover" 
        />
        <p className="text-sm text-gray-600 ml-10">Time: {timestamp}</p>
        </>
      ) : (
        <p>No image available</p>
      )}
    </div>
    </div>
  );
};
