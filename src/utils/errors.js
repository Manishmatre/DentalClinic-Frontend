export class SubscriptionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

export class ResourceLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ResourceLimitError';
  }
}

export class FeatureAccessError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FeatureAccessError';
  }
}

export class PaymentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PaymentError';
  }
}

// Helper function to format error messages for display
export const formatErrorMessage = (error) => {
  if (error instanceof SubscriptionError) {
    return {
      title: 'Subscription Required',
      message: error.message,
      action: 'Upgrade'
    };
  }

  if (error instanceof ResourceLimitError) {
    return {
      title: 'Resource Limit Reached',
      message: error.message,
      action: 'Upgrade'
    };
  }

  if (error instanceof FeatureAccessError) {
    return {
      title: 'Feature Not Available',
      message: error.message,
      action: 'Upgrade'
    };
  }

  if (error instanceof PaymentError) {
    return {
      title: 'Payment Error',
      message: error.message,
      action: 'Update Payment'
    };
  }

  // Default error format
  return {
    title: 'Error',
    message: error.message || 'An unexpected error occurred',
    action: 'Try Again'
  };
};