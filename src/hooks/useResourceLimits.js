import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const planLimits = {
  Free: {
    doctors: 1,
    patients: 100,
    features: ['appointments', 'basic-billing']
  },
  Pro: {
    doctors: 5,
    patients: 500,
    features: ['appointments', 'billing', 'inventory', 'reports']
  },
  Enterprise: {
    doctors: Infinity,
    patients: Infinity,
    features: ['appointments', 'billing', 'inventory', 'reports', 'api-access', 'custom-branding']
  }
};

export const useResourceLimits = () => {
  const { clinic } = useAuth();
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const calculateLimits = async () => {
      try {
        if (!clinic) {
          setLimits(null);
          return;
        }

        const currentPlan = clinic.subscriptionPlan || 'Free';
        const planLimit = planLimits[currentPlan];

        // Calculate current usage
        const limits = {
          doctors: {
            current: clinic.doctors?.length || 0,
            max: planLimit.doctors,
            available: Math.max(0, planLimit.doctors - (clinic.doctors?.length || 0))
          },
          patients: {
            current: clinic.patients?.length || 0,
            max: planLimit.patients,
            available: Math.max(0, planLimit.patients - (clinic.patients?.length || 0))
          },
          features: planLimit.features
        };

        setLimits(limits);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    calculateLimits();
  }, [clinic]);

  const checkLimit = (resourceType, increment = 1) => {
    if (!limits) return false;

    const resource = limits[resourceType];
    if (!resource) return false;

    return (resource.current + increment) <= resource.max;
  };

  const hasFeature = (featureName) => {
    if (!limits?.features) return false;
    return limits.features.includes(featureName);
  };

  const getRequiredPlan = (feature) => {
    for (const [plan, config] of Object.entries(planLimits)) {
      if (config.features.includes(feature)) {
        return plan;
      }
    }
    return 'Enterprise';
  };

  const getUpgradeMessage = (feature) => {
    const requiredPlan = getRequiredPlan(feature);
    if (!clinic || !clinic.subscriptionPlan) return null;
    
    const plans = ['Free', 'Pro', 'Enterprise'];
    const currentIndex = plans.indexOf(clinic.subscriptionPlan);
    const requiredIndex = plans.indexOf(requiredPlan);

    if (currentIndex < requiredIndex) {
      return `This feature requires the ${requiredPlan} plan. Please upgrade your subscription to access this feature.`;
    }

    return null;
  };

  return {
    limits,
    loading,
    error,
    checkLimit,
    hasFeature,
    getRequiredPlan,
    getUpgradeMessage
  };
};

export default useResourceLimits;