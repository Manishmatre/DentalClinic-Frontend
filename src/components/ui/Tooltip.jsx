import React, { useState } from 'react';

/**
 * Tooltip component for displaying additional information on hover
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The element that triggers the tooltip
 * @param {string} props.content - The tooltip content
 * @param {string} props.position - Tooltip position (top, right, bottom, left)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Tooltip component
 */
const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  className = '',
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-1',
    right: 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-1',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-1',
    left: 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-1'
  };
  
  // Arrow classes
  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent'
  };
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      
      {isVisible && (
        <div className={`
          absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-lg
          whitespace-nowrap
          ${positionClasses[position] || positionClasses.top}
          ${className}
        `}>
          {content}
          <div className={`
            absolute w-0 h-0 border-4
            ${arrowClasses[position] || arrowClasses.top}
          `}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
