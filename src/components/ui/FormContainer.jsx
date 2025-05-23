import React from 'react';

const FormContainer = ({
  title,
  subtitle,
  children,
  onSubmit,
  className = '',
  containerClassName = '',
}) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}

      <form 
        onSubmit={onSubmit}
        className={`
          bg-white rounded-lg shadow-sm border border-gray-200
          p-6 sm:p-8
          space-y-6
          ${className}
        `}
      >
        {children}
      </form>
    </div>
  );
};

export default FormContainer;