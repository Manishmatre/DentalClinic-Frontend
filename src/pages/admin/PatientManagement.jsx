import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaUserPlus, 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaFilePdf, 
  FaFileExcel, 
  FaFileCsv, 
  FaSortAmountDown, 
  FaSortAmountUp,
  FaUserMd,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPrint,
  FaChartPie,
  FaChartLine,
  FaUsers,
  FaUserShield,
  FaUserMinus,
  FaUserCheck,
  FaUserClock,
  FaBriefcaseMedical,
  FaArrowUp,
  FaArrowDown,
  FaHeartbeat,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaFileMedical,
  FaHistory,
  FaAllergies,
  FaProcedures,
  FaVial,
  FaPills,
  FaNotesMedical,
  FaUserInjured,
  FaBell
} from 'react-icons/fa';

// UI Components
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import PatientRequestsList from '../../components/patients/PatientRequestsList';
import PatientList from '../../components/patients/PatientList';

// Chart Components
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Import services
import patientService from '../../api/patients/patientService';
import patientRequestService from '../../api/patients/patientRequestService';
import { useAuth } from '../../context/AuthContext';

const PatientManagement = () => {
  // State management
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    ageGroup: '',
    bloodGroup: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'patients', 'appointments', 'medical-records', 'requests'
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger state here
  
  // Patient analytics state
  const [patientAnalytics, setPatientAnalytics] = useState({
    totalActive: 0,
    totalInactive: 0,
    byGender: {},
    byAgeGroup: {},
    byBloodGroup: {},
    recentlyRegistered: [],
    patientsByGender: {
      labels: [],
      data: []
    },
    patientsByAgeGroup: {
      labels: [],
      data: []
    },
    patientTrend: {
      labels: [],
      data: []
    },
    appointmentStats: {
      completed: 0,
      upcoming: 0,
      cancelled: 0,
      noShow: 0
    }
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Fetch patients on component mount and when dependencies change
  useEffect(() => {
    console.log('Fetching patients with current filters:', { currentPage, limit, search, filters });
    fetchPatients();
    fetchPatientAnalytics();
  }, [currentPage, limit, search, filters]);
  
  // Handle tab selection from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['dashboard', 'patients', 'requests'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam || tabParam === '') {
      // If no tab parameter is specified, default to dashboard
      setActiveTab('dashboard');
    }
  }, [location.search]);
  
  // Fetch pending patient requests count
  useEffect(() => {
    fetchPendingRequestsCount();
  }, [refreshTrigger]);
  
  // Additional effect to handle refresh trigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('Refresh trigger activated, fetching patients again');
      fetchPatients();
    }
  }, [refreshTrigger]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch pending patient requests count
  const fetchPendingRequestsCount = async () => {
    try {
      const response = await patientRequestService.getPatientRequests({ status: 'pending' });
      
      // Handle different response formats
      if (response.data) {
        const requests = Array.isArray(response.data) ? response.data :
          (response.data.data && Array.isArray(response.data.data) ? response.data.data : []);
        
        console.log('Pending requests count:', requests.length);
        setPendingRequestsCount(requests.length);
      } else if (Array.isArray(response)) {
        console.log('Pending requests count:', response.length);
        setPendingRequestsCount(response.length);
      } else {
        console.log('No pending requests found');
        setPendingRequestsCount(0);
      }
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
      toast.error('Failed to fetch pending requests count');
      setPendingRequestsCount(0);
    }
  };
  
  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await patientService.getPatients({
        page: currentPage,
        limit,
        search,
        ...filters
      });

      if (response.error) {
        setError(response.message);
        return;
      }

      setPatients(response.data);
      setTotalPages(response.pagination.pages);
      setTotalPatients(response.pagination.total);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to fetch patients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch patient analytics
  const fetchPatientAnalytics = async () => {
    try {
      const response = await patientService.getPatientAnalytics();
      if (response.error) {
        setPatientAnalytics({
          totalActive: 0,
          totalInactive: 0,
          error: response.message
        });
        return;
      }
      const analyticsData = response.data || response;
      if (!analyticsData) {
        setPatientAnalytics({
          totalActive: 0,
          totalInactive: 0,
          error: 'No analytics data available'
        });
        return;
      }
      // Map backend fields to chart data
      const genderObj = analyticsData.gender || {};
      const ageGroupsObj = analyticsData.ageGroups || {};
      const trendArr = analyticsData.trend || [];
      setPatientAnalytics({
        totalActive: analyticsData.active || 0,
        totalInactive: analyticsData.inactive || 0,
        error: null,
        byGender: genderObj,
        byAgeGroup: ageGroupsObj,
        byBloodGroup: analyticsData.bloodGroups || {},
        recentlyRegistered: analyticsData.recentlyRegistered || [],
        patientsByGender: {
          labels: Object.keys(genderObj),
          data: Object.values(genderObj)
        },
        patientsByAgeGroup: {
          labels: Object.keys(ageGroupsObj),
          data: Object.values(ageGroupsObj)
        },
        patientTrend: {
          labels: trendArr.map(t => t.month),
          data: trendArr.map(t => t.count)
        },
        appointmentStats: analyticsData.appointmentStats || {
          completed: 0,
          upcoming: 0,
          cancelled: 0,
          noShow: 0
        }
      });
    } catch (error) {
      setPatientAnalytics({
        totalActive: 0,
        totalInactive: 0,
        error: error.response?.data?.message || 'Failed to fetch patient analytics'
      });
    }
  };

  // Event handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleAddPatient = () => {
    navigate('/admin/patients/add');
  };

  const handleEditPatient = (id) => {
    navigate(`/admin/patients/edit/${id}`);
  };

  const handleViewPatient = (patient) => {
    navigate(`/admin/patients/${patient._id || patient.id}`);
  };

  const handleDeletePatient = (patient) => {
    setSelectedPatient(patient);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePatient = async () => {
    if (!selectedPatient) return;

    try {
      const response = await patientService.deletePatient(selectedPatient._id);
      
      if (response.error) {
        toast.error(response.message);
        return;
      }

      toast.success('Patient deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedPatient(null);
      setRefreshTrigger(prev => prev + 1); // Trigger a refresh
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    }
  };

  // Handle export data
  const handleExportData = async (format) => {
    try {
      const response = await patientService.exportPatients(format, {
        search,
        ...filters
      });

      if (response.error) {
        toast.error(response.message);
        return;
      }

      // Create a download link
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patients.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Patient data exported successfully in ${format.toUpperCase()} format`);
    } catch (error) {
      console.error('Error exporting patient data:', error);
      toast.error('Failed to export patient data');
    }
  };

  // Print patient list
  const handlePrintList = () => {
    try {
      // In a real implementation, this would format the data for printing
      // and trigger the browser's print functionality
      toast.info('Preparing patient list for printing...');
      window.print();
    } catch (err) {
      console.error('Error printing list:', err);
      toast.error('Failed to print patient list');
    }
  };

  // Handle patient status change
  const handleStatusChange = async (patientId, newStatus) => {
    try {
      const response = await patientService.updatePatient(patientId, { status: newStatus });
      
      if (response.error) {
        toast.error(response.message);
        return;
      }

      toast.success('Patient status updated successfully');
      setRefreshTrigger(prev => prev + 1); // Trigger a refresh
    } catch (error) {
      console.error('Error updating patient status:', error);
      toast.error('Failed to update patient status');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Render patient statistics cards
  const renderStatisticsCards = () => {
    // Add null checks and default values
    const appointmentStats = patientAnalytics?.appointmentStats || { upcoming: 0, completed: 0, cancelled: 0, noShow: 0 };
    const patientTrend = patientAnalytics?.patientTrend || { data: [0] };
    const totalActive = patientAnalytics?.totalActive || 0;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Patients</h3>
              <p className="text-2xl font-bold text-blue-600">{totalPatients}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <div className="p-4 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <FaUserCheck className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Active Patients</h3>
              <p className="text-2xl font-bold text-green-600">{totalActive}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <div className="p-4 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <FaCalendarAlt className="text-purple-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
              <p className="text-2xl font-bold text-purple-600">
                {appointmentStats.upcoming + appointmentStats.completed}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-amber-50 border-amber-200">
          <div className="p-4 flex items-center">
            <div className="rounded-full bg-amber-100 p-3 mr-4">
              <FaFileInvoiceDollar className="text-amber-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">New This Month</h3>
              <p className="text-2xl font-bold text-amber-600">
                {patientTrend.data && patientTrend.data.length > 0 ? patientTrend.data[patientTrend.data.length - 1] : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Render charts for the dashboard
  const renderCharts = () => {
    // Add null checks and default values
    const patientsByGender = patientAnalytics?.patientsByGender || { labels: [], data: [] };
    const patientsByAgeGroup = patientAnalytics?.patientsByAgeGroup || { labels: [], data: [] };
    const patientTrend = patientAnalytics?.patientTrend || { labels: [], data: [] };
    
    const genderChartData = {
      labels: patientsByGender.labels,
      datasets: [
        {
          data: patientsByGender.data,
          backgroundColor: ['#4F46E5', '#EC4899', '#10B981'],
          borderWidth: 1,
        },
      ],
    };

    const ageGroupChartData = {
      labels: patientsByAgeGroup.labels,
      datasets: [
        {
          label: 'Patients by Age Group',
          data: patientsByAgeGroup.data,
          backgroundColor: '#6366F1',
          borderColor: '#4F46E5',
          borderWidth: 1,
        },
      ],
    };

    const trendChartData = {
      labels: patientTrend.labels,
      datasets: [
        {
          label: 'New Patients',
          data: patientTrend.data,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          tension: 0.4,
          fill: true,
        },
      ],
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Patients by Gender</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut 
                data={genderChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Patients by Age Group</h3>
            <div className="h-64 flex items-center justify-center">
              <Bar 
                data={ageGroupChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">New Patient Trend</h3>
            <div className="h-64 flex items-center justify-center">
              <Line 
                data={trendChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Render recent patients table
  const renderRecentPatients = () => {
    // Add null check for recentlyRegistered array
    const recentlyRegistered = patientAnalytics?.recentlyRegistered || [];
    
    return (
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recently Registered Patients</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered On</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentlyRegistered.map((patient) => {
                  const patientName = patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`;
                  const getGenderColor = (gender) => {
                    switch (gender) {
                      case 'Male': return 'bg-blue-100 text-blue-800';
                      case 'Female': return 'bg-pink-100 text-pink-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };
                  const getProfileImageUrl = (patient) => {
                    if (!patient) return null;
                    if (patient.profileImage && patient.profileImage.url) return patient.profileImage.url;
                    if (patient.profileImageUrl) return patient.profileImageUrl;
                    if (patient.profileImageURL) return patient.profileImageURL;
                    return null;
                  };
                  return (
                    <tr key={patient._id || patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                            {getProfileImageUrl(patient) ? (
                              <img
                                src={getProfileImageUrl(patient)}
                                alt={patientName}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class=\"h-full w-full bg-indigo-100 rounded-full flex items-center justify-center\"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 448 512\" fill=\"currentColor\" class=\"h-5 w-5 text-indigo-500\"><path d=\"M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm89.6 32h-11.2c-22 10.5-46.7 16-72.4 16s-50.4-5.5-72.4-16h-11.2C66 288 0 354 0 438.4V480c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32v-41.6c0-84.4-66-150.4-146.4-150.4z\"/></svg></div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="h-full w-full bg-indigo-100 rounded-full flex items-center justify-center">
                                <FaUserInjured className="text-indigo-500" />
                              </div>
                            )}
                          </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 cursor-pointer text-blue-600 hover:underline" onClick={() => navigate(`/admin/patients/${patient._id}`)}>
                          {patient.name}
                        </div>
                        <div className="text-sm text-gray-500">{patient.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGenderColor(patient.gender)}`}>
                          {patient.gender || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FaPhone className="text-gray-400 mr-2" />
                          {patient.phone || 'No phone'}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                          {new Date(patient.createdAt || patient.registeredOn).toLocaleDateString()}
                      </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleViewPatient(patient)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    );
  };

  // Render dashboard tab content
  const renderDashboard = () => {
    return (
      <div>
        {renderStatisticsCards()}
        {renderCharts()}
        {renderRecentPatients()}
      </div>
    );
  };

  // Render patient list with the enhanced PatientList component
  const renderPatientList = () => {
    return (
      <div>
        
        {/* Patient List */}
        <PatientList
          patients={patients}
          loading={isLoading}
          onViewPatient={handleViewPatient}
          onEditPatient={(patient) => handleEditPatient(patient._id || patient.id)}
          onDeletePatient={handleDeletePatient}
          onExportData={handleExportData}
          onPrintList={handlePrintList}
          onStatusChange={handleStatusChange}
          totalPatients={totalPatients}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={limit}
          onPageSizeChange={(newSize) => {
            setLimit(newSize);
            setCurrentPage(1); // Reset to first page when changing page size
          }}
        />
      </div>
    );
  };

  // Render patient requests tab content
  const renderPatientRequests = () => {
    return (
      <div className="patient-requests-container">
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <FaUserPlus className="text-indigo-600 text-xl mr-2" />
              <h2 className="text-xl font-semibold">Patient Registration Requests</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Review and process registration requests from new patients. Approved patients will be added to your patient database.
            </p>
            
            <PatientRequestsList 
              onRequestProcessed={(processInfo) => {
                console.log('Patient request processed:', processInfo);
                
                // Different handling based on approval or rejection
                if (processInfo?.action === 'approve') {
                  setSuccess('Patient registration request approved successfully. Patient list has been updated.');
                } else {
                  setSuccess('Patient registration request processed successfully.');
                }
                
                // Force refresh of the patient list to ensure it's up to date
                fetchPatients();
                setRefreshTrigger(prev => prev + 1);
              }} 
            />
          </div>
        </Card>
      </div>
    );
  };

  // Render appointments tab (placeholder for now)
  const renderAppointments = () => {
    return (
      <Card>
        <div className="p-6 text-center">
          <FaCalendarAlt className="text-purple-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Appointment Management</h3>
          <p className="text-gray-600 mb-4">
            This section will allow you to view and manage all patient appointments, including scheduling, rescheduling, and cancellations.
          </p>
          <Button variant="primary" onClick={() => navigate('/admin/appointments')}>
            Go to Appointment Calendar
          </Button>
        </div>
      </Card>
    );
  };

  // Main render function
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600 mt-1">Manage all patient information, medical records, and appointments</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button onClick={handleAddPatient} className="flex items-center">
            <FaUserPlus className="mr-2" /> Add New Patient
          </Button>
        </div>
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
            <FaChartPie className="inline-block mr-2" /> Dashboard
          </button>
          
          <button
            onClick={() => handleTabChange('patients')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'patients'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <FaUsers className="inline-block mr-2" /> Patients
          </button>
          
          <button
            onClick={() => handleTabChange('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} relative`}
          >
            <FaBell className="inline-block mr-2" /> Requests
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                <span>{pendingRequestsCount}</span>
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Loading Spinner */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        /* Tab Content */
        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'patients' && renderPatientList()}
          {activeTab === 'requests' && renderPatientRequests()}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedPatient && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeletePatient}
          title="Delete Patient"
          message={`Are you sure you want to delete ${selectedPatient.name || `${selectedPatient.firstName} ${selectedPatient.lastName}`}? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default PatientManagement;
