import axios from 'axios';
import { message } from 'antd';
import authService from './auth.service';

const API_URL = process.env.BASE_API || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
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

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and user data
      authService.logout();
      
      // Show error message
      message.error('Votre session a expiré. Veuillez vous reconnecter.');
      
      // Redirect to login page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 