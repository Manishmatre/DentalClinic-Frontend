import React, { forwardRef } from 'react';

const Input = forwardRef(({
  type = 'text',
  label,
  error,
  helperText,
  required = false,
  className = '',
  prefix,
  suffix,
  containerClassName = '',
  labelClassName = '',
  multiline,
  ...props
}, ref) => {
  const baseInputClasses = 'block w-full rounded-md shadow-sm transition-colors duration-200 px-2 py-2';
  const variantClasses = error
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500';

  return (
    <div className={containerClassName}>
      {label && (
        <label 
          htmlFor={props.id} 
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            {typeof prefix === 'string' ? (
              <span className="text-gray-500 sm:text-sm">{prefix}</span>
            ) : (
              prefix
            )}
          </div>
        )}

        {props.multiline ? (
          <textarea
            ref={ref}
            className={`
              ${baseInputClasses}
              ${variantClasses}
              ${prefix ? 'pl-8' : ''}
              ${suffix ? 'pr-8' : ''}
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={props.id ? `${props.id}-error` : undefined}
            rows={props.rows || 3}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={type}
            className={`
              ${baseInputClasses}
              ${variantClasses}
              ${prefix ? 'pl-8' : ''}
              ${suffix ? 'pr-8' : ''}
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={props.id ? `${props.id}-error` : undefined}
            {...props}
          />
        )}

        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            {typeof suffix === 'string' ? (
              <span className="text-gray-500 sm:text-sm">{suffix}</span>
            ) : (
              suffix
            )}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <div className="mt-1">
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

Input.displayName = 'Input';

export default Input;