import React from 'react';
import { format } from 'date-fns';
import Button from '../ui/Button';
import Card from '../ui/Card';

const MedicalRecordsList = ({ 
  records = [], 
  onView, 
  onEdit, 
  onDelete, 
  isLoading = false,
  error = null,
  showPatient = true,
  showDoctor = true
}) => {
  if (isLoading) {
    return <div>Loading medical records...</div>;
  }

  if (error) {
    return <div>Error loading medical records: {error.message}</div>;
  }

  if (records.length === 0) {
    return <p className="text-gray-500">No medical records found.</p>;
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record._id} className="overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {record.diagnosis}
              </h3>
              <p className="text-sm text-gray-500">
                {format(new Date(record.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
            {showPatient && record.patientId && (
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Patient: {record.patientId.name}
              </p>
            )}
            {showDoctor && record.doctorId && (
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Doctor: {record.doctorId.name}
              </p>
            )}
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Symptoms</dt>
                <dd className="mt-1 text-sm text-gray-900">{record.symptoms}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Treatment</dt>
                <dd className="mt-1 text-sm text-gray-900">{record.treatment}</dd>
              </div>
              {record.followUpDate && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Follow-up Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(record.followUpDate), 'MMM d, yyyy')}
                  </dd>
                </div>
              )}
              {record.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900">{record.notes}</dd>
                </div>
              )}
            </dl>
          </div>
          <div className="border-t border-gray-200 px-4 py-4 sm:px-6 flex justify-end space-x-3">
            {onView && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onView(record)}
              >
                View Details
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onEdit(record)}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => onDelete(record._id)}
              >
                Delete
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MedicalRecordsList;
