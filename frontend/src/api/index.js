import axios from "axios";

// Use localhost for development
const baseURL = "http://localhost:5000/api";
console.log("API Base URL:", baseURL);
console.log("Environment:", import.meta.env.MODE);

// Set global API URL
window.API_BASE_URL = baseURL;

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
