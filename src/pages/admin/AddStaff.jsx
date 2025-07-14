import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import StaffForm from './StaffForm';
import { FaUserPlus, FaUserEdit } from 'react-icons/fa';

const AddStaff = () => {
  const navigate = useNavigate();
  
  // Get ID from route parameters
  const { id: routeId } = useParams();
  
  // Also check for ID in query parameters (for backward compatibility)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryId = queryParams.get('id');
  
  // Use route ID if available, otherwise fall back to query ID
  const staffId = routeId || queryId;
  
  // If we have a query ID but not a route ID, redirect to the proper route
  useEffect(() => {
    if (queryId && !routeId) {
      console.log(`Redirecting from query parameter to route parameter: /admin/staff/${queryId}/edit`);
      navigate(`/admin/staff/${queryId}/edit`, { replace: true });
    }
  }, [queryId, routeId, navigate]);
  
  const isEditMode = Boolean(staffId);
  
  return (
    <div className="p-4">
      <Card>

        <StaffForm staffId={staffId} />
      </Card>
    </div>
  );
};

export default AddStaff;
