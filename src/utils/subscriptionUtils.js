import { SubscriptionError, ResourceLimitError, FeatureAccessError } from './errors';

export const checkSubscriptionAccess = async (clinic, feature) => {
  if (!clinic) {
    throw new SubscriptionError('No clinic found');
  }

  if (clinic.subscription.status !== 'active') {
    throw new SubscriptionError('Subscription is not active');
  }

  if (new Date(clinic.subscription.endDate) < new Date()) {
    throw new SubscriptionError('Subscription has expired');
  }

  if (feature && !clinic.features.allowedModules.includes(feature)) {
    throw new FeatureAccessError(`Feature '${feature}' is not available in your current plan`);
  }

  return true;
};

export const checkResourceLimit = (clinic, resourceType, currentCount) => {
  if (!clinic) {
    throw new ResourceLimitError('No clinic found');
  }

  const limits = {
    doctors: clinic.features.maxDoctors,
    patients: clinic.features.maxPatients
  };

  const limit = limits[resourceType];
  if (limit === undefined) {
    throw new ResourceLimitError(`Invalid resource type: ${resourceType}`);
  }

  if (currentCount >= limit) {
    throw new ResourceLimitError(
      `You have reached the maximum limit of ${limit} ${resourceType} for your subscription plan`
    );
  }

  return true;
};

export const getUpgradeMessage = (currentPlan, requiredPlan) => {
  const plans = ['Free', 'Pro', 'Enterprise'];
  const currentIndex = plans.indexOf(currentPlan);
  const requiredIndex = plans.indexOf(requiredPlan);

  if (currentIndex < requiredIndex) {
    return `This feature requires the ${requiredPlan} plan. Please upgrade your subscription to access this feature.`;
  }

  return null;
};