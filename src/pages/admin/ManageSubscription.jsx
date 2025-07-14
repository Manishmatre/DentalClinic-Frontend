import React from 'react';
import Card from '../../components/ui/Card';
import { FaCog } from 'react-icons/fa';

const ManageSubscription = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaCog className="mr-2 text-indigo-600" />
            Manage Subscription
          </h1>
          <p className="text-gray-500">Manage your current subscription settings</p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Subscription Settings</h2>
          <p className="text-gray-600">
            This feature is coming soon. You'll be able to manage your current subscription, 
            update payment methods, view billing history, and change plan settings.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ManageSubscription; 