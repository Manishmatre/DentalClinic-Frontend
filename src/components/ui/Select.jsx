import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  children,
  ...props
}, ref) => {
  const baseSelectClasses = 'block w-full rounded-lg shadow-sm transition-colors duration-200 px-2 py-2 pr-10 appearance-none bg-white';
  const variantClasses = error
    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 focus:ring-2'
    : 'border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 focus:ring-2';

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={props.id} 
          className={`block text-sm font-medium text-gray-900 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={`
            ${baseSelectClasses}
            ${variantClasses}
            ${className}
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={props.id ? `${props.id}-error` : undefined}
          {...props}
        >
          {children}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {(error || helperText) && (
        <div className="mt-1.5">
          {error && (
            <p 
              className="text-sm text-red-600" 
              id={props.id ? `${props.id}-error` : undefined}
            >
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;