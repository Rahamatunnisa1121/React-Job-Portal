
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  //Accepts children → the component(s)/page wrapped inside this route., an optional array of roles that are allowed to access this route
  const { isAuthenticated, user, isLoading } = useAuth(); //custom hook, provides the current authentication state

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; //replace the current entry in the browser’s history stack, instead of pushing a new one.
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          backgroundColor: "#f8f9fa",
          margin: "50px auto",
          maxWidth: "500px",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ color: "#dc3545" }}>Access Denied</h3>
        <p>You don't have permission to access this page.</p>
        <p>Required role(s): {allowedRoles.join(", ")}</p>
        <p>Your role: {user.role}</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
