import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user state with localStorage on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Proactively sync profile data from backend
          const res = await API.get('/users/profile');
          if (res.data?.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Initial session validation failed. Resetting states.');
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // 1. LOGIN
  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token, refreshToken, user: userData } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login verification failed.' };
    }
  };

  // 2. REGISTER
  const register = async (name, email, password, role) => {
    try {
      const res = await API.post('/auth/register', { name, email, password, role });
      if (res.data?.success) {
        const { token, refreshToken, user: userData } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed.' };
    }
  };

  // 3. LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  // 4. FORGOT PASSWORD
  const forgotPassword = async (email) => {
    try {
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data?.success) {
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to dispatch recovery link.' };
    }
  };

  // 5. GOOGLE LOGIN
  const googleLogin = async (payload) => {
    try {
      const res = await API.post('/auth/google-login', payload);
      if (res.data?.success) {
        const { token, refreshToken, user: userData } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Google Authentication failed.' };
    }
  };

  // 6. UPDATE PROFILE
  const updateProfile = async (name, avatar) => {
    try {
      const res = await API.put('/users/profile', { name, avatar });
      if (res.data?.success) {
        const updatedUser = res.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update profile.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, googleLogin, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
