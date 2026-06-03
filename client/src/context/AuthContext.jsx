import { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../services/authApi";
import axios from "axios";

const AuthContext = createContext();

// ✅ Single source of truth for backend URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // ✅ Restore auth on page refresh
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await axios.get(`${API_BASE}/api/auth/me`, {
          withCredentials: true,
        });

        if (isMounted) {
          setIsAuthenticated(true);
          setUser({ ...res.data, id: res.data.userId });
        }
      } catch (err) {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ Email / Password Login
  const login = async (data) => {
    setLoading(true);
    try {
      await authApi.login(data);

      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        withCredentials: true,
      });

      setUser({ ...res.data, id: res.data.userId });
      console.log("Logged in user:", user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      console.error("Login failed:", err.response?.data?.message);
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, error: err.response?.data?.message || "Invalid email or password" };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Signup
  const signup = async (data) => {
    setLoading(true);
    try {
      await authApi.signup(data);

      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        withCredentials: true,
      });

      setUser({ ...res.data, id: res.data.userId });
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      console.error("Signup failed:", err.response?.data?.message);
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, error: err.response?.data?.message || "Signup failed" };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Google login success (after cookie is set by backend)
  const googleLoginSuccess = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        withCredentials: true,
      });

      setUser({ ...res.data, id: res.data.userId });
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Fetch user failed:", err.response?.data?.message);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/logout`, {}, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // ✅ Update user after profile edit
  const updateUserInContext = (newUser) => {
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        user,
        googleLoginSuccess,
        updateUserInContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
