import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import patientService from '../../api/patients/patientService';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const MedicalHistory = () => {
  const { user } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMedicalHistory = useCallback(async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);
      const [historyData, treatmentsData] = await Promise.all([
        patientService.getMedicalHistory(user._id),
        patientService.getTreatmentHistory(user._id)
      ]);
      setMedicalHistory(historyData);
      setTreatments(treatmentsData);
    } catch (err) {
      console.error('Error fetching medical history:', err);
      setError(err.response?.data?.message || 'Failed to load medical history');
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchMedicalHistory();
  }, [fetchMedicalHistory]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <Alert variant="error" title="Error" message={error} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Medical History</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Information */}
        <Card title="Personal Health Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Blood Group</label>
              <div className="mt-1 text-sm text-gray-900">
                {medicalHistory?.bloodGroup || 'Not specified'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Allergies</label>
              <div className="mt-1 text-sm text-gray-900">
                {medicalHistory?.allergies?.length > 0 
                  ? medicalHistory.allergies.join(', ')
                  : 'No known allergies'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Pre-existing Conditions</label>
              <div className="mt-1 text-sm text-gray-900">
                {medicalHistory?.preExistingConditions?.length > 0
                  ? medicalHistory.preExistingConditions.join(', ')
                  : 'None reported'}
              </div>
            </div>
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card title="Emergency Contact">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Name</label>
              <div className="mt-1 text-sm text-gray-900">
                {medicalHistory?.emergencyContact?.name || 'Not specified'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <div className="mt-1 text-sm text-gray-900">
                {medicalHistory?.emergencyContact?.phone || 'Not specified'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Relationship</label>
              <div className="mt-1 text-sm text-gray-900">
                {medicalHistory?.emergencyContact?.relationship || 'Not specified'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Treatment History */}
      <Card title="Treatment History">
        {treatments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No treatment history found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treatment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {treatments.map((treatment) => (
                  <tr key={treatment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(treatment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {treatment.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {treatment.doctor?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {treatment.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MedicalHistory;