export const LIVE_BACKEND_URL = 'https://alpha-backend-zvhx.onrender.com';

/**
 * Universal URL resolver for payment screenshots and proof images.
 * Always resolves relative upload paths and localhost URLs to the live secure backend URL
 * (or Cloudinary CDN / Base64 Data URI) so images open and load properly from anywhere.
 */
export const getScreenshotUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  // Normalize backslashes and trim whitespace
  let clean = url.trim().replace(/\\/g, '/');
  if (!clean) return '';
  
  // 1. Base64 Data URL -> Return as-is
  if (clean.startsWith('data:')) {
    return clean;
  }

  // 2. Frontend static assets (e.g. /assets/payment_qr.png)
  if (clean.startsWith('/assets/') || clean.startsWith('assets/')) {
    return clean.startsWith('/') ? clean : `/${clean}`;
  }
  
  // 3. External HTTPS CDNs (Cloudinary, Imgur, S3, etc. - NOT localhost)
  if (clean.startsWith('https://') && !clean.includes('localhost') && !clean.includes('127.0.0.1')) {
    return clean;
  }
  
  // 4. Any localhost / 127.0.0.1 URL -> Replace with LIVE_BACKEND_URL
  if (clean.includes('localhost:') || clean.includes('127.0.0.1:')) {
    const uploadIndex = clean.indexOf('/uploads/');
    if (uploadIndex !== -1) {
      return `${LIVE_BACKEND_URL}${clean.substring(uploadIndex)}`;
    }
    const filename = clean.split('/').pop();
    return `${LIVE_BACKEND_URL}/uploads/${filename}`;
  }
  
  // 5. If it starts with http:// on onrender.com -> Upgrade to https://
  if (clean.startsWith('http://alpha-backend-zvhx.onrender.com')) {
    return clean.replace('http://', 'https://');
  }
  if (clean.startsWith('https://alpha-backend-zvhx.onrender.com')) {
    return clean;
  }
  
  // 6. Relative upload path (/uploads/file.png or uploads/file.png)
  if (clean.startsWith('/uploads/')) {
    return `${LIVE_BACKEND_URL}${clean}`;
  }
  if (clean.startsWith('uploads/')) {
    return `${LIVE_BACKEND_URL}/${clean}`;
  }
  
  // 7. Raw filename (e.g. utr_screenshot_1789193275269.jpg or xxx.png)
  if (clean.startsWith('utr_') || clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.webp')) {
    const filename = clean.replace(/^\//, '');
    return `${LIVE_BACKEND_URL}/uploads/${filename}`;
  }
  
  // 8. General HTTP URL -> Upgrade to HTTPS if on HTTPS or Render
  if (clean.startsWith('http://')) {
    return clean.replace('http://', 'https://');
  }
  
  if (clean.startsWith('https://')) {
    return clean;
  }
  
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${LIVE_BACKEND_URL}${path}`;
};
