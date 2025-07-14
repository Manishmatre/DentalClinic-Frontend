import React, { useEffect } from 'react';
import UniversalProfile from '../../components/profile/UniversalProfile';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * Doctor Profile Page
 * Uses the UniversalProfile component with doctor-specific configurations
 */
const DoctorProfile = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Redirect if not authenticated or not a doctor
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'Doctor') {
    return <Navigate to="/" />;
  }
  
  useEffect(() => {
    document.title = 'Doctor Profile | Clinic Management System';
  }, []);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-md p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
              <p className="text-gray-600 mt-1">Manage your professional information and credentials</p>
            </div>
          </div>
          <div className="h-1 w-20 bg-blue-600 mt-4"></div>
        </div>
        
        <UniversalProfile />
      </div>
    </div>
  );
};

export default DoctorProfile;
