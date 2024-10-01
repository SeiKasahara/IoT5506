import React, { useEffect, useState } from "react";
import api from "../../../libs/api";
import EXIF from "exif-js";

const TIME = 60000; // Polling interval in milliseconds (e.g., 60 seconds)

export const Monitor = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [timestamp, setTimestamp] = useState("");

  const fetchLatestImage = async () => {
    try {
      const response = await api.get("/api/latest-image/", {
        responseType: 'blob', // Important for handling binary data
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      const imageBlob = response.data;
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setImageUrl(imageObjectURL);
      //Time stamp should get in the backend ///working
    } catch (error) {
      console.error("Error fetching the latest image:", error);
    }
  };

  useEffect(() => {
    fetchLatestImage();
    const interval = setInterval(fetchLatestImage, TIME);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute left-[245px] w-[80%] h-auto flex flex-row items-start justify-start mt-[20px] bg-volt-background-light-mode rounded-lg container w-[900px] mx-auto p-4">
    <div className="bg-gray-100 rounded-lg p-5 shadow-md w-full h-130 flex items-start justify-start ml-5">
      {imageUrl ? (
        <>
        <img 
          src={imageUrl} 
          alt="Latest" 
          className="w-[640px] h-[480px] object-cover" 
        />
        <p className="text-sm text-gray-600 ml-10">Timestamp: {timestamp}</p>
        </>
      ) : (
        <p>No image available</p>
      )}
    </div>
    </div>
  );  
};
