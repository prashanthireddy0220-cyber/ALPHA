import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);
const envUrl = import.meta.env.VITE_API_URL;
axios.defaults.baseURL = isLocal
  ? 'http://localhost:5000'
  : (envUrl || 'https://alpha-backend-zvhx.onrender.com');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

