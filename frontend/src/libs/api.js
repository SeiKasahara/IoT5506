import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_NEXT_PUBLIC_BACKEND_URL,
});

export default api;
