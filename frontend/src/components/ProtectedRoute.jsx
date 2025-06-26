import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Allow /host/become for non-hosts, block other /host routes for non-hosts
  if (
    location.pathname.startsWith("/host") &&
    location.pathname !== "/host/become" &&
    user.role !== "host"
  ) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
