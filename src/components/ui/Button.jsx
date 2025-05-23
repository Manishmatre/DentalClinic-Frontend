import React from 'react';

const variants = {
  primary: {
    base: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    disabled: 'bg-indigo-400 cursor-not-allowed'
  },
  secondary: {
    base: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
    disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed'
  },
  danger: {
    base: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    disabled: 'bg-red-400 cursor-not-allowed'
  },
  success: {
    base: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    disabled: 'bg-green-400 cursor-not-allowed'
  },
  warning: {
    base: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    disabled: 'bg-yellow-400 cursor-not-allowed'
  }
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
  xl: 'px-6 py-3 text-base'
};

const Button = ({ 
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center border border-transparent font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  const safeVariant = variants[variant] ? variant : 'primary';
  const variantClasses = disabled ? variants[safeVariant].disabled : variants[safeVariant].base;
  const sizeClasses = sizes[size];
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses}
        ${sizeClasses}
        ${widthClass}
        ${className}
      `}
      onClick={disabled || loading ? undefined : onClick}
      {...props}
    >
      {loading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </>
      ) : children}
    </button>
  );
};

export default Button;