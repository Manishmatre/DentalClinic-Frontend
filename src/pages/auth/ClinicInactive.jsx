import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const ClinicInactive = () => {
  const { clinic, logout } = useAuth();

  const handleContactSupport = () => {
    // TODO: Implement contact support functionality
    window.location.href = 'mailto:support@dentalclinic.com';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Clinic Account Inactive
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {clinic?.name || 'Your clinic'} is currently not active
          </p>
        </div>

        <div className="mt-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Access Suspended
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    This could be due to:
                  </p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Pending subscription payment</li>
                    <li>Account suspension</li>
                    <li>Administrative review</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-4">
              Please contact support for assistance in reactivating your clinic account.
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              onClick={handleContactSupport}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Contact Support
            </button>
            
            {clinic?.status === 'suspended' && (
              <button
                onClick={() => window.location.href = '/billing'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Update Billing Information
              </button>
            )}

            <button
              onClick={() => logout()}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicInactive;