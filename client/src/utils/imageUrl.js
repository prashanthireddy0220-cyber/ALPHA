export const LIVE_BACKEND_URL = 'https://alpha-backend-zvhx.onrender.com';

/**
 * Robust URL resolver for payment screenshots and proof images.
 * Handles: Base64 Data URIs, Cloudinary CDN URLs, local uploads, Render URLs, and relative paths.
 */
export const getScreenshotUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  
  // Normalize Windows backslashes and whitespace
  let clean = url.trim().replace(/\\/g, '/');
  if (!clean) return '';
  
  // 1. If it's a base64 Data URL, return as-is
  if (clean.startsWith('data:')) {
    return clean;
  }

  // 2. If it's a frontend static asset (e.g. /assets/payment_qr.png)
  if (clean.startsWith('/assets/') || clean.startsWith('assets/')) {
    return clean.startsWith('/') ? clean : `/${clean}`;
  }
  
  // 3. If it's an external HTTPS URL (Cloudinary or others, NOT localhost)
  if (clean.startsWith('https://') && !clean.includes('localhost') && !clean.includes('127.0.0.1')) {
    return clean;
  }
  
  // Detect Environment
  const isLocalEnv = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
  
  // Determine preferred backend base
  let preferredBackend = LIVE_BACKEND_URL;
  if (isLocalEnv) {
    if (configuredApiUrl && !configuredApiUrl.includes('onrender.com')) {
      preferredBackend = configuredApiUrl;
    } else {
      // In local dev with Vite proxying /uploads, we can use window.location.origin
      preferredBackend = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';
    }
  } else if (configuredApiUrl) {
    preferredBackend = configuredApiUrl;
  }
  
  // 4. If it contains localhost:5000 or 127.0.0.1:5000
  if (clean.includes('localhost:') || clean.includes('127.0.0.1:')) {
    const uploadIndex = clean.indexOf('/uploads/');
    if (uploadIndex !== -1) {
      const subpath = clean.substring(uploadIndex);
      return isLocalEnv ? subpath : `${LIVE_BACKEND_URL}${subpath}`;
    }
    const filename = clean.split('/').pop();
    return isLocalEnv ? `/uploads/${filename}` : `${LIVE_BACKEND_URL}/uploads/${filename}`;
  }
  
  // 5. If it starts with http:// on onrender.com, upgrade to https://
  if (clean.startsWith('http://alpha-backend-zvhx.onrender.com')) {
    clean = clean.replace('http://', 'https://');
  }
  if (clean.startsWith('https://alpha-backend-zvhx.onrender.com')) {
    return clean;
  }
  
  // 6. If relative path like '/uploads/file.png' or 'uploads/file.png'
  if (clean.startsWith('/uploads/')) {
    return isLocalEnv ? clean : `${preferredBackend}${clean}`;
  }
  if (clean.startsWith('uploads/')) {
    return isLocalEnv ? `/${clean}` : `${preferredBackend}/${clean}`;
  }
  
  // 7. If just a raw filename like 'utr_screenshot_123.png'
  if (clean.startsWith('utr_') || clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.webp')) {
    const filename = clean.replace(/^\//, '');
    return isLocalEnv ? `/uploads/${filename}` : `${preferredBackend}/uploads/${filename}`;
  }
  
  // 8. General HTTP / HTTPS URLs
  if (clean.startsWith('http://')) {
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      return clean.replace('http://', 'https://');
    }
    return clean;
  }
  
  if (clean.startsWith('https://')) {
    return clean;
  }
  
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${preferredBackend}${path}`;
};
