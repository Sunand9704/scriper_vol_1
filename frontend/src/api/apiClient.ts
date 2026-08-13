import axios from 'axios';

// Centralized Base URL directly configured
export const API_BASE_URL = 'http://localhost:5000/api/scraper';

// Centralized Axios Instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Centralized Request Interceptor - Attaches Authorization Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('scriper_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Centralized Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.warn('⚠️ API Request Timeout');
    }
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem('scriper_token');
    }
    return Promise.reject(error);
  }
);
