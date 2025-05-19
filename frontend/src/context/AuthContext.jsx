import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/check-auth', {
          withCredentials: true
        });
        
        if (response.data.isAuthenticated) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register a new user
  const register = async (username, email, password) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/api/register', {
        username,
        email,
        password
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  // Login user
  const login = async (username, password) => {
    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password
      }, {
        withCredentials: true
      });
      
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get('http://localhost:5000/api/logout', {
        withCredentials: true
      });
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
