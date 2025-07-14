import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import patientService from '../../api/patients/patientService';
import { useAuth } from '../../context/AuthContext';

const DentalManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await patientService.getAllPatients();
        setPatients(data);
        setFilteredPatients(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        patient =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const handleViewDentalEHR = (patientId) => {
    const basePath = user.role === 'Admin' ? '/admin' : '/doctor';
    navigate(`${basePath}/patient/${patientId}/dental`);
  };

  const handlePatientProfile = (patientId) => {
    const basePath = user.role === 'Admin' ? '/admin' : '/doctor';
    if (user.role === 'Admin') {
      navigate(`/admin/patients-management?patientId=${patientId}`);
    } else {
      navigate(`/doctor/patients?patientId=${patientId}`);
    }
  };

  const handleNavigate = (path) => {
    const basePath = user.role === 'Admin' ? '/admin' : '/doctor';
    navigate(`${basePath}/${path}`);
  };

  // Calculate some statistics for the dashboard
  const totalPatients = patients.length;
  const patientsWithDentalRecords = Math.floor(totalPatients * 0.7); // Simulated statistic
  const pendingTreatments = Math.floor(totalPatients * 0.3); // Simulated statistic
  const recentAppointments = Math.floor(totalPatients * 0.2); // Simulated statistic

  return (
    <div className="container mx-auto p-4">
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button 
              onClick={() => handleNavigate('dashboard')} 
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
              </svg>
              Dashboard
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Dental Management</span>
            </div>
          </li>
        </ol>
      </nav>
      
      {/* Statistics Dashboard */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Dental EHR Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-blue-600">{totalPatients}</div>
            <div className="text-sm text-gray-600 mt-1">Total Patients</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-green-600">{patientsWithDentalRecords}</div>
            <div className="text-sm text-gray-600 mt-1">Patients with Dental Records</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-yellow-600">{pendingTreatments}</div>
            <div className="text-sm text-gray-600 mt-1">Pending Treatments</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-purple-600">{recentAppointments}</div>
            <div className="text-sm text-gray-600 mt-1">Recent Dental Appointments</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Dental Management</h1>
          <div className="flex space-x-2">
            <button
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
              onClick={() => {
                // This would open a modal to create a new dental record
                toast.info('Create new dental record feature coming soon');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Record
            </button>
            <button
              className="flex items-center bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
              onClick={() => {
                // This would generate a report
                toast.info('Generate report feature coming soon');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reports
            </button>
            <button
              className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
              onClick={() => navigate('/dental/chairs')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5v14" />
              </svg>
              Chair Management
            </button>
          </div>
        </div>
        <p className="text-gray-600 mb-4">
          Manage dental records, treatments, and imaging for your patients.
        </p>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-700 mb-2">Tooth Charting</h3>
            <p className="text-sm text-gray-600">
              Interactive dental charts for recording tooth conditions and treatments
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-700 mb-2">Treatment History</h3>
            <p className="text-sm text-gray-600">
              Comprehensive record of all dental procedures and treatments
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h3 className="font-semibold text-purple-700 mb-2">Dental Imaging</h3>
            <p className="text-sm text-gray-600">
              Upload and view dental X-rays and other diagnostic images
            </p>
          </div>
        </div>

        {/* HIPAA Compliance Notice */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-6">
          <h3 className="font-semibold text-yellow-700 mb-2">HIPAA Compliance</h3>
          <p className="text-sm text-gray-600">
            All dental records are protected health information (PHI) under HIPAA regulations.
            Unauthorized access, use, or disclosure is strictly prohibited.
          </p>
        </div>
      </div>

      {/* Patient Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Patient Dental Records</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search patients by name, email or phone..."
              className="w-full p-2 border border-gray-300 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="p-2 border border-gray-300 rounded bg-white"
              onChange={(e) => {
                // Filter functionality would go here
                toast.info(`Filter by ${e.target.value} coming soon`);
              }}
            >
              <option value="">Filter by Status</option>
              <option value="active">Active Treatments</option>
              <option value="completed">Completed Treatments</option>
              <option value="scheduled">Scheduled Appointments</option>
            </select>
            <select 
              className="p-2 border border-gray-300 rounded bg-white"
              onChange={(e) => {
                // Sort functionality would go here
                toast.info(`Sort by ${e.target.value} coming soon`);
              }}
            >
              <option value="name">Sort by Name</option>
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Name</th>
                  <th className="py-2 px-4 border-b text-left">Email</th>
                  <th className="py-2 px-4 border-b text-left">Phone</th>
                  <th className="py-2 px-4 border-b text-left">Gender</th>
                  <th className="py-2 px-4 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{patient.name}</td>
                      <td className="py-2 px-4 border-b">{patient.email}</td>
                      <td className="py-2 px-4 border-b">{patient.phone}</td>
                      <td className="py-2 px-4 border-b">{patient.gender}</td>
                      <td className="py-2 px-4 border-b">
                        <div className="flex space-x-2">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                            onClick={() => handleViewDentalEHR(patient._id)}
                          >
                            Dental EHR
                          </button>
                          <button
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                            onClick={() => handlePatientProfile(patient._id)}
                          >
                            Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-500">
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DentalManagement;
