import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import billingService from '../../api/billing/billingService';
import { toast } from 'react-toastify';
import { 
  FaChartLine, 
  FaMoneyBillWave, 
  FaFileInvoiceDollar, 
  FaExclamationTriangle,
  FaFileExport,
  FaFilePdf,
  FaFileExcel,
  FaCalendarAlt,
  FaRupeeSign,
  FaFilter,
  FaCalculator
} from 'react-icons/fa';
import { format, subMonths, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const BillingDashboard = ({ clinicId, userRole }) => {
  const { user, clinic } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month'); // 'month', 'quarter', 'year', 'financial-year', 'custom'
  const [customDateRange, setCustomDateRange] = useState({ 
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'), 
    endDate: format(new Date(), 'yyyy-MM-dd') 
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [gstReport, setGstReport] = useState(null);
  const [showGstReport, setShowGstReport] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf'); // 'pdf', 'excel'
  const [activeInsightTab, setActiveInsightTab] = useState('revenue'); // 'revenue', 'invoices', 'payments', 'gst'
  const [filterOptions, setFilterOptions] = useState({
    paymentStatus: 'all', // 'all', 'paid', 'pending', 'partial', 'cancelled'
    paymentMethod: 'all', // 'all', 'cash', 'card', 'upi', etc.
    serviceType: 'all',
    doctorId: 'all',
    includeGst: true
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState('previous'); // 'previous', 'same-last-year'
  const [comparisonStats, setComparisonStats] = useState(null);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const STATUS_COLORS = {
    'Paid': '#10B981',
    'Pending': '#F59E0B',
    'Partial': '#3B82F6',
    'Cancelled': '#EF4444'
  };

  useEffect(() => {
    if (user?.clinicId) {
      // Fetch stats for all users - the backend will handle permissions
      fetchBillingStats();
    }
  }, [user, dateRange]);

  const fetchBillingStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate user and clinic data
      if (!user || !user.clinicId) {
        setError('User or clinic information is missing');
        setIsLoading(false);
        return;
      }

      // Calculate date range based on selection
      let startDate, endDate = new Date();
      
      switch (dateRange) {
        case 'month':
          startDate = subMonths(endDate, 1);
          break;
        case 'quarter':
          startDate = subMonths(endDate, 3);
          break;
        case 'year':
          startDate = subMonths(endDate, 12);
          break;
        case 'financial-year':
          // Indian financial year: April 1 to March 31
          const currentYear = endDate.getFullYear();
          const currentMonth = endDate.getMonth();
          // If current date is Jan-Mar, use previous year's Apr-Mar
          // If current date is Apr-Dec, use current year's Apr-Mar
          const fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;
          startDate = new Date(fyStartYear, 3, 1); // April 1st
          endDate = new Date(fyStartYear + 1, 2, 31); // March 31st
          break;
        case 'custom':
          startDate = new Date(customDateRange.startDate);
          endDate = new Date(customDateRange.endDate);
          break;
        default:
          startDate = subMonths(endDate, 1);
      }

      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      // Prepare filter parameters
      const filterParams = {
        clinicId: user.clinicId,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      };

      // Add additional filters if they're not set to 'all'
      if (filterOptions.paymentStatus !== 'all') {
        filterParams.paymentStatus = filterOptions.paymentStatus;
      }
      if (filterOptions.paymentMethod !== 'all') {
        filterParams.paymentMethod = filterOptions.paymentMethod;
      }
      if (filterOptions.serviceType !== 'all') {
        filterParams.serviceType = filterOptions.serviceType;
      }
      if (filterOptions.doctorId !== 'all') {
        filterParams.doctorId = filterOptions.doctorId;
      }
      
      // Silent logging for development only
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching billing stats with params:', filterParams);
      }
      
      // Fetch main period stats
      const data = await billingService.getBillingStats(filterParams);
      
      // Fetch comparison period stats if needed
      let comparisonData = null;
      if (comparisonPeriod !== 'none') {
        const comparisonFilterParams = { ...filterParams };
        
        if (comparisonPeriod === 'previous') {
          // Previous period of same length
          const periodLength = (new Date(formattedEndDate) - new Date(formattedStartDate)) / (1000 * 60 * 60 * 24);
          comparisonFilterParams.endDate = formattedStartDate;
          comparisonFilterParams.startDate = format(subDays(new Date(formattedStartDate), periodLength), 'yyyy-MM-dd');
        } else if (comparisonPeriod === 'same-last-year') {
          // Same period last year
          comparisonFilterParams.startDate = format(subMonths(new Date(formattedStartDate), 12), 'yyyy-MM-dd');
          comparisonFilterParams.endDate = format(subMonths(new Date(formattedEndDate), 12), 'yyyy-MM-dd');
        }
        
        comparisonData = await billingService.getBillingStats(comparisonFilterParams);
      }
      
      if (data && !data.error) {
        // Process the data for analytics
        const validatedStats = {
          // Basic financial metrics
          totalRevenue: data.totalRevenue || 0,
          netRevenue: (data.totalRevenue || 0) - (data.totalRefunds || 0),
          totalRefunds: data.totalRefunds || 0,
          averageInvoiceValue: data.invoiceCount > 0 ? data.totalRevenue / data.invoiceCount : 0,
          
          // Invoice metrics
          invoiceCount: data.invoiceCount || 0,
          paidInvoices: data.paidInvoices || 0,
          unpaidInvoices: data.unpaidInvoices || 0,
          partiallyPaidInvoices: data.partiallyPaidInvoices || 0,
          cancelledInvoices: data.cancelledInvoices || 0,
          
          // GST metrics
          totalGst: (data.totalCgst || 0) + (data.totalSgst || 0) + (data.totalIgst || 0),
          cgst: data.totalCgst || 0,
          sgst: data.totalSgst || 0,
          igst: data.totalIgst || 0,
          
          // Time series data
          revenueByDay: data.revenueByDay || [],
          revenueByMonth: data.revenueByMonth || [],
          invoicesByDay: data.invoicesByDay || [],
          
          // Distribution data
          revenueByPaymentMethod: data.revenueByPaymentMethod || [],
          revenueByService: data.revenueByService || [],
          revenueByDoctor: data.revenueByDoctor || [],
          
          // Recent data
          recentInvoices: Array.isArray(data.recentInvoices) ? data.recentInvoices : [],
          topPatients: data.topPatients || [],
          
          // Raw data for custom analysis
          rawData: data
        };
        
        setStats(validatedStats);
        
        // Process comparison data if available
        if (comparisonData && !comparisonData.error) {
          const validatedComparisonStats = {
            totalRevenue: comparisonData.totalRevenue || 0,
            invoiceCount: comparisonData.invoiceCount || 0,
            paidInvoices: comparisonData.paidInvoices || 0,
            totalGst: (comparisonData.totalCgst || 0) + (comparisonData.totalSgst || 0) + (comparisonData.totalIgst || 0),
            rawData: comparisonData
          };
          
          setComparisonStats(validatedComparisonStats);
        } else {
          setComparisonStats(null);
        }
        
        // Generate GST report if requested
        if (showGstReport) {
          generateGstReport(data);
        }
      } else if (data && data.error) {
        // Handle error from the service
        toast.error(data.error || 'Failed to fetch billing statistics');
        setError('Failed to fetch billing statistics');
        
        // Set default empty stats
        setStats(getEmptyStats());
        setComparisonStats(null);
      } else {
        toast.info('No billing data available for the selected period');
        setStats(getEmptyStats());
        setComparisonStats(null);
      }
    } catch (err) {
      // This should rarely happen since billingService handles errors
      toast.error('An unexpected error occurred while fetching billing statistics');
      setError('Failed to fetch billing statistics');
      
      // Set default empty stats
      setStats(getEmptyStats());
      setComparisonStats(null);
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unhandled error in fetchBillingStats:', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get empty stats object
  const getEmptyStats = () => ({
    totalRevenue: 0,
    netRevenue: 0,
    totalRefunds: 0,
    averageInvoiceValue: 0,
    invoiceCount: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    partiallyPaidInvoices: 0,
    cancelledInvoices: 0,
    totalGst: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    revenueByDay: [],
    revenueByMonth: [],
    invoicesByDay: [],
    revenueByPaymentMethod: [],
    revenueByService: [],
    revenueByDoctor: [],
    recentInvoices: [],
    topPatients: [],
    rawData: {}
  });
  
  // Generate GST report from billing data
  const generateGstReport = (data) => {
    const gstData = {
      totalCgst: data.totalCgst || 0,
      totalSgst: data.totalSgst || 0,
      totalIgst: data.totalIgst || 0,
      totalTaxableValue: data.totalTaxableValue || 0,
      gstByRate: data.gstByRate || [],
      gstByMonth: data.gstByMonth || [],
      gstByService: data.gstByService || []
    };
    
    setGstReport(gstData);
  };

  // Format monthly trend data for chart
  const formatMonthlyTrendData = () => {
    if (!stats?.monthlyTrend) return [];
    
    return stats.monthlyTrend.map(item => ({
      name: `${item.month}/${item.year}`,
      total: item.total,
      paid: item.paid,
      pending: item.total - item.paid,
      count: item.count
    }));
  };

  // Format status distribution data for pie chart
  const formatStatusData = () => {
    if (!stats?.statusDistribution) return [];
    
    return stats.statusDistribution.map(item => ({
      name: item.status,
      value: item.amount,
      count: item.count
    }));
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: $${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Handle date range selection
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range !== 'custom') {
      setShowCustomDatePicker(false);
    } else {
      setShowCustomDatePicker(true);
    }
  };

  // Handle custom date range changes
  const handleCustomDateChange = (field, value) => {
    setCustomDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilterOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle GST report visibility
  const toggleGstReport = () => {
    setShowGstReport(!showGstReport);
    if (!showGstReport && stats) {
      generateGstReport(stats.rawData);
    }
  };

  // Handle export format change
  const handleExportFormatChange = (format) => {
    setExportFormat(format);
  };

  // Export data in selected format
  const exportData = () => {
    toast.info(`Exporting data in ${exportFormat} format... This feature will be available soon.`);
  };

  // Render date range selector
  const renderDateRangeSelector = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex space-x-2 mb-2 sm:mb-0">
          <button
            onClick={() => handleDateRangeChange('month')}
            className={`px-3 py-1 text-sm rounded-md ${dateRange === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Last Month
          </button>
          <button
            onClick={() => handleDateRangeChange('quarter')}
            className={`px-3 py-1 text-sm rounded-md ${dateRange === 'quarter' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Last Quarter
          </button>
          <button
            onClick={() => handleDateRangeChange('year')}
            className={`px-3 py-1 text-sm rounded-md ${dateRange === 'year' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Last Year
          </button>
          <button
            onClick={() => handleDateRangeChange('financial-year')}
            className={`px-3 py-1 text-sm rounded-md ${dateRange === 'financial-year' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Financial Year
          </button>
          <button
            onClick={() => handleDateRangeChange('custom')}
            className={`px-3 py-1 text-sm rounded-md ${dateRange === 'custom' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Custom
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <FaFilter className="mr-1" /> Filters
          </button>
          <button
            onClick={exportData}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <FaFileExport className="mr-1" /> Export
          </button>
        </div>
      </div>
      
      {showCustomDatePicker && (
        <div className="mt-4 flex flex-wrap items-center space-x-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Start Date</label>
            <input 
              type="date" 
              value={customDateRange.startDate}
              onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">End Date</label>
            <input 
              type="date" 
              value={customDateRange.endDate}
              onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="mt-6">
            <button
              onClick={fetchBillingStats}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              Apply
            </button>
          </div>
        </div>
      )}
      
      {/* Comparison period selector */}
      <div className="mt-4">
        <label className="block text-sm text-gray-700 mb-1">Compare with:</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setComparisonPeriod('none')}
            className={`px-3 py-1 text-sm rounded-md ${comparisonPeriod === 'none' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            No Comparison
          </button>
          <button
            onClick={() => setComparisonPeriod('previous')}
            className={`px-3 py-1 text-sm rounded-md ${comparisonPeriod === 'previous' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Previous Period
          </button>
          <button
            onClick={() => setComparisonPeriod('same-last-year')}
            className={`px-3 py-1 text-sm rounded-md ${comparisonPeriod === 'same-last-year' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Same Period Last Year
          </button>
        </div>
      </div>
    </div>
  );

  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      isOpen={showFilterModal}
      onClose={() => setShowFilterModal(false)}
      title="Filter Options"
      size="md"
    >
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
          <select
            value={filterOptions.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partially Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            value={filterOptions.paymentMethod}
            onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Net Banking</option>
            <option value="insurance">Insurance</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Include GST</label>
          <div className="mt-1">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={filterOptions.includeGst}
                onChange={(e) => handleFilterChange('includeGst', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include GST in reports</span>
            </label>
          </div>
        </div>
        
        <div className="pt-4 flex justify-end space-x-3">
          <button
            onClick={() => {
              setFilterOptions({
                paymentStatus: 'all',
                paymentMethod: 'all',
                serviceType: 'all',
                doctorId: 'all',
                includeGst: true
              });
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            Reset Filters
          </button>
          <button
            onClick={() => {
              setShowFilterModal(false);
              fetchBillingStats();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </Modal>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // For non-admin users, show a simplified dashboard with limited information
  if (user?.role !== 'Admin' && stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your Invoices Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Invoices</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">Total Due</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${stats.revenue ? (stats.revenue.total - stats.revenue.paid).toFixed(2) : '0.00'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.revenue ? stats.revenue.paid.toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Payment Status */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status</h3>
            <div className="flex flex-col space-y-2">
              {stats.statusDistribution && stats.statusDistribution.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <span className="flex items-center">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: STATUS_COLORS[status.status] || '#CBD5E0' }}
                    ></span>
                    {status.status}
                  </span>
                  <span className="font-medium">{status.count} invoice(s)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mt-2 text-sm">For detailed analytics and financial reports, please contact your clinic administrator.</p>
      </div>
    );
  }

  // Render key metrics section
  const renderKeyMetrics = () => {
    if (!stats) return null;
    
    // Format currency in Indian format
    const formatIndianCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
      }).format(amount || 0);
    };
    
    // Calculate percentage change for comparison
    const calculateChange = (current, previous) => {
      if (!previous || previous === 0) return { value: 0, isPositive: true };
      const change = ((current - previous) / previous) * 100;
      return {
        value: Math.abs(change).toFixed(1),
        isPositive: change >= 0
      };
    };
    
    // Get comparison metrics if available
    const getComparisonMetric = (metric) => {
      if (!comparisonStats) return null;
      
      const current = stats[metric] || 0;
      const previous = comparisonStats[metric] || 0;
      const change = calculateChange(current, previous);
      
      return (
        <div className="text-xs flex items-center mt-1">
          <span className={change.isPositive ? 'text-green-600' : 'text-red-600'}>
            {change.isPositive ? '↑' : '↓'} {change.value}%
          </span>
          <span className="text-gray-500 ml-1">
            vs. {comparisonPeriod === 'previous' ? 'previous period' : 'last year'}
          </span>
        </div>
      );
    };
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <FaRupeeSign className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-semibold text-gray-900">
              {formatIndianCurrency(stats.totalRevenue)}
            </p>
            {getComparisonMetric('totalRevenue')}
          </div>
        </div>
        
        {/* Invoice Count */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Invoices</h3>
            <FaFileInvoiceDollar className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-semibold text-gray-900">
              {stats.invoiceCount}
            </p>
            {getComparisonMetric('invoiceCount')}
          </div>
        </div>
        
        {/* Average Invoice Value */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Avg. Invoice Value</h3>
            <FaCalculator className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-semibold text-gray-900">
              {formatIndianCurrency(stats.averageInvoiceValue)}
            </p>
          </div>
        </div>
        
        {/* GST Collection */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total GST</h3>
            <FaCalculator className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-semibold text-gray-900">
              {formatIndianCurrency(stats.totalGst)}
            </p>
            {getComparisonMetric('totalGst')}
          </div>
        </div>
      </div>
    );
  };
  
  // Render revenue trends chart
  const renderRevenueTrends = () => {
    if (!stats || !stats.revenueByDay || stats.revenueByDay.length === 0) return null;
    
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.revenueByDay}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']} />
              <Area type="monotone" dataKey="amount" stroke="#4F46E5" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Billing Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={toggleGstReport}
            className={`px-3 py-1 text-sm rounded-md ${showGstReport ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {showGstReport ? 'Hide GST Report' : 'Show GST Report'}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <FaFileExport className="mr-1" /> Export
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleExportFormatChange('pdf');
                      exportData();
                      setShowExportOptions(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FaFilePdf className="mr-2" /> Export as PDF
                  </button>
                  <button
                    onClick={() => {
                      handleExportFormatChange('excel');
                      exportData();
                      setShowExportOptions(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FaFileExcel className="mr-2" /> Export as Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Date Range Selector */}
      {renderDateRangeSelector()}

      {/* Key Metrics */}
      {renderKeyMetrics()}
      
      {/* Revenue Trends */}
      {renderRevenueTrends()}
      
      {/* GST Report Section */}
      {showGstReport && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">GST Report</h3>
          
          {/* GST Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">CGST</p>
              <p className="text-xl font-semibold">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR'
                }).format(stats?.cgst || 0)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">SGST</p>
              <p className="text-xl font-semibold">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR'
                }).format(stats?.sgst || 0)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">IGST</p>
              <p className="text-xl font-semibold">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR'
                }).format(stats?.igst || 0)}
              </p>
            </div>
          </div>
          
          {/* GST by Rate */}
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-700 mb-2">GST by Rate</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Value</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGST</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SGST</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IGST</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tax</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats?.rawData?.gstByRate?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.rate}%</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format(item.taxableValue || 0)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format(item.cgst || 0)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format(item.sgst || 0)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format(item.igst || 0)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        }).format((item.cgst || 0) + (item.sgst || 0) + (item.igst || 0))}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="6" className="px-4 py-2 text-center text-sm text-gray-500">No GST data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mt-2">
            <p>Note: This GST report is for informational purposes only. Please consult with your accountant for official GST filings.</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Invoice Status Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Paid', value: stats?.paidInvoices || 0, color: '#10B981' },
                    { name: 'Pending', value: stats?.unpaidInvoices || 0, color: '#F59E0B' },
                    { name: 'Partial', value: stats?.partiallyPaidInvoices || 0, color: '#3B82F6' },
                    { name: 'Cancelled', value: stats?.cancelledInvoices || 0, color: '#EF4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {[
                    { name: 'Paid', value: stats?.paidInvoices || 0, color: '#10B981' },
                    { name: 'Pending', value: stats?.unpaidInvoices || 0, color: '#F59E0B' },
                    { name: 'Partial', value: stats?.partiallyPaidInvoices || 0, color: '#3B82F6' },
                    { name: 'Cancelled', value: stats?.cancelledInvoices || 0, color: '#EF4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} invoices`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Payment Method</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.revenueByPaymentMethod || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => 
                  new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(value)
                } />
                <YAxis type="category" dataKey="method" width={100} />
                <Tooltip 
                  formatter={(value) => [
                    new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR'
                    }).format(value),
                    'Amount'
                  ]} 
                />
                <Bar dataKey="amount" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Service Distribution and Doctor Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Service Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Service</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.revenueByService?.slice(0, 10) || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => 
                  new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(value)
                } />
                <YAxis type="category" dataKey="service" width={150} />
                <Tooltip 
                  formatter={(value) => [
                    new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR'
                    }).format(value),
                    'Amount'
                  ]} 
                />
                <Bar dataKey="amount" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doctor Performance */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Doctor</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.revenueByDoctor?.slice(0, 10) || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="doctorName" />
                <YAxis tickFormatter={(value) => 
                  new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(value)
                } />
                <Tooltip 
                  formatter={(value) => [
                    new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR'
                    }).format(value),
                    'Amount'
                  ]} 
                />
                <Bar dataKey="amount" fill="#EC4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Outstanding Invoices Summary */}
      {stats?.statusDistribution?.some(item => item.status === 'Pending' || item.status === 'Partial') && (
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Outstanding Invoices Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.statusDistribution
                  .filter(item => item.status === 'Pending' || item.status === 'Partial')
                  .map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'Pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingDashboard;
