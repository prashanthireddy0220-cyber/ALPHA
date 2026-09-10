export const getScreenshotUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  
  // Normalize Windows backslashes to forward slashes
  const normalized = url.replace(/\\/g, '/');
  
  if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('data:')) {
    return normalized;
  }
  
  const backendBase = import.meta.env.VITE_API_URL || 'https://alpha-backend-zvhx.onrender.com';
  const cleanBase = backendBase.replace(/\/$/, '');
  const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return `${cleanBase}${cleanPath}`;
};

