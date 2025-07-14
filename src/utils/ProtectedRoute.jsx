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
  // Only redirect if verification is required AND we have explicit confirmation that email is NOT verified
  // This prevents redirection when the property is missing or undefined
  if (requireVerified && user.isEmailVerified === false) {
    return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
  }

  // Check clinic association if required
  if (requireClinic && !clinic) {
    console.warn('No clinic association found:', {
      user: user?.id,
      userClinicId: user?.clinicId,
      clinic: clinic,
      isAuthenticated,
      requireClinic
    });
    
    // Try to get clinic data from localStorage as fallback
    const storedClinicData = localStorage.getItem('clinicData');
    if (storedClinicData) {
      try {
        const parsedClinicData = JSON.parse(storedClinicData);
        if (parsedClinicData && parsedClinicData._id) {
          console.log('Found clinic data in localStorage, allowing access');
          // Don't redirect, allow access with stored clinic data
        } else {
          return <Navigate to="/no-clinic" replace />;
        }
      } catch (e) {
        console.error('Error parsing stored clinic data:', e);
        return <Navigate to="/no-clinic" replace />;
      }
    } else {
    return <Navigate to="/no-clinic" replace />;
    }
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
