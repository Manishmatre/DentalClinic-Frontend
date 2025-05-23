import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaUserMd,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaUser,
  FaPrint
} from 'react-icons/fa';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StaffDetailsModal from '../../components/staff/StaffDetailsModal';
import staffService from '../../api/staff/staffService';

const StaffDirectory = () => {
  // State management
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    department: '',
    status: 'Active',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Fetch staff on component mount and when dependencies change
  useEffect(() => {
    fetchStaff();
  }, [search, filters]);

  // Fetch staff from API
  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await staffService.getStaff({
        search,
        ...filters
      });
      
      if (response && response.data) {
        setStaff(response.data);
        setError(null);
      } else {
        console.warn('Unexpected API response format:', response);
        setStaff(Array.isArray(response) ? response : []);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(err.response?.data?.message || 'Failed to load staff members');
      setStaff([]);
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

  // Open modal to view staff details
  const handleViewDetails = (staff) => {
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Staff Directory</h1>
      
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}
      
      <Card>
        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-wrap justify-between items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="w-full md:w-auto flex">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search staff..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                >
                  <FaSearch />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <FaFilter />
              </button>
            </form>
            
            <Button
              onClick={handlePrint}
              icon={<FaPrint />}
              variant="outline"
              size="sm"
            >
              Print Directory
            </Button>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Roles</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Staff">Staff</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Lab Technician">Lab Technician</option>
                    <option value="Pharmacist">Pharmacist</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Departments</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Administration">Administration</option>
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Staff List Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No staff members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((staffMember) => (
                    <tr key={staffMember._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {staffMember.role === 'Doctor' ? (
                              <FaUserMd className="text-blue-500" />
                            ) : (
                              <FaUser className="text-blue-500" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {staffMember.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {staffMember.specialization || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(staffMember.role)}`}>
                          {staffMember.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaBuilding className="text-gray-400 mr-2" />
                          {staffMember.department || 'Not assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FaEnvelope className="text-gray-400 mr-2" />
                          {staffMember.email}
                        </div>
                        {staffMember.phone && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <FaPhone className="text-gray-400 mr-2" />
                            {staffMember.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => handleViewDetails(staffMember)}
                          variant="outline"
                          size="sm"
                          icon={<FaEye />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
      
      {/* Staff Details Modal */}
      <StaffDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        staff={selectedStaff}
        onEdit={() => {}} // Read-only for receptionists
      />
    </div>
  );
};

export default StaffDirectory;
