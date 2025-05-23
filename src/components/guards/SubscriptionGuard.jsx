import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUpgradeMessage } from '../../utils/subscriptionUtils';

const SubscriptionGuard = ({ children, requiredPlan }) => {
  const { clinic } = useAuth();
  const location = useLocation();

  if (!clinic) {
    return <Navigate to="/login" />;
  }

  // Check if the clinic's subscription plan meets the requirements
  const plans = ['Free', 'Pro', 'Enterprise'];
  const currentPlanIndex = plans.indexOf(clinic.subscriptionPlan);
  const requiredPlanIndex = plans.indexOf(requiredPlan);

  if (currentPlanIndex < requiredPlanIndex || clinic.subscription?.status !== 'active') {
    const message = getUpgradeMessage(clinic.subscriptionPlan, requiredPlan);
    
    // Redirect to clinic settings with upgrade message
    return (
      <Navigate
        to="/admin/clinic-settings"
        state={{
          from: location.pathname,
          message,
          requiresUpgrade: true,
          requiredPlan
        }}
      />
    );
  }

  return children;
};

export default SubscriptionGuard;