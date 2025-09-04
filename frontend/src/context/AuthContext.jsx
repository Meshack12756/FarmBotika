import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API = axios.create({
    baseURL: "http://127.0.0.1:8000",
  });

  // 🔐 Automatically attach token to requests
  API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // 🔄 Hydrate user on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/api/auth/profile/");
        setUser(res.data);
      } catch (err) {
        console.error("🔒 Token invalid or expired:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 🔑 Login and redirect based on role
  const login = async (credentials) => {
    try {
      const res = await API.post("/api/auth/token/", credentials);
      const { access, refresh } = res.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      const profileRes = await API.get("/api/auth/profile/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const userData = profileRes.data;
      setUser(userData);
      localStorage.setItem("farmerProfile", JSON.stringify(userData));

      switch (userData.role) {
        case "FARMER":
          navigate("/dashboard");
          break;
        case "STAFF":
          navigate("/staff");
          break;
        case "ADMIN":
          navigate("/admin");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      throw err;
    }
  };

  // 🚪 Secure Logout
  const logout = async () => {
    const refresh = localStorage.getItem("refreshToken");

    try {
      await API.post("/api/auth/logout/", { refresh });

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("farmerProfile");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);

      // Still clear client state if logout request fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("farmerProfile");
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
