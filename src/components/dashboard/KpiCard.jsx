import React from 'react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

/**
 * A reusable KPI card component for dashboards
 * 
 * @param {string} title - The KPI title
 * @param {string|number} value - The KPI value
 * @param {string} unit - Optional unit to display after the value
 * @param {string} trend - Optional trend value (percentage)
 * @param {string} trendDirection - Optional trend direction ('up', 'down', 'neutral')
 * @param {React.ReactNode} icon - Optional icon to display
 * @param {string} color - Optional color theme ('primary', 'success', 'warning', 'danger')
 * @param {string} className - Additional CSS classes
 */
const KpiCard = ({ 
  title, 
  value, 
  unit = '', 
  trend, 
  trendDirection, 
  icon, 
  color = 'primary',
  className = '',
  onClick
}) => {
  const colorStyles = {
    primary: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      iconText: 'text-indigo-600',
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
    },
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
    },
    dental: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
      iconBg: 'bg-cyan-100',
      iconText: 'text-cyan-600',
    }
  };

  const styles = colorStyles[color] || colorStyles.primary;
  
  return (
    <div 
      className={`p-4 rounded-lg ${styles.bg} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-1 flex items-baseline">
            <p className={`text-2xl font-semibold ${styles.text}`}>
              {value}
              {unit && <span className="ml-1 text-sm">{unit}</span>}
            </p>
            
            {trend && (
              <span className={`ml-2 flex items-baseline text-sm font-semibold ${
                trendDirection === 'up' ? 'text-green-600' : 
                trendDirection === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {trendDirection === 'up' && <FaArrowUp className="self-center flex-shrink-0 h-4 w-4 text-green-500" />}
                {trendDirection === 'down' && <FaArrowDown className="self-center flex-shrink-0 h-4 w-4 text-red-500" />}
                <span className="ml-1">{trend}%</span>
              </span>
            )}
          </div>
        </div>
        
        {icon && (
          <div className={`p-2 rounded-full ${styles.iconBg}`}>
            <div className={`h-6 w-6 ${styles.iconText}`}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
