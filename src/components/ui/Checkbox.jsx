import React from 'react';

const Checkbox = ({ id, label, checked, onChange, disabled = false, className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
      />
      <label
        htmlFor={id}
        className={`ml-2 block text-sm ${
          disabled ? 'text-gray-400' : 'text-gray-700'
        } cursor-pointer`}
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
