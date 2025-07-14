import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import inventoryService from '../../api/inventory/inventoryService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const InventoryUsageChart = ({ 
  data, 
  period = 'month', 
  chartType = 'bar',
  title = 'Inventory Usage',
  height = 300
}) => {
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    if (data) {
      // Format data for charts based on the type of data provided
      if (Array.isArray(data.usageByCategory)) {
        setChartData(data.usageByCategory);
      } else if (Array.isArray(data.topItems)) {
        setChartData(data.topItems);
      } else if (data.usageOverTime) {
        setChartData(data.usageOverTime);
      } else {
        setChartData([]);
      }
    }
  }, [data]);

  // Format currency values
  const formatCurrency = (value) => {
    return inventoryService.formatCurrency(value);
  };

  // Format date labels based on period
  const formatDateLabel = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    
    switch (period) {
      case 'week':
        return dateObj.toLocaleDateString(undefined, { weekday: 'short' });
      case 'month':
        return dateObj.toLocaleDateString(undefined, { day: '2-digit' });
      case 'quarter':
        return `Week ${Math.ceil(dateObj.getDate() / 7)}`;
      case 'year':
        return dateObj.toLocaleDateString(undefined, { month: 'short' });
      default:
        return dateObj.toLocaleDateString();
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-900">{payload[0].payload.name || label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.toLowerCase().includes('cost') 
                ? formatCurrency(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render appropriate chart based on chartType
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDateLabel} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="quantity" 
                name="Quantity Used" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="totalCost" 
                name="Total Cost" 
                stroke="#82ca9d" 
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalCost"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="count" 
                name="Usage Count" 
                fill="#8884d8" 
              />
              <Bar 
                yAxisId="right"
                dataKey="totalCost" 
                name="Total Cost" 
                fill="#82ca9d" 
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-gray-500">
          No data available
        </div>
      ) : (
        renderChart()
      )}
    </div>
  );
};

export default InventoryUsageChart;
