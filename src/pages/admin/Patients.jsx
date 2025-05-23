import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import patientService from '../../api/patients/patientService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    sortBy: 'name',
    sortOrder: 'asc',
    dateRange: 'all'
  });
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchPatients();
  }, [currentPage, search, filters]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await patientService.getPatients({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search,
        ...filters
      });
      setPatients(response.data);
      setTotalPages(Math.ceil(response.pagination.total / ITEMS_PER_PAGE));
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.response?.data?.message || 'Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleAddPatient = () => {
    navigate('/admin/patients/add');
  };

  const handleEditPatient = (patientId) => {
    navigate(`/admin/patients/edit/${patientId}`);
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      await patientService.deletePatient(patientId);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete patient');
    }
  };

  const handleViewDetails = (patientId) => {
    navigate(`/admin/patients/${patientId}`);
  };

  const renderPagination = () => {
    return (
      <div className="flex justify-center mt-4 gap-2">
        <Button
          variant="secondary"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="px-4 py-2 bg-gray-100 rounded">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="secondary"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
        <Button onClick={handleAddPatient}>Add New Patient</Button>
      </div>

      {/* Advanced Filters */}
      <Card className="mb-6">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <select
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <select
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="name">Sort by Name</option>
                <option value="createdAt">Sort by Date Added</option>
                <option value="lastVisit">Sort by Last Visit</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {patients.length === 0 ? (
              <Card>
                <div className="p-4 text-center text-gray-500">
                  No patients found
                </div>
              </Card>
            ) : (
              patients.map((patient) => (
                <Card key={patient._id}>
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-sm">{patient.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-sm">{patient.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Gender</p>
                          <p className="text-sm">{patient.gender || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Visit</p>
                          <p className="text-sm">
                            {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleViewDetails(patient._id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleEditPatient(patient._id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeletePatient(patient._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default Patients;