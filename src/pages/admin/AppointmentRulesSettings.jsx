import React from 'react';

const AppointmentRulesSettings = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Appointment Rules</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Appointment Duration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Appointment Duration
            </label>
            <div className="flex items-center">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="15">15 minutes</option>
                <option value="30" selected>30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This will be the default duration for all appointments
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buffer Time Between Appointments
            </label>
            <div className="flex items-center">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="0">No buffer</option>
                <option value="5">5 minutes</option>
                <option value="10" selected>10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Add buffer time between appointments to prepare
            </p>
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-4">Appointment Booking Rules</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Notice for Booking
            </label>
            <div className="flex items-center">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="0">No minimum</option>
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="24" selected>24 hours</option>
                <option value="48">48 hours</option>
              </select>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Minimum time in advance for patients to book appointments
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Advance Booking
            </label>
            <div className="flex items-center">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="7">1 week</option>
                <option value="14">2 weeks</option>
                <option value="30" selected>1 month</option>
                <option value="60">2 months</option>
                <option value="90">3 months</option>
                <option value="180">6 months</option>
              </select>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              How far in advance patients can book appointments
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cancellation Policy
            </label>
            <div className="flex items-center">
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="0">Anytime</option>
                <option value="1">1 hour before</option>
                <option value="2">2 hours before</option>
                <option value="4">4 hours before</option>
                <option value="24" selected>24 hours before</option>
                <option value="48">48 hours before</option>
              </select>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Minimum notice required for cancellation without penalty
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Appointments Per Day
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="No limit"
              value="20"
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum number of appointments allowed per day (leave empty for no limit)
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Appointment Reminders</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="email_reminder" 
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              checked 
            />
            <label htmlFor="email_reminder" className="ml-2 text-sm text-gray-700">
              Send email reminders
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="sms_reminder" 
              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              checked 
            />
            <label htmlFor="sms_reminder" className="ml-2 text-sm text-gray-700">
              Send SMS reminders
            </label>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Time
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="1">1 hour before</option>
              <option value="2">2 hours before</option>
              <option value="4">4 hours before</option>
              <option value="24" selected>24 hours before</option>
              <option value="48">48 hours before</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          type="button"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Save Appointment Rules
        </button>
      </div>
    </div>
  );
};

export default AppointmentRulesSettings;
