import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';
import { FaMoneyCheckAlt, FaUserCheck, FaChartBar, FaFileInvoiceDollar, FaPlus, FaFileCsv, FaFileExcel, FaFilePdf, FaSearch, FaFilter, FaSortUp, FaSortDown, FaPrint } from 'react-icons/fa';
import PayrollList from './PayrollList';
import PayrollModal from './PayrollModal';
import AttendanceList from './AttendanceList';
import AttendanceModal from './AttendanceModal';
import payrollService from '../../api/payroll/payrollService';
import attendanceService from '../../api/payroll/attendanceService';
import LineChart from '../dashboard/LineChart';
import BarChart from '../dashboard/BarChart';
import PieChart from '../dashboard/PieChart';
import LoadingSpinner from '../ui/LoadingSpinner';
import DatePicker from '../ui/DatePicker';
import AsyncSelect from 'react-select/async';
import staffService from '../../api/staff/staffService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Pagination from '../ui/Pagination';

const TAB_DASHBOARD = 'dashboard';
const TAB_PAYROLL = 'payroll';
const TAB_ATTENDANCE = 'attendance';
const TAB_REPORTS = 'reports';

const tabList = [
  { id: TAB_DASHBOARD, label: 'Dashboard', icon: <FaChartBar /> },
  { id: TAB_PAYROLL, label: 'Payroll', icon: <FaMoneyCheckAlt /> },
  { id: TAB_ATTENDANCE, label: 'Attendance', icon: <FaUserCheck /> },
  { id: TAB_REPORTS, label: 'Reports', icon: <FaFileInvoiceDollar /> },
];

