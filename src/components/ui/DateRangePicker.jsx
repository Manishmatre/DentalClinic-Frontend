import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';

const DateRangePicker = ({
  label,
  startDate,
  endDate,
  onChange,
  isClearable = false,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStartDateChange = (date) => {
    onChange({
      startDate: date,
      endDate: endDate
    });
  };

  const handleEndDateChange = (date) => {
    onChange({
      startDate: startDate,
      endDate: date
    });
  };

  const handleClear = () => {
    onChange({
      startDate: null,
      endDate: null
    });
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholderText="Start date"
            dateFormat="MMM d, yyyy"
            onCalendarOpen={() => setIsOpen(true)}
            onCalendarClose={() => setIsOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FaCalendarAlt className="text-gray-400" />
          </div>
        </div>
        <div className="relative flex-1">
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholderText="End date"
            dateFormat="MMM d, yyyy"
            onCalendarOpen={() => setIsOpen(true)}
            onCalendarClose={() => setIsOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FaCalendarAlt className="text-gray-400" />
          </div>
        </div>
        {isClearable && (startDate || endDate) && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaTimes className="mr-1" />
            Clear
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DateRangePicker;
