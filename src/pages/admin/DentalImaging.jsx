import React from 'react';
import Card from '../../components/ui/Card';
import { FaXRay } from 'react-icons/fa';

const DentalImaging = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaXRay className="mr-2 text-indigo-600" />
            Dental Imaging
          </h1>
          <p className="text-gray-500">Manage dental X-rays and imaging records</p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dental Imaging Management</h2>
          <p className="text-gray-600">
            This feature is coming soon. You'll be able to upload, view, and manage 
            dental X-rays, panoramic images, and other dental imaging records.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default DentalImaging; 