// src/api/safewalkApi.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; // or your deployed backend

export const getSafestRoute = async (source, destination) => {
  const timestamp = new Date().toISOString();

  const res = await axios.post(`${API_BASE_URL}/safest-route`, {
    source,
    destination,
    timestamp
  });

  return res.data;
};
