import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('fairworkers_token');
      const storedUser = localStorage.getItem('fairworkers_user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verify token is still valid
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          localStorage.setItem('fairworkers_user', JSON.stringify(response.data.user));
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token, refreshToken } = response.data;

      localStorage.setItem('fairworkers_token', token);
      localStorage.setItem('fairworkers_refresh_token', refreshToken);
      localStorage.setItem('fairworkers_user', JSON.stringify(user));

      setUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registrace selhala'
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token, refreshToken } = response.data;

      localStorage.setItem('fairworkers_token', token);
      localStorage.setItem('fairworkers_refresh_token', refreshToken);
      localStorage.setItem('fairworkers_user', JSON.stringify(user));

      setUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Přihlášení selhalo'
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('fairworkers_token');
    localStorage.removeItem('fairworkers_refresh_token');
    localStorage.removeItem('fairworkers_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    isWorker: user?.role === 'worker',
    isClient: user?.role === 'client',
    isAdmin: user?.role === 'admin'
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-purple-900 to-black">
          <div className="text-white text-center">
            <div className="text-6xl mb-4">💎</div>
            <div className="text-2xl font-bold">Načítání...</div>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
