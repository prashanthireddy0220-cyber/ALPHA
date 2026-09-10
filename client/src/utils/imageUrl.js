export const getScreenshotUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  
  // Normalize Windows backslashes
  let clean = url.trim().replace(/\\/g, '/');
  
  // If it's a base64 data URI or Cloudinary / external secure URL (not localhost)
  if (clean.startsWith('data:') || (clean.startsWith('https://') && !clean.includes('localhost') && !clean.includes('127.0.0.1'))) {
    return clean;
  }
  
  const backendBase = (import.meta.env.VITE_API_URL || 'https://alpha-backend-zvhx.onrender.com').replace(/\/$/, '');
  
  // If it contains localhost:5000 or 127.0.0.1:5000 or localhost:3000
  if (clean.includes('localhost:') || clean.includes('127.0.0.1:')) {
    const uploadIndex = clean.indexOf('/uploads/');
    if (uploadIndex !== -1) {
      return `${backendBase}${clean.substring(uploadIndex)}`;
    }
    const filename = clean.split('/').pop();
    return `${backendBase}/uploads/${filename}`;
  }
  
  // If it starts with http:// on onrender.com, upgrade to https://
  if (clean.startsWith('http://alpha-backend-zvhx.onrender.com')) {
    return clean.replace('http://', 'https://');
  }
  
  // If it's an external http/https URL
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  
  // If relative path like 'uploads/file.png' or '/uploads/file.png'
  if (clean.startsWith('/uploads/')) {
    return `${backendBase}${clean}`;
  }
  if (clean.startsWith('uploads/')) {
    return `${backendBase}/${clean}`;
  }
  
  // If just a raw filename like 'utr_screenshot_123.png'
  if (clean.startsWith('utr_') || clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.webp')) {
    return `${backendBase}/uploads/${clean.replace(/^\//, '')}`;
  }
  
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${backendBase}${path}`;
};


