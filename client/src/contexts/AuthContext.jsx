import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Synchronously set initial token if present in localStorage
const initialUser = (() => {
  try {
    const saved = localStorage.getItem('alpha_user');
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
    const saved = localStorage.getItem('alpha_user');
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed?.token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${parsed.token}`;
    }
  } catch (e) {}
  return config;
});

import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const data = res.data;
      sessionStorage.removeItem('alpha_cached_team_dashboard');
      setUser(data);
      localStorage.setItem('alpha_user', JSON.stringify(data));
      setLoading(false);
      return { success: true, user: data };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      let email = '';
      let name = 'ALPHA Student';
      let firebaseErrorMsg = '';

      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        if (result?.user?.email) {
          email = result.user.email.trim().toLowerCase();
          name = result.user.displayName || name;
        }
      } catch (fbErr) {
        console.error('Firebase popup error:', fbErr);
        if (fbErr.code === 'auth/unauthorized-domain') {
          firebaseErrorMsg = 'This domain is not authorized for Google Sign-In in Firebase Console.';
        } else if (fbErr.code === 'auth/popup-closed-by-user') {
          firebaseErrorMsg = 'Google Sign-In popup was closed. Please try signing in again.';
        } else if (fbErr.code === 'auth/popup-blocked') {
          firebaseErrorMsg = 'Google Sign-In popup was blocked by your browser. Please allow popups.';
        } else {
          firebaseErrorMsg = fbErr.message || 'Firebase Google Sign-In failed.';
        }
      }

      if (!email) {
        setLoading(false);
        return {
          success: false,
          message: firebaseErrorMsg || 'Google Sign-In popup was closed or cancelled. Please try signing in again.'
        };
      }

      if (!email.endsWith('@klu.ac.in')) {
        setLoading(false);
        return {
          success: false,
          message: 'Only KLU students with a @klu.ac.in email address are allowed.'
        };
      }

      const res = await axios.post('/api/auth/login', { email, password: 'password123', name });
      const data = res.data;
      sessionStorage.removeItem('alpha_cached_team_dashboard');
      setUser(data);
      localStorage.setItem('alpha_user', JSON.stringify(data));
      setLoading(false);
      return { success: true, user: data };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message || err.message || 'Google Sign-In failed.' };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      const data = res.data;
      sessionStorage.removeItem('alpha_cached_team_dashboard');
      setUser(data);
      localStorage.setItem('alpha_user', JSON.stringify(data));
      setLoading(false);
      return { success: true, user: data };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('alpha_user');
    sessionStorage.removeItem('alpha_cached_team_dashboard');
    sessionStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
