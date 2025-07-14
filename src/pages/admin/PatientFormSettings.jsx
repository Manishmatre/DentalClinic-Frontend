import React from 'react';

const PatientFormSettings = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Patient Form Settings</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Registration Form Fields</h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize which fields are required, optional, or hidden in the patient registration form.
        </p>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Field Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Display Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: 'First Name', status: 'required', order: 1 },
                { name: 'Last Name', status: 'required', order: 2 },
                { name: 'Date of Birth', status: 'required', order: 3 },
                { name: 'Gender', status: 'required', order: 4 },
                { name: 'Email Address', status: 'required', order: 5 },
                { name: 'Phone Number', status: 'required', order: 6 },
                { name: 'Address', status: 'required', order: 7 },
                { name: 'City', status: 'required', order: 8 },
                { name: 'State/Province', status: 'required', order: 9 },
                { name: 'Postal Code', status: 'required', order: 10 },
                { name: 'Country', status: 'required', order: 11 },
                { name: 'Emergency Contact', status: 'optional', order: 12 },
                { name: 'Insurance Provider', status: 'optional', order: 13 },
                { name: 'Insurance ID', status: 'optional', order: 14 },
                { name: 'Preferred Language', status: 'optional', order: 15 },
                { name: 'Occupation', status: 'hidden', order: 16 },
                { name: 'Employer', status: 'hidden', order: 17 },
              ].map((field, index) => (
                <tr key={field.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{field.name}</td>
                  <td className="px-4 py-3">
                    <select className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                      <option value="required" selected={field.status === 'required'}>Required</option>
                      <option value="optional" selected={field.status === 'optional'}>Optional</option>
                      <option value="hidden" selected={field.status === 'hidden'}>Hidden</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="number" 
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      value={field.order}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Custom Form Fields</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add custom fields to collect additional information from patients.
        </p>
        
        <div className="mb-4">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            Add Custom Field
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Field Label</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Field Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Required</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-white">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Allergies</td>
                <td className="px-4 py-3 text-sm text-gray-700">Text Area</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" checked />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Previous Dental Work</td>
                <td className="px-4 py-3 text-sm text-gray-700">Text Area</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">How did you hear about us?</td>
                <td className="px-4 py-3 text-sm text-gray-700">Dropdown</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Consent Forms</h3>
        <p className="text-sm text-gray-600 mb-4">
          Manage consent forms that patients must agree to during registration.
        </p>
        
        <div className="mb-4">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            Add Consent Form
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Form Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Required</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Last Updated</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-white">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Privacy Policy</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" checked />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">Jan 15, 2025</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Treatment Consent</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" checked />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">Feb 3, 2025</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          type="button"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Save Form Settings
        </button>
      </div>
    </div>
  );
};

export default PatientFormSettings;
