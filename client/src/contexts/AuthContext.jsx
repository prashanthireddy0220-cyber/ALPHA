import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Synchronously set initial token if present in sessionStorage
const initialUser = (() => {
  try {
    localStorage.removeItem('alpha_user');
    const saved = sessionStorage.getItem('alpha_user');
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
    }
    return parsed;
  } catch (e) {
    return null;
  }
})();

// Axios Request Interceptor to ensure token is always attached
axios.interceptors.request.use((config) => {
  try {
    const saved = sessionStorage.getItem('alpha_user');
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed?.token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${parsed.token}`;
    }
  } catch (e) {}
  return config;
});

import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';

const clearAllUserSessionCaches = () => {
  try {
    sessionStorage.clear();
    localStorage.removeItem('alpha_user');
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('alpha_')) {
        localStorage.removeItem(k);
      }
    });
  } catch (e) {}
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // Handle Google Redirect Result on page mount / return
  useEffect(() => {
    let isMounted = true;
    const processRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!isMounted || !result?.user?.email) return;

        const email = result.user.email.trim().toLowerCase();
        const name = result.user.displayName || 'ALPHA Student';

        if (!email.endsWith('@klu.ac.in')) {
          console.warn('Google sign-in email must be @klu.ac.in:', email);
          return;
        }

        setLoading(true);
        let res;
        try {
          res = await axios.post('/api/auth/login', { email, password: 'password123', name });
        } catch (firstErr) {
          const isConnRefused = firstErr.code === 'ERR_NETWORK' || !firstErr.response;
          const isUsingLocalhost = axios.defaults.baseURL && axios.defaults.baseURL.includes('localhost:5000');
          if (isConnRefused && isUsingLocalhost) {
            axios.defaults.baseURL = 'https://alpha-backend-zvhx.onrender.com';
            res = await axios.post('/api/auth/login', { email, password: 'password123', name });
          } else {
            await new Promise((r) => setTimeout(r, 2000));
            res = await axios.post('/api/auth/login', { email, password: 'password123', name });
          }
        }

        if (res?.data && isMounted) {
          clearAllUserSessionCaches();
          if (res.data.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
          }
          setUser(res.data);
          sessionStorage.setItem('alpha_user', JSON.stringify(res.data));
        }
      } catch (err) {
        console.warn('Google redirect result error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    processRedirectResult();
    return () => {
      isMounted = false;
    };
  }, []);

  // Revalidate profile with backend to keep teamId strictly synchronized
  useEffect(() => {
    let isMounted = true;
    if (user?.token && user?.role === 'user') {
      axios.get('/api/auth/profile')
        .then(res => {
          if (isMounted && res.data) {
            const serverUser = res.data;
            const currentTeamId = user.teamId;
            const serverTeamId = serverUser.teamId;
            if (currentTeamId !== serverTeamId) {
              const updated = { ...user };
              if (serverTeamId) {
                updated.teamId = serverTeamId;
              } else {
                delete updated.teamId;
                if (user.email) {
                  sessionStorage.removeItem(`alpha_cached_team_dashboard_${user.email.toLowerCase()}`);
                }
              }
              setUser(updated);
              sessionStorage.setItem('alpha_user', JSON.stringify(updated));
            }
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [user?.token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const data = res.data;
      clearAllUserSessionCaches();
      if (data.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      setUser(data);
      sessionStorage.setItem('alpha_user', JSON.stringify(data));
      setLoading(false);
      return { success: true, user: data };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const loginWithGoogle = async (preferRedirect = false) => {
    setLoading(true);
    try {
      try {
        await signOut(auth);
      } catch (e) {}

      let email = '';
      let name = 'ALPHA Student';
      let firebaseErrorMsg = '';

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      if (preferRedirect) {
        await signInWithRedirect(auth, provider);
        return { success: true, redirecting: true };
      }

      try {
        const result = await signInWithPopup(auth, provider);
        if (result?.user?.email) {
          email = result.user.email.trim().toLowerCase();
          name = result.user.displayName || name;
        }
      } catch (fbErr) {
        console.warn('Firebase popup attempt note:', fbErr?.code || fbErr?.message);
        if (fbErr.code === 'auth/unauthorized-domain') {
          firebaseErrorMsg = 'This deployment domain is not authorized in Firebase Console. Add this domain to Firebase Console > Authentication > Settings > Authorized domains.';
        } else if (fbErr.code === 'auth/popup-blocked' || fbErr.code === 'auth/cancelled-popup-request') {
          console.info('Popup blocked by browser, switching to redirect sign-in...');
          await signInWithRedirect(auth, provider);
          return { success: true, redirecting: true };
        } else if (fbErr.code === 'auth/popup-closed-by-user') {
          firebaseErrorMsg = 'Google Sign-In popup was closed before completing. Please try again.';
        } else if (fbErr.code === 'auth/network-request-failed') {
          firebaseErrorMsg = 'Network error during Google authentication. Check your internet connection or Firebase Authorized Domains.';
        } else {
          firebaseErrorMsg = fbErr.message || 'Firebase Google Sign-In failed.';
        }
      }

      if (!email) {
        setLoading(false);
        return {
          success: false,
          message: firebaseErrorMsg || 'Google Sign-In cancelled. Please try again.'
        };
      }

      if (!email.endsWith('@klu.ac.in')) {
        try {
          await signOut(auth);
        } catch (e) {}
        setLoading(false);
        return {
          success: false,
          message: 'Only KLU students with a @klu.ac.in email address are allowed.'
        };
      }

      // Call backend login with automatic retry and localhost -> live fallback
      let res;
      try {
        res = await axios.post('/api/auth/login', { email, password: 'password123', name });
      } catch (firstErr) {
        const isConnRefused = firstErr.code === 'ERR_NETWORK' || !firstErr.response;
        const isUsingLocalhost = axios.defaults.baseURL && axios.defaults.baseURL.includes('localhost:5000');

        if (isConnRefused && isUsingLocalhost) {
          try {
            console.warn('Localhost backend unreachable, falling back to live Render API...');
            axios.defaults.baseURL = 'https://alpha-backend-zvhx.onrender.com';
            res = await axios.post('/api/auth/login', { email, password: 'password123', name });
          } catch (liveErr) {
            throw liveErr;
          }
        } else if (isConnRefused || firstErr.code === 'ECONNABORTED') {
          // If network error / timeout (e.g. Render cold start), retry once after a short delay
          await new Promise(resolve => setTimeout(resolve, 2500));
          res = await axios.post('/api/auth/login', { email, password: 'password123', name });
        } else {
          throw firstErr;
        }
      }

      const data = res.data;
      clearAllUserSessionCaches();
      if (data.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      setUser(data);
      sessionStorage.setItem('alpha_user', JSON.stringify(data));
      setLoading(false);
      return { success: true, user: data };
    } catch (err) {
      setLoading(false);
      const isNetError = !err.response || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error');
      const msg = isNetError
        ? 'Backend API server connection error. If the server was sleeping, please retry in a few seconds.'
        : (err.response?.data?.message || err.message || 'Google Sign-In failed.');
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      const data = res.data;
      clearAllUserSessionCaches();
      if (data.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      setUser(data);
      sessionStorage.setItem('alpha_user', JSON.stringify(data));
      setLoading(false);
      return { success: true, user: data };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    clearAllUserSessionCaches();
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
