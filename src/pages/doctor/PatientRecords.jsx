import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PatientList from '../../components/patients/PatientList';
import MedicalRecordsList from '../../components/medical/MedicalRecordsList';
import MedicalRecordForm from '../../components/medical/MedicalRecordForm';
import { useAuth } from '../../hooks/useAuth';
import patientService from '../../api/patients/patientService.js';
import medicalRecordService from '../../api/medical/medicalRecordService.js';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Tabs from '../../components/ui/Tabs';

const PatientRecords = () => {
  const { clinic, user } = useAuth();
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecordsLoading, setIsRecordsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordsError, setRecordsError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch all patients for the clinic
  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await patientService.getPatients({ clinicId: clinic?._id });
      setPatients(data);
      
      // If patientId is provided in URL, select that patient
      if (patientId) {
        const patient = data.find(p => p._id === patientId);
        if (patient) {
          setSelectedPatient(patient);
          fetchPatientRecords(patientId);
        }
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  }, [clinic?._id, patientId]);

  // Fetch medical records for a specific patient
  const fetchPatientRecords = async (id) => {
    try {
      setIsRecordsLoading(true);
      setRecordsError(null);
      const data = await medicalRecordService.getMedicalRecordsByPatient(id);
      setMedicalRecords(data);
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setRecordsError(err.response?.data?.message || 'Failed to load medical records');
    } finally {
      setIsRecordsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    // Update URL without reloading the page
    navigate(`/doctor/patients/${patient._id}`, { replace: true });
    fetchPatientRecords(patient._id);
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
    setMedicalRecords([]);
    navigate('/doctor/patients', { replace: true });
  };

  const handleCreateRecord = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
    setFormError(null);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setIsFormOpen(true);
    setFormError(null);
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) {
      try {
        await medicalRecordService.deleteMedicalRecord(recordId);
        // Refresh the records list
        fetchPatientRecords(selectedPatient._id);
      } catch (err) {
        console.error('Error deleting medical record:', err);
        setRecordsError(err.response?.data?.message || 'Failed to delete medical record');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    setFormError(null);
    
    try {
      const recordData = {
        ...formData,
        doctorId: user._id,
        clinicId: clinic._id
      };
      
      if (editingRecord) {
        // Update existing record
        await medicalRecordService.updateMedicalRecord(editingRecord._id, recordData);
      } else {
        // Create new record
        await medicalRecordService.createMedicalRecord(recordData);
      }
      
      // Close form and refresh records
      setIsFormOpen(false);
      fetchPatientRecords(selectedPatient._id);
    } catch (err) {
      console.error('Error saving medical record:', err);
      setFormError(err.response?.data?.message || 'Failed to save medical record');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!selectedPatient ? (
        // Patient List View
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Patient Records</h1>
          </div>

          {error && (
            <Alert 
              variant="error" 
              title="Error" 
              message={error} 
              onClose={() => setError(null)} 
            />
          )}

          <Card title="All Patients">
            {isLoading ? (
              <div className="flex justify-center p-6">
                <LoadingSpinner />
              </div>
            ) : (
              <PatientList 
                patients={patients}
                onView={handleSelectPatient}
                isLoading={isLoading}
                error={error}
              />
            )}
          </Card>
        </>
      ) : (
        // Patient Detail View with Medical Records
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="secondary" onClick={handleBackToList}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Patients
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">{selectedPatient.name}'s Medical Records</h1>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="primary" 
                onClick={() => navigate(`/doctor/patient/${selectedPatient._id}/documents`)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                View Documents
              </Button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedPatient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedPatient.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedPatient.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{selectedPatient.gender}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-900">Medical History</h2>
            <Button onClick={handleCreateRecord}>Add Medical Record</Button>
          </div>

          {recordsError && (
            <Alert 
              variant="error" 
              title="Error" 
              message={recordsError} 
              onClose={() => setRecordsError(null)} 
            />
          )}

          {/* Medical Records List */}
          {isRecordsLoading ? (
            <div className="flex justify-center p-6">
              <LoadingSpinner />
            </div>
          ) : (
            <MedicalRecordsList 
              records={medicalRecords}
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
              showPatient={false}
              showDoctor={true}
            />
          )}

          {/* Medical Record Form Modal */}
          {isFormOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                      {editingRecord ? 'Edit Medical Record' : 'Create New Medical Record'}
                    </h2>
                    <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <MedicalRecordForm 
                    onSubmit={handleFormSubmit}
                    initialData={editingRecord}
                    isLoading={formLoading}
                    error={formError}
                    patientId={selectedPatient._id}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatientRecords;