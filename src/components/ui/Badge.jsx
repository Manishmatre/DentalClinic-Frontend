import React from 'react';

/**
 * Badge component for displaying status indicators
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Badge variant (primary, success, warning, danger, info, etc.)
 * @param {string} props.color - Color of the badge (red, green, blue, yellow, etc.)
 * @param {string} props.text - Text to display in the badge
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.icon - Optional icon to display before text
 * @param {boolean} props.pill - Whether to display as a pill (rounded)
 * @param {string} props.size - Size of the badge (sm, md, lg)
 * @returns {JSX.Element} Badge component
 */
const Badge = ({ 
  variant = 'primary', 
  color,
  text, 
  className = '', 
  icon,
  pill = false,
  size = 'md',
  ...props 
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center font-medium';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-indigo-100 text-indigo-800',
    light: 'bg-gray-50 text-gray-600 border border-gray-200',
    dark: 'bg-gray-700 text-white'
  };
  
  // Color classes (direct color names)
  const colorClasses = {
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    gray: 'bg-gray-100 text-gray-800'
  };
  
  // Pill classes
  const pillClasses = pill ? 'rounded-full' : 'rounded';
  
  // Combine classes
  const classes = `
    ${baseClasses} 
    ${sizeClasses[size] || sizeClasses.md} 
    ${color ? (colorClasses[color] || colorClasses.gray) : (variantClasses[variant] || variantClasses.primary)} 
    ${pillClasses}
    ${className}
  `;
  
  return (
    <span className={classes} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {text}
    </span>
  );
};

export default Badge;
