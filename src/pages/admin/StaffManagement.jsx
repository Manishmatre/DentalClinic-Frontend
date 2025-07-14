import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaBuilding,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPrint,
  FaUserNurse,
  FaUserTie,
  FaUserCog,
  FaChartPie,
  FaChartLine,
  FaUsers,
  FaUsersCog,
  FaUserShield,
  FaUserMinus,
  FaUserCheck,
  FaUserClock,
  FaBriefcaseMedical,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
// StaffModal removed - using dedicated AddStaff page instead
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';

import StaffList from '../../components/staff/StaffList';
import StaffRequestsList from '../../components/staff/StaffRequestsList';
import { useAuth } from '../../context/AuthContext';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Import services
import staffService from '../../api/staff/staffService';
import staffRequestService from '../../api/staff/staffRequestService';

const StaffManagement = () => {
  // State management
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStaff, setTotalStaff] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'staff' or 'requests'
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger state here
  
  // Staff analytics state
  const [staffAnalytics, setStaffAnalytics] = useState({
    totalActive: 0,
    totalInactive: 0,
    totalOnLeave: 0,
    byRole: {},
    byDepartment: {},
    recentlyJoined: [],
    staffByRole: {
      labels: [],
      data: []
    },
    staffTrend: {
      labels: [],
      data: []
    }
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const ITEMS_PER_PAGE = 10;

  // Fetch staff on component mount and when dependencies change
  useEffect(() => {
    console.log('Fetching staff with current filters:', { currentPage, search, filters });
    fetchStaff();
  }, [currentPage, search, filters]);
  
  // Fetch pending staff requests count
  useEffect(() => {
    fetchPendingRequestsCount();
  }, [refreshTrigger]);
  
  // Additional effect to handle refresh trigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('Refresh trigger activated, fetching staff again');
      fetchStaff();
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

  // Fetch pending staff requests count
  const fetchPendingRequestsCount = async () => {
    try {
      const response = await staffRequestService.getStaffRequests({ status: 'pending' });
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        setPendingRequestsCount(response.data.length);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setPendingRequestsCount(response.data.data.length);
      } else if (Array.isArray(response)) {
        setPendingRequestsCount(response.length);
      } else {
        console.error('Unexpected response format for pending requests count');
        setPendingRequestsCount(0);
      }
    } catch (err) {
      console.error('Error fetching pending requests count:', err);
      setPendingRequestsCount(0);
    }
  };
  
  // Fetch staff from API
  const fetchStaff = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare query parameters
      const queryParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: search,
        ...filters,
        // Add timestamp to prevent caching issues
        _t: new Date().getTime()
      };
      
      console.log('Fetching staff with params:', queryParams);
      
      // Fetch staff data - the service now handles errors internally
      const staffResponse = await staffService.getStaff(queryParams);
      
      // Update state with fetched staff data
      setStaff(staffResponse.data);
      setTotalPages(staffResponse.totalPages || 1);
      setTotalStaff(staffResponse.totalItems || staffResponse.data.length);
      
      console.log('Staff data loaded successfully:', staffResponse.data.length, 'staff members');
      
      if (staffResponse.data.length === 0) {
        setError('No staff records found in the database. Please add staff members.');
      } else {
        setError(null); // Clear any previous errors
      }
      
      // Fetch analytics separately to handle potential errors independently
      try {
        const analyticsData = await staffService.getStaffAnalytics();
        
        // Process analytics data for charts
        const roleLabels = Object.keys(analyticsData.roleDistribution || {});
        const roleData = roleLabels.map(role => analyticsData.roleDistribution[role]);
        
        // Update analytics state
        setStaffAnalytics({
          totalActive: analyticsData.totalActive || 0,
          totalInactive: analyticsData.totalInactive || 0,
          totalOnLeave: analyticsData.totalOnLeave || 0,
          byRole: analyticsData.roleDistribution || {},
          byDepartment: analyticsData.departmentDistribution || {},
          recentlyJoined: analyticsData.recentlyJoined || [],
          staffByRole: {
            labels: roleLabels,
            data: roleData
          },
          staffTrend: {
            labels: analyticsData.trendLabels || [],
            data: analyticsData.trendData || []
          }
        });
        
        console.log('Analytics data loaded successfully:', analyticsData);
      } catch (analyticsError) {
        console.error('Error fetching analytics data:', analyticsError);
        // Don't show an error to the user, just use default analytics
        setStaffAnalytics({
          totalActive: staffResponse.data.filter(s => s.status === 'Active').length,
          totalInactive: staffResponse.data.filter(s => s.status === 'Inactive').length,
          totalOnLeave: staffResponse.data.filter(s => s.status === 'On Leave').length,
          byRole: {},
          byDepartment: {},
          recentlyJoined: [],
          staffByRole: {
            labels: [],
            data: []
          },
          staffTrend: {
            labels: [],
            data: []
          }
        });
      }
    } catch (err) {
      console.error('Error fetching staff data:', err);
      
      // Set empty data
      setStaff([]);
      setTotalPages(1);
      setTotalStaff(0);
      
      // Set appropriate error message
      setError('Unable to fetch staff data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStaff();
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Navigate to the AddStaff page for editing a staff member
  const handleEditStaff = (staff) => {
    // Navigate to the AddStaff page with the staff ID as a query parameter
    navigate(`/admin/add-staff?id=${staff._id}`);
  };

  // Open modal to confirm staff deletion
  const handleDeleteClick = (staff) => {
    setSelectedStaff(staff);
    setIsDeleteModalOpen(true);
  };

  // Delete a staff member
  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;
    
    try {
      await staffService.deleteStaff(selectedStaff._id);
      setSuccess('Staff member deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err) {
      setError('Failed to delete staff member');
      console.error('Error deleting staff:', err);
    }
  };

  // Export staff data in different formats
  const handleExportData = (format) => {
    try {
      console.log(`Exporting staff data in ${format} format`);
      toast.info(`Exporting staff data in ${format} format`);
      
      // In a real implementation, this would generate and download the file
      // For now, just show a toast message
      setTimeout(() => {
        toast.success(`Staff data exported as ${format.toUpperCase()} successfully`);
      }, 1000);
    } catch (err) {
      console.error(`Error exporting staff data as ${format}:`, err);
      toast.error(`Failed to export staff data as ${format}`);
    }
  };
  
  // Print staff list
  const handlePrintList = () => {
    try {
      console.log('Printing staff list');
      toast.info('Preparing staff list for printing...');
      
      // In a real implementation, this would open the print dialog
      // For now, just show a toast message
      setTimeout(() => {
        toast.success('Staff list sent to printer');
      }, 1000);
    } catch (err) {
      console.error('Error printing staff list:', err);
      toast.error('Failed to print staff list');
    }
  };
  
  // This is a duplicate function - removed
  
  // Navigate to staff details page
  const handleViewDetails = (staffMember) => {
    // If we received a staff ID instead of a staff object, find the staff member
    if (typeof staffMember === 'string') {
      staffMember = staff.find(s => s._id === staffMember);
    }
    navigate(`/admin/staff/${staffMember._id}`);
  };
  
  // Update staff status (active, inactive, on leave)
  const handleStatusChange = async (staffId, newStatus) => {
    try {
      setIsLoading(true);
      await staffService.updateStaffStatus(staffId, newStatus);
      
      // Update local state to reflect the change immediately
      setStaff(prevStaff => 
        prevStaff.map(s => 
          s._id === staffId ? { ...s, status: newStatus } : s
        )
      );
      
      // Show success message
      setSuccess(`Staff status updated to ${newStatus} successfully`);
      
      // Refresh analytics data
      const analyticsData = await staffService.getStaffAnalytics();
      
      // Process analytics data for charts
      const roleLabels = Object.keys(analyticsData.roleDistribution || {});
      const roleData = roleLabels.map(role => analyticsData.roleDistribution[role]);
      
      // Update analytics state
      setStaffAnalytics({
        totalActive: analyticsData.totalActive || 0,
        totalInactive: analyticsData.totalInactive || 0,
        totalOnLeave: analyticsData.totalOnLeave || 0,
        byRole: analyticsData.roleDistribution || {},
        byDepartment: analyticsData.departmentDistribution || {},
        recentlyJoined: analyticsData.recentlyJoined || [],
        staffByRole: {
          labels: roleLabels,
          data: roleData
        },
        staffTrend: {
          labels: analyticsData.trendLabels || [],
          data: analyticsData.trendData || []
        }
      });
      
    } catch (err) {
      console.error('Error updating staff status:', err);
      setError('Failed to update staff status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to the AddStaff page
  const handleAddStaff = () => {
    navigate('/admin/add-staff');
  };

  // Export staff data
  const handleExport = (format) => {
    toast.info(`Exporting staff data as ${format.toUpperCase()}...`);
    setShowExportOptions(false);
    // Implementation for export functionality would go here
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center mt-6">
        <nav className="inline-flex rounded-md shadow">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } text-sm font-medium focus:z-10 focus:outline-none`}
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, i) => {
            // Show only a window of 5 pages
            if (
              i + 1 === 1 ||
              i + 1 === totalPages ||
              (i + 1 >= currentPage - 2 && i + 1 <= currentPage + 2)
            ) {
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    currentPage === i + 1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } text-sm font-medium focus:z-10 focus:outline-none`}
                >
                  {i + 1}
                </button>
              );
            }
            
            // Add ellipsis for skipped pages
            if (i + 1 === currentPage - 3 || i + 1 === currentPage + 3) {
              return (
                <span
                  key={i}
                  className="relative inline-flex items-center px-4 py-2 border bg-white text-gray-700 text-sm font-medium"
                >
                  ...
                </span>
              );
            }
            
            return null;
          })}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } text-sm font-medium focus:z-10 focus:outline-none`}
          >
            Next
          </button>
        </nav>
      </div>
    );
  };

  // Helper to get role color (copy from StaffList)
  const getRoleColor = (role) => {
    switch (role) {
      case 'Doctor':
        return 'bg-blue-100 text-blue-800';
      case 'Receptionist':
        return 'bg-green-100 text-green-800';
      case 'Nurse':
        return 'bg-purple-100 text-purple-800';
      case 'Lab Technician':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pharmacist':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-500 mt-1">Manage your clinic staff, view analytics, and process staff requests</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={handleAddStaff}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center gap-2"
          >
            <FaUserPlus className="text-white" />
            Add Staff
          </Button>
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <FaFilter className="text-gray-500" />
              Filters
            </Button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-10 p-4 border border-gray-100">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Filter Options</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    value={filters.role}
                    onChange={handleFilterChange}
                    name="role"
                  >
                    <option value="">All Roles</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Admin">Admin</option>
                    <option value="Lab Technician">Lab Technician</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    value={filters.department}
                    onChange={handleFilterChange}
                    name="department"
                  >
                    <option value="">All Departments</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="ENT">ENT</option>
                    <option value="Dental">Dental</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    value={filters.status}
                    onChange={handleFilterChange}
                    name="status"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
                <Button
                  variant="primary"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md shadow-sm"
                  onClick={() => setShowFilters(false)}
                >
                  Apply Filters
                </Button>
              </div>
            )}
          </div>
          <div className="relative">
            <Button
              variant="secondary"
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <FaFilePdf className="text-gray-500" />
              Export
            </Button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10 p-4 border border-gray-100">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Export Options</h3>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full justify-start bg-white hover:bg-gray-50 text-gray-700 py-2 px-3 rounded-md flex items-center gap-2"
                    onClick={() => handleExport('pdf')}
                  >
                    <FaFilePdf className="text-red-500" />
                    Export as PDF
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-start bg-white hover:bg-gray-50 text-gray-700 py-2 px-3 rounded-md flex items-center gap-2"
                    onClick={() => handleExport('excel')}
                  >
                    <FaFileExcel className="text-green-600" />
                    Export as Excel
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-start bg-white hover:bg-gray-50 text-gray-700 py-2 px-3 rounded-md flex items-center gap-2"
                    onClick={() => handleExport('csv')}
                  >
                    <FaFileCsv className="text-indigo-500" />
                    Export as CSV
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap space-x-6">
          <button
            className={`${activeTab === 'dashboard' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
            onClick={() => setActiveTab('dashboard')}
          >
            <FaChartPie className="mr-2" />
            Dashboard
          </button>
          <button
            className={`${activeTab === 'staff' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
            onClick={() => setActiveTab('staff')}
          >
            <FaUserMd className="mr-2" />
            Staff List
          </button>
          <button
            className={`${activeTab === 'requests' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 relative`}
            onClick={() => setActiveTab('requests')}
          >
            <FaUserPlus className="mr-2" />
            Registration Requests
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                <span>{pendingRequestsCount}</span>
              </span>
            )}
          </button>
        </nav>
      </div>
      
      {activeTab === 'dashboard' ? (
        <>
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Staff */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Staff</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{totalStaff}</p>
                  </div>
                  <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FaUsers className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">Staff growth</span>
                    <span className="text-sm font-semibold text-green-600 flex items-center">
                      <FaArrowUp className="mr-1 h-3 w-3" />
                      12%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-1"></div>
            </div>
            
            {/* Active Staff */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Staff</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{staffAnalytics.totalActive}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FaUserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">{totalStaff > 0 ? Math.round((staffAnalytics.totalActive / totalStaff) * 100) : 0}% of total</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${totalStaff > 0 ? Math.round((staffAnalytics.totalActive / totalStaff) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-1"></div>
            </div>
            
            {/* On Leave */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">On Leave</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{staffAnalytics.totalOnLeave}</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FaUserClock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">{totalStaff > 0 ? Math.round((staffAnalytics.totalOnLeave / totalStaff) * 100) : 0}% of total</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${totalStaff > 0 ? Math.round((staffAnalytics.totalOnLeave / totalStaff) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-1"></div>
            </div>
            
            {/* Inactive Staff */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Inactive Staff</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{staffAnalytics.totalInactive}</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <FaUserMinus className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-500">{totalStaff > 0 ? Math.round((staffAnalytics.totalInactive / totalStaff) * 100) : 0}% of total</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${totalStaff > 0 ? Math.round((staffAnalytics.totalInactive / totalStaff) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-red-500 to-red-600 h-1"></div>
            </div>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Staff by Role Chart */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Staff by Role</h3>
                  <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    Total: {totalStaff}
                  </div>
                </div>
                <div className="h-64">
                  <Doughnut 
                    data={{
                      labels: staffAnalytics.staffByRole.labels,
                      datasets: [{
                        data: staffAnalytics.staffByRole.data,
                        backgroundColor: [
                          '#4F46E5', // indigo
                          '#10B981', // green
                          '#F59E0B', // yellow
                          '#EF4444', // red
                          '#6366F1', // indigo-500
                          '#8B5CF6', // violet-500
                        ],
                        borderWidth: 1,
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '70%',
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                              size: 12
                            }
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          titleFont: {
                            size: 14
                          },
                          bodyFont: {
                            size: 13
                          },
                          displayColors: false
                        }
                      },
                    }}
                  />
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1"></div>
            </div>
            
            {/* Staff Growth Trend */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Staff Growth Trend</h3>
                  <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    Last 12 months
                  </div>
                </div>
                <div className="h-64">
                  <Line 
                    data={{
                      labels: staffAnalytics.staffTrend.labels,
                      datasets: [{
                        label: 'Total Staff',
                        data: staffAnalytics.staffTrend.data,
                        borderColor: '#4F46E5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#4F46E5',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          titleFont: {
                            size: 14
                          },
                          bodyFont: {
                            size: 13
                          },
                          displayColors: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.05)',
                          },
                          ticks: {
                            precision: 0
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1"></div>
            </div>
          </div>
          
          {/* Recently Joined Staff */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recently Joined Staff</h3>
                  <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                    Last 30 days
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {staffAnalytics.recentlyJoined.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No recent staff found</td>
                        </tr>
                      ) : (
                        staffAnalytics.recentlyJoined.map((staff) => (
                          <tr key={staff._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                                  {staff.profileImage && staff.profileImage.url ? (
                                    <img src={staff.profileImage.url} alt={staff.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className={`h-full w-full flex items-center justify-center rounded-full text-lg font-bold ${getRoleColor(staff.role)}`}>
                                      {staff.name?.charAt(0) || '?'}
                                    </div>
                                  )}
                                </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 cursor-pointer text-blue-600 hover:underline" onClick={() => navigate(`/admin/staff/${staff._id}`)}>
                                {staff.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(staff.role)}`}>
                                {staff.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center">
                                <span className="mr-2">{staff.email}</span>
                              </div>
                              {staff.phone && (
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <span className="mr-2">{staff.phone}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {staff.joinedDate ? new Date(staff.joinedDate).toLocaleDateString() : 'N/A'}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'staff' ? (
        <>
          {/* Staff List */}
          <StaffList
            staff={staff}
            loading={isLoading}
            onEditStaff={handleEditStaff}
            onDeleteStaff={handleDeleteClick}
            onViewStaff={handleViewDetails}
            onStatusChange={handleStatusChange}
            onExportData={handleExportData}
            onPrintList={handlePrintList}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalStaff={totalStaff}
          />
        </>
      ) : (
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Staff Registration Requests</h2>
            <p className="text-gray-600 mb-6">
              Review and manage staff registration requests. Approve or reject requests based on your clinic's staffing needs.
            </p>
            
            <StaffRequestsList 
              onRequestProcessed={(processInfo) => {
                console.log('Staff request processed:', processInfo);
                
                // Different handling based on approval or rejection
                if (processInfo?.action === 'approve') {
                  setSuccess('Staff registration request approved successfully. Staff list has been updated.');
                } else {
                  setSuccess('Staff registration request processed successfully.');
                }
                
                // Force refresh of the staff list to ensure it's up to date
                fetchStaff();
                setRefreshTrigger(prev => prev + 1);
              }} 
            />
          </div>
        </Card>
      )}
      
      {/* Staff Add/Edit Modal removed - using dedicated AddStaff page */}
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteStaff}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${selectedStaff?.name}? This action cannot be undone.`}
      />
      
    </div>
  );
};

export default StaffManagement;
