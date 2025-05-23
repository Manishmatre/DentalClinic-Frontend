import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaUserInjured,
  FaCalendarAlt,
  FaVenusMars,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaMapMarkerAlt,
  FaHistory,
  FaClipboardList,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPrint
} from 'react-icons/fa';
import patientService from '../../api/patients/patientService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PatientModal from '../../components/patients/PatientModal';
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal';
import PatientDetailsModal from '../../components/patients/PatientDetailsModal';
import PatientsList from '../../components/patients/PatientsList';

const PatientsManagement = () => {
  // State management
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 10;

  // Fetch patients on component mount and when dependencies change
  useEffect(() => {
    fetchPatients();
  }, [currentPage, search, filters]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await patientService.getPatients({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search,
        ...filters
      });
      
      // Check if response has the expected structure
      if (response && response.data) {
        setPatients(response.data);
        setTotalPatients(response.pagination?.total || 0);
        setTotalPages(response.pagination?.pages || 1);
        setError(null);
      } else {
        // Handle legacy API response format or unexpected response
        console.warn('Unexpected API response format:', response);
        setPatients(Array.isArray(response) ? response : []);
        setTotalPatients(Array.isArray(response) ? response.length : 0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.response?.data?.message || 'Failed to load patients');
      setPatients([]);
      setTotalPatients(0);
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
    fetchPatients();
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Open modal to add a new patient
  const handleAddPatient = () => {
    setSelectedPatient(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Open modal to edit an existing patient
  const handleEditPatient = (patient) => {
    // Make sure we have the complete patient data before opening the edit modal
    if (patient && patient._id) {
      // Fetch the complete patient data to ensure we have all fields
      const fetchCompletePatientData = async () => {
        try {
          setIsLoading(true);
          const response = await patientService.getPatientById(patient._id);
          if (response && response.data) {
            setSelectedPatient(response.data);
            setModalMode('edit');
            setIsModalOpen(true);
          } else {
            setError('Could not retrieve complete patient data for editing');
          }
        } catch (err) {
          console.error('Error fetching patient details:', err);
          setError(err.response?.data?.message || 'Failed to load patient details');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchCompletePatientData();
    } else {
      setError('Invalid patient data for editing');
    }
  };

  // Open modal to confirm patient deletion
  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setIsDeleteModalOpen(true);
  };

  // Delete a patient
  const handleDeletePatient = async () => {
    if (!selectedPatient) return;
    
    try {
      await patientService.deletePatient(selectedPatient._id);
      setSuccess(`Patient ${selectedPatient.name} has been deleted successfully`);
      fetchPatients();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete patient');
    }
  };

  // Open modal to view patient details
  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setIsViewModalOpen(true);
  };

  // Handle patient creation or update from modal
  const handlePatientSubmit = async (patientData) => {
    try {
      setIsLoading(true);
      console.log('Handling patient submission:', patientData);
      console.log('Current mode:', modalMode);
      console.log('Selected patient:', selectedPatient);
      
      if (modalMode === 'add') {
        // For new patients
        const response = await patientService.createPatient(patientData);
        console.log('Create patient response:', response);
        setSuccess('Patient added successfully');
      } else if (modalMode === 'edit' && selectedPatient && selectedPatient._id) {
        // For existing patients
        console.log('Updating patient with ID:', selectedPatient._id);
        console.log('Update data:', patientData);
        
        // Make sure we're passing the patient ID correctly
        const response = await patientService.updatePatient(selectedPatient._id, patientData);
        console.log('Update patient response:', response);
        setSuccess('Patient updated successfully');
      } else {
        throw new Error('Invalid operation or missing patient ID');
      }
      
      setIsModalOpen(false);
      setSelectedPatient(null);
      await fetchPatients(); // Refetch the patients list to show the new/updated patient
    } catch (err) {
      console.error('Error submitting patient:', err);
      setError(err.response?.data?.message || `Failed to ${modalMode === 'add' ? 'add' : 'update'} patient`);
    } finally {
      setIsLoading(false);
    }
  };

  // Export patient data
  const handleExport = async (format) => {
    try {
      const response = await patientService.exportPatients(format, { search, ...filters });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `patients_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(`Failed to export patients as ${format.toUpperCase()}`);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    return (
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">
          Showing {patients.length} of {totalPatients} patients
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm"
          >
            Previous
          </Button>
          
          <div className="flex items-center">
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNumber = currentPage <= 3 
                ? index + 1 
                : currentPage + index - 2;
              
              if (pageNumber <= totalPages) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 mx-1 rounded-full ${
                      currentPage === pageNumber 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              return null;
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="mx-1">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8 mx-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 text-sm"
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaUserInjured className="mr-2 text-blue-600" /> Patient Management
          </h1>
          <p className="text-gray-600 mt-1">Manage your clinic's patients</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button 
            onClick={handleAddPatient}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-200 flex items-center"
          >
            <FaUserPlus className="mr-2" /> Add New Patient
          </Button>
          
          <div className="dropdown relative">
            <Button 
              variant="secondary"
              className="px-4 py-2 rounded-md flex items-center"
              onClick={() => document.getElementById('exportDropdown').classList.toggle('hidden')}
            >
              <FaFilePdf className="mr-2" /> Export
            </Button>
            <div id="exportDropdown" className="dropdown-menu hidden absolute right-0 mt-2 bg-white shadow-lg rounded-md z-10">
              <button 
                onClick={() => handleExport('pdf')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-md flex items-center"
              >
                <FaFilePdf className="mr-2 text-red-600" /> Export as PDF
              </button>
              <button 
                onClick={() => handleExport('excel')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
              >
                <FaFileExcel className="mr-2 text-green-600" /> Export as Excel
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-md flex items-center"
              >
                <FaFileCsv className="mr-2 text-blue-600" /> Export as CSV
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alerts */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />
      )}
      
      {success && (
        <Alert type="success" message={success} onClose={() => setSuccess(null)} className="mb-4" />
      )}
      
      <Card className="mb-6">
        <div className="p-4">
          {/* Filter Section */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <h3 className="text-md font-medium text-gray-700 mb-3">Filter Patients</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={filters.gender}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                  <select
                    name="ageRange"
                    value={filters.ageRange}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Ages</option>
                    <option value="0-18">Under 18</option>
                    <option value="19-35">19-35</option>
                    <option value="36-50">36-50</option>
                    <option value="51-65">51-65</option>
                    <option value="65+">Over 65</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <div className="flex">
                    <select
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="createdAt">Date Added</option>
                      <option value="name">Name</option>
                      <option value="lastVisit">Last Visit</option>
                    </select>
                    <button
                      type="button"
                      onClick={toggleSortOrder}
                      className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-white text-gray-500 hover:bg-gray-50"
                    >
                      {filters.sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* PatientsList Component */}
          <PatientsList
            patients={patients}
            loading={isLoading}
            onAddPatient={handleAddPatient}
            onEditPatient={(id, data) => {
              setSelectedPatient({ _id: id, ...data });
              setModalMode('edit');
              setIsModalOpen(true);
            }}
            onDeletePatient={handleDeleteClick}
            onViewPatient={handleViewDetails}
            onExportData={handleExport}
            onPrintList={() => window.print()}
            totalPatients={totalPatients}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={ITEMS_PER_PAGE}
            onPageSizeChange={(size) => {
              // In a real implementation, you would update the page size and refetch
              console.log('Page size changed to', size);
            }}
          />
        </div>
      </Card>
      
      {/* Patient Add/Edit Modal */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePatientSubmit}
        patient={selectedPatient}
        mode={modalMode}
      />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePatient}
        title="Delete Patient"
        message={`Are you sure you want to delete ${selectedPatient?.name}? This action cannot be undone.`}
      />
      
      {/* Patient Details Modal */}
      <PatientDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        patient={selectedPatient}
        onEdit={handleEditPatient}
      />
    </div>
  );
};

export default PatientsManagement;
