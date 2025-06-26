import React, { createContext, useContext, useReducer, useEffect } from "react";
import api from "../api";

const AuthContext = createContext();

const getStoredUser = () => {
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!user || user === "undefined") return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};
const getStoredToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case "LOAD_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    default:
      return state;
  }
};

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  loading: false,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      loadUser();
    }
    // eslint-disable-next-line
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.get("/auth/me");
      dispatch({ type: "LOAD_USER", payload: response.data });
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
    }
  };

  // Add rememberMe param
  const login = async (email, password, rememberMe = false) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData, rememberMe = false) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await api.post("/auth/register", userData);
      const { token, user } = response.data;
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    loadUser,
  };

  console.log("isAuthenticated:", state.isAuthenticated, "user:", state.user);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
