import React from 'react';
import Card from '../../components/ui/Card';
import { FaMoneyBillWave } from 'react-icons/fa';

const DentalBilling = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaMoneyBillWave className="mr-2 text-indigo-600" />
            Dental Billing
          </h1>
          <p className="text-gray-500">Manage dental-specific billing and payments</p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dental Billing Management</h2>
          <p className="text-gray-600">
            This feature is coming soon. You'll be able to manage dental-specific billing, 
            insurance claims, and payment processing for dental procedures.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default DentalBilling; 