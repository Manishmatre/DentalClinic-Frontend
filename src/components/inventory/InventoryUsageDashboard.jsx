import React, { useState, useEffect } from 'react';
import dentalProcedureService from '../../api/dental/dentalProcedureService';
import InventoryUsageChart from './InventoryUsageChart';
import DateRangePicker from '../common/DateRangePicker';
import { FaSpinner, FaFilter, FaChartBar, FaChartLine, FaCalendarAlt } from 'react-icons/fa';

const InventoryUsageDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('month');
  const [category, setCategory] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [usageData, setUsageData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch procedure categories
  useEffect(() => {
    setCategories(dentalProcedureService.getProcedureCategories());
  }, []);

  // Fetch usage report data
  const fetchUsageReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      
      if (dateRange.startDate) {
        params.startDate = dateRange.startDate.toISOString();
      }
      
      if (dateRange.endDate) {
        params.endDate = dateRange.endDate.toISOString();
      }
      
      if (category) {
        params.category = category;
      }
      
      const data = await dentalProcedureService.getInventoryUsageReport(params);
      setUsageData(data);
    } catch (err) {
      console.error('Error fetching inventory usage report:', err);
      setError('Failed to load inventory usage data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch usage trend data
  const fetchUsageTrend = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        period,
        limit: 10
      };
      
      if (category) {
        params.category = category;
      }
      
      const data = await dentalProcedureService.getInventoryUsageTrend(params);
      setTrendData(data);
    } catch (err) {
      console.error('Error fetching inventory usage trends:', err);
      setError('Failed to load inventory usage trends');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchUsageReport();
    } else if (activeTab === 'trends') {
      fetchUsageTrend();
    }
  }, [activeTab]);

  // Handle filter changes
  const handleApplyFilters = () => {
    if (activeTab === 'overview') {
      fetchUsageReport();
    } else if (activeTab === 'trends') {
      fetchUsageTrend();
    }
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Dental Inventory Usage Analytics</h2>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              <FaChartBar className="inline mr-2" /> Usage Overview
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'trends' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('trends')}
            >
              <FaChartLine className="inline mr-2" /> Usage Trends
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Common filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Procedure Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {/* Date range picker for overview tab */}
          {activeTab === 'overview' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={setDateRange}
              />
            </div>
          )}
          
          {/* Period selector for trends tab */}
          {activeTab === 'trends' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          )}
          
          {/* Apply filters button */}
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                <>
                  <FaFilter className="mr-2" />
                  Apply Filters
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        {/* Tab content */}
        {activeTab === 'overview' ? (
          <div className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="text-indigo-600 text-3xl animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top used items */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Top Used Items</h3>
                  {usageData?.topItems?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Item</th>
                            <th className="text-right py-2">Quantity</th>
                            <th className="text-right py-2">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usageData.topItems.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2">{item.name}</td>
                              <td className="text-right py-2">{item.totalQuantity}</td>
                              <td className="text-right py-2">{formatCurrency(item.totalCost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-40 text-gray-500">
                      No data available
                    </div>
                  )}
                </div>
                
                {/* Usage by category */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Usage by Category</h3>
                  <InventoryUsageChart 
                    data={{ usageByCategory: usageData?.usageByCategory || [] }}
                    chartType="pie"
                    height={250}
                  />
                </div>
                
                {/* Usage by procedure */}
                <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Usage by Procedure</h3>
                  <InventoryUsageChart 
                    data={{ usageByCategory: usageData?.usageByProcedure || [] }}
                    chartType="bar"
                    height={300}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="text-indigo-600 text-3xl animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {/* Usage over time */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Inventory Usage Over Time</h3>
                  <InventoryUsageChart 
                    data={{ usageOverTime: trendData?.usageOverTime || [] }}
                    period={period}
                    chartType="line"
                    height={300}
                  />
                </div>
                
                {/* Top items during period */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-4">Top Items During Period</h3>
                  <InventoryUsageChart 
                    data={{ topItems: trendData?.topItems || [] }}
                    chartType="bar"
                    height={300}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryUsageDashboard;
