import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  className = '',
  containerClassName = '',
  labelClassName = '',
  rows = 3,
  ...props
}, ref) => {
  const baseTextareaClasses = 'block w-full rounded-lg shadow-sm transition-colors duration-200 px-2 py-2';
  const variantClasses = error
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 focus:ring-2'
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
      
      <textarea
        ref={ref}
        rows={rows}
        className={`
          ${baseTextareaClasses}
          ${variantClasses}
          ${className}
          placeholder:text-gray-400
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          resize-vertical
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={props.id ? `${props.id}-error` : undefined}
        {...props}
      />

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

Textarea.displayName = 'Textarea';

export default Textarea;