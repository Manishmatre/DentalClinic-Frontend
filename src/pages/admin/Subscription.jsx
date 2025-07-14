import React from 'react';
import Card from '../../components/ui/Card';
import { FaCreditCard } from 'react-icons/fa';

const Subscription = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaCreditCard className="mr-2 text-indigo-600" />
            Subscription Plans
          </h1>
          <p className="text-gray-500">Choose and manage your subscription plan</p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Subscription Management</h2>
          <p className="text-gray-600">
            This feature is coming soon. You'll be able to view available subscription plans, 
            upgrade or downgrade your plan, and manage billing information.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Subscription; 