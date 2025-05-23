import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientForm from '../../components/patients/PatientForm';
import { useAuth } from '../../hooks/useAuth';
import patientService from '../../api/patients/patientService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';

const PatientRegistration = () => {
  const { clinic } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);
      await patientService.createPatient(formData);
      // Redirect to patient list or show success message
      navigate('/receptionist/appointments');
    } catch (err) {
      console.error('Error registering patient:', err);
      setError(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Register New Patient</h1>
      </div>

      {error && (
        <Alert 
          variant="error" 
          title="Error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <Card>
        <PatientForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          clinicId={clinic?._id}
        />
      </Card>
    </div>
  );
};

export default PatientRegistration;