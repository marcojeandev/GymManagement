// contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<{ message: string }>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (parseError) {
            console.error('Failed to parse user data:', parseError);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for logout events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' && !e.newValue) {
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const handleForceLogout = () => {
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    };
    window.addEventListener('auth:logout', handleForceLogout);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:logout', handleForceLogout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/login', { email, password });
      const { status, data: responseData } = response.data;
      
      if (status !== 1 || !responseData?.token || !responseData?.user) {
        throw new Error('Invalid login response from server');
      }
      
      const { token: newToken, user: userData } = responseData;
      
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<{ message: string }> => {
    try {
      const response = await api.post('/logout');
      const { message } = response.data;
      return { message: message || 'Logged out successfully.' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Logout failed. Please try again.';
      throw new Error(message);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
