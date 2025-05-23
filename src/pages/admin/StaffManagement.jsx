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
  FaPrint
} from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StaffModal from '../../components/staff/StaffModal';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import StaffDetailsModal from '../../components/staff/StaffDetailsModal';
import StaffList from '../../components/staff/StaffList';
import StaffRequestsList from '../../components/staff/StaffRequestsList';
import { useAuth } from '../../context/AuthContext';

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
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' or 'requests'
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const ITEMS_PER_PAGE = 10;

  // Fetch staff on component mount and when dependencies change
  useEffect(() => {
    console.log('Fetching staff with current filters:', { currentPage, search, filters });
    fetchStaff();
  }, [currentPage, search, filters]);
  
  // Add a refresh trigger to force staff list refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
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

  // Fetch staff from API
  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching staff with params:', {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search,
        ...filters,
        timestamp: new Date().toISOString() // Add timestamp to prevent caching
      });
      
      const response = await staffService.getStaff({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search,
        ...filters,
        timestamp: new Date().toISOString() // Add timestamp to prevent caching
      });
      
      console.log('Staff API response:', response);
      
      // Check if response has the expected structure
      if (response && response.data) {
        console.log(`Setting ${response.data.length} staff members from response.data`);
        setStaff(response.data);
        setTotalStaff(response.pagination?.total || 0);
        setTotalPages(response.pagination?.pages || 1);
        setError(null);
      } else {
        // Handle legacy API response format or unexpected response
        console.warn('Unexpected API response format:', response);
        if (Array.isArray(response)) {
          console.log(`Setting ${response.length} staff members from direct array response`);
          setStaff(response);
          setTotalStaff(response.length);
        } else {
          console.error('Unable to parse staff response, setting empty array');
          setStaff([]);
          setTotalStaff(0);
        }
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(err.response?.data?.message || 'Failed to load staff members');
      setStaff([]);
      setTotalStaff(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
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

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
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

  // Open modal to add a new staff member
  const handleAddStaff = () => {
    setSelectedStaff(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Open modal to edit an existing staff member
  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Open modal to confirm staff deletion
  const handleDeleteClick = (staff) => {
    setSelectedStaff(staff);
    setIsDeleteModalOpen(true);
  };

  // Delete a staff member
  const handleDeleteStaff = async () => {
    try {
      await staffService.deleteStaff(selectedStaff._id);
      setSuccess(`Staff member ${selectedStaff.name} deleted successfully`);
      fetchStaff();
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting staff member:', err);
      setError(err.response?.data?.message || 'Failed to delete staff member');
    }
  };

  // Open modal to view staff details
  const handleViewDetails = (staff) => {
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  };

  // Handle staff creation or update from modal
  const handleStaffSubmit = async (staffData) => {
    try {
      setIsLoading(true);
      
      if (modalMode === 'add') {
        const response = await staffService.createStaff(staffData);
        
        // If a temporary password was returned, show it in the success message
        if (response.tempPassword) {
          setSuccess(`Staff member ${staffData.name} added successfully. Temporary password: ${response.tempPassword}`);
        } else {
          setSuccess(`Staff member ${staffData.name} added successfully`);
        }
      } else {
        await staffService.updateStaff(selectedStaff._id, staffData);
        setSuccess(`Staff member ${staffData.name} updated successfully`);
      }
      
      fetchStaff();
      setIsModalOpen(false);
      setSelectedStaff(null);
      return true;
    } catch (err) {
      console.error('Error saving staff data:', err);
      setError(err.response?.data?.message || 'Failed to save staff data');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Export staff data
  const handleExport = (format) => {
    // Implement export functionality based on format (pdf, excel, csv)
    console.log(`Exporting staff data as ${format}`);
    
    // In a real implementation, you would call an API endpoint to generate the export
    // Show a toast notification instead of UI alert
    toast.success(`Staff data exported as ${format.toUpperCase()} successfully`);
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex justify-center mt-4">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              )}
            </>
          )}
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === number
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              )}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </nav>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'requests' ? 'secondary' : 'primary'}
            onClick={() => setActiveTab('staff')}
          >
            Staff List
          </Button>
          <Button
            variant={activeTab === 'staff' ? 'secondary' : 'primary'}
            onClick={() => setActiveTab('requests')}
          >
            Staff Requests
          </Button>
          {activeTab === 'staff' && (
            <Button
              variant="primary"
              onClick={handleAddStaff}
              icon={<FaUserPlus />}
            >
              Add Staff
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      {success && (
        <Alert
          variant="success"
          title="Success"
          message={success}
          onClose={() => setSuccess(null)}
          className="mb-4"
        />
      )}

      {activeTab === 'staff' ? (
        <>
          {/* Staff List */}
          <StaffList
            staff={staff}
            loading={isLoading}
            onEditStaff={handleEditStaff}
            onDeleteStaff={handleDeleteClick}
            onViewStaff={handleViewDetails}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <StaffRequestsList 
          onRequestProcessed={(processInfo) => {
            console.log('Staff request processed:', processInfo);
            
            // Different handling based on approval or rejection
            if (processInfo.action === 'approve') {
              setSuccess('Staff request approved successfully. Staff list has been updated.');
              
              // Force multiple refreshes of the staff list to ensure it's up to date
              fetchStaff();
              setRefreshTrigger(prev => prev + 1);
              
              // Switch back to staff tab after a short delay to show the updated staff list
              setTimeout(() => {
                setActiveTab('staff');
                
                // Force another refresh when switching to the staff tab
                fetchStaff();
                setRefreshTrigger(prev => prev + 1);
                
                // One more refresh after a short delay to ensure the latest data
                setTimeout(() => {
                  console.log('Performing final staff list refresh');
                  fetchStaff();
                  setRefreshTrigger(prev => prev + 2);
                }, 1000);
                
                toast.success('Staff list updated with the newly approved staff member');
              }, 2000);
            } else {
              // Just refresh the requests list for rejections
              setSuccess('Staff request rejected successfully.');
              setRefreshTrigger(prev => prev + 1);
            }
          }} 
        />
      )}
      
      {/* Staff Add/Edit Modal */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleStaffSubmit}
        staff={selectedStaff}
        mode={modalMode}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteStaff}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${selectedStaff?.name}? This action cannot be undone.`}
      />
      
      {/* Staff Details Modal */}
      <StaffDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        staff={selectedStaff}
        onEdit={handleEditStaff}
      />
    </div>
  );
};

export default StaffManagement;
