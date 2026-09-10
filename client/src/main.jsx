import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const LIVE_BACKEND_URL = 'https://alpha-backend-zvhx.onrender.com';

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

let envUrl = import.meta.env.VITE_API_URL || LIVE_BACKEND_URL;
if (typeof envUrl === 'string' && envUrl.endsWith('/')) {
  envUrl = envUrl.slice(0, -1);
}

// On production deployment, always use envUrl/LIVE_BACKEND_URL.
// On localhost, start with localhost:5000 with automatic fallback to live backend if port 5000 is offline.
axios.defaults.baseURL = isLocal ? 'http://localhost:5000' : envUrl;
axios.defaults.timeout = 60000; // 60s timeout to allow Render free tier backend wake-up

// Global Axios Interceptor: Automatically catch ERR_CONNECTION_REFUSED / ERR_NETWORK on localhost:5000 and switch to live backend
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


