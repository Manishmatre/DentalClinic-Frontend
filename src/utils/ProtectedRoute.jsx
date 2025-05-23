// src/utils/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ 
  requiredRoles, // Array of allowed roles
  requireVerified = true, // Whether email verification is required
  requireClinic = true // Whether clinic association is required
}) => {
  const { isAuthenticated, user, clinic, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check email verification if required
  if (requireVerified && !user.isEmailVerified) {
    return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
  }

  // Check clinic association if required
  if (requireClinic && !clinic) {
    return <Navigate to="/no-clinic" replace />;
  }

  // Check if clinic is active
  // Bypass clinic active status check to allow access regardless of clinic status
  // if (requireClinic && clinic?.status !== 'active') {
  //   return <Navigate to="/clinic-inactive" replace />;
  // }

  // Check role access
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ 
      requiredRoles,
      userRole: user.role 
    }} replace />;
  }

  // All checks passed, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
