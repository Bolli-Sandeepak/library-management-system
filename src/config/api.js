import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'https://library-management-system-1-jfn4.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies if using them
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
