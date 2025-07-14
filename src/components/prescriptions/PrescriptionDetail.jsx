import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaFileMedical, FaPrint, FaEdit, FaTrash, 
  FaArrowLeft, FaCheck, FaTimes, FaUser, FaCalendarAlt 
} from 'react-icons/fa';
import prescriptionService from '../../api/prescriptions/prescriptionService';
import patientService from '../../api/patients/patientService';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [prescription, setPrescription] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchPrescription();
  }, [id]);
  
  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const data = await prescriptionService.getPrescriptionById(id);
      if (data) {
        setPrescription(data);
        fetchPatientInfo(data.patientId);
      } else {
        toast.error('Prescription not found');
        navigate('/prescriptions');
      }
    } catch (error) {
      toast.error('Failed to load prescription');
      console.error('Error fetching prescription:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPatientInfo = async (patientId) => {
    try {
      const data = await patientService.getPatientById(patientId);
      setPatientInfo(data);
    } catch (error) {
      console.error('Error fetching patient info:', error);
    }
  };
  
  const handleDeletePrescription = async () => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await prescriptionService.deletePrescription(id);
        toast.success('Prescription deleted successfully');
        navigate(`/patients/${prescription.patientId}/dental`);
      } catch (error) {
        toast.error('Failed to delete prescription');
        console.error('Error deleting prescription:', error);
      }
    }
  };
  
  const handlePrintPrescription = () => {
    window.print();
  };
  
  const handleToggleStatus = async () => {
    try {
      const newStatus = prescription.status === 'active' ? 'completed' : 'active';
      await prescriptionService.updatePrescription(id, {
        ...prescription,
        status: newStatus
      });
      setPrescription({
        ...prescription,
        status: newStatus
      });
      toast.success(`Prescription marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update prescription status');
      console.error('Error updating prescription status:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!prescription) {
    return (
      <div className="text-center py-8">
        <FaFileMedical className="mx-auto text-gray-300 text-5xl mb-3" />
        <p className="text-gray-500">Prescription not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 print:shadow-none print:p-0">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaFileMedical className="mr-2 text-blue-500" />
          Prescription Details
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 flex items-center"
          >
            <FaArrowLeft className="mr-1" /> Back
          </button>
          <button
            onClick={handlePrintPrescription}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
          >
            <FaPrint className="mr-1" /> Print
          </button>
          <Link
            to={`/prescriptions/edit/${id}`}
            className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center"
          >
            <FaEdit className="mr-1" /> Edit
          </Link>
          <button
            onClick={handleDeletePrescription}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
          >
            <FaTrash className="mr-1" /> Delete
          </button>
          <button
            onClick={handleToggleStatus}
            className={`px-3 py-1 rounded-md flex items-center ${
              prescription.status === 'active'
                ? 'bg-gray-500 text-white hover:bg-gray-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {prescription.status === 'active' ? (
              <>
                <FaCheck className="mr-1" /> Mark Completed
              </>
            ) : (
              <>
                <FaTimes className="mr-1" /> Mark Active
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Printable Header */}
      <div className="hidden print:block text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-blue-800">Dental Clinic Prescription</h1>
        <p className="text-gray-600">123 Dental Street, Cityville, State 12345</p>
        <p className="text-gray-600">Phone: (555) 123-4567 | Email: info@dentalclinic.com</p>
      </div>
      
      {/* Prescription Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg print:bg-white print:border print:rounded-none">
          <h2 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
            <FaUser className="mr-2" /> Patient Information
          </h2>
          {patientInfo ? (
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {patientInfo.firstName} {patientInfo.lastName}</p>
              <p><span className="font-medium">ID:</span> {patientInfo.id}</p>
              <p><span className="font-medium">Date of Birth:</span> {new Date(patientInfo.dateOfBirth).toLocaleDateString()}</p>
              <p><span className="font-medium">Contact:</span> {patientInfo.phone}</p>
            </div>
          ) : (
            <p className="text-gray-500">Patient ID: {prescription.patientId}</p>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg print:bg-white print:border print:rounded-none">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
            <FaCalendarAlt className="mr-2" /> Prescription Details
          </h2>
          <div className="space-y-2">
            <p><span className="font-medium">Prescription ID:</span> {prescription.id}</p>
            <p><span className="font-medium">Date:</span> {new Date(prescription.date).toLocaleDateString()}</p>
            <p><span className="font-medium">Doctor:</span> {prescription.doctorName}</p>
            <p><span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                prescription.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {prescription.status === 'active' ? 'Active' : 'Completed'}
              </span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Diagnosis & Notes</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p><span className="font-medium">Diagnosis:</span> {prescription.diagnosis}</p>
          {prescription.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="font-medium">Notes:</p>
              <p className="text-gray-700 whitespace-pre-line">{prescription.notes}</p>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Prescribed Medications</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {prescription.medications.map((medication, index) => (
                <tr key={medication.id || index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{medication.name}</td>
                  <td className="px-4 py-3 text-sm">{medication.dosage}</td>
                  <td className="px-4 py-3 text-sm">{medication.frequency}</td>
                  <td className="px-4 py-3 text-sm">{medication.duration}</td>
                  <td className="px-4 py-3 text-sm">{medication.quantity}</td>
                  <td className="px-4 py-3 text-sm">{medication.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Printable Footer */}
      <div className="hidden print:block mt-12 pt-8 border-t">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">This prescription is valid for 30 days from the date of issue.</p>
            <p className="text-sm text-gray-500">Please follow all medication instructions carefully.</p>
          </div>
          <div className="text-right">
            <div className="border-t border-gray-400 w-48 ml-auto pt-2">
              <p className="font-medium">{prescription.doctorName}</p>
              <p className="text-sm text-gray-500">Doctor's Signature</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            size: portrait;
            margin: 2cm;
          }
          body {
            font-size: 12pt;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrescriptionDetail;
