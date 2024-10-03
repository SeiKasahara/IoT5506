import React, { useEffect, useState } from "react";
import api from "../../../libs/api";
const TIME = 60000; // Polling interval in milliseconds (e.g., 60 seconds)

export const Monitor = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [prediction, setPrediction] = useState("");
  const [food, setFood] = useState("");
  const [freshness, setFreshness] = useState("");

  const fetchLatestImage = async () => {
    try {
      const response = await api.get(`/api/latest-image/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
  
      const { image, prediction, timestamp, food_v, freshness_v } = response.data;
      const imageBlob = await (await fetch(`data:image/jpeg;base64,${image}`)).blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      const date = new Date(timestamp);
      const formattedDate = `${('0' + (date.getMonth() + 1)).slice(-2)}/${('0' + date.getDate()).slice(-2)}/${date.getFullYear().toString().slice(-2)}`;
      const formattedTime = `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
      const formattedTimestamp = `${formattedDate} ${formattedTime}`;

      setTimestamp(formattedTimestamp);
      setImageUrl(imageObjectURL);
      setPrediction(prediction);
      setFood(food_v);
      setFreshness(freshness_v);
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
        <div className="flex-col items-start">
        <p className="text-sm text-gray-600 ml-10">Time: {timestamp}</p>
        <div className="separator h-0.5 w-full mt-2 mb-5 bg-gray-300 mx-1 self-center"></div>
          <p className="text-sm text-gray-600 ml-10">Accuracy: {prediction} %</p>
          <p className="text-sm text-gray-600 ml-10">Food: {food} </p>
          <p className={`text-sm ${freshness === 'Fresh' ? 'text-green-600' : 'text-red-600'} ml-10`}>Freshness: {freshness} </p>
        </div>
        </>
      ) : (
        <p>No image available</p>
      )}
    </div>
    </div>
  );
};
