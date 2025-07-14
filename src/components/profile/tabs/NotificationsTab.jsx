import React from 'react';
import { 
  FaBell, 
  FaEnvelope, 
  FaMobile, 
  FaDesktop, 
  FaCalendarAlt, 
  FaUserMd, 
  FaFileInvoiceDollar,
  FaClipboardCheck,
  FaInfoCircle
} from 'react-icons/fa';

/**
 * Notifications Tab Component
 * Allows users to manage their notification preferences
 */
const NotificationsTab = ({ formData, isEditing, handleInputChange }) => {
  // Initialize notification preferences if they don't exist
  const notificationPrefs = formData.notificationPreferences || {
    email: {
      appointments: true,
      reminders: true,
      billing: true,
      marketing: false,
      systemUpdates: true
    },
    sms: {
      appointments: true,
      reminders: true,
      billing: false,
      marketing: false,
      systemUpdates: false
    },
    push: {
      appointments: true,
      reminders: true,
      billing: true,
      marketing: false,
      systemUpdates: true
    }
  };
  
  // Update notification preference
  const updateNotificationPref = (channel, category, value) => {
    const updatedPrefs = { ...notificationPrefs };
    updatedPrefs[channel][category] = value;
    
    handleInputChange({
      target: {
        name: 'notificationPreferences',
        value: updatedPrefs
      }
    });
  };
  
  // Get notification category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'appointments':
        return <FaCalendarAlt className="text-blue-500" />;
      case 'reminders':
        return <FaClipboardCheck className="text-green-500" />;
      case 'billing':
        return <FaFileInvoiceDollar className="text-red-500" />;
      case 'marketing':
        return <FaUserMd className="text-purple-500" />;
      case 'systemUpdates':
        return <FaInfoCircle className="text-gray-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };
  
  // Get channel icon
  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email':
        return <FaEnvelope className="text-blue-600" />;
      case 'sms':
        return <FaMobile className="text-green-600" />;
      case 'push':
        return <FaDesktop className="text-purple-600" />;
      default:
        return <FaBell className="text-gray-600" />;
    }
  };
  
  // Format category name for display
  const formatCategoryName = (category) => {
    switch (category) {
      case 'appointments':
        return 'Appointment Updates';
      case 'reminders':
        return 'Appointment Reminders';
      case 'billing':
        return 'Billing & Payments';
      case 'marketing':
        return 'Marketing & Promotions';
      case 'systemUpdates':
        return 'System Updates';
      default:
        return category;
    }
  };
  
  // Format channel name for display
  const formatChannelName = (channel) => {
    switch (channel) {
      case 'email':
        return 'Email Notifications';
      case 'sms':
        return 'SMS Text Messages';
      case 'push':
        return 'Push Notifications';
      default:
        return channel;
    }
  };
  
  // Get channel description
  const getChannelDescription = (channel) => {
    switch (channel) {
      case 'email':
        return 'Notifications sent to your email address';
      case 'sms':
        return 'Text messages sent to your mobile phone';
      case 'push':
        return 'Notifications sent to your browser or mobile app';
      default:
        return '';
    }
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Preferences</h3>
        <p className="text-sm text-gray-500 mb-6">
          Manage how and when you receive notifications from the clinic management system.
        </p>
        
        {Object.entries(notificationPrefs).map(([channel, categories]) => (
          <div key={channel} className="mb-8">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
                {getChannelIcon(channel)}
              </div>
              <div className="ml-4">
                <h4 className="text-base font-medium text-gray-900">{formatChannelName(channel)}</h4>
                <p className="text-sm text-gray-500">{getChannelDescription(channel)}</p>
              </div>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {Object.entries(categories).map(([category, enabled]) => (
                  <li key={category}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {getCategoryIcon(category)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{formatCategoryName(category)}</p>
                          </div>
                        </div>
                        <div>
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => updateNotificationPref(channel, category, e.target.checked)}
                              disabled={!isEditing}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Schedule</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="appointmentReminderTime" className="block text-sm font-medium text-gray-700">
              Appointment Reminder Time
            </label>
            <div className="mt-1">
              <select
                id="appointmentReminderTime"
                name="appointmentReminderTime"
                value={formData.appointmentReminderTime || '24'}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">1 hour before</option>
                <option value="2">2 hours before</option>
                <option value="4">4 hours before</option>
                <option value="12">12 hours before</option>
                <option value="24">24 hours before</option>
                <option value="48">2 days before</option>
                <option value="72">3 days before</option>
              </select>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              When should we send you appointment reminders?
            </p>
          </div>
          
          <div>
            <label htmlFor="quietHoursStart" className="block text-sm font-medium text-gray-700">
              Quiet Hours Start
            </label>
            <div className="mt-1">
              <input
                type="time"
                id="quietHoursStart"
                name="quietHoursStart"
                value={formData.quietHoursStart || '22:00'}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="quietHoursEnd" className="block text-sm font-medium text-gray-700">
              Quiet Hours End
            </label>
            <div className="mt-1">
              <input
                type="time"
                id="quietHoursEnd"
                name="quietHoursEnd"
                value={formData.quietHoursEnd || '08:00'}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              We won't send SMS or push notifications during quiet hours.
            </p>
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Subscription</h3>
        
        <div className="space-y-4">
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="newsletterSubscription"
                name="newsletterSubscription"
                type="checkbox"
                checked={formData.newsletterSubscription || false}
                onChange={(e) => handleInputChange({
                  target: {
                    name: 'newsletterSubscription',
                    value: e.target.checked
                  }
                })}
                disabled={!isEditing}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="newsletterSubscription" className="font-medium text-gray-700">
                Newsletter Subscription
              </label>
              <p className="text-gray-500">
                Receive monthly newsletters with health tips, clinic updates, and special offers.
              </p>
            </div>
          </div>
          
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="healthTipsSubscription"
                name="healthTipsSubscription"
                type="checkbox"
                checked={formData.healthTipsSubscription || false}
                onChange={(e) => handleInputChange({
                  target: {
                    name: 'healthTipsSubscription',
                    value: e.target.checked
                  }
                })}
                disabled={!isEditing}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="healthTipsSubscription" className="font-medium text-gray-700">
                Health Tips & Advice
              </label>
              <p className="text-gray-500">
                Receive personalized health tips and medical advice based on your profile.
              </p>
            </div>
          </div>
          
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="appointmentDigest"
                name="appointmentDigest"
                type="checkbox"
                checked={formData.appointmentDigest || false}
                onChange={(e) => handleInputChange({
                  target: {
                    name: 'appointmentDigest',
                    value: e.target.checked
                  }
                })}
                disabled={!isEditing}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="appointmentDigest" className="font-medium text-gray-700">
                Weekly Appointment Digest
              </label>
              <p className="text-gray-500">
                Receive a weekly summary of your upcoming appointments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
