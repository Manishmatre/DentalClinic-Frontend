import React from 'react';

const FormSection = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-6 pt-6 first:pt-0 border-t first:border-t-0 border-gray-200 ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
};

export default FormSection;