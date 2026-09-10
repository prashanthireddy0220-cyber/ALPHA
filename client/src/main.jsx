import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

export const LIVE_BACKEND_URL = 'https://alpha-backend-zvhx.onrender.com';

const determineApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    // If not running on local machine (e.g. Vercel production), NEVER use localhost
    if (!isLocal) {
      const envUrl = import.meta.env.VITE_API_URL;
      if (envUrl && typeof envUrl === 'string' && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1') && envUrl.startsWith('https://')) {
        return envUrl.replace(/\/$/, '');
      }
      return LIVE_BACKEND_URL;
    }
  }
  let envUrl = import.meta.env.VITE_API_URL || LIVE_BACKEND_URL;
  if (typeof envUrl === 'string') {
    return envUrl.replace(/\/$/, '');
  }
  return LIVE_BACKEND_URL;
};

// Always default axios baseURL to configured API URL or live Render backend
axios.defaults.baseURL = determineApiBaseUrl();
axios.defaults.timeout = 60000; // 60s timeout to allow Render free tier backend wake-up

// Request Interceptor: Ensure on production/HTTPS no request ever goes to localhost
axios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
      if (!isLocal || window.location.protocol === 'https:') {
        if (!config.baseURL || config.baseURL.includes('localhost') || config.baseURL.includes('127.0.0.1')) {
          config.baseURL = LIVE_BACKEND_URL;
        }
        if (config.url && (config.url.includes('localhost:5000') || config.url.includes('127.0.0.1:5000') || config.url.includes('localhost:3000'))) {
          config.url = config.url.replace(/http:\/\/(localhost|127\.0\.0\.1):(5000|3000)/g, LIVE_BACKEND_URL);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global Axios Interceptor: Automatically catch ERR_CONNECTION_REFUSED / ERR_NETWORK and fallback to live backend
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const isConnRefused = error?.code === 'ERR_NETWORK' || !error?.response;
    const currentBase = axios.defaults.baseURL || '';
    const isUsingLocalhost = currentBase.includes('localhost') || originalRequest?.url?.includes('localhost');

    if (isConnRefused && isUsingLocalhost && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('Localhost backend unreachable (ERR_CONNECTION_REFUSED). Automatically switching to live Render API:', LIVE_BACKEND_URL);
      axios.defaults.baseURL = LIVE_BACKEND_URL;

      if (originalRequest.baseURL) {
        originalRequest.baseURL = LIVE_BACKEND_URL;
      }
      if (originalRequest.url) {
        originalRequest.url = originalRequest.url.replace(/http:\/\/(localhost|127\.0\.0\.1):(5000|3000)/g, LIVE_BACKEND_URL);
      }
      return axios(originalRequest);
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)



