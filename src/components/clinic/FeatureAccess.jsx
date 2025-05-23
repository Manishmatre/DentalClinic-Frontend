import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import clinicService from '../../api/clinic/clinicService';
import Alert from '../ui/Alert';

const FeatureAccess = ({ feature, children, fallback }) => {
  const { clinic } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (!clinic?._id) {
          setHasAccess(false);
          return;
        }

        const { hasAccess } = await clinicService.checkFeatureAccess(clinic._id, feature);
        setHasAccess(hasAccess);
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [clinic?._id, feature]);

  if (isLoading) {
    return null;
  }

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }
    return (
      <Alert
        variant="warning"
        title="Feature Not Available"
        message="This feature is not available in your current subscription plan. Please upgrade to access this feature."
      />
    );
  }

  return children;
};

export default FeatureAccess;