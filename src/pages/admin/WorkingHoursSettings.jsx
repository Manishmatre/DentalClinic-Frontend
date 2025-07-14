import React from 'react';

const WorkingHoursSettings = () => {
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Working Hours & Holidays</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Regular Working Hours</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Day</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Opening Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Closing Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Lunch Break</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {daysOfWeek.map((day, index) => (
                <tr key={day} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{day}</td>
                  <td className="px-4 py-3">
                    <select className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                      <option value="open">Open</option>
                      <option value="closed" selected={day === 'Sunday'}>Closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" disabled={day === 'Sunday'}>
                      {timeSlots.slice(0, 8).map(time => (
                        <option key={`open-${time}`} value={time} selected={time === '9:00 AM'}>{time}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" disabled={day === 'Sunday'}>
                      {timeSlots.slice(4).map(time => (
                        <option key={`close-${time}`} value={time} selected={time === '5:00 PM'}>{time}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" checked={day !== 'Sunday'} disabled={day === 'Sunday'} />
                      <span className="text-sm text-gray-500">1:00 PM - 2:00 PM</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Holiday Calendar</h3>
        
        <div className="mb-4">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            Add New Holiday
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Holiday Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Recurring</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="bg-white">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">New Year's Day</td>
                <td className="px-4 py-3 text-sm text-gray-700">January 1, 2025</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" checked />
                    <span className="ml-2">Yearly</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Independence Day</td>
                <td className="px-4 py-3 text-sm text-gray-700">July 4, 2025</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" checked />
                    <span className="ml-2">Yearly</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Christmas Day</td>
                <td className="px-4 py-3 text-sm text-gray-700">December 25, 2025</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" checked />
                    <span className="ml-2">Yearly</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          type="button"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Save Working Hours & Holidays
        </button>
      </div>
    </div>
  );
};

export default WorkingHoursSettings;
