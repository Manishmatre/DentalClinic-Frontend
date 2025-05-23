import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import patientService from '../../api/patients/patientService';
import MedicalHistoryForm from '../../components/patients/MedicalHistoryForm';
import DocumentUpload from '../../components/patients/DocumentUpload';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { exportPatientData } from '../../utils/exportUtils';

const PatientDetailsContent = () => {
  const [patient, setPatient] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMedicalHistoryForm, setShowMedicalHistoryForm] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      setIsLoading(true);
      const [
        patientData,
        medicalHistoryData,
        appointmentsData,
        documentsData
      ] = await Promise.all([
        patientService.getPatientById(id),
        patientService.getMedicalHistory(id),
        patientService.getPatientAppointments(id),
        patientService.getDocuments(id)
      ]);

      setPatient(patientData.data);
      setMedicalHistory(medicalHistoryData.data);
      setAppointments(appointmentsData.data);
      setDocuments(documentsData.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError(err.response?.data?.message || 'Failed to load patient details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/patients/edit/${id}`);
  };

  const handleAddMedicalRecord = async (formData) => {
    try {
      await patientService.updateMedicalHistory(id, formData);
      setShowMedicalHistoryForm(false);
      await fetchPatientDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update medical history');
    }
  };

  const handleUploadComplete = () => {
    fetchPatientDetails();
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const response = await patientService.downloadDocument(id, documentId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download document');
    }
  };

  const handleExportData = () => {
    exportPatientData(patient, medicalHistory, appointments);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        variant="error"
        title="Error"
        message={error}
        onClose={() => setError(null)}
      />
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <Alert
          variant="error"
          title="Not Found"
          message="Patient not found"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Patient Details</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportData}>Export Data</Button>
          <Button onClick={handleEdit}>Edit Patient</Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['info', 'medical', 'appointments', 'documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab === 'info' ? 'Basic Information' : tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === 'info' && (
          <Card>
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-gray-900">{patient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-gray-900">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-gray-900">
                    {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">{patient.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Medical History</h2>
              <Button onClick={() => setShowMedicalHistoryForm(true)}>
                Add Medical Record
              </Button>
            </div>

            {showMedicalHistoryForm && (
              <MedicalHistoryForm
                onSubmit={handleAddMedicalRecord}
                onCancel={() => setShowMedicalHistoryForm(false)}
              />
            )}

            {medicalHistory.length === 0 ? (
              <Card>
                <div className="p-4 text-center text-gray-500">
                  No medical history available
                </div>
              </Card>
            ) : (
              medicalHistory.map((record, index) => (
                <Card key={index}>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Condition</p>
                        <p className="text-gray-900">{record.condition}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Diagnosis</p>
                      <p className="text-gray-900">{record.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Treatment</p>
                      <p className="text-gray-900">{record.treatment}</p>
                    </div>
                    {record.medications?.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Medications</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {record.medications.map((med, medIndex) => (
                            <li key={medIndex}>
                              {med.name} - {med.dosage} ({med.frequency})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {record.notes && (
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-gray-900">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Appointments</h2>
              <Button onClick={() => navigate('/admin/appointments/new', { state: { patientId: id } })}>
                Book Appointment
              </Button>
            </div>

            {appointments.length === 0 ? (
              <Card>
                <div className="p-4 text-center text-gray-500">
                  No appointments found
                </div>
              </Card>
            ) : (
              appointments.map((appointment) => (
                <Card key={appointment._id}>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="text-gray-900">
                          {new Date(appointment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="text-gray-900">
                          {new Date(appointment.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-gray-900">{appointment.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Doctor</p>
                        <p className="text-gray-900">{appointment.doctor?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <DocumentUpload
              patientId={id}
              onUploadComplete={handleUploadComplete}
            />

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Documents</h2>
              {documents.length === 0 ? (
                <Card>
                  <div className="p-4 text-center text-gray-500">
                    No documents available
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <Card key={doc._id}>
                      <div className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => handleDownloadDocument(doc._id, doc.name)}
                        >
                          Download
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PatientDetails = () => {
  return (
    <ErrorBoundary>
      <PatientDetailsContent />
    </ErrorBoundary>
  );
};

export default PatientDetails;