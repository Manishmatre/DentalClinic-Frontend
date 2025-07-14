import React from 'react';

/**
 * This guard component ensures the AppointmentForm is only rendered when clinicId is available.
 * It prevents all hook violations by rendering the error UI or children, never conditionally returning from inside AppointmentForm.
 */
export default function AppointmentFormClinicGuard({ clinicId, user, clinic, propClinicId, children }) {
  if (!clinicId) {
    console.error('[AppointmentForm] No clinic ID found. Cannot fetch data.', { user, clinic, propClinicId });
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">No clinic ID found. Cannot fetch doctor/patient data. Please check your login, user profile, and clinic assignment.</span>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-gray-700">Debug Info (click to expand)</summary>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">{JSON.stringify({ user, clinic, propClinicId }, null, 2)}</pre>
        </details>
      </div>
    );
  }
  return children;
}
