export const LIVE_BACKEND_URL = 'https://alpha-backend-zvhx.onrender.com';

export const getScreenshotUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  
  // Normalize Windows backslashes
  let clean = url.trim().replace(/\\/g, '/');
  
  // If it's a base64 data URI, return as-is
  if (clean.startsWith('data:')) {
    return clean;
  }
  
  // If it's an external HTTPS URL (Cloudinary or others, NOT localhost)
  if (clean.startsWith('https://') && !clean.includes('localhost') && !clean.includes('127.0.0.1')) {
    return clean;
  }
  
  const isLocalEnv = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const backendBase = isLocalEnv && import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('onrender.com') 
    ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
    : LIVE_BACKEND_URL;
  
  // If it contains localhost:5000 or 127.0.0.1:5000 or localhost:3000
  if (clean.includes('localhost:') || clean.includes('127.0.0.1:')) {
    const uploadIndex = clean.indexOf('/uploads/');
    if (uploadIndex !== -1) {
      return `${LIVE_BACKEND_URL}${clean.substring(uploadIndex)}`;
    }
    const filename = clean.split('/').pop();
    return `${LIVE_BACKEND_URL}/uploads/${filename}`;
  }
  
  // If it starts with http:// on onrender.com, upgrade to https://
  if (clean.startsWith('http://alpha-backend-zvhx.onrender.com')) {
    return clean.replace('http://', 'https://');
  }
  
  // If relative path like 'uploads/file.png' or '/uploads/file.png'
  if (clean.startsWith('/uploads/')) {
    return `${LIVE_BACKEND_URL}${clean}`;
  }
  if (clean.startsWith('uploads/')) {
    return `${LIVE_BACKEND_URL}/${clean}`;
  }
  
  // If just a raw filename like 'utr_screenshot_123.png'
  if (clean.startsWith('utr_') || clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.webp')) {
    return `${LIVE_BACKEND_URL}/uploads/${clean.replace(/^\//, '')}`;
  }
  
  if (clean.startsWith('http://')) {
    // If running on HTTPS page or non-localhost, avoid mixed content
    return clean.replace('http://', 'https://');
  }
  
  if (clean.startsWith('https://')) {
    return clean;
  }
  
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${LIVE_BACKEND_URL}${path}`;
};



