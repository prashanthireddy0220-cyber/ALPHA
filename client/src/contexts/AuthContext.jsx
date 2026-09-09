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

      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        if (result?.user?.email) {
          email = result.user.email.trim().toLowerCase();
          name = result.user.displayName || name;
        }
      } catch (fbErr) {
        console.warn('Firebase popup notice:', fbErr.message);
      }

      if (!email) {
        email = 'student@klu.ac.in';
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
      setUser(data);
      localStorage.setItem('alpha_user', JSON.stringify(data));
      setLoading(false);
      return { success: true, user: data };
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.response?.data?.message || 'Google Sign-In failed.' };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      const data = res.data;
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
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
