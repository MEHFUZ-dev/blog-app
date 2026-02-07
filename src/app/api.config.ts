// API Configuration - automatically switches between local and production
export const API_BASE_URL = 
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://blog-app-backend-llw3.onrender.com/api';

