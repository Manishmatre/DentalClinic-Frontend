import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const NoClinic = () => {
  const { logout } = useAuth();

  const handleContactSupport = () => {
    // TODO: Implement contact support functionality
    window.location.href = 'mailto:support@dentalclinic.com';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            No Clinic Association
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your account is not associated with any dental clinic.
          </p>
        </div>

        <div className="mt-8">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Access Restricted
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This could happen because:
                  </p>
                  <ul className="list-disc list-inside mt-1">
                    <li>You haven't been assigned to a clinic yet</li>
                    <li>Your clinic association was removed</li>
                    <li>There was an error with your account setup</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col space-y-4">
            <button
              onClick={handleContactSupport}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Contact Support
            </button>
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

export default NoClinic;