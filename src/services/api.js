import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://clownfish-app-d64w7.ondigitalocean.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Only add Authorization header if it's not already set
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        endpoint: error.config.url,
        headers: error.config.headers,
      });
      
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        // Don't remove token on 401 from login endpoint
        if (!error.config.url.includes('/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Don't redirect if we're already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
    } else {
      console.error('Network Error:', error);
    }
    return Promise.reject(error);
  }
);

export default api;