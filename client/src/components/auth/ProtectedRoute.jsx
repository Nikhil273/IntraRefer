import React from "react";
import { Navigate, Outlet } from "react-router-dom"; // Assuming you're using react-router-dom v6+
import { useAuth } from "../../contexts/AuthContext"; // Adjust the path as needed

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, token } = useAuth(); // Destructure user, loading, and token from useAuth()

  // 1. Show a loading indicator while authentication status is being determined
  if (loading) {
    return <div>Loading authentication...</div>;
  }

  // 2. If no token or user, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />; // Redirect to your login page
  }

  // 3. Check for role-based access if allowedRoles are provided
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // User does not have the required role, redirect to an unauthorized page or dashboard
      return <Navigate to="/unauthorized" replace />; // Or to "/" or a specific dashboard
    }
  }

  // 4. If authenticated and authorized, render the child routes/components
  return <Outlet />;
};

export default ProtectedRoute;