const PayrollManagement = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('payrollActiveTab') || TAB_DASHBOARD;
  });
  const [payrolls, setPayrolls] = useState([]);
  const [payrollModalOpen, setPayrollModalOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollError, setPayrollError] = useState(null);
  const [payrollSuccess, setPayrollSuccess] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [attendanceSuccess, setAttendanceSuccess] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // 'payroll' or 'attendance'
  // Search/filter/pagination state (placeholders for now)
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [payrollAnalytics, setPayrollAnalytics] = useState(null);
  const [attendanceAnalytics, setAttendanceAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  // Reports tab state
  const [reportDateRange, setReportDateRange] = useState({ start: null, end: null });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [reportStatus, setReportStatus] = useState('');
  const [dateFilterType, setDateFilterType] = useState('month'); // 'day', 'week', 'month', 'custom'
  const [showFilters, setShowFilters] = useState(false);

  // Persist active tab to localStorage
  useEffect(() => {
    localStorage.setItem('payrollActiveTab', activeTab);
  }, [activeTab]);

  // Helper to set date range for quick filters
  const setQuickDateRange = (type) => {
    const now = new Date();
    let start, end;
    if (type === 'day') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (type === 'week') {
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day + (day === 0 ? -6 : 1)); // Monday
      end = new Date(start);
      end.setDate(start.getDate() + 6); // Sunday
    } else if (type === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      start = reportDateRange.start;
      end = reportDateRange.end;
    }
    setReportDateRange({ start, end });
    setDateFilterType(type);
  };

  // Fetch payrolls on mount
  useEffect(() => { fetchPayrolls(); }, []);
  const fetchPayrolls = async () => {
    setPayrollLoading(true);
    setPayrollError(null);
    try {
      const data = await payrollService.getPayrolls({ search, ...filters, page: currentPage, limit: pageSize });
      setPayrolls(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setPayrollError(err.message || 'Failed to load payroll records');
    } finally {
      setPayrollLoading(false);
    }
  };

  // Fetch attendance on mount
  useEffect(() => { fetchAttendance(); }, []);
  const fetchAttendance = async () => {
    setAttendanceLoading(true);
    setAttendanceError(null);
    try {
      const data = await attendanceService.getAttendance({ search, ...filters, page: currentPage, limit: pageSize });
      setAttendance(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setAttendanceError(err.message || 'Failed to load attendance records');
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Fetch analytics on mount/dashboard tab
  useEffect(() => {
    if (activeTab === TAB_DASHBOARD) {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const [payroll, attendance] = await Promise.all([
        payrollService.getAnalytics(),
        attendanceService.getAnalytics()
      ]);
      setPayrollAnalytics(payroll);
      setAttendanceAnalytics(attendance);
    } catch (err) {
      setAnalyticsError(err.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Payroll handlers
  const handleAddPayroll = () => { setEditingPayroll(null); setPayrollModalOpen(true); };
  const handleEditPayroll = (payroll) => { setEditingPayroll(payroll); setPayrollModalOpen(true); };
  const handleDeletePayroll = (payroll) => { setDeleteTarget(payroll); setDeleteType('payroll'); setIsDeleteModalOpen(true); };
  const confirmDeletePayroll = async () => {
    if (!deleteTarget) return;
    try {
      setPayrollLoading(true);
      await payrollService.deletePayroll(deleteTarget._id);
      setPayrollSuccess('Payroll deleted successfully');
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchPayrolls();
    } catch (err) {
      setPayrollError(err.message || 'Failed to delete payroll');
    } finally {
      setPayrollLoading(false);
    }
  };
  const handlePayrollModalSubmit = async (form) => {
    setPayrollLoading(true);
    try {
      if (editingPayroll) {
        await payrollService.updatePayroll(editingPayroll._id, form);
        setPayrollSuccess('Payroll updated successfully');
      } else {
        await payrollService.addPayroll(form);
        setPayrollSuccess('Payroll added successfully');
      }
      setPayrollModalOpen(false);
      setEditingPayroll(null);
      fetchPayrolls();
    } catch (err) {
      setPayrollError(err.message || 'Failed to save payroll');
    } finally {
      setPayrollLoading(false);
    }
  };
  const handlePayrollModalClose = () => { setPayrollModalOpen(false); setEditingPayroll(null); };

  // Attendance handlers
  const handleAddAttendance = () => { setEditingAttendance(null); setAttendanceModalOpen(true); };
  const handleEditAttendance = (record) => { setEditingAttendance(record); setAttendanceModalOpen(true); };
  const handleDeleteAttendance = (record) => { setDeleteTarget(record); setDeleteType('attendance'); setIsDeleteModalOpen(true); };
  const confirmDeleteAttendance = async () => {
    if (!deleteTarget) return;
    try {
      setAttendanceLoading(true);
      await attendanceService.deleteAttendance(deleteTarget._id);
      setAttendanceSuccess('Attendance deleted successfully');
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
      fetchAttendance();
    } catch (err) {
      setAttendanceError(err.message || 'Failed to delete attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };
  const handleAttendanceModalSubmit = async (form) => {
    setAttendanceLoading(true);
    try {
      if (editingAttendance) {
        await attendanceService.updateAttendance(editingAttendance._id, form);
        setAttendanceSuccess('Attendance updated successfully');
      } else {
        await attendanceService.addAttendance(form);
        setAttendanceSuccess('Attendance added successfully');
      }
      setAttendanceModalOpen(false);
      setEditingAttendance(null);
      fetchAttendance();
    } catch (err) {
      setAttendanceError(err.message || 'Failed to save attendance');
    } finally {
      setAttendanceLoading(false);
    }
  };
  const handleAttendanceModalClose = () => { setAttendanceModalOpen(false); setEditingAttendance(null); };

  // Alerts auto-dismiss
  useEffect(() => { if (payrollError) toast.error(payrollError); }, [payrollError]);
  useEffect(() => { if (payrollSuccess) toast.success(payrollSuccess); }, [payrollSuccess]);
  useEffect(() => { if (attendanceError) toast.error(attendanceError); }, [attendanceError]);
  useEffect(() => { if (attendanceSuccess) toast.success(attendanceSuccess); }, [attendanceSuccess]);
  useEffect(() => {
    if (analyticsError) {
      toast.error(analyticsError);
    }
  }, [analyticsError]);

  // Delete modal confirm handler
  const handleDeleteConfirm = () => {
    if (deleteType === 'payroll') confirmDeletePayroll();
    else if (deleteType === 'attendance') confirmDeleteAttendance();
  };

  // Dummy employee loader for AsyncSelect
  const loadEmployeeOptions = async (inputValue) => {
    // Replace with real API call if needed
    const res = await staffService.getStaff({ search: inputValue, status: 'Active' });
    return (res.data || []).map(staff => ({ value: staff._id, label: staff.name }));
  };
  // Filtered data for reports
  const filteredPayrolls = payrolls.filter(p => {
    if (selectedEmployee && p.employeeId !== selectedEmployee.value) return false;
    if (reportStatus && p.status !== reportStatus) return false;
    // Date range filter (if implemented)
    return true;
  });
  const filteredAttendance = attendance.filter(a => {
    if (selectedEmployee && a.employeeId !== selectedEmployee.value) return false;
    if (reportStatus && a.status !== reportStatus) return false;
    // Date range filter (if implemented)
    return true;
  });
  // Export handlers (CSV only for now)
  // Update handleExportCSV to use proper CSV formatting
  function handleExportCSV() {
    const headers = ['Type', 'Employee', 'Date', 'Status', 'Amount/In', 'Out'];
    let csv = headers.join(',') + '\n';
    filteredPayrolls.concat(filteredAttendance).forEach(row => {
      let inTime = '', outTime = '';
      if (row.punches && row.punches.length > 0) {
        const punchesIn = row.punches.filter(p => p.type === 'IN');
        const punchesOut = row.punches.filter(p => p.type === 'OUT');
        if (punchesIn.length > 0) inTime = new Date(punchesIn[0].timeIn).toLocaleTimeString();
        if (punchesOut.length > 0) outTime = new Date(punchesOut[punchesOut.length - 1].timeIn).toLocaleTimeString();
      }
      const values = [
        row.amount !== undefined ? 'Payroll' : 'Attendance',
        (row.employeeName || row.employeeId || '').replace(/,/g, ' '),
        (row.date || '').replace(/,/g, ' '),
        (row.status || '').replace(/,/g, ' '),
        row.amount !== undefined ? `₹${row.amount || 0}` : inTime,
        row.amount !== undefined ? '-' : outTime
      ];
      csv += values.join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_attendance_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  // Update handleExportExcel to use CSV format but with .xls extension
  function handleExportExcel() {
    const headers = ['Type', 'Employee', 'Date', 'Status', 'Amount/In', 'Out'];
    let csv = headers.join(',') + '\n';
    filteredPayrolls.concat(filteredAttendance).forEach(row => {
      let inTime = '', outTime = '';
      if (row.punches && row.punches.length > 0) {
        const punchesIn = row.punches.filter(p => p.type === 'IN');
        const punchesOut = row.punches.filter(p => p.type === 'OUT');
        if (punchesIn.length > 0) inTime = new Date(punchesIn[0].timeIn).toLocaleTimeString();
        if (punchesOut.length > 0) outTime = new Date(punchesOut[punchesOut.length - 1].timeIn).toLocaleTimeString();
      }
      const values = [
        row.amount !== undefined ? 'Payroll' : 'Attendance',
        (row.employeeName || row.employeeId || '').replace(/,/g, ' '),
        (row.date || '').replace(/,/g, ' '),
        (row.status || '').replace(/,/g, ' '),
        row.amount !== undefined ? `₹${row.amount || 0}` : inTime,
        row.amount !== undefined ? '-' : outTime
      ];
      csv += values.join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_attendance_report.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }
  // Update handleExportPDF to use print as fallback, or clarify
  function handleExportPDF(e) {
    if (e && e.preventDefault) e.preventDefault();
    const doc = new jsPDF();
    const headers = [['Type', 'Employee', 'Date', 'Status', 'Amount/In', 'Out']];
    const rows = filteredPayrolls.concat(filteredAttendance).map(row => {
      let inTime = '', outTime = '';
      if (row.punches && row.punches.length > 0) {
        const punchesIn = row.punches.filter(p => p.type === 'IN');
        const punchesOut = row.punches.filter(p => p.type === 'OUT');
        if (punchesIn.length > 0) inTime = new Date(punchesIn[0].timeIn).toLocaleTimeString();
        if (punchesOut.length > 0) outTime = new Date(punchesOut[punchesOut.length - 1].timeIn).toLocaleTimeString();
      }
      return [
        row.amount !== undefined ? 'Payroll' : 'Attendance',
        row.employeeName || row.employeeId || '',
        row.date || '',
        row.status || '',
        row.amount !== undefined ? `₹${row.amount || 0}` : inTime,
        row.amount !== undefined ? '-' : outTime
      ];
    });
    doc.autoTable({ head: headers, body: rows });
    doc.save('payroll_attendance_report.pdf');
  }

  // Render dashboard analytics
  const renderDashboard = () => {
    if (analyticsLoading) {
      return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
    }
    // Remove Alert UI for analyticsError, use toast instead
    if (!payrollAnalytics || !attendanceAnalytics) {
      return <div className="text-gray-500">No analytics data available.</div>;
    }
    // Payroll trend chart data
    const payrollTrendData = {
      labels: payrollAnalytics.trend.map(t => `${t.month}/${t.year}`),
      datasets: [{
        label: 'Payroll Amount',
        data: payrollAnalytics.trend.map(t => t.total),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79,70,229,0.1)',
        fill: true,
        tension: 0.4
      }]
    };
    // Payroll status breakdown
    const payrollStatusData = {
      labels: payrollAnalytics.statusBreakdown.map(s => s._id),
      datasets: [{
        data: payrollAnalytics.statusBreakdown.map(s => s.count),
        backgroundColor: ['#4F46E5', '#F59E42', '#EF4444'],
        borderWidth: 1
      }]
    };
    // Top employees
    const topPayrollData = {
      labels: payrollAnalytics.topEmployees.map(e => e._id),
      datasets: [{
        label: 'Total Paid',
        data: payrollAnalytics.topEmployees.map(e => e.total),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      }]
    };
    // Attendance trend chart data
    const attendanceTrendData = {
      labels: attendanceAnalytics.trend.map(t => `${t.month}/${t.year}`),
      datasets: [
        {
          label: 'Present',
          data: attendanceAnalytics.trend.map(t => t.present),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Absent',
          data: attendanceAnalytics.trend.map(t => t.absent),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239,68,68,0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'On Leave',
          data: attendanceAnalytics.trend.map(t => t.onLeave),
          borderColor: '#F59E42',
          backgroundColor: 'rgba(245,158,66,0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
    // Attendance status breakdown
    const attendanceStatusData = {
      labels: attendanceAnalytics.statusBreakdown.map(s => s._id),
      datasets: [{
        data: attendanceAnalytics.statusBreakdown.map(s => s.count),
        backgroundColor: ['#10B981', '#EF4444', '#F59E42'],
        borderWidth: 1
      }]
    };
    // Top attendance
    const topAttendanceData = {
      labels: attendanceAnalytics.topAttendance.map(e => e._id),
      datasets: [{
        label: 'Days Present',
        data: attendanceAnalytics.topAttendance.map(e => e.count),
        backgroundColor: '#6366F1',
        borderColor: '#4F46E5',
        borderWidth: 1
      }]
    };
    return (
      <>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200 min-h-[80px] flex-1 flex flex-col justify-center">
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FaMoneyCheckAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Payrolls</h3>
                <p className="text-2xl font-bold text-blue-600">{payrollAnalytics.totalPayrolls}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-green-50 border-green-200 min-h-[80px] flex-1 flex flex-col justify-center">
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FaUserCheck className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Payroll Amount</h3>
                <p className="text-2xl font-bold text-green-600">₹{payrollAnalytics.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-purple-50 border-purple-200 min-h-[80px] flex-1 flex flex-col justify-center">
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <FaUserCheck className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Attendance</h3>
                <p className="text-2xl font-bold text-purple-600">{attendanceAnalytics.totalAttendance}</p>
              </div>
            </div>
          </Card>
        </div>
        {/* New Punch Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-yellow-50 border-yellow-200 min-h-[80px] flex-1 flex flex-col justify-center">
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FaUserCheck className="text-yellow-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Punches Today</h3>
                <p className="text-2xl font-bold text-yellow-600">{attendanceAnalytics.totalPunchesToday}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-orange-50 border-orange-200 min-h-[80px] flex-1 flex flex-col justify-center">
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-orange-100 p-3 mr-4">
                <FaUserCheck className="text-orange-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Punches This Month</h3>
                <p className="text-2xl font-bold text-orange-600">{attendanceAnalytics.totalPunchesThisMonth}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-teal-50 border-teal-200 min-h-[80px] flex-1 flex flex-col justify-center">
            <div className="p-4 flex items-center">
              <div className="rounded-full bg-teal-100 p-3 mr-4">
                <FaUserCheck className="text-teal-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Avg Punches/Employee</h3>
                <p className="text-2xl font-bold text-teal-600">{attendanceAnalytics.avgPunchesPerEmployee?.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-pink-50 border-pink-200 min-h-[80px] flex-1 flex flex-col justify-center">
            <div className="p-4 h-full flex flex-col justify-start">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="rounded-full bg-pink-100 p-3 mr-3">
                    <FaUserCheck className="text-pink-600 text-xl" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Most Punctual </span>
                  <span className="font-bold text-pink-600 ml-1">{attendanceAnalytics?.mostPunctual?._id || '-'}</span>
                </div>
                <span className="text-xs text-gray-500">{attendanceAnalytics?.mostPunctual?.count || 0} punches</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="rounded-full bg-gray-100 p-3 mr-3">
                    <FaUserCheck className="text-gray-600 text-xl" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Least Punctual </span>
                  <span className="font-bold text-gray-600 ml-1">{attendanceAnalytics?.leastPunctual?._id || '-'}</span>
                </div>
                <span className="text-xs text-gray-500">{attendanceAnalytics?.leastPunctual?.count || 0} punches</span>
              </div>
            </div>
          </Card>
        </div>
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card title="Payroll Trend">
            <LineChart data={payrollTrendData} height={250} />
          </Card>
          <Card title="Payroll Status Breakdown">
            <PieChart data={payrollStatusData} height={250} />
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card title="Top 5 Highest Paid Employees">
            <BarChart data={topPayrollData} height={250} />
          </Card>
          <Card title="Attendance Trend">
            <LineChart data={attendanceTrendData} height={250} />
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card title="Attendance Status Breakdown">
            <PieChart data={attendanceStatusData} height={250} />
          </Card>
          <Card title="Top 5 Perfect Attendance">
            <BarChart data={topAttendanceData} height={250} />
          </Card>
        </div>
      </>
    );
  };

  // Reports tab handlers
  const handleSort = (key) => {
    setFilters(prev => ({ ...prev, sortBy: key }));
  };

  const getSortIcon = (key) => {
    if (filters.sortBy === key) {
      return filters.sortOrder === 'asc' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
    }
    return null;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({});
    setSearch('');
    setShowFilters(false);
  };

  // Pagination logic for reports tab
  const reportsPageSize = pageSize;
  const reportsCurrentPage = currentPage;
  const allRows = filteredPayrolls.concat(filteredAttendance);
  const reportsTotalPages = Math.max(1, Math.ceil(allRows.length / reportsPageSize));
  const paginatedRows = allRows.slice((reportsCurrentPage - 1) * reportsPageSize, reportsCurrentPage * reportsPageSize);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll & Attendance Management</h1>
          <p className="text-gray-600 mt-1">Manage payroll, attendance, and related reports for your clinic staff.</p>
        </div>
        <div className="mt-4 md:mt-0">
          {activeTab === TAB_PAYROLL && (
            <Button onClick={handleAddPayroll} className="flex items-center">
              <FaPlus className="mr-2" /> Add Payroll
            </Button>
          )}
          {activeTab === TAB_ATTENDANCE && (
            <Button onClick={handleAddAttendance} className="flex items-center">
              <FaPlus className="mr-2" /> Add Attendance
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {/* Remove Alert UI for payrollError, payrollSuccess, attendanceError, attendanceSuccess */}

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabList.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === TAB_DASHBOARD && (
        <>
          {renderDashboard()}
        </>
      )}
      {activeTab === TAB_PAYROLL && (
        <Card>
          <PayrollList
            payrolls={payrolls}
            loading={payrollLoading}
            onAddPayroll={handleAddPayroll}
            onEditPayroll={handleEditPayroll}
            onDeletePayroll={handleDeletePayroll}
            totalPayrolls={payrolls.length}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            search={search}
            onSearch={setSearch}
            filters={filters}
            onFilterChange={setFilters}
            onExportData={() => toast.info('Export coming soon!')}
            onPrintList={() => window.print()}
          />
          <PayrollModal
            isOpen={payrollModalOpen}
            onClose={handlePayrollModalClose}
            onSubmit={handlePayrollModalSubmit}
            payroll={editingPayroll}
            mode={editingPayroll ? 'edit' : 'add'}
          />
        </Card>
      )}
      {activeTab === TAB_ATTENDANCE && (
        <Card>
          <AttendanceList
            attendance={attendance}
            loading={attendanceLoading}
            onAddAttendance={handleAddAttendance}
            onEditAttendance={handleEditAttendance}
            onDeleteAttendance={handleDeleteAttendance}
            totalAttendance={attendance.length}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            search={search}
            onSearch={setSearch}
            filters={filters}
            onFilterChange={setFilters}
            onExportData={() => toast.info('Export coming soon!')}
            onPrintList={() => window.print()}
            fetchAttendance={fetchAttendance}
          />
          <AttendanceModal
            isOpen={attendanceModalOpen}
            onClose={handleAttendanceModalClose}
            onSubmit={handleAttendanceModalSubmit}
            attendance={editingAttendance}
            mode={editingAttendance ? 'edit' : 'add'}
          />
        </Card>
      )}
      {activeTab === TAB_REPORTS && (
        <Card title="Payroll & Attendance Reports">
          {/* Search bar and filter toggle */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            {/* Left side - Search bar */}
            <div className="w-full md:w-auto mb-2 md:mb-0">
              <form className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search records..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <FaFilter />
                </button>
              </form>
            </div>
            {/* Right side - Export/Print buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleExportCSV} variant="secondary" className="flex items-center text-sm"><FaFileCsv className="mr-1" /> CSV</Button>
              <Button onClick={handleExportExcel} variant="secondary" className="flex items-center text-sm"><FaFileExcel className="mr-1" /> Excel</Button>
              <Button onClick={handleExportPDF} variant="secondary" className="flex items-center text-sm"><FaFilePdf className="mr-1" /> PDF</Button>
              <Button onClick={() => window.print()} variant="secondary" className="flex items-center text-sm"><FaPrint className="mr-1" /> Print</Button>
            </div>
          </div>
          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
                <Button
                  onClick={resetFilters}
                  variant="secondary"
                  size="sm"
                  className="flex items-center text-sm"
                >
                  <FaFilter className="mr-1" /> Remove Filters
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    name="month"
                    value={filters.month}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Months</option>
                    {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={filters.year}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Processed">Processed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <div className="flex">
                    <select
                      name="sortBy"
                      value={filters.sortBy}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="createdAt">Date Processed</option>
                      <option value="employeeName">Employee Name</option>
                      <option value="amount">Amount</option>
                      <option value="status">Status</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                      className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-white text-gray-500 hover:bg-gray-50"
                    >
                      {filters.sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Reports Table (same style as PayrollList) */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('employeeName')}>
                      Employee {getSortIcon('employeeName')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('month')}>
                      Month {getSortIcon('month')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('year')}>
                      Year {getSortIcon('year')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('amount')}>
                      Amount {getSortIcon('amount')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button className="flex items-center focus:outline-none" onClick={() => handleSort('status')}>
                      Status {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-400">No records found for selected filters.</td>
                  </tr>
                ) : (
                  paginatedRows.map((row, idx) => (
                    <tr key={row._id || idx}>
                      <td className="px-6 py-4 whitespace-nowrap">{row.employeeName || row.employeeId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.month || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.year || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.amount !== undefined ? `₹${row.amount}` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{row.status || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {/* Actions: view/edit/delete if needed */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <Pagination
            currentPage={reportsCurrentPage}
            totalPages={reportsTotalPages}
            onPageChange={setCurrentPage}
          />
          <div className="flex justify-end items-center mt-2">
            <span className="mr-2 text-sm text-gray-600">Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title={`Delete ${deleteType === 'payroll' ? 'Payroll' : 'Attendance'} Record`}
          message={`Are you sure you want to delete this ${deleteType === 'payroll' ? 'payroll' : 'attendance'} record? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default PayrollManagement; 