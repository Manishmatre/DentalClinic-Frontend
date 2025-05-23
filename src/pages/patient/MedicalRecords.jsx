import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ehrService from '../../api/billing/ehrService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const MedicalRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('records');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [recordsData, prescriptionsData, appointmentsData] = await Promise.all([
        ehrService.getPatientRecords(user?._id),
        ehrService.getPatientPrescriptions(user?._id),
        ehrService.getPatientAppointments(user?._id)
      ]);
      setRecords(recordsData);
      setPrescriptions(prescriptionsData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error fetching medical data:', err);
      setError(err.response?.data?.message || 'Failed to load medical records');
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const downloadRecord = async (recordId) => {
    try {
      const response = await ehrService.downloadRecord(recordId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `medical-record-${recordId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading record:', err);
      setError(err.response?.data?.message || 'Failed to download record');
    }
  };

  const renderRecords = () => (
    <div className="space-y-6">
      {records.map((record) => (
        <Card key={record._id}>
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {record.type}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Date: {new Date(record.date).toLocaleDateString()}
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  {record.description}
                </p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Doctor's Notes:</h4>
                  <p className="mt-1 text-sm text-gray-700">{record.notes}</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => downloadRecord(record._id)}
              >
                Download PDF
              </Button>
            </div>
            {record.attachments && record.attachments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments:</h4>
                <div className="grid grid-cols-2 gap-4">
                  {record.attachments.map((attachment, index) => (
                    <div key={index} className="relative">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                        <Button
                          variant="white"
                          size="sm"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          View Full Size
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  const renderPrescriptions = () => (
    <div className="space-y-6">
      {prescriptions.map((prescription) => (
        <Card key={prescription._id}>
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Prescription #{prescription.number}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Prescribed on: {new Date(prescription.date).toLocaleDateString()}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Doctor: Dr. {prescription.doctor.name}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => downloadRecord(prescription._id)}
              >
                Download
              </Button>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Medications:</h4>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medication
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dosage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prescription.medications.map((medication, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {medication.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medication.dosage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medication.frequency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medication.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {prescription.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Additional Notes:</h4>
                <p className="mt-1 text-sm text-gray-700">{prescription.notes}</p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {appointments.map((appointment) => (
          <Card key={appointment._id}>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {appointment.type}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Date: {new Date(appointment.date).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Time: {new Date(appointment.date).toLocaleTimeString()}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Doctor: Dr. {appointment.doctor.name}
                  </p>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  appointment.status === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : appointment.status === 'Scheduled'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
              {appointment.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Notes:</h4>
                  <p className="mt-1 text-sm text-gray-700">{appointment.notes}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Medical Records</h1>
      </div>

      {error && (
        <Alert 
          variant="error" 
          title="Error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Total Records</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {records.length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Active Prescriptions</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {prescriptions.filter(p => p.active).length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Upcoming Appointments</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {appointments.filter(a => a.status === 'Scheduled').length}
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('records')}
            className={`${
              activeTab === 'records'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Medical Records
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`${
              activeTab === 'prescriptions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`${
              activeTab === 'appointments'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Appointments
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div>
          {activeTab === 'records' && renderRecords()}
          {activeTab === 'prescriptions' && renderPrescriptions()}
          {activeTab === 'appointments' && renderAppointments()}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;