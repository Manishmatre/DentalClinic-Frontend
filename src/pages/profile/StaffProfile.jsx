import React, { useEffect } from 'react';
import UniversalProfile from '../../components/profile/UniversalProfile';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * Staff Profile Page
 * Uses the UniversalProfile component with staff-specific configurations
 */
const StaffProfile = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Redirect if not authenticated or not a staff member
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'Receptionist') {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    document.title = 'Staff Profile | Clinic Management System';
  }, []);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center">
            <div className="bg-green-600 rounded-md p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account information and clinic settings</p>
            </div>
          </div>
          <div className="h-1 w-20 bg-green-600 mt-4"></div>
        </div>
        
        <UniversalProfile />
      </div>
    </div>
  );
};

export default StaffProfile;
