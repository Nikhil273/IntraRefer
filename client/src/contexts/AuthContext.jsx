import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  UPDATE_USER: "UPDATE_USER",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_LOADING: "SET_LOADING",
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set token in localStorage and axios headers
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem("token", token);
      authAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete authAPI.defaults.headers.common["Authorization"];
    }
  };

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        setAuthToken(token);
        try {
          const response = await authAPI.get("/auth/me");
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              token,
            },
          });
        } catch (error) {
          console.error("Failed to load user:", error);
          localStorage.removeItem("token");
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log("Login response:");
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await authAPI.post("/auth/login", { email, password });

      const { token, user } = response.data;

      setAuthToken(token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await authAPI.post("/auth/register", userData);
      const { token, user } = response.data;

      setAuthToken(token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      toast.success("Registration successful!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuthToken(null);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success("Logged out successfully");
    }
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  // Check if user is subscribed
  const isSubscribed = () => {
    if (!state.user) return false;
    if (state.user.role === "admin") return true; // Admin always has premium features

    return (
      state.user.isSubscribed &&
      state.user.subscriptionEnd &&
      new Date(state.user.subscriptionEnd) > new Date()
    );
  };

  // Get subscription status
  const getSubscriptionStatus = () => {
    if (!state.user) return null;

    if (state.user.role === "admin") {
      return {
        isActive: true,
        type: "admin",
        daysRemaining: Infinity,
      };
    }

    const isActive = isSubscribed();
    const daysRemaining = isActive
      ? Math.ceil(
        (new Date(state.user.subscriptionEnd) - new Date()) /
        (1000 * 60 * 60 * 24)
      )
      : 0;

    return {
      isActive,
      type: state.user.subscriptionType || null,
      daysRemaining,
    };
  };

  // Context value
  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasRole,
    hasAnyRole,
    isSubscribed,
    getSubscriptionStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
