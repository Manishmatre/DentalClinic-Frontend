import React from 'react';
import { Navigate } from 'react-router-dom';

// This component is now deprecated and redirects to the new PatientAppointments component
const PatientAppointmentManagement = ({ view = 'upcoming' }) => {
  // Determine which route to redirect to based on the view prop
  let redirectPath = '/patient/appointments';
  
  if (view === 'book') {
    redirectPath = '/patient/appointments/book';
  } else if (view === 'history') {
    redirectPath = '/patient/appointments/history';
  }
  
  // Redirect to the appropriate route
  return <Navigate to={redirectPath} replace />;
};

export default PatientAppointmentManagement;
