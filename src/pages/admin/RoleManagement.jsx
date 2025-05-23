import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import roleService from '../../api/roles/roleService';
import userService from '../../api/users/userService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Checkbox from '../../components/ui/Checkbox';
import Badge from '../../components/ui/Badge';

const RoleManagement = () => {
  const { clinic } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [assignFormData, setAssignFormData] = useState({
    userId: '',
    roleId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Group permissions by category for better organization
  const permissionCategories = {
    patients: ['view_patients', 'edit_patients', 'add_patients', 'delete_patients'],
    appointments: ['view_appointments', 'schedule_appointments', 'cancel_appointments'],
    billing: ['view_invoices', 'create_invoices', 'process_payments'],
    staff: ['view_staff', 'add_staff', 'edit_staff', 'delete_staff'],
    admin: ['manage_roles', 'manage_clinic', 'view_reports', 'all']
  };

  // Fetch roles and permissions
  const fetchRolesAndPermissions = useCallback(async () => {
    if (!clinic?._id) return;

    try {
      setIsLoading(true);
      setError(null);

      const [rolesData, permissionsData] = await Promise.all([
        roleService.getRoles(clinic._id),
        roleService.getPermissions()
      ]);

      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (err) {
      console.error('Error fetching roles and permissions:', err);
      setError(err.response?.data?.message || 'Failed to load roles and permissions');

      // Fallback to default roles if API fails
      setRoles([
        { id: '1', name: 'Admin', permissions: ['all'] },
        { id: '2', name: 'Doctor', permissions: ['view_patients', 'manage_appointments', 'manage_treatments'] },
        { id: '3', name: 'Receptionist', permissions: ['manage_appointments', 'register_patients', 'manage_billing'] },
        { id: '4', name: 'Patient', permissions: ['view_own_records', 'book_appointments'] }
      ]);

      // Generate default permissions list
      const defaultPermissions = [];
      Object.entries(permissionCategories).forEach(([category, perms]) => {
        perms.forEach(perm => {
          defaultPermissions.push({
            id: perm,
            name: perm.replace(/_/g, ' '),
            category
          });
        });
      });
      setPermissions(defaultPermissions);
    } finally {
      setIsLoading(false);
    }
  }, [clinic?._id]);
  
  // Fetch users for role assignment
  const fetchUsers = useCallback(async () => {
    if (!clinic?._id) return;
    
    try {
      const usersData = await userService.getUsers(clinic._id);
      // Filter out users that are not staff or admin (e.g., patients)
      const staffUsers = usersData.filter(user => 
        user.role === 'Doctor' || 
        user.role === 'Receptionist' || 
        user.role === 'Admin' || 
        user.role === 'Staff'
      );
      setUsers(staffUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      // Don't show error for this as it's not critical
      // Set a default empty array for users
      setUsers([]);
      
      // If the backend API is not ready yet, we can use this fallback
      // for development/testing purposes
      if (process.env.NODE_ENV === 'development') {
        console.log('Using fallback user data for development');
        setUsers([
          { _id: '1', name: 'Dr. John Smith', email: 'john@example.com', role: 'Doctor' },
          { _id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'Receptionist' },
          { _id: '3', name: 'Admin User', email: 'admin@example.com', role: 'Admin' }
        ]);
      }
    }
  }, [clinic?._id]);

  useEffect(() => {
    fetchRolesAndPermissions();
    fetchUsers();
  }, [fetchRolesAndPermissions, fetchUsers]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (permissionId) => {
    setFormData(prev => {
      const permissions = [...prev.permissions];
      if (permissions.includes(permissionId)) {
        // If 'all' permission is being removed, remove it
        if (permissionId === 'all') {
          return { ...prev, permissions: permissions.filter(p => p !== permissionId) };
        }
        // Otherwise remove the specific permission
        return { ...prev, permissions: permissions.filter(p => p !== permissionId) };
      } else {
        // If 'all' permission is being added, make it the only permission
        if (permissionId === 'all') {
          return { ...prev, permissions: ['all'] };
        }
        // If adding a specific permission and 'all' is already selected, remove 'all'
        if (permissions.includes('all')) {
          return { ...prev, permissions: [permissionId] };
        }
        // Otherwise add the permission to the list
        return { ...prev, permissions: [...permissions, permissionId] };
      }
    });
  };

  // Open modal for creating/editing a role
  const openRoleModal = (role = null) => {
    if (role) {
      setCurrentRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions || []
      });
    } else {
      setCurrentRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setShowModal(true);
  };

  // Open modal for assigning roles to users
  const openAssignRoleModal = () => {
    setAssignFormData({
      userId: '',
      roleId: ''
    });
    setShowAssignModal(true);
  };

  // Handle role assignment form input changes
  const handleAssignInputChange = (e) => {
    const { name, value } = e.target;
    setAssignFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle role assignment form submission
  const handleAssignRole = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!assignFormData.userId || !assignFormData.roleId) {
        setError('Please select both a user and a role');
        setIsSubmitting(false);
        return;
      }

      // Assign role to user
      await roleService.assignRole(
        assignFormData.userId,
        assignFormData.roleId,
        clinic._id
      );

      setSuccessMessage('Role assigned successfully');

      // Close the modal after a short delay
      setTimeout(() => {
        setShowAssignModal(false);
        setSuccessMessage('');
        // Refresh users to show updated roles
        fetchUsers();
      }, 1500);
    } catch (err) {
      console.error('Error assigning role:', err);
      setError(err.response?.data?.message || 'Failed to assign role');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (currentRole) {
        // Update existing role
        await roleService.updateRole(currentRole.id, {
          ...formData,
          clinicId: clinic._id
        });
        setSuccessMessage('Role updated successfully');

        // Update the roles list
        setRoles(prev => prev.map(role =>
          role.id === currentRole.id ? { ...role, ...formData } : role
        ));
      } else {
        // Create new role
        const newRole = await roleService.createRole({
          ...formData,
          clinicId: clinic._id
        });
        setSuccessMessage('Role created successfully');

        // Add the new role to the list
        setRoles(prev => [...prev, newRole]);
      }

      // Close the modal after a short delay
      setTimeout(() => {
        setShowModal(false);
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      console.error('Error saving role:', err);
      setError(err.response?.data?.message || 'Failed to save role');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle role deletion
  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      setIsLoading(true);
      await roleService.deleteRole(roleId);

      // Remove the role from the list
      setRoles(prev => prev.filter(role => role.id !== roleId));
      setSuccessMessage('Role deleted successfully');

      // Clear success message after delay
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting role:', err);
      setError(err.response?.data?.message || 'Failed to delete role');
    } finally {
      setIsLoading(false);
    }
  };

  // Render permission checkboxes grouped by category
  const renderPermissionCheckboxes = () => {
    return Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
      <div key={category} className="mb-4">
        <h3 className="text-md font-medium text-gray-700 capitalize mb-2">{category} Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {categoryPermissions.map(permission => (
            <Checkbox
              key={permission}
              id={`permission-${permission}`}
              label={permission.replace(/_/g, ' ')}
              checked={formData.permissions.includes(permission)}
              onChange={() => handlePermissionChange(permission)}
            />
          ))}
        </div>
      </div>
    ));
  };

  if (isLoading && roles.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Role Management</h1>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => openAssignRoleModal()}>Assign Role</Button>
          <Button variant="primary" onClick={() => openRoleModal()}>Add New Role</Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert
          variant="success"
          title="Success"
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {error && (
        <Alert
          variant="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Roles List */}
      <div className="grid gap-6">
        {roles.map(role => (
          <Card key={role.id}>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                  {role.description && (
                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                  )}
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-500">Permissions:</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {role.permissions.includes('all') ? (
                        <Badge color="purple">All Permissions</Badge>
                      ) : (
                        role.permissions.map(permission => (
                          <Badge
                            key={permission}
                            color={permission.includes('delete') ? 'red' :
                              permission.includes('edit') ? 'blue' :
                              permission.includes('add') ? 'green' : 'gray'}
                          >
                            {permission.replace(/_/g, ' ')}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => openRoleModal(role)}
                  >
                    Edit
                  </Button>
                  {role.name !== 'Admin' && (
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Role Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={currentRole ? `Edit ${currentRole.name} Role` : 'Create New Role'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Role Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Description"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of this role's responsibilities"
          />

          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Permissions</h3>
            {renderPermissionCheckboxes()}
          </div>

          {error && (
            <Alert
              variant="error"
              title="Error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {successMessage && (
            <Alert
              variant="success"
              title="Success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
            />
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : currentRole ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Assignment Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Role to User"
      >
        <form onSubmit={handleAssignRole} className="space-y-4">
          {error && (
            <Alert
              variant="error"
              title="Error"
              message={error}
              onClose={() => setError(null)}
            />
          )}
          
          {successMessage && (
            <Alert
              variant="success"
              title="Success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
            <select
              name="userId"
              value={assignFormData.userId}
              onChange={handleAssignInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select User --</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email}) - Current Role: {user.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
            <select
              name="roleId"
              value={assignFormData.roleId}
              onChange={handleAssignInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Select Role --</option>
              {roles.map(role => (
                <option key={role._id || role.id} value={role._id || role.id}>
                  {role.name} - {role.description || ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Assigning...' : 'Assign Role'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoleManagement;