import React from 'react';

const variants = {
  success: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-400'
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-400'
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-400'
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-400'
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    dot: 'bg-gray-400'
  }
};

const defaultStatuses = {
  active: 'success',
  pending: 'warning',
  cancelled: 'error',
  completed: 'success',
  failed: 'error',
  processing: 'info',
  inactive: 'gray'
};

const StatusBadge = ({
  status,
  variant,
  showDot = true,
  className = '',
  size = 'md'
}) => {
  // Determine the variant based on status or explicit variant prop
  const variantKey = variant || defaultStatuses[status?.toLowerCase()] || 'gray';
  const styles = variants[variantKey];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full
        ${styles.bg} ${styles.text}
        ${sizeClasses[size]}
        font-medium
        ${className}
      `}
    >
      {showDot && (
        <span
          className={`
            mr-1.5 h-2 w-2 rounded-full
            ${styles.dot}
          `}
        />
      )}
      {status}
    </span>
  );
};

export default StatusBadge;

// Usage examples:
// <StatusBadge status="Active" />
// <StatusBadge status="Pending" variant="warning" />
// <StatusBadge status="Custom" variant="info" showDot={false} />