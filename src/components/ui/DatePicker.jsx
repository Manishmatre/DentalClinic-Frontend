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
  showClearButton = true,
  range = false // new prop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateString, setDateString] = useState('');
  const [rangeString, setRangeString] = useState({ start: '', end: '' });
  const dropdownRef = useRef(null);

  // Format date for display
  const formatDate = (date) => {
    if (!date || !isValid(date)) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // Format date for display in the input field
  const formatDisplayDate = (date) => {
    if (!date || !isValid(date)) return '';
    return format(date, 'MMM dd, yyyy');
  };

  // Initialize date string when value changes
  useEffect(() => {
    if (range) {
      setRangeString({
        start: value?.start && isValid(value.start) ? formatDate(value.start) : '',
        end: value?.end && isValid(value.end) ? formatDate(value.end) : ''
      });
    } else {
      if (value && typeof value === 'string') {
        const dateObj = parse(value, 'yyyy-MM-dd', new Date());
        if (isValid(dateObj)) {
          setDateString(formatDate(dateObj));
        } else {
          setDateString('');
        }
      } else if (value && isValid(value)) {
        setDateString(formatDate(value));
    } else {
      setDateString('');
      }
    }
  }, [value, range]);

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

  // Handle range change
  const handleRangeChange = (e, which) => {
    const newVal = e.target.value;
    setRangeString(prev => ({ ...prev, [which]: newVal }));
    let start = which === 'start' ? newVal : rangeString.start;
    let end = which === 'end' ? newVal : rangeString.end;
    const startDate = start ? parse(start, 'yyyy-MM-dd', new Date()) : null;
    const endDate = end ? parse(end, 'yyyy-MM-dd', new Date()) : null;
    if (isValid(startDate) || isValid(endDate)) {
      onChange({ start: isValid(startDate) ? startDate : null, end: isValid(endDate) ? endDate : null });
    }
  };

  // Clear the date
  const handleClear = () => {
    setDateString('');
    setRangeString({ start: '', end: '' });
    onChange(range ? { start: null, end: null } : null);
  };

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div 
          className={`flex items-center justify-between border ${error ? 'border-red-400' : 'border-gray-200'} rounded-lg p-2 cursor-pointer ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center flex-grow">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            {range ? (
              <span className="text-sm text-gray-700">
                {value?.start ? formatDisplayDate(typeof value.start === 'string' ? parse(value.start, 'yyyy-MM-dd', new Date()) : value.start) : 'Start'}
                {' - '}
                {value?.end ? formatDisplayDate(typeof value.end === 'string' ? parse(value.end, 'yyyy-MM-dd', new Date()) : value.end) : 'End'}
              </span>
            ) : (
            <input
              type="text"
              readOnly
                value={value ? formatDisplayDate(typeof value === 'string' ? parse(value, 'yyyy-MM-dd', new Date()) : value) : ''}
              placeholder={placeholder}
                className="bg-transparent border-none focus:outline-none w-full cursor-pointer text-sm text-gray-700 placeholder-gray-400"
              disabled={disabled}
            />
            )}
          </div>
          {(value && (!range || value.start || value.end)) && showClearButton && !disabled && (
            <FaTimes
              className="text-gray-400 hover:text-gray-600 cursor-pointer ml-2"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
        </div>
        {isOpen && !disabled && (
          <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-full animate-fade-in">
            {range ? (
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={rangeString.start}
                    onChange={e => handleRangeChange(e, 'start')}
                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    autoFocus
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={rangeString.end}
                    onChange={e => handleRangeChange(e, 'end')}
                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            ) : (
            <input
              type="date"
              value={dateString}
              onChange={handleDateChange}
                className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              autoFocus
            />
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};

export default DatePicker;
