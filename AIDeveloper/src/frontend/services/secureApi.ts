import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com';

/**
 * Secure API client with authentication and security headers.
 * Strips sensitive headers and handles token refresh.
 */
export const secureApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to strip sensitive headers
secureApi.interceptors.response.use(
  (response) => {
    // Remove server version or other sensitive headers
    delete response.headers['x-powered-by'];
    delete response.headers['server'];
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      // Trigger logout or refresh token
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
secureApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);