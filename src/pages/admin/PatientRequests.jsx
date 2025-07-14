import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaUserPlus, FaFilter } from 'react-icons/fa';
import PatientRequestsList from '../../components/patients/PatientRequestsList';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PatientRequests = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleRequestProcessed = () => {
    toast.success('Patient request processed successfully');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Patient Registration Requests</h1>
        <p className="text-gray-600 mt-2">
          Manage and process patient registration requests from outside users
        </p>
      </div>

      <Card className="mb-8">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FaUserPlus className="text-indigo-600 text-xl mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Registration Requests</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Review and process registration requests from new patients. Approved patients will be added to your patient database.
          </p>
          
          <PatientRequestsList onRequestProcessed={handleRequestProcessed} />
        </div>
      </Card>
    </div>
  );
};

export default PatientRequests;
