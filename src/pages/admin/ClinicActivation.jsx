import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHospital, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import clinicService from '../../api/clinic/clinicService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ClinicActivation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchClinicDetails();
  }, []);

  const fetchClinicDetails = async () => {
    try {
      setLoading(true);
      
      // Ensure we have a valid clinic ID
      if (!user?.clinicId) {
        setError('No clinic associated with your account.');
        setLoading(false);
        return;
      }
      
      const response = await clinicService.getClinicDetails(user.clinicId);
      setClinic(response.data);
      setError(null);
      
      // If clinic is already active, show success message
      if (response.data?.status === 'active') {
        setSuccess('Your clinic is already active!');
      }
    } catch (err) {
      console.error('Error fetching clinic details:', err);
      setError('Failed to load clinic details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateClinic = async () => {
    try {
      setActivating(true);
      setError(null);
      
      // Make sure we're using the correct clinic ID
      if (!user.clinicId) {
        setError('No clinic associated with your account.');
        return;
      }
      
      const response = await clinicService.activateClinic(user.clinicId);
      
      setClinic(response.data);
      setSuccess('Clinic activated successfully! You now have access to all features.');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
        navigate('/admin/dashboard');
      }, 5000);
    } catch (err) {
      console.error('Error activating clinic:', err);
      
      // Display more specific error message if available
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to activate clinic: ${err.response.data.message}`);
      } else {
        setError('Failed to activate clinic. Please try again later.');
      }
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <FaHospital className="text-blue-500 text-3xl mr-3" />
            <h1 className="text-2xl font-bold">Clinic Activation</h1>
          </div>

          {error && (
            <Alert type="error" className="mb-4">
              {error}
            </Alert>
          )}

          {success && (
            <Alert type="success" className="mb-4">
              {success}
            </Alert>
          )}

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Clinic Information</h2>
            
            {clinic ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 font-medium">Name:</p>
                  <p className="text-gray-800">{clinic.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Email:</p>
                  <p className="text-gray-800">{clinic.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Status:</p>
                  <p className={`${
                    clinic.status === 'active' ? 'text-green-600' : 
                    clinic.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  } font-medium`}>
                    {clinic.status.charAt(0).toUpperCase() + clinic.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Subscription Plan:</p>
                  <p className="text-gray-800">{clinic.subscriptionPlan}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No clinic information available</p>
            )}
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <div className="flex items-start">
              <FaInfoCircle className="text-blue-500 mt-1 mr-3" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Why Activate Your Clinic?</h3>
                <p className="text-gray-700 mb-4">
                  Activating your clinic gives you access to all the features of our Clinic Management System, including:
                </p>
                <ul className="list-none space-y-2">
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" />
                    <span>Appointment Scheduling</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" />
                    <span>Patient Records Management</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" />
                    <span>Billing System</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" />
                    <span>Inventory Management</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" />
                    <span>Staff Management</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" />
                    <span>Reporting and Analytics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleActivateClinic}
              disabled={activating || clinic?.status === 'active'}
              isLoading={activating}
              size="lg"
              className="px-8"
            >
              {clinic?.status === 'active' ? 'Clinic Already Active' : 'Activate Clinic Now'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClinicActivation;
