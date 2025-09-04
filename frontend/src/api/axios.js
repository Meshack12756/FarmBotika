import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/auth/", // aligned with Django root
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // optional, only needed for cookie/session auth
});

// 🔐 Register a new user
export const registerUser = (data) => API.post("register/", data);

// 🔑 Verify email token (if applicable)
export const verifyEmail = (token) => API.post("verify-email/", { token });

// 👤 Get current user's profile
export const getProfile = () => API.get("profile/");

// 🕵🏾 Get login history
export const getLogins = () => API.get("logins/");

// 🔒 Access protected data (if backend provides this)
export const getProtected = () => API.get("protected/");

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
