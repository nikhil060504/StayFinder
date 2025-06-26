import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if trying to access host routes without host role
  if (location.pathname.startsWith("/host") && user.role !== "host") {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
