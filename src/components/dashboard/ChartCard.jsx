import React from 'react';
import Card from '../../components/ui/Card';

/**
 * A reusable chart card component for dashboards
 * 
 * @param {string} title - Chart title
 * @param {React.ReactNode} children - Chart component
 * @param {React.ReactNode} actions - Optional actions (buttons, dropdowns)
 * @param {string} className - Additional CSS classes
 */
const ChartCard = ({ title, children, actions, className = '' }) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
      <div className="p-4">
        {children}
      </div>
    </Card>
  );
};

export default ChartCard;
