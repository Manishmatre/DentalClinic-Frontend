import React, { useState, useRef, useEffect } from 'react';
import { format, addDays, isValid, parse } from 'date-fns';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';

const DateRangePicker = ({ startDate, endDate, onChange, label = 'Date Range' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const dropdownRef = useRef(null);

  // Format the date range for display
  const formatDateRange = () => {
    if (!startDate && !endDate) return 'Select date range';
    
    if (startDate && !endDate) {
      return `From ${format(startDate, 'MMM dd, yyyy')}`;
    }
    
    if (!startDate && endDate) {
      return `Until ${format(endDate, 'MMM dd, yyyy')}`;
    }
    
    return `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
  };

  // Initialize date strings when dates change
  useEffect(() => {
    if (startDate) {
      setStartDateStr(format(startDate, 'yyyy-MM-dd'));
    }
    if (endDate) {
      setEndDateStr(format(endDate, 'yyyy-MM-dd'));
    }
  }, [startDate, endDate]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle start date change
  const handleStartDateChange = (e) => {
    const dateStr = e.target.value;
    setStartDateStr(dateStr);
    
    if (dateStr) {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date());
      if (isValid(date)) {
        onChange({ startDate: date, endDate });
      }
    } else {
      onChange({ startDate: null, endDate });
    }
  };

  // Handle end date change
  const handleEndDateChange = (e) => {
    const dateStr = e.target.value;
    setEndDateStr(dateStr);
    
    if (dateStr) {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date());
      if (isValid(date)) {
        onChange({ startDate, endDate: date });
      }
    } else {
      onChange({ startDate, endDate: null });
    }
  };

  // Clear the date range
  const handleClear = () => {
    setStartDateStr('');
    setEndDateStr('');
    onChange({ startDate: null, endDate: null });
  };

  // Set quick date ranges
  const setLastWeek = () => {
    const end = new Date();
    const start = addDays(end, -7);
    setStartDateStr(format(start, 'yyyy-MM-dd'));
    setEndDateStr(format(end, 'yyyy-MM-dd'));
    onChange({ startDate: start, endDate: end });
    setIsOpen(false);
  };

  const setLastMonth = () => {
    const end = new Date();
    const start = addDays(end, -30);
    setStartDateStr(format(start, 'yyyy-MM-dd'));
    setEndDateStr(format(end, 'yyyy-MM-dd'));
    onChange({ startDate: start, endDate: end });
    setIsOpen(false);
  };

  const setLastQuarter = () => {
    const end = new Date();
    const start = addDays(end, -90);
    setStartDateStr(format(start, 'yyyy-MM-dd'));
    setEndDateStr(format(end, 'yyyy-MM-dd'));
    onChange({ startDate: start, endDate: end });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center justify-between border border-gray-300 rounded-md p-2 cursor-pointer"
           onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center">
          <FaCalendarAlt className="text-gray-500 mr-2" />
          <span>{formatDateRange()}</span>
        </div>
        {(startDate || endDate) && (
          <FaTimes
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-full md:w-96">
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDateStr}
                  onChange={handleStartDateChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDateStr}
                  onChange={handleEndDateChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quick Select</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={setLastWeek}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
              >
                Last 7 Days
              </button>
              <button
                onClick={setLastMonth}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
              >
                Last 30 Days
              </button>
              <button
                onClick={setLastQuarter}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
              >
                Last 90 Days
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleClear}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
