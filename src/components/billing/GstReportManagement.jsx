import React, { useState, useEffect, useRef } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import billingService from '../../api/billing/billingService';
import { 
  FaFileExport, 
  FaFilePdf, 
  FaFileExcel, 
  FaSearch, 
  FaFilter,
  FaCalculator,
  FaChartBar,
  FaDownload,
  FaRupeeSign
} from 'react-icons/fa';
import Button from '../ui/Button';
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
  Cell
} from 'recharts';

const GstReportManagement = ({ 
  gstData = null,
  onGenerateReport,
  onDownloadReport,
  isLoading = false,
  error = null
}) => {
  const [reportType, setReportType] = useState('gstr1');
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd')
  });
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  const { user } = useAuth();
  const [realGstData, setRealGstData] = useState(null);
  const [isLoadingGstData, setIsLoadingGstData] = useState(false);
  const [gstDataError, setGstDataError] = useState(null);
  
  useEffect(() => {
    // Fetch real GST data if no data is provided as props
    if (!gstData && user) {
      fetchGstData();
    }
  }, [gstData, user, dateRange]);
  
  // Function to fetch GST data from the API
  const fetchGstData = async () => {
    setIsLoadingGstData(true);
    setGstDataError(null);
    
    try {
      // Only admins and doctors can access GST reports
      if (user.role === 'Admin' || user.role === 'Doctor') {
        const result = await billingService.getGstReports(
          user.clinicId,
          dateRange.startDate,
          dateRange.endDate,
          reportType
        );
        
        if (result && result.success) {
          setRealGstData(result);
        } else {
          setGstDataError(result?.error || 'Failed to fetch GST reports');
        }
      } else {
        setGstDataError('You do not have permission to access GST reports');
      }
    } catch (error) {
      setGstDataError('An error occurred while fetching GST reports');
      console.error('Error fetching GST reports:', error);
    } finally {
      setIsLoadingGstData(false);
    }
  };
  
  // Function to generate mock GST data
  const generateMockGstData = () => {
    return {
      summary: {
        totalTaxableValue: 250000,
        totalCgst: 22500,
        totalSgst: 22500,
        totalIgst: 5000,
        totalGst: 50000
      },
      gstByRate: [
        { rate: 5, taxableValue: 50000, cgst: 1250, sgst: 1250, igst: 0 },
        { rate: 12, taxableValue: 75000, cgst: 4500, sgst: 4500, igst: 0 },
        { rate: 18, taxableValue: 100000, cgst: 9000, sgst: 9000, igst: 0 },
        { rate: 28, taxableValue: 25000, cgst: 3500, sgst: 3500, igst: 0 },
        { rate: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 5000 }
      ],
      gstByMonth: [
        { month: 'Jan', year: 2023, taxableValue: 20000, cgst: 1800, sgst: 1800, igst: 400 },
        { month: 'Feb', year: 2023, taxableValue: 22000, cgst: 1980, sgst: 1980, igst: 440 },
        { month: 'Mar', year: 2023, taxableValue: 25000, cgst: 2250, sgst: 2250, igst: 500 },
        { month: 'Apr', year: 2023, taxableValue: 18000, cgst: 1620, sgst: 1620, igst: 360 },
        { month: 'May', year: 2023, taxableValue: 21000, cgst: 1890, sgst: 1890, igst: 420 },
        { month: 'Jun', year: 2023, taxableValue: 24000, cgst: 2160, sgst: 2160, igst: 480 },
        { month: 'Jul', year: 2023, taxableValue: 19000, cgst: 1710, sgst: 1710, igst: 380 },
        { month: 'Aug', year: 2023, taxableValue: 23000, cgst: 2070, sgst: 2070, igst: 460 },
        { month: 'Sep', year: 2023, taxableValue: 26000, cgst: 2340, sgst: 2340, igst: 520 },
        { month: 'Oct', year: 2023, taxableValue: 17000, cgst: 1530, sgst: 1530, igst: 340 },
        { month: 'Nov', year: 2023, taxableValue: 20000, cgst: 1800, sgst: 1800, igst: 400 },
        { month: 'Dec', year: 2023, taxableValue: 15000, cgst: 1350, sgst: 1350, igst: 300 }
      ],
      hsnSummary: [
        { hsnCode: '9954', description: 'Healthcare Services', taxableValue: 150000, cgst: 13500, sgst: 13500, igst: 3000 },
        { hsnCode: '3004', description: 'Medicines', taxableValue: 50000, cgst: 4500, sgst: 4500, igst: 1000 },
        { hsnCode: '9022', description: 'Medical Equipment', taxableValue: 30000, cgst: 2700, sgst: 2700, igst: 600 },
        { hsnCode: '3005', description: 'Dressings', taxableValue: 20000, cgst: 1800, sgst: 1800, igst: 400 }
      ]
    };
  };
  
  // Use real data from API if no data is provided as props
  // Ensure displayGstData is always properly structured
  const displayGstData = gstData || (realGstData?.data || null);
  
  // Show loading state if we're fetching GST data
  if (isLoadingGstData) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Show error state if there was an error fetching GST data
  if (gstDataError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{gstDataError}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading GST data: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Format currency in Indian format
  const formatIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Handle date range change
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle generate report
  const handleGenerateReport = () => {
    if (onGenerateReport) {
      onGenerateReport(reportType, dateRange);
    }
  };
  
  // Handle download report
  const handleDownloadReport = (format) => {
    setExportFormat(format);
    setShowExportOptions(false);
    
    if (onDownloadReport) {
      onDownloadReport(reportType, dateRange, format);
    }
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Report Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">GST Reports</h2>
            <p className="text-sm text-gray-500">Generate and download GST reports for tax filing</p>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowExportOptions(!showExportOptions)}
              >
                <FaFileExport className="mr-1 h-4 w-4" /> Export
              </Button>
              
              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleDownloadReport('pdf')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FaFilePdf className="mr-2 h-4 w-4" /> Download as PDF
                    </button>
                    <button
                      onClick={() => handleDownloadReport('excel')}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FaFileExcel className="mr-2 h-4 w-4" /> Download as Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleGenerateReport}
            >
              <FaCalculator className="mr-1 h-4 w-4" /> Generate Report
            </Button>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="gstr1">GSTR-1 (Outward Supplies)</option>
              <option value="gstr3b">GSTR-3B (Summary Return)</option>
              <option value="gstr9">GSTR-9 (Annual Return)</option>
              <option value="hsn">HSN Summary</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
      </div>
      
      {displayGstData && (
        <div className="p-4">
          {/* GST Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">GST Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Taxable Value</p>
                <p className="text-xl font-semibold">{formatIndianCurrency(displayGstData?.summary?.totalTaxableValue || 0)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">CGST</p>
                <p className="text-xl font-semibold">{formatIndianCurrency(displayGstData?.summary?.totalCgst || 0)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">SGST</p>
                <p className="text-xl font-semibold">{formatIndianCurrency(displayGstData?.summary?.totalSgst || 0)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">IGST</p>
                <p className="text-xl font-semibold">{formatIndianCurrency(displayGstData?.summary?.totalIgst || 0)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total GST</p>
                <p className="text-xl font-semibold">{formatIndianCurrency(displayGstData?.summary?.totalGst || 0)}</p>
              </div>
            </div>
          </div>
          
          {/* GST by Rate */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">GST by Rate</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (%)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Value</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGST</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SGST</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IGST</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tax</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(displayGstData?.gstByRate || []).map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.rate}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIndianCurrency(item.taxableValue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIndianCurrency(item.cgst)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIndianCurrency(item.sgst)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIndianCurrency(item.igst)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIndianCurrency(item.cgst + item.sgst + item.igst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* GST Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* GST by Rate Chart */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">GST Distribution by Rate</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(displayGstData?.gstByRate || []).map(item => ({
                        name: `${item.rate}%`,
                        value: item.cgst + item.sgst + item.igst
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {(displayGstData?.gstByRate || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatIndianCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Monthly GST Trend */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly GST Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayGstData?.gstByMonth || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${value / 1000}K`} />
                    <Tooltip formatter={(value) => formatIndianCurrency(value)} />
                    <Legend />
                    <Bar dataKey="cgst" name="CGST" fill="#0088FE" />
                    <Bar dataKey="sgst" name="SGST" fill="#00C49F" />
                    <Bar dataKey="igst" name="IGST" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* HSN Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">HSN/SAC Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN/SAC Code</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Value</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CGST</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SGST</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IGST</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tax</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(displayGstData?.hsnSummary || []).map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.hsnCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIndianCurrency(item.taxableValue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIndianCurrency(item.cgst)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIndianCurrency(item.sgst)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIndianCurrency(item.igst)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatIndianCurrency(item.cgst + item.sgst + item.igst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mt-4">
            <p>Note: This GST report is for informational purposes only. Please consult with your accountant for official GST filings.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GstReportManagement;
