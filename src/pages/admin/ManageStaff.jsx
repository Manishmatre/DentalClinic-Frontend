import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import clinicService from '../../api/clinic/clinicService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ManageStaff = () => {
  const { clinic } = useAuth();
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);

  // Get clinic ID from multiple sources
  const getClinicId = useCallback(() => {
    // First try from auth context
    if (clinic && clinic._id) {
      return typeof clinic._id === 'object' ? clinic._id.toString() : clinic._id.toString();
    }
    
    // Then try from localStorage
    try {
      // Try clinicData
      const storedClinicData = localStorage.getItem('clinicData');
      if (storedClinicData) {
        const parsedClinicData = JSON.parse(storedClinicData);
        if (parsedClinicData._id) {
          return parsedClinicData._id;
        }
      }
      
      // Try userData
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        if (parsedUserData.clinicId) {
          return typeof parsedUserData.clinicId === 'object' ?
            (parsedUserData.clinicId._id || parsedUserData.clinicId.id) :
            parsedUserData.clinicId;
        }
      }
      
      // Try defaultClinicId
      return localStorage.getItem('defaultClinicId');
    } catch (e) {
      console.error('Error getting clinic ID:', e);
      return null;
    }
  }, [clinic]);

  const fetchStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const clinicId = getClinicId();
      if (!clinicId) {
        setError('No clinic ID available. Please select a clinic or log in again.');
        setStaff([]);
        return;
      }
      
      const data = await clinicService.getStaff(clinicId);
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(err.response?.data?.message || 'Failed to load staff members');
      setStaff([]);
    } finally {
      setIsLoading(false);
    }
  }, [getClinicId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleAddStaff = () => {
    setEditingStaff(null);
    setIsFormOpen(true);
    setTempPassword(null);
  };

  const handleEditStaff = (staffMember) => {
    setEditingStaff(staffMember);
    setIsFormOpen(true);
    setTempPassword(null);
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) {
      return;
    }

    try {
      await clinicService.deleteStaff(clinic._id, staffId);
      setSuccess('Staff member removed successfully');
      await fetchStaff();
    } catch (err) {
      console.error('Error deleting staff member:', err);
      setError(err.response?.data?.message || 'Failed to delete staff member');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let response;
      if (editingStaff) {
        response = await clinicService.updateStaff(clinic._id, editingStaff._id, formData);
        setSuccess('Staff member updated successfully');
      } else {
        response = await clinicService.createStaff(clinic._id, formData);
        setSuccess('Staff member created successfully');
        if (response.tempPassword) {
          setTempPassword(response.tempPassword);
        }
      }
      setIsFormOpen(false);
      setEditingStaff(null);
      await fetchStaff();
    } catch (err) {
      console.error('Error saving staff member:', err);
      setError(err.response?.data?.message || 'Failed to save staff member');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Staff Management</h1>
        <Button onClick={handleAddStaff}>
          + Add Staff Member
        </Button>
      </div>

      {error && (
        <Alert 
          variant="error" 
          title="Error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <Alert 
          variant="success" 
          title="Success" 
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {tempPassword && (
        <Alert 
          variant="info" 
          title="Temporary Password" 
          message={`Please provide this temporary password to the staff member: ${tempPassword}`}
          onClose={() => setTempPassword(null)}
        />
      )}

      <Card>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staff.map((member) => (
                  <tr key={member._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xl text-gray-600">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.specialization || member.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.role === 'Doctor'
                          ? 'bg-blue-100 text-blue-800'
                          : member.role === 'Receptionist'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mr-2"
                        onClick={() => handleEditStaff(member)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteStaff(member._id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Staff Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleFormSubmit(Object.fromEntries(formData));
              }} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={editingStaff?.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={editingStaff?.email}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    id="role"
                    name="role"
                    defaultValue={editingStaff?.role || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                    Specialization/Department
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    defaultValue={editingStaff?.specialization || editingStaff?.department}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                {editingStaff && (
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={editingStaff?.status || 'Active'}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsFormOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingStaff ? 'Save Changes' : 'Add Staff Member'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;