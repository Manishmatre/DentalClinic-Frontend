import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import dentalProcedureService from '../../api/dental/dentalProcedureService';
import patientService from '../../api/patients/patientService';
import staffService from '../../api/staff/staffService';
import inventoryService from '../../api/inventory/inventoryService';
import DentalProcedureForm from './DentalProcedureForm';
import DentalProcedureDetail from './DentalProcedureDetail';
import InventoryUsageDashboard from '../inventory/InventoryUsageDashboard';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Input from '../ui/Input';
import Select from '../ui/Select';
import DateRangePicker from '../ui/DateRangePicker';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaChartLine } from 'react-icons/fa';

const DentalProcedureManagement = () => {
  const { user, clinic } = useAuth();
  const [procedures, setProcedures] = useState([]);
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isProcedureFormModalOpen, setIsProcedureFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUsageReportModalOpen, setIsUsageReportModalOpen] = useState(false);
  const [procedureToDelete, setProcedureToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [usageReport, setUsageReport] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportDateRange, setReportDateRange] = useState({ startDate: null, endDate: null });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });

  // Fetch procedures
  const fetchProcedures = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const data = await dentalProcedureService.getDentalProcedures(params);
      setProcedures(data.procedures);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching dental procedures:', err);
      setError(err.response?.data?.message || 'Failed to load dental procedures');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch patients and dentists
  const fetchPatientsAndDentists = async () => {
    try {
      // Fetch patients
      const patientsData = await patientService.getPatients();
      setPatients(patientsData);

      // Fetch dentists (staff with dentist role)
      const staffData = await staffService.getStaff({ role: 'dentist' });
      setDentists(staffData);
    } catch (err) {
      console.error('Error fetching patients or dentists:', err);
      // Don't set error state here to avoid blocking the main functionality
    }
  };

  // Fetch usage report
  const fetchUsageReport = async () => {
    setIsLoadingReport(true);
    try {
      const params = {};
      if (reportDateRange.startDate) params.startDate = reportDateRange.startDate;
      if (reportDateRange.endDate) params.endDate = reportDateRange.endDate;

      const data = await dentalProcedureService.getInventoryUsageReport(params);
      setUsageReport(data);
    } catch (err) {
      console.error('Error fetching inventory usage report:', err);
      // Don't set error state here to avoid blocking the main functionality
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchProcedures();
    fetchPatientsAndDentists();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchProcedures(1); // Reset to first page when filters change
  }, [searchTerm, categoryFilter, statusFilter, dateRange]);

  // Handle creating or updating a procedure
  const handleSubmitProcedure = async (procedureData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (selectedProcedure) {
        // Update existing procedure
        await dentalProcedureService.updateDentalProcedure(selectedProcedure._id, procedureData);
        setSuccessMessage('Procedure updated successfully');
      } else {
        // Create new procedure
        await dentalProcedureService.createDentalProcedure(procedureData);
        setSuccessMessage('Procedure created successfully');
      }
      
      // Close modal and refresh data
      setIsProcedureFormModalOpen(false);
      setSelectedProcedure(null);
      fetchProcedures();
      
      // Show success message briefly
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving procedure:', err);
      setError(err.response?.data?.message || 'Failed to save procedure');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding inventory items to a procedure
  const handleAddInventoryItems = async (procedure, inventoryItems) => {
    setIsLoading(true);
    setError(null);
    try {
      await dentalProcedureService.addInventoryItems(procedure._id, inventoryItems);
      setSuccessMessage('Inventory items added successfully');
      
      // Close modal and refresh data
      setIsProcedureFormModalOpen(false);
      setSelectedProcedure(null);
      fetchProcedures();
      
      // Show success message briefly
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding inventory items:', err);
      setError(err.response?.data?.message || 'Failed to add inventory items');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a procedure
  const handleDeleteProcedure = async () => {
    if (!procedureToDelete) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await dentalProcedureService.deleteDentalProcedure(procedureToDelete);
      setSuccessMessage('Procedure deleted successfully');
      
      // Close modal and refresh data
      setIsDeleteModalOpen(false);
      setProcedureToDelete(null);
      fetchProcedures();
      
      // Show success message briefly
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting procedure:', err);
      setError(err.response?.data?.message || 'Failed to delete procedure');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle viewing a procedure
  const handleViewProcedure = async (procedure) => {
    setIsLoading(true);
    setError(null);
    try {
      const detailedProcedure = await dentalProcedureService.getDentalProcedureById(procedure._id);
      setSelectedProcedure(detailedProcedure);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error('Error fetching procedure details:', err);
      setError(err.response?.data?.message || 'Failed to load procedure details');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle editing a procedure
  const handleEditProcedure = (procedure) => {
    setSelectedProcedure(procedure);
    setIsDetailModalOpen(false);
    setIsProcedureFormModalOpen(true);
  };

  // Handle confirming procedure deletion
  const handleConfirmDelete = (procedureId) => {
    setProcedureToDelete(procedureId);
    setIsDetailModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  // Handle opening the usage report modal
  const handleOpenUsageReport = () => {
    fetchUsageReport();
    setIsUsageReportModalOpen(true);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchProcedures(newPage);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dental Procedures</h1>
        <div className="flex space-x-2">
          <Button 
            variant="primary" 
            onClick={() => {
              setSelectedProcedure(null);
              setIsProcedureFormModalOpen(true);
            }}
          >
            <FaPlus className="mr-2" /> New Procedure
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleOpenUsageReport}
          >
            <FaChartLine className="mr-2" /> Usage Report
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert 
          variant="success" 
          title="Success" 
          message={successMessage} 
          className="mb-4"
          onClose={() => setSuccessMessage('')}
        />
      )}

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search procedures..."
              icon={<FaSearch className="text-gray-400" />}
            />
          </div>
          <div>
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                ...dentalProcedureService.getProcedureCategories().map(cat => ({
                  value: cat,
                  label: cat
                }))
              ]}
            />
          </div>
          <div>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                ...dentalProcedureService.getProcedureStatuses().map(status => ({
                  value: status,
                  label: status
                }))
              ]}
            />
          </div>
          <div>
            <DateRangePicker
              label="Date Range"
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={setDateRange}
              isClearable
            />
          </div>
        </div>
      </div>

      {/* Procedures List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error && <Alert variant="error" title="Error" message={error} className="m-4" />}
        
        {isLoading ? (
          <div className="p-4 text-center">Loading procedures...</div>
        ) : procedures.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-500">No procedures found</p>
            <Button 
              variant="primary" 
              size="sm"
              className="mt-2"
              onClick={() => {
                setSelectedProcedure(null);
                setIsProcedureFormModalOpen(true);
              }}
            >
              <FaPlus className="mr-2" /> Create New Procedure
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedure</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dentist</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory Cost</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {procedures.map((procedure) => (
                  <tr key={procedure._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{procedure.name}</div>
                      <div className="text-sm text-gray-500">{procedure.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {procedure.patient?.firstName} {procedure.patient?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {procedure.dentist?.firstName} {procedure.dentist?.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(procedure.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(procedure.status)}`}>
                        {procedure.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inventoryService.formatCurrency(procedure.totalInventoryCost || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="secondary" 
                        size="xs" 
                        onClick={() => handleViewProcedure(procedure)}
                        className="mr-2"
                      >
                        <FaEye className="mr-1" /> View
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="xs" 
                        onClick={() => handleEditProcedure(procedure)}
                        className="mr-2"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="danger" 
                        size="xs" 
                        onClick={() => handleConfirmDelete(procedure._id)}
                      >
                        <FaTrash className="mr-1" /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                  <span className="font-medium">{pagination.pages}</span> pages
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    variant="link"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  {[...Array(pagination.pages).keys()].map((page) => (
                    <Button
                      key={page + 1}
                      variant={pagination.page === page + 1 ? 'primary' : 'link'}
                      onClick={() => handlePageChange(page + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        pagination.page === page + 1
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                      } text-sm font-medium`}
                    >
                      {page + 1}
                    </Button>
                  ))}
                  <Button
                    variant="link"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Procedure Form Modal */}
      <Modal
        isOpen={isProcedureFormModalOpen}
        onClose={() => {
          setIsProcedureFormModalOpen(false);
          setSelectedProcedure(null);
        }}
        title={selectedProcedure ? 'Edit Dental Procedure' : 'Add New Dental Procedure'}
        size="xl"
      >
        <DentalProcedureForm
          initialData={selectedProcedure}
          onSubmit={handleSubmitProcedure}
          onCancel={() => {
            setIsProcedureFormModalOpen(false);
            setSelectedProcedure(null);
          }}
          isLoading={isLoading}
          error={error}
          patients={patients}
          dentists={dentists}
        />
      </Modal>

      {/* Procedure Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Dental Procedure Details"
        size="lg"
      >
        <DentalProcedureDetail
          procedure={selectedProcedure}
          onEdit={handleEditProcedure}
          onDelete={handleConfirmDelete}
          onAddInventoryItems={() => {
            // Implementation for adding more inventory items to an existing procedure
            setIsDetailModalOpen(false);
            setIsProcedureFormModalOpen(true);
          }}
          onBack={() => setIsDetailModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="p-4">
          <p className="mb-4">Are you sure you want to delete this procedure? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteProcedure}
              loading={isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Inventory Usage Dashboard Modal */}
      <Modal
        isOpen={isUsageReportModalOpen}
        onClose={() => setIsUsageReportModalOpen(false)}
        title="Dental Inventory Usage Analytics"
        size="xl"
      >
        <div className="p-4">
          <InventoryUsageDashboard />
        </div>
      </Modal>

    </div>
  );
};

export default DentalProcedureManagement;
