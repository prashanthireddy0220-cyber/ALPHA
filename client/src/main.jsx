import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);
let envUrl = import.meta.env.VITE_API_URL || 'https://alpha-backend-zvhx.onrender.com';
if (typeof envUrl === 'string' && envUrl.endsWith('/')) {
  envUrl = envUrl.slice(0, -1);
}
axios.defaults.baseURL = isLocal ? 'http://localhost:5000' : envUrl;
axios.defaults.timeout = 60000; // 60s timeout to allow Render free tier backend wake-up


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

