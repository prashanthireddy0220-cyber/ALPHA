import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const isVercel = typeof window !== 'undefined' && (
  window.location.hostname.includes('vercel.app') ||
  window.location.hostname.includes('alpha-ieee-eds')
);

const defaultBackendUrl = isVercel
  ? 'https://alpha-backend-zvhx.onrender.com'
  : 'http://localhost:5000';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || defaultBackendUrl;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

