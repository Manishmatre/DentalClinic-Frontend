import React, { useState, useRef, useEffect } from 'react';
import { format, isValid, parse } from 'date-fns';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';

const DatePicker = ({ 
  value, 
  onChange, 
  label = 'Date', 
  placeholder = 'Select a date',
  error,
  disabled = false,
  className = '',
  showClearButton = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateString, setDateString] = useState('');
  const dropdownRef = useRef(null);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // Format date for display in the input field
  const formatDisplayDate = (date) => {
    if (!date) return '';
    return format(date, 'MMM dd, yyyy');
  };

  // Initialize date string when value changes
  useEffect(() => {
    if (value && isValid(value)) {
      setDateString(formatDate(value));
    } else {
      setDateString('');
    }
  }, [value]);

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

  // Handle date change
  const handleDateChange = (e) => {
    const newDateString = e.target.value;
    setDateString(newDateString);
    
    if (newDateString) {
      const date = parse(newDateString, 'yyyy-MM-dd', new Date());
      if (isValid(date)) {
        onChange(date);
      }
    } else {
      onChange(null);
    }
  };

  // Clear the date
  const handleClear = () => {
    setDateString('');
    onChange(null);
  };

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div 
          className={`flex items-center justify-between border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center flex-grow">
            <FaCalendarAlt className="text-gray-500 mr-2" />
            <input
              type="text"
              readOnly
              value={value ? formatDisplayDate(value) : ''}
              placeholder={placeholder}
              className="bg-transparent border-none focus:outline-none w-full cursor-pointer"
              disabled={disabled}
            />
          </div>
          {value && showClearButton && !disabled && (
            <FaTimes
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
        </div>
        
        {isOpen && !disabled && (
          <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 w-full">
            <input
              type="date"
              value={dateString}
              onChange={handleDateChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              autoFocus
            />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DatePicker;
