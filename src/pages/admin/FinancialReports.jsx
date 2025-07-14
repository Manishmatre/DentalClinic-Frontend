import React from 'react';
import Card from '../../components/ui/Card';
import { FaChartLine } from 'react-icons/fa';

const FinancialReports = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaChartLine className="mr-2 text-indigo-600" />
            Financial Reports
          </h1>
          <p className="text-gray-500">View detailed financial analytics and reports</p>
        </div>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Analytics</h2>
          <p className="text-gray-600">
            This feature is coming soon. You'll be able to view detailed financial reports, 
            revenue analytics, expense tracking, and profit/loss statements.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default FinancialReports; 