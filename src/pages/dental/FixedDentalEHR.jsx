import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTooth, FaHistory, FaImage, FaChartBar, FaFileInvoiceDollar, FaPrint, FaFilePdf, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
// Import enhanced components
import FixedToothChart from '../../components/dental/FixedToothChart';
import EnhancedDentalImaging from '../../components/dental/EnhancedDentalImaging';
import TreatmentHistory from '../../components/dental/TreatmentHistory';
import DentalReporting from '../../components/dental/DentalReporting';
import DentalBilling from '../../components/dental/DentalBilling';
import patientService from '../../api/patients/patientService';
import { useAuth } from '../../context/AuthContext';

const FixedDentalEHR = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chart');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true);
        const data = await patientService.getPatientById(patientId);
        setPatient(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching patient:', error);
        // Use mock data if API fails
        setPatient({
          _id: patientId,
          name: 'Demo Patient',
          email: 'patient@example.com',
          phone: '(123) 456-7890',
          gender: 'Male',
          dateOfBirth: new Date(1990, 0, 1).toISOString(),
          address: '123 Main St, Anytown, USA'
        });
        console.log('Using mock patient data for demo');
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  // Check if user has permission to access dental EHR
  const canEditDental = user && ['Admin', 'Doctor'].includes(user.role);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold mb-4">Patient Not Found</h2>
        <p className="text-gray-600 mb-4">The patient you're looking for doesn't exist or you don't have permission to view their records.</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center mb-6 text-sm">
        <Link
          to={`/${user.role.toLowerCase()}/dental-management`}
          className="text-blue-500 hover:text-blue-700 cursor-pointer flex items-center"
        >
          <FaArrowLeft className="mr-1" /> Dental Management
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-500">Patient Dental EHR</span>
      </div>
      
      {/* Patient Info Header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <div className="flex flex-col md:flex-row md:space-x-4 text-gray-600 mt-1">
              <p>ID: {patient._id}</p>
              <p>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
              <p>Gender: {patient.gender}</p>
              <p>Phone: {patient.phone}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 flex items-center"
              onClick={() => window.print()}
            >
              <FaPrint className="mr-1" /> Print Record
            </button>
            <button
              className="bg-green-500 text-white px-3 py-1.5 rounded text-sm hover:bg-green-600 flex items-center"
              onClick={() => {
                // Generate PDF logic would go here
                toast.success('PDF Export feature will be implemented soon');
              }}
            >
              <FaFilePdf className="mr-1" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b overflow-x-auto">
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'chart'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('chart')}
          >
            <FaTooth className="mr-1" /> Tooth Chart
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'treatments'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('treatments')}
          >
            <FaHistory className="mr-1" /> Treatment History
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'images'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('images')}
          >
            <FaImage className="mr-1" /> Dental Images
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'reports'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('reports')}
          >
            <FaChartBar className="mr-1" /> Reports
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'billing'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('billing')}
          >
            <FaFileInvoiceDollar className="mr-1" /> Billing
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'chart' && (
            <FixedToothChart patientId={patientId} readOnly={!canEditDental} />
          )}
          {activeTab === 'treatments' && (
            <TreatmentHistory patientId={patientId} readOnly={!canEditDental} />
          )}
          {activeTab === 'images' && (
            <EnhancedDentalImaging patientId={patientId} readOnly={!canEditDental} />
          )}
          {activeTab === 'reports' && (
            <DentalReporting patientId={patientId} readOnly={!canEditDental} />
          )}
          {activeTab === 'billing' && (
            <DentalBilling patientId={patientId} readOnly={!canEditDental} />
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-right text-sm text-gray-500 mt-4">
        Last updated: {lastUpdated}
      </div>
    </div>
  );
};

export default FixedDentalEHR;
