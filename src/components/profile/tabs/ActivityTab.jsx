import React, { useState, useEffect, useRef } from 'react';
import { 
  FaSpinner, 
  FaExclamationTriangle, 
  FaClock, 
  FaHistory, 
  FaUser, 
  FaCalendarAlt, 
  FaFileMedical, 
  FaFileInvoiceDollar, 
  FaCog, 
  FaShieldAlt, 
  FaPills,
  FaSearch,
  FaFilter,
  FaDownload,
  FaSortDown,
  FaSortUp,
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaGlobe,
  FaMapMarkerAlt,
  FaMobileAlt,
  FaTabletAlt,
  FaLaptop,
  FaDesktop,
  FaUserEdit,
  FaKey,
  FaDatabase,
  FaChartLine,
  FaEye,
  FaEyeSlash,
  FaSort,
  FaUserMd,
  FaClipboardList,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserInjured,
  FaCalendarCheck,
  FaPrescription,
  FaInfoCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import adminService from '../../../api/admin/adminService';

// Activity item component
const ActivityItem = ({ activity }) => {
  // Determine icon based on activity type
  const getActivityIcon = (type) => {
    // Normalize type to lowercase for consistent matching
    const normalizedType = (type || '').toLowerCase();
    
    switch (normalizedType) {
      case 'login':
        return <FaSignInAlt className="text-green-500" />;
      case 'logout':
        return <FaSignOutAlt className="text-red-500" />;
      case 'profile':
        return <FaUserEdit className="text-blue-500" />;
      case 'settings':
        return <FaCog className="text-gray-500" />;
      case 'patient':
        return <FaUserInjured className="text-purple-500" />;
      case 'appointment':
        return <FaCalendarCheck className="text-indigo-500" />;
      case 'billing':
        return <FaFileInvoiceDollar className="text-yellow-500" />;
      case 'prescription':
        return <FaPrescription className="text-pink-500" />;
      case 'doctor':
        return <FaUserMd className="text-teal-500" />;
      case 'report':
        return <FaClipboardList className="text-orange-500" />;
      default:
        console.log('Unknown activity type:', type);
        return <FaInfoCircle className="text-gray-500" />;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Unknown date';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };
  
  // Handle missing data gracefully
  const title = activity.title || 'Unknown Activity';
  const description = activity.description || '';
  const timestamp = activity.timestamp || activity.createdAt || new Date();
  const module = activity.module || 'system';
  const status = activity.status || 'unknown';
  const type = activity.type || 'unknown';
  
  return (
    <div className="flex items-start p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="mr-3 mt-1">
        {getActivityIcon(type)}
      </div>
      <div className="flex-grow">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <FaClock className="mr-1" />
          <span>{formatDate(timestamp)}</span>
          {module && (
            <>
              <span className="mx-1">•</span>
              <span className="capitalize">{module}</span>
            </>
          )}
          {status && (
            <>
              <span className="mx-1">•</span>
              <span className={`capitalize ${status === 'success' ? 'text-green-500' : status === 'failed' ? 'text-red-500' : 'text-gray-500'}`}>
                {status}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Activity Tab Component
 * Displays user activity history based on their role
 */
const ActivityTab = ({ profileData, userRole }) => {
  // Determine icon based on activity type - moved from ActivityItem to fix scope issue
  const getActivityIcon = (type) => {
    // Normalize type to lowercase for consistent matching
    const normalizedType = (type || '').toLowerCase();
    
    switch (normalizedType) {
      case 'login':
        return <FaSignInAlt className="text-green-500" />;
      case 'logout':
        return <FaSignOutAlt className="text-red-500" />;
      case 'profile':
        return <FaUserEdit className="text-blue-500" />;
      case 'settings':
        return <FaCog className="text-gray-500" />;
      case 'patient':
        return <FaUserInjured className="text-purple-500" />;
      case 'appointment':
        return <FaCalendarCheck className="text-indigo-500" />;
      case 'billing':
        return <FaFileInvoiceDollar className="text-yellow-500" />;
      case 'prescription':
        return <FaPrescription className="text-pink-500" />;
      case 'doctor':
        return <FaUserMd className="text-teal-500" />;
      case 'report':
        return <FaClipboardList className="text-orange-500" />;
      default:
        console.log('Unknown activity type:', type);
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [filteredLoginHistory, setFilteredLoginHistory] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Refs
  const activityListRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Filter activities based on current filters
  useEffect(() => {
    if (activities.length > 0) {
      let filtered = [...activities];
      
      // Apply type filter
      if (activeFilter !== 'all') {
        filtered = filtered.filter(activity => activity.type === activeFilter);
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(activity => 
          (activity.title && activity.title.toLowerCase().includes(query)) ||
          (activity.details && activity.details.toLowerCase().includes(query)) ||
          (activity.description && activity.description.toLowerCase().includes(query))
        );
      }
      
      // Apply time range filter
      if (timeRange !== 'all') {
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (timeRange) {
          case 'today':
            cutoffDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            break;
        }
        
        filtered = filtered.filter(activity => {
          const activityDate = new Date(activity.timestamp || activity.createdAt);
          return activityDate >= cutoffDate;
        });
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt);
        const dateB = new Date(b.timestamp || b.createdAt);
        
        if (sortOrder === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
      
      // Calculate total pages
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      
      // Apply pagination
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedActivities = filtered.slice(startIndex, startIndex + itemsPerPage);
      
      setFilteredActivities(paginatedActivities);
    } else {
      setFilteredActivities([]);
    }
  }, [activities, activeFilter, searchQuery, timeRange, page, itemsPerPage, sortOrder]);
  
  // Filter login history
  useEffect(() => {
    if (loginHistory.length > 0) {
      let filtered = [...loginHistory];
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(login => 
          (login.device && login.device.toLowerCase().includes(query)) ||
          (login.browser && login.browser.toLowerCase().includes(query)) ||
          (login.ipAddress && login.ipAddress.toLowerCase().includes(query)) ||
          (login.location && login.location.toLowerCase().includes(query))
        );
      }
      
      // Apply time range filter
      if (timeRange !== 'all') {
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (timeRange) {
          case 'today':
            cutoffDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            break;
        }
        
        filtered = filtered.filter(login => {
          const loginDate = new Date(login.timestamp || login.loginTime);
          return loginDate >= cutoffDate;
        });
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.loginTime);
        const dateB = new Date(b.timestamp || b.loginTime);
        
        if (sortOrder === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
      
      setFilteredLoginHistory(filtered);
    } else {
      setFilteredLoginHistory([]);
    }
  }, [loginHistory, searchQuery, timeRange, sortOrder]);

  // Fetch activity data and log page view
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        console.log('Fetching activity data...');
        
        // Fetch activity data from the backend
        const activityData = await adminService.getAdminActivity();
        console.log('Raw activity data:', activityData);
        
        if (activityData && Array.isArray(activityData)) {
          setActivities(activityData);
          console.log('Activity data loaded:', activityData.length, 'records');
          
          // Log the first few activities for debugging
          if (activityData.length > 0) {
            console.log('Sample activities:', activityData.slice(0, 3));
          }
        } else {
          console.warn('Activity data is not an array or is empty:', activityData);
          setActivities([]);
        }
        
        // Fetch login history
        console.log('Fetching login history...');
        const loginData = await adminService.getLoginHistory();
        console.log('Raw login history:', loginData);
        
        if (loginData && Array.isArray(loginData)) {
          setLoginHistory(loginData);
          console.log('Login history loaded:', loginData.length, 'records');
          
          // Log the first few login records for debugging
          if (loginData.length > 0) {
            console.log('Sample login history:', loginData.slice(0, 3));
          }
        } else {
          console.warn('Login history is not an array or is empty:', loginData);
          setLoginHistory([]);
        }
        
        setLoading(false);
        
        // Force a refresh after a short delay to ensure new activities are shown
        setTimeout(() => {
          adminService.getAdminActivity().then(newData => {
            if (newData && Array.isArray(newData)) {
              setActivities(newData);
              console.log('Activity data refreshed:', newData.length, 'records');
            }
          }).catch(err => console.error('Error refreshing activity data:', err));
        }, 1000);
        
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError('Failed to load activity data. Please try again later.');
        setLoading(false);
        toast.error('Failed to load activity data');
        
        // Fallback to empty arrays if there's an error
        setActivities([]);
        setLoginHistory([]);
      }
    };
    
    fetchActivityData();
  }, []);
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top of activity list
    if (activityListRef.current) {
      activityListRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1); // Reset to first page when filter changes
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setPage(1); // Reset to first page when time range changes
  };
  
  // Handle sort change
  const handleSortChange = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };
  
  // Export activity data
  const exportActivityData = async (format) => {
    try {
      setIsExporting(true);
      // In a real application, you would call an API to generate the export
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast.success(`Activity data exported as ${format.toUpperCase()} successfully`);
      setShowExportOptions(false);
      setIsExporting(false);
    } catch (err) {
      console.error('Error exporting activity data:', err);
      toast.error('Failed to export activity data');
      setIsExporting(false);
    }
  };
  
  // View activity details
  const viewActivityDetails = (activity) => {
    setSelectedActivity(activity);
    setShowDetailedView(true);
  };
  
  // Close detailed view
  const closeDetailedView = () => {
    setShowDetailedView(false);
    setSelectedActivity(null);
  };
  
  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 30) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Activity Header with Filters */}
      <div ref={activityListRef}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Activity Timeline</h3>
          
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <button 
              onClick={() => setShowExportOptions(!showExportOptions)} 
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaDownload className="mr-1.5" /> Export
            </button>
            
            <button 
              onClick={handleSortChange} 
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {sortOrder === 'desc' ? <FaSortDown className="mr-1.5" /> : <FaSortUp className="mr-1.5" />}
              {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </button>
          </div>
        </div>
        
        {/* Export Options Dropdown */}
        {showExportOptions && (
          <div className="absolute z-10 mt-1 right-4 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100">
            <div className="py-1">
              <button 
                onClick={() => exportActivityData('pdf')} 
                disabled={isExporting}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                {isExporting && exportFormat === 'pdf' ? <FaSpinner className="animate-spin mr-2" /> : <FaFileAlt className="mr-2 text-red-500" />}
                Export as PDF
              </button>
              <button 
                onClick={() => exportActivityData('csv')} 
                disabled={isExporting}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                {isExporting && exportFormat === 'csv' ? <FaSpinner className="animate-spin mr-2" /> : <FaFileAlt className="mr-2 text-green-500" />}
                Export as CSV
              </button>
              <button 
                onClick={() => exportActivityData('excel')} 
                disabled={isExporting}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                {isExporting && exportFormat === 'excel' ? <FaSpinner className="animate-spin mr-2" /> : <FaFileAlt className="mr-2 text-blue-500" />}
                Export as Excel
              </button>
            </div>
          </div>
        )}
        
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                ref={searchInputRef}
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search activities..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            {/* Type Filter */}
            <div>
              <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
              <select
                id="typeFilter"
                value={activeFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Activities</option>
                <option value="login">Login</option>
                <option value="profile">Profile</option>
                <option value="appointment">Appointment</option>
                <option value="medical-record">Medical Record</option>
                <option value="prescription">Prescription</option>
                <option value="billing">Billing</option>
                <option value="settings">Settings</option>
                <option value="security">Security</option>
              </select>
            </div>
            
            {/* Time Range Filter */}
            <div>
              <label htmlFor="timeFilter" className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                id="timeFilter"
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Activity Content */}
      {loading ? (
        <div className="text-center py-12">
          <FaSpinner className="mx-auto text-4xl text-blue-500 animate-spin mb-3" />
          <p className="text-gray-500">Loading activity data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg border border-dashed border-red-300">
          <FaExclamationTriangle className="mx-auto text-4xl text-red-300 mb-3" />
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Try Again
          </button>
        </div>
      ) : filteredActivities.length > 0 ? (
        <div className="space-y-6">
          {/* Activity Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
            
            {/* Activity Items */}
            <div className="space-y-8">
              {filteredActivities.map((activity) => (
                <div 
                  key={activity._id || activity.id || Math.random().toString()} 
                  className="relative pl-14 hover:shadow-md transition-shadow duration-200"
                  onClick={() => viewActivityDetails(activity)}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-0 bg-white p-1.5 rounded-full border-2 border-gray-200">
                    {getActivityIcon(activity.type || 'default')}
                  </div>
                  
                  {/* Activity Content */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-900">{activity.title || 'Activity'}</h4>
                      <span className="text-xs text-gray-500 flex items-center">
                        <FaClock className="mr-1" /> {formatRelativeTime(activity.timestamp || activity.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{activity.details || activity.description || 'No details available'}</p>
                    
                    {/* Activity Metadata */}
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {activity.type || 'system'}
                      </span>
                      {activity.module && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {activity.module}
                        </span>
                      )}
                      {activity.ipAddress && (
                        <span className="ml-2 flex items-center">
                          <FaGlobe className="mr-1" /> {activity.ipAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <FaChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNum === page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <FaChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FaHistory className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 mb-2">No activity found matching your filters.</p>
          <button 
            onClick={() => {
              setActiveFilter('all');
              setSearchQuery('');
              setTimeRange('all');
              if (searchInputRef.current) {
                searchInputRef.current.focus();
              }
            }}
            className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaFilter className="mr-1.5" /> Clear Filters
          </button>
        </div>
      )}
      
      {/* Detailed Activity View Modal */}
      {showDetailedView && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg font-medium text-gray-900">Activity Details</h3>
              <button 
                onClick={closeDetailedView}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-blue-100 mr-3">
                  {getActivityIcon(selectedActivity.type || 'default')}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedActivity.title || 'Activity'}</h4>
                  <p className="text-sm text-gray-500">{formatRelativeTime(selectedActivity.timestamp || selectedActivity.createdAt)}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                <p className="text-sm text-gray-600">{selectedActivity.details || selectedActivity.description || 'No description available'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Activity Type</h5>
                  <p className="text-sm text-gray-600 bg-blue-100 text-blue-800 inline-block px-2 py-1 rounded">{selectedActivity.type || 'system'}</p>
                </div>
                
                {selectedActivity.module && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Module</h5>
                    <p className="text-sm text-gray-600">{selectedActivity.module}</p>
                  </div>
                )}
                
                {selectedActivity.ipAddress && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">IP Address</h5>
                    <p className="text-sm text-gray-600">{selectedActivity.ipAddress}</p>
                  </div>
                )}
                
                {selectedActivity.device && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Device</h5>
                    <p className="text-sm text-gray-600">{selectedActivity.device}</p>
                  </div>
                )}
                
                {selectedActivity.browser && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Browser</h5>
                    <p className="text-sm text-gray-600">{selectedActivity.browser}</p>
                  </div>
                )}
                
                {selectedActivity.location && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Location</h5>
                    <p className="text-sm text-gray-600">{selectedActivity.location}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeDetailedView}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Login History */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Login History</h3>
          
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
        
        {filteredLoginHistory.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {filteredLoginHistory.map((login, index) => (
                <li key={login._id || `login-${index}`} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {login.device?.toLowerCase().includes('mobile') ? (
                            <FaMobileAlt className="h-5 w-5 text-blue-500" />
                          ) : login.device?.toLowerCase().includes('tablet') ? (
                            <FaTabletAlt className="h-5 w-5 text-green-500" />
                          ) : (
                            <FaLaptop className="h-5 w-5 text-indigo-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {login.device || 'Unknown Device'} • {login.browser || 'Unknown Browser'}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <FaMapMarkerAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {login.location || 'Unknown Location'} • {login.ipAddress || 'Unknown IP'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(login.timestamp || login.loginTime).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(login.timestamp || login.loginTime).toLocaleTimeString()}
                        </div>
                        <div className="mt-1">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${login.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {login.status || 'successful'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No login history available for the selected time range.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTab;
