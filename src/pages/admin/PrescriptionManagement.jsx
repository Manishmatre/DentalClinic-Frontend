import React from 'react';
import Card from '../../components/ui/Card';
import { FaPrescriptionBottle } from 'react-icons/fa';

const PrescriptionManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaPrescriptionBottle className="mr-2 text-indigo-600" />
            Prescription Management
          </h1>
          <p className="text-gray-500">Manage patient prescriptions and medications</p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Prescription Management</h2>
          <p className="text-gray-600">
            This feature is coming soon. You'll be able to manage patient prescriptions, 
            track medications, and handle prescription renewals.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PrescriptionManagement; 