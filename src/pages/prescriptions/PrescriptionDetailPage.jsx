import React from 'react';
import PrescriptionDetail from '../../components/prescriptions/PrescriptionDetail';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PrescriptionDetailPage = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <PrescriptionDetail />
    </div>
  );
};

export default PrescriptionDetailPage;
