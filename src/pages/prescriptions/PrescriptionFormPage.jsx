import React from 'react';
import PrescriptionForm from '../../components/prescriptions/PrescriptionForm';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PrescriptionFormPage = () => {
  const { user, loading } = useAuth();
  
  // Check if user is authorized (doctor or staff)
  const isAuthorized = user && (user.role === 'doctor' || user.role === 'admin' || user.role === 'staff');
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthorized) {
    return <Navigate to="/unauthorized" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PrescriptionForm />
    </div>
  );
};

export default PrescriptionFormPage;
