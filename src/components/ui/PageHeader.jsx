import React from 'react';
import PropTypes from 'prop-types';

/**
 * PageHeader component for consistent page headers across the application
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The main title of the page
 * @param {string} [props.subtitle] - Optional subtitle or description
 * @param {React.ReactNode} [props.actions] - Optional actions (buttons, links, etc.)
 * @param {string} [props.icon] - Optional icon component to display next to the title
 * @param {string} [props.className] - Additional CSS classes
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  actions, 
  icon, 
  className = "" 
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          {icon && (
            <div className="mr-3 text-indigo-600 text-xl">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  icon: PropTypes.node,
  className: PropTypes.string
};

export default PageHeader;
