import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const LIVE_BACKEND_URL = 'https://alpha-backend-zvhx.onrender.com';

let envUrl = import.meta.env.VITE_API_URL || LIVE_BACKEND_URL;
if (typeof envUrl === 'string' && envUrl.endsWith('/')) {
  envUrl = envUrl.slice(0, -1);
}

// Always default axios baseURL to configured API URL or live Render backend
axios.defaults.baseURL = envUrl;
axios.defaults.timeout = 60000; // 60s timeout to allow Render free tier backend wake-up

// Global Axios Interceptor: Automatically catch ERR_CONNECTION_REFUSED / ERR_NETWORK and fallback to live backend
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const isConnRefused = error?.code === 'ERR_NETWORK' || !error?.response;
    const currentBase = axios.defaults.baseURL || '';
    const isUsingLocalhost = currentBase.includes('localhost:5000') || originalRequest?.url?.includes('localhost:5000');

    if (isConnRefused && isUsingLocalhost && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('Localhost backend unreachable (ERR_CONNECTION_REFUSED). Automatically switching to live Render API:', LIVE_BACKEND_URL);
      axios.defaults.baseURL = LIVE_BACKEND_URL;

      if (originalRequest.baseURL) {
        originalRequest.baseURL = LIVE_BACKEND_URL;
      }
      if (originalRequest.url && originalRequest.url.startsWith('http://localhost:5000')) {
        originalRequest.url = originalRequest.url.replace('http://localhost:5000', LIVE_BACKEND_URL);
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



