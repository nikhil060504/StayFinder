import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import api from "../api";

const AuthContext = createContext();

const getStoredUser = () => {
  const user = localStorage.getItem("user");
  if (!user || user === "undefined") return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};
const getStoredToken = () => {
  return localStorage.getItem("token");
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_BOOTSTRAP_START":
      return { ...state, loading: true, error: null };
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
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
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
    case "AUTH_BOOTSTRAP_END":
      return {
        ...state,
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
  loading: true, // Start with loading true for bootstrap
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Bootstrap auth on app start
  useEffect(() => {
    const bootstrapAuth = async () => {
      dispatch({ type: "AUTH_BOOTSTRAP_START" });
      try {
        // Check if we have a token in storage
        const token = localStorage.getItem("token");
        if (token) {
          // Try to load user from /auth/me endpoint (uses HttpOnly cookie)
          const response = await api.get("/auth/me");
          const user = response.data;
          // Update storage with latest user data
          localStorage.setItem("user", JSON.stringify(user));
          dispatch({ type: "LOAD_USER", payload: user });
        } else {
          // No token, just end bootstrap
          dispatch({ type: "AUTH_BOOTSTRAP_END" });
        }
      } catch (error) {
        // No valid session, clear storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        dispatch({ type: "AUTH_BOOTSTRAP_END" });
      }
    };

    bootstrapAuth();
    // eslint-disable-next-line
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      const user = response.data;
      // Update storage with latest user data
      localStorage.setItem("user", JSON.stringify(user));
      dispatch({ type: "LOAD_USER", payload: user });
      return user; // ← RETURN the user data
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
      return null; // ← RETURN null on error
    }
  }, []);

  // Add rememberMe param
  const login = async (email, password, rememberMe = false) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        remember: rememberMe,
      });
      const { token, user } = response.data;
      // Always store in localStorage for persistence (HttpOnly cookie handles session)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
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
      // Always store in localStorage for persistence (HttpOnly cookie handles session)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });
      return { success: true };
    } catch (error) {
      let errorMessage = "Registration failed";

      // Handle validation errors from the server
      if (error.response?.data?.errors) {
        // Get the first error message from the array of validation errors
        errorMessage = error.response.data.errors[0].msg || errorMessage;
      }
      // Handle other types of errors
      else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

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
    updateUser: (userData) => {
      dispatch({ type: "UPDATE_USER", payload: userData });
      // Update storage
      const storage = localStorage.getItem("token")
        ? localStorage
        : sessionStorage;
      const currentUser = JSON.parse(storage.getItem("user") || "{}");
      storage.setItem("user", JSON.stringify({ ...currentUser, ...userData }));
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
