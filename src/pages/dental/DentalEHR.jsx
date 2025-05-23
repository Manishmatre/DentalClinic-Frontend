import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * DentalEHR component - Legacy component replaced by FixedDentalEHR
 * This component is kept for backward compatibility but redirects to the new implementation
 */
const DentalEHR = () => {
  const navigate = useNavigate();
  
  // Redirect to the current location but with the fixed component
  React.useEffect(() => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace('/dental', '/dental-fixed');
    navigate(newPath, { replace: true });
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default DentalEHR;
