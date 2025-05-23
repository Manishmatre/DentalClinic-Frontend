import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useResourceLimits } from '../../hooks/useResourceLimits';
import Card from '../ui/Card';

const SubscriptionStatus = () => {
  const { clinic } = useAuth();
  const { limits } = useResourceLimits();

  const daysUntilExpiry = () => {
    if (!clinic?.subscription?.endDate) return 0;
    const endDate = new Date(clinic.subscription.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const renderUsageBar = (current, max) => {
    const percentage = Math.min((current / max) * 100, 100);
    const getBarColor = () => {
      if (percentage >= 90) return 'bg-red-600';
      if (percentage >= 70) return 'bg-yellow-600';
      return 'bg-green-600';
    };

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${getBarColor()} h-2 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  if (!clinic) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Subscription Status
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            getStatusColor(clinic.subscription?.status)
          }`}>
            {clinic.subscriptionPlan} Plan
          </span>
        </div>

        <div className="space-y-6">
          {/* Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {clinic.subscription?.status.charAt(0).toUpperCase() + 
                 clinic.subscription?.status.slice(1)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Next Payment
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {clinic.subscription?.endDate
                  ? new Date(clinic.subscription.endDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Days Until Expiry
              </label>
              <p className={`mt-1 text-sm ${
                daysUntilExpiry() <= 5 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {daysUntilExpiry()} days
              </p>
            </div>
          </div>

          {/* Resource Usage */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Resource Usage</h4>
            
            <div className="space-y-3">
              {/* Doctors Usage */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Doctors</span>
                  <span>{limits?.doctors?.current || 0}/{limits?.doctors?.max || 0}</span>
                </div>
                {renderUsageBar(
                  limits?.doctors?.current || 0,
                  limits?.doctors?.max || 1
                )}
              </div>

              {/* Patients Usage */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Patients</span>
                  <span>{limits?.patients?.current || 0}/{limits?.patients?.max || 0}</span>
                </div>
                {renderUsageBar(
                  limits?.patients?.current || 0,
                  limits?.patients?.max || 1
                )}
              </div>
            </div>
          </div>

          {/* Available Features */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Available Features
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {clinic.features?.allowedModules.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center space-x-2 text-sm text-gray-600"
                >
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature.charAt(0).toUpperCase() + feature.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Message for Near Expiry */}
          {daysUntilExpiry() <= 5 && clinic.subscription?.status === 'active' && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Subscription Expiring Soon
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Your subscription will expire in {daysUntilExpiry()} days. 
                      Please renew to avoid service interruption.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SubscriptionStatus;