import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaTooth, 
  FaSearch, 
  FaFilter, 
  FaUserPlus, 
  FaChartBar, 
  FaCalendarAlt, 
  FaFileInvoiceDollar, 
  FaImage, 
  FaHistory, 
  FaClipboardList,
  FaUserInjured,
  FaPlus
} from 'react-icons/fa';

// UI Components
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// API Services
import patientService from '../../api/patients/patientService';
import dentalService from '../../api/dental/dentalService';
import { useAuth } from '../../context/AuthContext';

const DentalManagement = () => {
  // State management
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'lastVisit',
    sortOrder: 'desc'
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dentalStats, setDentalStats] = useState({
    totalPatients: 0,
    pendingTreatments: 0,
    completedTreatments: 0,
    upcomingAppointments: 0,
    recentTreatments: []
  });
  
  const navigate = useNavigate();
  const { user, socket } = useAuth();
  const ITEMS_PER_PAGE = 10;

  // Fetch patients and dental statistics on component mount
  useEffect(() => {
    fetchPatients();
    fetchDentalStats();

    if (socket) {
      socket.on('patientCreated', (newPatient) => {
        setPatients(prev => [newPatient, ...prev]);
      });

      socket.on('patientUpdated', (updatedPatient) => {
        setPatients(prev => prev.map(p => p._id === updatedPatient._id ? updatedPatient : p));
      });

      socket.on('patientDeleted', ({ id }) => {
        setPatients(prev => prev.filter(p => p._id !== id));
      });

      socket.on('appointmentCreated', (newAppointment) => {
        // Optionally refresh appointments or update state
        fetchAppointments();
      });

      socket.on('invoiceCreated', (newInvoice) => {
        // Optionally refresh invoices or update state
        fetchInvoices();
      });

      socket.on('toothRecordUpdated', (updatedToothRecord) => {
        // Optionally refresh dental chart or update state
        fetchDentalStats();
      });
    }

    return () => {
      if (socket) {
        socket.off('patientCreated');
        socket.off('patientUpdated');
        socket.off('patientDeleted');
        socket.off('appointmentCreated');
        socket.off('invoiceCreated');
        socket.off('toothRecordUpdated');
      }
    };
  }, [currentPage, search, filters, socket]);

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare query parameters
      const queryParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: search,
        ...filters
      };
      
      // Fetch patient data
      const response = await patientService.getPatients(queryParams);
      
      // Update state with fetched patient data
      if (Array.isArray(response)) {
        setPatients(response);
        setTotalPages(Math.ceil(response.length / ITEMS_PER_PAGE));
      } else if (response && response.data) {
        setPatients(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setPatients([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dental statistics
  const fetchDentalStats = async () => {
    try {
      const data = await dentalService.getDentalStats();
      setDentalStats(data);
    } catch (err) {
      console.error('Error fetching dental statistics:', err);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Navigate to patient dental EHR
  const navigateToPatientDentalEHR = (patientId) => {
    navigate(`/admin/patient/${patientId}/dental`);
  };

  // Render dashboard tab content
  const renderDashboard = () => {
    return (
      <div className="dashboard-container space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-indigo-50 border-indigo-200">
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-indigo-100 p-3 mr-4">
                <FaUserInjured className="text-indigo-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Patients</h3>
                <p className="text-2xl font-bold text-indigo-600">{dentalStats?.totalPatients ?? 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FaHistory className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Completed Treatments</h3>
                <p className="text-2xl font-bold text-green-600">{dentalStats?.completedTreatments ?? 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FaTooth className="text-yellow-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Pending Treatments</h3>
                <p className="text-2xl font-bold text-yellow-600">{dentalStats?.pendingTreatments ?? 0}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <FaCalendarAlt className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h3>
                <p className="text-2xl font-bold text-purple-600">{dentalStats?.upcomingAppointments ?? 0}</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Recent Treatments */}
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Dental Treatments</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedure</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(dentalStats?.recentTreatments ?? []).map((treatment) => (
                    <tr key={treatment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{treatment.patientName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{treatment.procedure}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(treatment.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          color={treatment.status === 'completed' ? 'success' : 'warning'} 
                          text={treatment.status === 'completed' ? 'Completed' : 'Scheduled'} 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => toast.info('View treatment details feature coming soon')}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="p-4 text-center">
              <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <FaUserPlus className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">New Dental Examination</h3>
              <p className="text-gray-600 mb-4">Start a new dental examination for a patient</p>
              <Button 
                variant="primary" 
                onClick={() => setActiveTab('patients')}
              >
                Select Patient
              </Button>
            </div>
          </Card>
          
          <Card>
            <div className="p-4 text-center">
              <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <FaCalendarAlt className="text-green-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Schedule Treatment</h3>
              <p className="text-gray-600 mb-4">Schedule a new dental treatment appointment</p>
              <Button 
                variant="success" 
                onClick={() => navigate('/admin/appointment-management')}
              >
                Open Calendar
              </Button>
            </div>
          </Card>
          
          <Card>
            <div className="p-4 text-center">
              <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <FaChartBar className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Dental Reports</h3>
              <p className="text-gray-600 mb-4">View and generate dental treatment reports</p>
              <Button 
                variant="secondary" 
                onClick={() => toast.info('Dental reports feature coming soon')}
              >
                View Reports
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // Render patients tab content
  const renderPatients = () => {
    return (
      <div className="patients-container">
        <Card>
          <div className="p-4">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div className="mb-4 md:mb-0">
                <h3 className="text-lg font-semibold">Dental Patients</h3>
                <p className="text-gray-600">Select a patient to view or update their dental records</p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="border rounded-md pl-10 pr-4 py-2 w-full"
                    value={search}
                    onChange={handleSearchChange}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="border rounded-md px-4 py-2"
                >
                  <option value="all">All Patients</option>
                  <option value="active">Active Treatment</option>
                  <option value="completed">Completed Treatment</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center my-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8">
                <FaUserInjured className="mx-auto text-4xl text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-500">No patients found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patients.map((patient) => (
                        <tr key={patient._id || patient.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                {patient.profileImage ? (
                                  <img className="h-10 w-10 rounded-full" src={patient.profileImage} alt="" />
                                ) : (
                                  <span className="text-gray-500 font-medium">
                                    {`${patient.firstName?.charAt(0) || ''}${patient.lastName?.charAt(0) || ''}`}
                                  </span>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`}
                                </div>
                                <div className="text-sm text-gray-500">{patient.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient._id || patient.id || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.age || calculateAge(patient.dateOfBirth || patient.dob)} / {patient.gender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.phone || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('en-IN') : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigateToPatientDentalEHR(patient._id || patient.id)}
                            >
                              <FaTooth className="mr-1" /> Dental EHR
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, patients.length)} of {patients.length} patients
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Render procedures tab content
  const renderProcedures = () => {
    return (
      <div className="procedures-container">
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Dental Procedures</h3>
                <p className="text-gray-600">Manage dental procedures and treatment options</p>
              </div>
              <Button
                variant="primary"
                onClick={() => toast.info('Add procedure feature coming soon')}
              >
                <FaPlus className="mr-1" /> Add Procedure
              </Button>
            </div>
            
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <FaTooth className="text-4xl text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Dental Procedures Module</h3>
              <p className="text-gray-600 mb-4">
                This section will allow you to manage dental procedures, including pricing, descriptions, and categories.
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Coming soon in the next update
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Render reports tab content
  const renderReports = () => {
    return (
      <div className="reports-container">
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">Dental Reports</h3>
                <p className="text-gray-600">Generate and view dental treatment reports</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => toast.info('Export feature coming soon')}
                >
                  <FaFileInvoiceDollar className="mr-1" /> Export
                </Button>
                <Button
                  variant="primary"
                  onClick={() => toast.info('Generate report feature coming soon')}
                >
                  <FaChartBar className="mr-1" /> Generate Report
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <FaChartBar className="text-4xl text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Dental Reports Module</h3>
              <p className="text-gray-600 mb-4">
                This section will allow you to generate and view various dental reports, including treatment statistics, revenue analysis, and patient demographics.
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Coming soon in the next update
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dental Management</h1>
        <p className="text-gray-600 mt-2">
          Manage dental records, treatments, and procedures for your patients
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
          className="mb-6"
        />
      )}
      
      {success && (
        <Alert
          variant="success"
          title="Success"
          message={success}
          onClose={() => setSuccess(null)}
          className="mb-6"
        />
      )}

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FaChartBar className="inline-block mr-2" /> Dashboard
          </button>
          
          <button
            onClick={() => handleTabChange('patients')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'patients'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FaUserInjured className="inline-block mr-2" /> Patients
          </button>
          
          <button
            onClick={() => handleTabChange('procedures')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'procedures'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FaTooth className="inline-block mr-2" /> Procedures
          </button>
          
          <button
            onClick={() => handleTabChange('reports')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FaClipboardList className="inline-block mr-2" /> Reports
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'patients' && renderPatients()}
        {activeTab === 'procedures' && renderProcedures()}
        {activeTab === 'reports' && renderReports()}
      </div>
    </div>
  );
};

export default DentalManagement;
