import React from 'react';

const StaffAccessSettings = () => {
  const [activeRole, setActiveRole] = useState('Administrator');
  const [permissions, setPermissions] = useState({
    Administrator: {
      Dashboard: 'full',
      'Patient Management': 'full',
      'Appointment Management': 'full',
      'Staff Management': 'full',
      'Billing & Invoices': 'full',
      'Inventory Management': 'full',
      Reports: 'full',
      'Clinic Settings': 'full',
      'Audit Logs': 'full'
    },
    Doctor: {
      Dashboard: 'read_only',
      'Patient Management': 'full',
      'Appointment Management': 'full',
      'Staff Management': 'no_access',
      'Billing & Invoices': 'read_only',
      'Inventory Management': 'read_only',
      Reports: 'read_only',
      'Clinic Settings': 'no_access',
      'Audit Logs': 'read_only'
    },
    Receptionist: {
      Dashboard: 'read_only',
      'Patient Management': 'full',
      'Appointment Management': 'full',
      'Staff Management': 'no_access',
      'Billing & Invoices': 'read_only',
      'Inventory Management': 'no_access',
      Reports: 'read_only',
      'Clinic Settings': 'no_access',
      'Audit Logs': 'no_access'
    },
    Nurse: {
      Dashboard: 'read_only',
      'Patient Management': 'read_only',
      'Appointment Management': 'read_only',
      'Staff Management': 'no_access',
      'Billing & Invoices': 'no_access',
      'Inventory Management': 'no_access',
      Reports: 'read_only',
      'Clinic Settings': 'no_access',
      'Audit Logs': 'no_access'
    },
    'Billing Staff': {
      Dashboard: 'read_only',
      'Patient Management': 'read_only',
      'Appointment Management': 'no_access',
      'Staff Management': 'no_access',
      'Billing & Invoices': 'full',
      'Inventory Management': 'no_access',
      Reports: 'read_only',
      'Clinic Settings': 'no_access',
      'Audit Logs': 'no_access'
    }
  });

  const handleRoleChange = (role) => {
    setActiveRole(role);
  };

  const handlePermissionChange = (module, access) => {
    setPermissions(prev => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [module]: access
      }
    }));
  };
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Staff Access Control</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Role Permissions</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure access permissions for each staff role in your clinic.
        </p>
        
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            {Object.keys(permissions).map((role) => (
              <button
                key={role}
                className={`py-2 px-4 font-medium text-sm ${
                  role === activeRole 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500'
                }`}
                onClick={() => handleRoleChange(role)}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50 w-1/3">Feature / Module</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Access Level</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(permissions[activeRole]).map(([module, access], index) => (
                <tr key={module} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{module}</td>
                  <td className="px-4 py-3">
                    <select
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      value={permissions[activeRole][module]}
                      onChange={(e) => handlePermissionChange(module, e.target.value)}
                    >
                      <option value="no_access">No Access</option>
                      <option value="read_only">Read Only</option>
                      <option value="limited">Limited Access</option>
                      <option value="full">Full Access</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {module === 'Dashboard' && 'View clinic analytics and performance metrics'}
                    {module === 'Patient Management' && 'Add, edit, and delete patient records'}
                    {module === 'Appointment Management' && 'Schedule, reschedule, and cancel appointments'}
                    {module === 'Staff Management' && 'Add, edit, and delete staff accounts'}
                    {module === 'Billing & Invoices' && 'Create invoices, process payments, and manage billing'}
                    {module === 'Inventory Management' && 'Manage dental supplies and equipment inventory'}
                    {module === 'Reports' && 'Generate and view financial and operational reports'}
                    {module === 'Clinic Settings' && 'Configure clinic-wide settings and preferences'}
                    {module === 'Audit Logs' && 'View system activity and user action logs'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Security Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Policy
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="basic">Basic (8+ characters)</option>
              <option value="standard" selected>Standard (8+ chars, 1 uppercase, 1 number)</option>
              <option value="strong">Strong (10+ chars, uppercase, number, symbol)</option>
              <option value="custom">Custom Policy</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Expiry
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="never">Never</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90" selected>90 days</option>
              <option value="180">180 days</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Lockout Threshold
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="3">3 failed attempts</option>
              <option value="5" selected>5 failed attempts</option>
              <option value="10">10 failed attempts</option>
              <option value="0">Never lock accounts</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Timeout
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="15">15 minutes</option>
              <option value="30" selected>30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
              <option value="0">Never timeout</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="two_factor_auth" 
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              checked 
            />
            <label htmlFor="two_factor_auth" className="ml-2 text-sm text-gray-700">
              Enable Two-Factor Authentication for all staff
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="ip_restriction" 
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="ip_restriction" className="ml-2 text-sm text-gray-700">
              Restrict access to specific IP addresses
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="audit_logging" 
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              checked 
            />
            <label htmlFor="audit_logging" className="ml-2 text-sm text-gray-700">
              Enable detailed audit logging
            </label>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          type="button"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Save Access Settings
        </button>
      </div>
    </div>
  );
};

export default StaffAccessSettings;
