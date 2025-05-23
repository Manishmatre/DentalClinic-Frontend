import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import clinicService from '../../api/clinic/clinicService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Reports = () => {
  const { clinic } = useAuth();
  const [reportType, setReportType] = useState('financial');
  const [dateRange, setDateRange] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reportTypes = [
    { id: 'financial', label: 'Financial Reports' },
    { id: 'appointments', label: 'Appointment Statistics' },
    { id: 'patients', label: 'Patient Analytics' },
    { id: 'inventory', label: 'Inventory Reports' }
  ];

  const dateRanges = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' }
  ];

  const fetchReport = useCallback(async () => {
    if (!clinic?._id) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await clinicService.getReport(clinic._id, {
        type: reportType,
        dateRange: dateRange,
      });
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.message || 'Failed to load report');
    } finally {
      setIsLoading(false);
    }
  }, [clinic?._id, reportType, dateRange]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = async (format) => {
    try {
      setIsLoading(true);
      const response = await clinicService.exportReport(clinic._id, {
        type: reportType,
        dateRange: dateRange,
        format: format
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting report:', err);
      setError(err.response?.data?.message || 'Failed to export report');
    } finally {
      setIsLoading(false);
    }
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'financial':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-500">Total Revenue</div>
                  <div className="mt-1 text-3xl font-semibold text-green-600">
                    ₹{reportData.totalRevenue.toFixed(2)}
                  </div>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-500">Outstanding Payments</div>
                  <div className="mt-1 text-3xl font-semibold text-red-600">
                    ₹{reportData.outstandingPayments.toFixed(2)}
                  </div>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-500">Average Transaction</div>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">
                    ₹{reportData.averageTransaction.toFixed(2)}
                  </div>
                </div>
              </Card>
            </div>

            <Card title="Revenue Breakdown">
              <div className="p-6">
                {reportData.revenueByService.map((item) => (
                  <div key={item.service} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500">{item.service}</span>
                      <span className="text-sm font-medium text-gray-900">₹{item.amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${(item.amount / reportData.totalRevenue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-500">Total Appointments</div>
                  <div className="mt-1 text-3xl font-semibold text-indigo-600">
                    {reportData.totalAppointments}
                  </div>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-500">Completion Rate</div>
                  <div className="mt-1 text-3xl font-semibold text-green-600">
                    {reportData.completionRate}%
                  </div>
                </div>
              </Card>
              <Card>
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-500">No-show Rate</div>
                  <div className="mt-1 text-3xl font-semibold text-red-600">
                    {reportData.noShowRate}%
                  </div>
                </div>
              </Card>
            </div>

            <Card title="Appointments by Doctor">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.appointmentsByDoctor.map((item) => (
                      <tr key={item.doctorId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Dr. {item.doctorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.completed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 mr-2">
                              {((item.completed / item.total) * 100).toFixed(1)}%
                            </span>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${(item.completed / item.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-6 text-gray-500">
            Select a report type to view data
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <div className="space-x-2">
          <Button
            variant="secondary"
            onClick={() => handleExport('pdf')}
            disabled={isLoading || !reportData}
          >
            Export PDF
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExport('csv')}
            disabled={isLoading || !reportData}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <Alert 
          variant="error" 
          title="Error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {dateRanges.map((range) => (
                  <option key={range.id} value={range.id}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : (
        renderReportContent()
      )}
    </div>
  );
};

export default Reports;