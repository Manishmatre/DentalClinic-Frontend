import React from 'react';
import DentalProcedureScheduler from '../../components/dental/DentalProcedureScheduler';
import { useAuth } from '../../context/AuthContext';

const DentalProcedureSchedule = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dental Procedure Schedule</h1>
        <p className="text-gray-600">
          Schedule and manage dental procedures with integrated inventory planning
        </p>
      </div>
      
      <DentalProcedureScheduler />
    </div>
  );
};

export default DentalProcedureSchedule;
