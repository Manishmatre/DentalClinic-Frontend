import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useResourceLimits } from './useResourceLimits';
import clinicService from '../api/clinic/clinicService';

export const useFeatureAccess = () => {
  const { clinic } = useAuth();
  const { hasFeature, getUpgradeMessage, getRequiredPlan } = useResourceLimits();
  const navigate = useNavigate();

  const checkFeatureAccess = useCallback((featureName) => {
    if (!clinic) {
      return {
        hasAccess: false,
        message: 'Please log in to access this feature.',
        requiredPlan: null
      };
    }

    if (clinic.subscription?.status !== 'active') {
      return {
        hasAccess: false,
        message: 'Your subscription is not active. Please update your subscription to continue.',
        requiredPlan: clinic.subscriptionPlan
      };
    }

    const canAccess = hasFeature(featureName);
    const message = canAccess ? null : getUpgradeMessage(featureName);
    const requiredPlan = canAccess ? null : getRequiredPlan(featureName);

    return {
      hasAccess: canAccess,
      message,
      requiredPlan
    };
  }, [clinic, hasFeature, getUpgradeMessage, getRequiredPlan]);

  const withFeatureAccess = useCallback((featureName, callback) => {
    const { hasAccess, message, requiredPlan } = checkFeatureAccess(featureName);

    if (!hasAccess) {
      navigate('/admin/clinic-settings', {
        state: {
          message,
          requiresUpgrade: true,
          requiredPlan,
          feature: featureName
        }
      });
      return false;
    }

    return callback();
  }, [checkFeatureAccess, navigate]);

  const FeatureGuard = useCallback(({ feature, children }) => {
    const { hasAccess, message, requiredPlan } = checkFeatureAccess(feature);

    if (!hasAccess) {
      navigate('/admin/clinic-settings', {
        state: {
          message,
          requiresUpgrade: true,
          requiredPlan,
          feature
        }
      });
      return null;
    }

    return children;
  }, [checkFeatureAccess, navigate]);

  return {
    checkFeatureAccess,
    withFeatureAccess,
    FeatureGuard
  };
};

export default useFeatureAccess;