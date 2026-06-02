import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data.user);
        } else {
          // New auth flow returns data directly sometimes, adjusting based on actual response
          setUser({
             userId: response.data.userId,
             name: response.data.name,
             email: response.data.email
          });
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    // Fetch user details immediately after successful login
    const userResponse = await api.get('/auth/me');
    if (userResponse.data.userId) {
       setUser(userResponse.data);
    } else if (userResponse.data.data?.user) {
       setUser(userResponse.data.data.user);
    }
    return response;
  };

  const signup = async (name, email, password) => {
    const response = await api.post('/auth/signup', { name, email, password });
    
    // Fetch user details immediately after successful signup
    const userResponse = await api.get('/auth/me');
     if (userResponse.data.userId) {
       setUser(userResponse.data);
    } else if (userResponse.data.data?.user) {
       setUser(userResponse.data.data.user);
    }
    return response;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
