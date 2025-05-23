import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useResourceLimits } from '../../hooks/useResourceLimits';
import clinicService from '../../api/clinic/clinicService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const SubscriptionPlans = {
  Free: {
    price: 0,
    features: [
      '1 Doctor',
      '100 Patients',
      'Basic Appointments',
      'Basic Billing'
    ]
  },
  Pro: {
    price: 49.99,
    features: [
      '5 Doctors',
      '500 Patients',
      'Advanced Appointments',
      'Inventory Management',
      'Advanced Reports',
      'Priority Support'
    ]
  },
  Enterprise: {
    price: 199.99,
    features: [
      'Unlimited Doctors',
      'Unlimited Patients',
      'All Pro Features',
      'Custom Branding',
      'Dedicated Support',
      'API Access'
    ]
  }
};

const ClinicSettings = ({ clinic }) => {
  const navigate = useNavigate();
  const { limits } = useResourceLimits();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [settings, setSettings] = useState({
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    workingDays: [],
    appointmentDuration: 30,
    timezone: 'UTC',
    currency: 'USD'
  });

  useEffect(() => {
    if (clinic?.settings) {
      setSettings(clinic.settings);
    }
  }, [clinic]);

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleWorkingDaysChange = (day) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const handleUpgrade = async (plan) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await clinicService.updateClinicSubscription(clinic._id, { plan });
      
      setSuccess(`Successfully upgraded to ${plan} plan`);
      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upgrade subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await clinicService.updateClinicSettings(clinic._id, { settings });
      
      setSuccess('Settings updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert 
          variant="error" 
          title="Error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {success && (
        <Alert 
          variant="success" 
          title="Success" 
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}

      {/* Subscription Plans */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(SubscriptionPlans).map(([plan, details]) => (
            <Card key={plan}>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{plan}</h3>
                <p className="mt-2 text-sm text-gray-500">
                  ${details.price}/month
                </p>
                <ul className="mt-4 space-y-2">
                  {details.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  disabled={isLoading || clinic?.subscriptionPlan === plan}
                  onClick={() => handleUpgrade(plan)}
                >
                  {clinic?.subscriptionPlan === plan ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Clinic Settings */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Clinic Settings</h2>
        <Card>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Opening Time
                </label>
                <input
                  type="time"
                  name="workingHours.start"
                  value={settings.workingHours.start}
                  onChange={handleSettingsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Closing Time
                </label>
                <input
                  type="time"
                  name="workingHours.end"
                  value={settings.workingHours.end}
                  onChange={handleSettingsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Days
              </label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleWorkingDaysChange(day)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      settings.workingDays.includes(day)
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Appointment Duration (minutes)
                </label>
                <select
                  name="appointmentDuration"
                  value={settings.appointmentDuration}
                  onChange={handleSettingsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleSettingsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleSettingsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSettingsSave}
                disabled={isLoading}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClinicSettings;