import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Grid,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  CardHeader,
  CardBody,
  Text,
  HStack,
  useToast,
  SimpleGrid,
  Tooltip
} from '@chakra-ui/react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

import billService from '../../api/billing/billService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AsyncSelect from 'react-select/async';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FaFileCsv, FaFileExcel, FaFilePdf, FaSearch, FaChartBar, FaFileInvoiceDollar, FaFilter, FaPrint, FaSort, FaEye, FaUserCheck, FaRupeeSign, FaUserMd } from 'react-icons/fa';
import BillingForm from '../../components/billing/BillingForm';
import DentalBillDetails from '../../components/dental/DentalBillDetails';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import { PaymentForm } from '../../components/billing/AddPaymentModal';

const TAB_DASHBOARD = 'dashboard';
const TAB_INVOICES = 'invoices';
const TAB_PAYMENTS = 'payments';
const TAB_REFUNDS = 'refunds';
const TAB_GST = 'gst';
const TAB_ANALYTICS = 'analytics';
const tabList = [
  { id: TAB_DASHBOARD, label: 'Dashboard', icon: <FaChartBar /> },
  { id: TAB_INVOICES, label: 'Invoices', icon: <FaFileInvoiceDollar /> },
  { id: TAB_PAYMENTS, label: 'Payments', icon: <FaFilePdf /> },
  { id: TAB_REFUNDS, label: 'Refunds', icon: <FaFilePdf /> },
  { id: TAB_GST, label: 'GST Reports', icon: <FaFilePdf /> },
  { id: TAB_ANALYTICS, label: 'Analytics', icon: <FaChartBar /> },
];

// Helper for INR currency formatting
function formatINRCurrency(amount) {
  return (amount ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
}

const BillingDashboard = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBills: 0,
    summary: {
      totalBilled: 0,
      totalPaid: 0,
      totalPending: 0,
      totalInsuranceCoverage: 0,
      averageBillAmount: 0,
      totalOverdue: 0,
      totalRefunds: 0,
      avgPaymentDelay: 0
    },
    statusDistribution: [],
    monthlyTrend: [],
    paymentMethodDistribution: [],
    topPayer: null,
    topPatients: [],
    invoices: []
  });
  
  // Filter state
  const [timeRange, setTimeRange] = useState('6months');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [activeTab, setActiveTab] = useState(TAB_DASHBOARD);
  
  // Add show/hide state for Advanced Filters for each tab
  const [showInvoiceFilters, setShowInvoiceFilters] = useState(false);
  const [showPaymentFilters, setShowPaymentFilters] = useState(false);
  const [showRefundFilters, setShowRefundFilters] = useState(false);
  const [showGSTFilters, setShowGSTFilters] = useState(false);
  
  // Table data state
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [gstRecords, setGstRecords] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [deletePaymentError, setDeletePaymentError] = useState(null);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  
  useEffect(() => {
    fetchBillingStats();
  }, [timeRange]);
  
  // Fetch table data when tab changes
  useEffect(() => {
    if (activeTab === TAB_INVOICES) {
      fetchInvoices();
    } else if (activeTab === TAB_PAYMENTS) {
      fetchPayments();
    } else if (activeTab === TAB_REFUNDS) {
      fetchRefunds();
    } else if (activeTab === TAB_GST) {
      fetchGSTRecords();
    }
  }, [activeTab, currentPage, pageSize]);
  
  const fetchBillingStats = async () => {
    setLoading(true);
    try {
      // Calculate date range based on selected timeRange
      let startDate, endDate;
      const now = new Date();
      
      switch (timeRange) {
        case '30days':
          startDate = subMonths(now, 1);
          endDate = now;
          break;
        case '3months':
          startDate = subMonths(now, 3);
          endDate = now;
          break;
        case '6months':
          startDate = subMonths(now, 6);
          endDate = now;
          break;
        case '12months':
          startDate = subMonths(now, 12);
          endDate = now;
          break;
        case 'ytd':
          startDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
          endDate = now;
          break;
        default:
          startDate = subMonths(now, 6);
          endDate = now;
      }
      
      // Format dates for API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const response = await billService.getBillingStats(formattedStartDate, formattedEndDate);
      
      // Enhance the response with additional analytics
      const enhancedStats = {
        ...response,
        topPayer: response.topPayer || null,
        topPatients: response.topPatients || [],
        invoices: response.invoices || [],
        summary: {
          ...response.summary,
          totalOverdue: response.summary?.totalOverdue || 0,
          totalRefunds: response.summary?.totalRefunds || 0,
          avgPaymentDelay: response.summary?.avgPaymentDelay || 0
        }
      };
      
      setStats(enhancedStats);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch billing statistics',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch invoices data
  const fetchInvoices = async () => {
    setTableLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        search: search,
        status: statusFilter,
        startDate: dateRange.start,
        endDate: dateRange.end
      };
      const response = await billService.getBills(params);
      setInvoices(Array.isArray(response?.bills) ? response.bills : Array.isArray(response?.data) ? response.data : []);
      setTotalRecords(response.pagination?.total || response.total || response.data?.length || 0);
      setTotalPages(response.pagination?.pages || response.totalPages || 1);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch invoices',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTableLoading(false);
    }
  };
  
  // Fetch payments data (aggregate from all bills)
  const fetchPayments = async () => {
    setTableLoading(true);
    try {
      const params = {
        page: 1, // fetch all bills for aggregation
        limit: 1000, // adjust as needed for large clinics
        search: search,
        status: statusFilter,
        startDate: dateRange.start,
        endDate: dateRange.end
      };
      const response = await billService.getBills(params);
      const bills = Array.isArray(response?.bills) ? response.bills : Array.isArray(response?.data) ? response.data : [];
      // Aggregate all payments from all bills
      const allPayments = bills.flatMap(bill =>
        (bill.payments || []).map(payment => ({
          ...payment,
          billNumber: bill.billNumber || bill.invoiceNumber || bill.id,
          patient: bill.patientId?.name || bill.patient || '-',
          doctor: bill.doctorId?.userId?.name || bill.doctorId?.name || '-',
          billDate: bill.createdAt || bill.billDate || bill.date,
          billId: bill._id || bill.id
        }))
      );
      setPayments(allPayments);
      setTotalRecords(allPayments.length);
      setTotalPages(Math.ceil(allPayments.length / pageSize));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch payments',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTableLoading(false);
    }
  };
  
  // Fetch refunds data
  const fetchRefunds = async () => {
    setTableLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockRefunds = [
        { id: 'REF-001', date: '2024-06-03', patient: 'Patient 1', amount: 500, mode: 'Cash', invoice: 'INV-001', paymentId: 'PAY-001', status: 'Processed' },
        { id: 'REF-002', date: '2024-06-03', patient: 'Patient 2', amount: 1000, mode: 'Card', invoice: 'INV-002', paymentId: 'PAY-002', status: 'Pending' },
        { id: 'REF-003', date: '2024-06-03', patient: 'Patient 3', amount: 1500, mode: 'UPI', invoice: 'INV-003', paymentId: 'PAY-003', status: 'Failed' },
        { id: 'REF-004', date: '2024-06-03', patient: 'Patient 4', amount: 2000, mode: 'Cheque', invoice: 'INV-004', paymentId: 'PAY-004', status: 'Processed' },
        { id: 'REF-005', date: '2024-06-03', patient: 'Patient 5', amount: 2500, mode: 'Cash', invoice: 'INV-005', paymentId: 'PAY-005', status: 'Processed' }
      ];
      setRefunds(mockRefunds);
      setTotalRecords(mockRefunds.length);
      setTotalPages(1);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch refunds',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTableLoading(false);
    }
  };
  
  // Fetch GST records data
  const fetchGSTRecords = async () => {
    setTableLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockGSTRecords = [
        { id: 'GST-001', date: '2024-06-04', invoice: 'INV-001', patient: 'Patient 1', amount: 2000, gstAmount: 360, status: 'Filed' },
        { id: 'GST-002', date: '2024-06-04', invoice: 'INV-002', patient: 'Patient 2', amount: 4000, gstAmount: 720, status: 'Pending' },
        { id: 'GST-003', date: '2024-06-04', invoice: 'INV-003', patient: 'Patient 3', amount: 6000, gstAmount: 1080, status: 'Filed' },
        { id: 'GST-004', date: '2024-06-04', invoice: 'INV-004', patient: 'Patient 4', amount: 8000, gstAmount: 1440, status: 'Filed' },
        { id: 'GST-005', date: '2024-06-04', invoice: 'INV-005', patient: 'Patient 5', amount: 10000, gstAmount: 1800, status: 'Pending' }
      ];
      setGstRecords(mockGSTRecords);
      setTotalRecords(mockGSTRecords.length);
      setTotalPages(1);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch GST records',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTableLoading(false);
    }
  };
  
  // Export functions
  const handleExport = async (type, tabData, tabName) => {
    try {
      const headers = getHeadersForTab(tabName);
      const rows = tabData.map(item => getRowDataForTab(item, tabName));
      
      if (type === 'csv' || type === 'excel') {
        let csv = headers.join(',') + '\n';
        rows.forEach(r => { csv += r.join(',') + '\n'; });
        const blob = new Blob([csv], { type: type === 'csv' ? 'text/csv' : 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tabName.toLowerCase()}_report.${type === 'csv' ? 'csv' : 'xls'}`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (type === 'pdf') {
        const doc = new jsPDF();
        doc.autoTable({ head: [headers], body: rows });
        doc.save(`${tabName.toLowerCase()}_report.pdf`);
      }
      
      toast({
        title: 'Success',
        description: `${tabName} exported successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to export ${tabName}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const getHeadersForTab = (tabName) => {
    switch (tabName) {
      case 'Invoices':
        return ['Invoice #', 'Date', 'Patient', 'Amount', 'Status', 'Type', 'Payment Mode', 'GST'];
      case 'Payments':
        return ['Payment ID', 'Date', 'Patient', 'Amount', 'Mode', 'Invoice #', 'Status'];
      case 'Refunds':
        return ['Refund ID', 'Date', 'Patient', 'Amount', 'Mode', 'Invoice #', 'Payment ID', 'Status'];
      case 'GST':
        return ['GST ID', 'Date', 'Invoice #', 'Patient', 'Amount', 'GST Amount', 'Status'];
      default:
        return [];
    }
  };
  
  const getRowDataForTab = (item, tabName) => {
    switch (tabName) {
      case 'Invoices': {
        // Determine if this is a dental bill
        const isDental = Array.isArray(item.items) && item.items.some(i => i.category === 'procedure' && i.procedureId);
        return [
          item.invoiceNumber || item.billNumber || item.id,
          format(new Date(item.createdAt || item.billDate || item.date), 'dd MMM yyyy'),
          item.patientName || item.patient,
          formatINRCurrency(item.totalAmount || item.total || item.amount),
          item.paymentStatus || item.status,
          isDental ? 'Dental' : 'General',
          item.paymentMode || '-',
          formatINRCurrency(item.gst || 0)
        ];
      }
      case 'Payments':
        return [
          item.id,
          format(new Date(item.date), 'dd MMM yyyy'),
          item.patient,
          formatINRCurrency(item.amount),
          item.mode,
          item.invoice,
          item.status
        ];
      case 'Refunds':
        return [
          item.id,
          format(new Date(item.date), 'dd MMM yyyy'),
          item.patient,
          formatINRCurrency(item.amount),
          item.mode,
          item.invoice,
          item.paymentId,
          item.status
        ];
      case 'GST':
        return [
          item.id,
          format(new Date(item.date), 'dd MMM yyyy'),
          item.invoice,
          item.patient,
          formatINRCurrency(item.amount),
          formatINRCurrency(item.gstAmount),
          item.status
        ];
      default:
        return [];
    }
  };
  
  // Prepare and format data for charts
  const formatStatusData = () => {
    if (!stats.statusDistribution || !Array.isArray(stats.statusDistribution)) return [];
    return stats.statusDistribution.map(item => ({
      name: item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'Unknown',
      value: item.amount || 0
    }));
  };
  
  const formatMonthlyTrendData = () => {
    if (!stats.monthlyTrend || !Array.isArray(stats.monthlyTrend)) return [];
    return stats.monthlyTrend.map(item => ({
      month: `${item.month || '?'}/${item.year || '?'}`,
      billed: item.totalBilled || 0,
      paid: item.totalPaid || 0,
      count: item.count || 0
    }));
  };
  
  const formatPaymentMethodData = () => {
    if (!stats.paymentMethodDistribution || !Array.isArray(stats.paymentMethodDistribution)) return [];
    return stats.paymentMethodDistribution.map(item => ({
      name: item.method ? (item.method.replace('_', ' ').charAt(0).toUpperCase() + item.method.replace('_', ' ').slice(1)) : 'Unknown',
      value: item.amount || 0
    }));
  };
  
  const calculateCollectionRate = () => {
    if (!stats.summary || !stats.summary.totalBilled) return 0;
    return (stats.summary.totalPaid / stats.summary.totalBilled) * 100;
  };
  
  if (loading || !stats.summary) {
    return <LoadingSpinner />;
  }
  
  // Handlers for CRUD
  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceModal(true);
  };
  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceModal(true);
  };
  const handleViewInvoice = (invoice) => {
    setViewingInvoice(invoice);
    setShowInvoiceDetail(true);
  };
  const handleDeleteInvoice = (invoice) => {
    setDeletingInvoice(invoice);
    setDeleteError(null);
  };
  const handleConfirmDeleteInvoice = async () => {
    if (!deletingInvoice) return;
    try {
      const res = await billService.deleteBill(deletingInvoice._id || deletingInvoice.id);
      if (res && !res.error) {
        setDeletingInvoice(null);
        fetchInvoices();
        toast({ title: 'Invoice deleted', status: 'success', duration: 3000 });
      } else {
        throw new Error(res.error || 'Failed to delete invoice');
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete invoice');
    }
  };
  
  // Handlers for Payment CRUD
  const handleAddPayment = (bill) => {
    setSelectedBillForPayment(bill);
    setEditingPayment(null);
    setShowPaymentModal(true);
  };
  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowPaymentModal(true);
  };
  const handleViewPayment = (payment) => {
    setViewingPayment(payment);
    setShowPaymentDetail(true);
  };
  const handleDeletePayment = (payment) => {
    setDeletingPayment(payment);
    setDeletePaymentError(null);
  };
  const handleConfirmDeletePayment = async () => {
    if (!deletingPayment) return;
    try {
      // Implement delete payment API call here
      // await billService.deletePayment(deletingPayment._id || deletingPayment.id);
      setDeletingPayment(null);
      fetchPayments();
      toast({ title: 'Payment deleted', status: 'success', duration: 3000 });
    } catch (err) {
      setDeletePaymentError(err.message || 'Failed to delete payment');
    }
  };
  
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance & Billing Management</h1>
          <p className="text-gray-600 mt-1">Manage all aspects of your clinic's finances, including billing, invoices, payments, and financial reports.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="ytd">Year to Date</option>
          </select>
        </div>
      </div>
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
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200 min-h-[40px] flex-1 flex flex-col justify-center">
              <div className="p-2 flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <FaFileInvoiceDollar className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Billed</h3>
                  <p className="text-2xl font-bold text-blue-600">{formatINRCurrency(stats.summary.totalBilled)}</p>
                  <span className="text-xs text-gray-500">From {stats.totalBills} bills</span>
                </div>
              </div>
        </Card>
            <Card className="bg-green-50 border-green-200 min-h-[40px] flex-1 flex flex-col justify-center">
              <div className="p-2 flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <FaFilePdf className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Collected</h3>
                  <p className="text-2xl font-bold text-green-600">{formatINRCurrency(stats.summary.totalPaid)}</p>
                  <span className="text-xs text-gray-500">{calculateCollectionRate().toFixed(1)}% collection rate</span>
                </div>
              </div>
        </Card>
            <Card className="bg-yellow-50 border-yellow-200 min-h-[40px] flex-1 flex flex-col justify-center">
              <div className="p-2 flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <FaFileInvoiceDollar className="text-yellow-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Outstanding</h3>
                  <p className="text-2xl font-bold text-yellow-600">{formatINRCurrency(stats.summary.totalPending)}</p>
                  <span className="text-xs text-gray-500">Awaiting payment</span>
                </div>
              </div>
        </Card>
            <Card className="bg-red-50 border-red-200 min-h-[40px] flex-1 flex flex-col justify-center">
              <div className="p-2 flex items-center">
                <div className="rounded-full bg-red-100 p-3 mr-4">
                  <FaFileInvoiceDollar className="text-red-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Overdue</h3>
                  <p className="text-2xl font-bold text-red-600">{formatINRCurrency(stats.summary.totalOverdue || 0)}</p>
                  <span className="text-xs text-gray-500">Past due</span>
                </div>
              </div>
        </Card>
          </div>
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-indigo-50 border-indigo-200 min-h-[40px] flex-1 flex flex-col justify-center">
              <div className="p-2 flex items-center">
                <div className="rounded-full bg-indigo-100 p-3 mr-4">
                  <FaUserCheck className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Top Payer</h3>
                  <p className="text-lg font-bold text-indigo-600">{stats.topPayer?.name || '-'}</p>
                  <span className="text-xs text-gray-500">{formatINRCurrency(stats.topPayer?.amount || 0)}</span>
                </div>
              </div>
            </Card>
            <Card className="bg-orange-50 border-orange-200 min-h-[40px] flex-1 flex flex-col justify-center">
              <div className="p-2 flex items-center">
                <div className="rounded-full bg-orange-100 p-3 mr-4">
                  <FaFileInvoiceDollar className="text-orange-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Avg Bill Amount</h3>
                  <p className="text-2xl font-bold text-orange-600">{formatINRCurrency(stats.summary.averageBillAmount)}</p>
                  <span className="text-xs text-gray-500">Per bill</span>
                </div>
              </div>
            </Card>
            <Card className="bg-pink-50 border-pink-200 min-h-[40px] flex-1 flex flex-col justify-center">
              <div className="p-2 flex items-center">
                <div className="rounded-full bg-pink-100 p-3 mr-4">
                  <FaFileInvoiceDollar className="text-pink-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Refunds</h3>
                  <p className="text-2xl font-bold text-pink-600">{formatINRCurrency(stats.summary?.totalRefunds ?? 0)}</p>
                  <span className="text-xs text-gray-500">Processed</span>
                </div>
              </div>
            </Card>
            <Card className="bg-teal-50 border-teal-200 min-h-[40px] flex-1 flex flex-col justify-center">
              <div className="p-2 flex items-center">
                <div className="rounded-full bg-teal-100 p-3 mr-4">
                  <FaFileInvoiceDollar className="text-teal-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Avg Payment Delay</h3>
                  <p className="text-2xl font-bold text-teal-600">{stats.summary?.avgPaymentDelay ?? 0}d</p>
                  <span className="text-xs text-gray-500">From bill to payment</span>
                </div>
              </div>
            </Card>
          </div>
      {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
              <div className="p-4">
                <div className="text-lg font-semibold mb-2">Monthly Revenue Trend</div>
              </div>
              <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formatMonthlyTrendData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                    <RechartsTooltip formatter={(value) => formatINRCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="billed" stroke="#8884d8" name="Billed Amount" />
                <Line type="monotone" dataKey="paid" stroke="#82ca9d" name="Collected Amount" />
              </LineChart>
            </ResponsiveContainer>
              </div>
        </Card>
        <Card>
              <div className="p-4">
                <div className="text-lg font-semibold mb-2">Bill Status Distribution</div>
              </div>
              <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatStatusData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {formatStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                    <RechartsTooltip formatter={(value) => formatINRCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
              </div>
        </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
              <div className="p-4">
                <div className="text-lg font-semibold mb-2">Payment Methods</div>
              </div>
              <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formatPaymentMethodData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                    <RechartsTooltip formatter={(value) => formatINRCurrency(value)} />
                <Bar dataKey="value" fill="#82ca9d" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
              </div>
        </Card>
        <Card>
              <div className="p-4">
                <div className="text-lg font-semibold mb-2">Insurance Coverage</div>
              </div>
              <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Covered by Insurance', value: stats.summary?.totalInsuranceCoverage || 0 },
                    { 
                      name: 'Patient Responsibility', 
                      value: Math.max(0, (stats.summary?.totalBilled || 0) - (stats.summary?.totalInsuranceCoverage || 0))
                    }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#0088FE" />
                  <Cell fill="#00C49F" />
                </Pie>
                    <RechartsTooltip formatter={(value) => formatINRCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
              </div>
        </Card>
          </div>
        </>
      )}
      {activeTab === TAB_INVOICES && (
        <div className="space-y-4">
          {/* Top row: Search, filter toggle, export/print/add */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="w-full md:w-auto mb-2 md:mb-0">
              <form className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input type="text" placeholder="Search invoices..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64" />
                </div>
                <button type="button" onClick={() => setShowInvoiceFilters(v => !v)} className="px-4 py-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <FaFilter />
                </button>
              </form>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => handleExport('pdf', invoices, 'Invoices')}><FaFilePdf className="mr-1" /> PDF</Button>
              <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => handleExport('excel', invoices, 'Invoices')}><FaFileExcel className="mr-1" /> Excel</Button>
              <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => handleExport('csv', invoices, 'Invoices')}><FaFileCsv className="mr-1" /> CSV</Button>
              <Button variant="secondary" size="sm" className="flex items-center text-sm"><FaPrint className="mr-1" /> Print</Button>
              <Button variant="primary" size="sm" className="flex items-center text-sm ml-2" onClick={handleAddInvoice}><FaFileInvoiceDollar className="mr-1" /> Add Invoice</Button>
            </div>
          </div>
          {/* Advanced Filters (collapsible) */}
          {showInvoiceFilters && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
                <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => setShowInvoiceFilters(false)}><FaFilter className="mr-1" /> Remove Filters</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Payment Modes</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex items-center gap-2">
                    <input type="date" className="border rounded px-2 py-1" />
                    <span className="mx-1">to</span>
                    <input type="date" className="border rounded px-2 py-1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <AsyncSelect /* patient filter, mock options */ />
                </div>
              </div>
            </div>
          )}
          {/* Table */}
          <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><input type="checkbox" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Invoice # <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Date <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Patient <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Amount <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Mode</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableLoading ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-4 whitespace-nowrap text-center">Loading...</td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-4 whitespace-nowrap text-center">No invoices found.</td>
                    </tr>
                  ) : (
                    invoices.map(inv => (
                      <tr key={inv._id || inv.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaFileInvoiceDollar className="h-5 w-5 text-green-600 mr-2" />
                            {inv.billNumber || inv.invoiceNumber || inv.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(inv.createdAt || inv.date), 'dd MMM yyyy')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.patientId?.name || inv.patient || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaUserMd className="h-5 w-5 text-indigo-500 mr-2" />
                            <Tooltip content={`Doctor ID: ${inv.doctorId?._id || inv.doctorId || 'Unknown'}`}>
                              <span>{
                                inv.doctorId?.userId?.name ||
                                inv.doctorId?.name ||
                                (typeof inv.doctorId === 'string' && inv.doctorId !== '[object Object]' ? inv.doctorId : 'N/A')
                              }</span>
                            </Tooltip>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.dueDate ? format(new Date(inv.dueDate), 'dd MMM yyyy') : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaRupeeSign className="mr-1 text-green-500" />
                            {(inv.totalAmount || inv.total || inv.amount || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.paymentStatus || inv.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.paymentMode || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <Tooltip content="View">
                              <Button variant="primary" size="xs" className="p-2" onClick={() => handleViewInvoice(inv)}>
                                <FaEye size={16} />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Download PDF">
                              <Button variant="success" size="xs" className="p-2">
                                <FaFilePdf size={16} />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Refund">
                              <Button variant="danger" size="xs" className="p-2" onClick={() => handleDeleteInvoice(inv)}>
                                <FaFileInvoiceDollar size={16} />
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} results
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={pageSize} 
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <Button 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
          {/* CRUD Modals */}
          {showInvoiceModal && (
            <Modal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} title={editingInvoice ? 'Edit Invoice' : 'Add Invoice'}>
              <BillingForm
                initialData={editingInvoice}
                onSubmit={async (data) => {
                  if (editingInvoice) {
                    await billService.updateBill(editingInvoice._id || editingInvoice.id, data);
                  } else {
                    await billService.createBill(data);
                  }
                  setShowInvoiceModal(false);
                  fetchInvoices();
                }}
                onCancel={() => setShowInvoiceModal(false)}
              />
            </Modal>
          )}
          {showInvoiceDetail && viewingInvoice && (
            <Modal isOpen={showInvoiceDetail} onClose={() => setShowInvoiceDetail(false)} title="Invoice Details">
              <DentalBillDetails 
                bill={viewingInvoice} 
                onClose={() => setShowInvoiceDetail(false)} 
                payMode={!!(viewingInvoice && viewingInvoice.balanceAmount > 0)}
                onPaymentSuccess={() => {
                  setShowInvoiceDetail(false);
                  fetchInvoices();
                }}
              />
            </Modal>
          )}
          {deletingInvoice && (
            <Modal isOpen={!!deletingInvoice} onClose={() => setDeletingInvoice(null)} title="Delete Invoice">
              <Alert variant="error" title="Are you sure you want to delete this invoice?" message={deleteError || ''} />
              <div className="flex justify-end space-x-3 mt-4">
                <Button variant="secondary" onClick={() => setDeletingInvoice(null)}>Cancel</Button>
                <Button variant="danger" onClick={handleConfirmDeleteInvoice}>Delete</Button>
              </div>
            </Modal>
          )}
        </div>
      )}
      {activeTab === TAB_PAYMENTS && (
        <div className="space-y-4">
          {/* Top row: Search, filter toggle, export/print/add */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="w-full md:w-auto mb-2 md:mb-0">
              <form className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input type="text" placeholder="Search payments..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64" />
                </div>
                <button type="button" onClick={() => setShowPaymentFilters(v => !v)} className="px-4 py-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <FaFilter />
                </button>
              </form>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => handleExport('pdf', payments, 'Payments')}><FaFilePdf className="mr-1" /> PDF</Button>
              <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => handleExport('excel', payments, 'Payments')}><FaFileExcel className="mr-1" /> Excel</Button>
              <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => handleExport('csv', payments, 'Payments')}><FaFileCsv className="mr-1" /> CSV</Button>
              <Button variant="secondary" size="sm" className="flex items-center text-sm"><FaPrint className="mr-1" /> Print</Button>
              <Button variant="primary" size="sm" className="flex items-center text-sm ml-2" onClick={() => handleAddPayment(null)}><FaFileInvoiceDollar className="mr-1" /> Add Payment</Button>
            </div>
          </div>
          {/* Advanced Filters (collapsible) */}
          {showPaymentFilters && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
                <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => setShowPaymentFilters(false)}><FaFilter className="mr-1" /> Remove Filters</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Statuses</option>
                    <option value="Success">Success</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Payment Modes</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex items-center gap-2">
                    <input type="date" className="border rounded px-2 py-1" />
                    <span className="mx-1">to</span>
                    <input type="date" className="border rounded px-2 py-1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <AsyncSelect /* patient filter, mock options */ />
                </div>
              </div>
            </div>
          )}
          {/* Table */}
          <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><input type="checkbox" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Payment ID <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Date <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Patient <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableLoading ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-4 whitespace-nowrap text-center">Loading...</td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-4 whitespace-nowrap text-center">No payments found.</td>
                    </tr>
                  ) : (
                    payments.map(pay => (
                      <tr key={pay._id || pay.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pay._id || pay.id || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{
                          pay.billDate && !isNaN(new Date(pay.billDate))
                            ? format(new Date(pay.billDate), 'dd MMM yyyy')
                            : '-'
                        }</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pay.patient || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pay.doctor || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaRupeeSign className="mr-1 text-green-500" />
                            {(pay.amount || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pay.paymentMethod || pay.method || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pay.billNumber || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pay.status || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <Tooltip content="View">
                              <Button variant="primary" size="xs" className="p-2">
                                <FaEye size={16} />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Download PDF">
                              <Button variant="success" size="xs" className="p-2">
                                <FaFilePdf size={16} />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Refund">
                              <Button variant="danger" size="xs" className="p-2">
                                <FaFileInvoiceDollar size={16} />
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} results
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={pageSize} 
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <Button 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
          {/* Payment CRUD Modals */}
          {showPaymentModal && (
            <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title={editingPayment ? 'Edit Payment' : 'Add Payment'}>
              <PaymentForm
                bill={selectedBillForPayment}
                onSubmit={() => {
                  setShowPaymentModal(false);
                  fetchPayments();
                }}
                onCancel={() => setShowPaymentModal(false)}
              />
            </Modal>
          )}
          {showPaymentDetail && viewingPayment && (
            <Modal isOpen={showPaymentDetail} onClose={() => setShowPaymentDetail(false)} title="Payment Details">
              <PaymentDetail payment={viewingPayment} onEdit={handleEditPayment} onBack={() => setShowPaymentDetail(false)} />
            </Modal>
          )}
          {deletingPayment && (
            <Modal isOpen={!!deletingPayment} onClose={() => setDeletingPayment(null)} title="Delete Payment">
              <Alert variant="error" title="Are you sure you want to delete this payment?" message={deletePaymentError || ''} />
              <div className="flex justify-end space-x-3 mt-4">
                <Button variant="secondary" onClick={() => setDeletingPayment(null)}>Cancel</Button>
                <Button variant="danger" onClick={handleConfirmDeletePayment}>Delete</Button>
              </div>
            </Modal>
          )}
        </div>
      )}
      {activeTab === TAB_REFUNDS && (
        <div className="space-y-4">
          {/* Top row: Search, filter toggle, export/print/add */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="w-full md:w-auto mb-2 md:mb-0">
              <form className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input type="text" placeholder="Search refunds..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64" />
                </div>
                <button type="button" onClick={() => setShowRefundFilters(v => !v)} className="px-4 py-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <FaFilter />
                </button>
              </form>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => handleExport('pdf', refunds, 'Refunds')}><FaFilePdf className="mr-1" /> PDF</Button>
              <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => handleExport('excel', refunds, 'Refunds')}><FaFileExcel className="mr-1" /> Excel</Button>
              <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => handleExport('csv', refunds, 'Refunds')}><FaFileCsv className="mr-1" /> CSV</Button>
              <Button variant="secondary" size="sm" className="flex items-center text-sm"><FaPrint className="mr-1" /> Print</Button>
            </div>
          </div>
          {/* Advanced Filters (collapsible) */}
          {showRefundFilters && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
                <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => setShowRefundFilters(false)}><FaFilter className="mr-1" /> Remove Filters</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Statuses</option>
                    <option value="Processed">Processed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Payment Modes</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex items-center gap-2">
                    <input type="date" className="border rounded px-2 py-1" />
                    <span className="mx-1">to</span>
                    <input type="date" className="border rounded px-2 py-1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <AsyncSelect /* patient filter, mock options */ />
                </div>
              </div>
            </div>
          )}
          {/* Table */}
          <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><input type="checkbox" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Refund ID <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Date <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Patient <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableLoading ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-4 whitespace-nowrap text-center">Loading...</td>
                    </tr>
                  ) : refunds.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-4 whitespace-nowrap text-center">No refunds found.</td>
                    </tr>
                  ) : (
                    refunds.map(ref => (
                      <tr key={ref._id || ref.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaFileInvoiceDollar className="h-5 w-5 text-green-600 mr-2" />
                            {ref.id || ref.refundId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(ref.date), 'dd MMM yyyy')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ref.patientId?.name || ref.patient || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaUserMd className="h-5 w-5 text-indigo-500 mr-2" />
                            <Tooltip content={`Doctor ID: ${ref.doctorId?._id || ref.doctorId || 'Unknown'}`}>
                              <span>{ref.doctorId?.userId?.name || ref.doctorId?.name || (typeof ref.doctorId === 'string' && ref.doctorId !== '[object Object]' ? ref.doctorId : 'N/A')}</span>
                            </Tooltip>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaRupeeSign className="mr-1 text-green-500" />
                            {(ref.amount || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ref.mode || ref.paymentMode || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaFileInvoiceDollar className="h-5 w-5 text-green-600 mr-2" />
                            {ref.invoiceNumber || ref.invoice || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ref.status || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <Tooltip content="View">
                              <Button variant="primary" size="xs" className="p-2">
                                <FaEye size={16} />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Download PDF">
                              <Button variant="success" size="xs" className="p-2">
                                <FaFilePdf size={16} />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Refund">
                              <Button variant="danger" size="xs" className="p-2">
                                <FaFileInvoiceDollar size={16} />
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} results
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={pageSize} 
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <Button 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
      {activeTab === TAB_GST && (
        <div className="space-y-4">
          {/* Top row: Search, filter toggle, export/print/add */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="w-full md:w-auto mb-2 md:mb-0">
              <form className="flex">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input type="text" placeholder="Search GST reports..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64" />
                </div>
                <button type="button" onClick={() => setShowGSTFilters(v => !v)} className="px-4 py-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <FaFilter />
                </button>
              </form>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => handleExport('pdf', gstRecords, 'GST')}><FaFilePdf className="mr-1" /> PDF</Button>
              <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => handleExport('excel', gstRecords, 'GST')}><FaFileExcel className="mr-1" /> Excel</Button>
              <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => handleExport('csv', gstRecords, 'GST')}><FaFileCsv className="mr-1" /> CSV</Button>
              <Button variant="secondary" size="sm" className="flex items-center text-sm"><FaPrint className="mr-1" /> Print</Button>
            </div>
          </div>
          {/* Advanced Filters (collapsible) */}
          {showGSTFilters && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
                <Button variant="secondary" size="sm" className="flex items-center text-sm" onClick={() => setShowGSTFilters(false)}><FaFilter className="mr-1" /> Remove Filters</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Statuses</option>
                    <option value="Filed">Filed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Payment Modes</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex items-center gap-2">
                    <input type="date" className="border rounded px-2 py-1" />
                    <span className="mx-1">to</span>
                    <input type="date" className="border rounded px-2 py-1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                  <AsyncSelect /* patient filter, mock options */ />
                </div>
              </div>
            </div>
          )}
          {/* Table */}
          <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><input type="checkbox" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">GST ID <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Date <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Patient <FaSort className="inline ml-1 text-gray-300" /></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableLoading ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-4 whitespace-nowrap text-center">Loading...</td>
                    </tr>
                  ) : gstRecords.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-4 whitespace-nowrap text-center">No GST records found.</td>
                    </tr>
                  ) : (
                    gstRecords.map(gst => (
                      <tr key={gst.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaFileInvoiceDollar className="h-5 w-5 text-green-600 mr-2" />
                            {gst.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(gst.date), 'dd MMM yyyy')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gst.patientId?.name || gst.patient || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaUserMd className="h-5 w-5 text-indigo-500 mr-2" />
                            <Tooltip content={`Doctor ID: ${gst.doctorId?._id || gst.doctorId || 'Unknown'}`}>
                              <span>{gst.doctorId?.userId?.name || gst.doctorId?.name || (typeof gst.doctorId === 'string' && gst.doctorId !== '[object Object]' ? gst.doctorId : 'N/A')}</span>
                            </Tooltip>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaRupeeSign className="mr-1 text-green-500" />
                            {(gst.amount || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaRupeeSign className="mr-1 text-blue-500" />
                            {(gst.gstAmount || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gst.mode || gst.paymentMode || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <FaFileInvoiceDollar className="h-5 w-5 text-green-600 mr-2" />
                            {gst.invoiceNumber || gst.invoice || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gst.status || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <Tooltip content="View">
                              <Button variant="primary" size="xs" className="p-2">
                                <FaEye size={16} />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Download PDF">
                              <Button variant="success" size="xs" className="p-2">
                                <FaFilePdf size={16} />
                              </Button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} results
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={pageSize} 
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <Button 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
      {activeTab === TAB_ANALYTICS && (
        <div className="space-y-4">
          <div className="text-xl font-semibold mb-4">Finance Analytics Summary</div>
          {/* KPI Cards condensed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card><div className="p-4"><div className="text-sm font-medium text-gray-500">Total Billed</div><div className="mt-1 text-2xl font-bold text-blue-600">{formatINRCurrency(stats.summary.totalBilled)}</div></div></Card>
            <Card><div className="p-4"><div className="text-sm font-medium text-gray-500">Total Collected</div><div className="mt-1 text-2xl font-bold text-green-600">{formatINRCurrency(stats.summary.totalPaid)}</div></div></Card>
            <Card><div className="p-4"><div className="text-sm font-medium text-gray-500">Outstanding</div><div className="mt-1 text-2xl font-bold text-yellow-600">{formatINRCurrency(stats.summary.totalPending)}</div></div></Card>
            <Card><div className="p-4"><div className="text-sm font-medium text-gray-500">Overdue</div><div className="mt-1 text-2xl font-bold text-red-600">{formatINRCurrency(stats.summary.totalOverdue || 0)}</div></div></Card>
          </div>
          {/* Main Charts condensed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-4">
                <div className="text-lg font-semibold mb-2">Monthly Revenue Trend</div>
              </div>
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatMonthlyTrendData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip formatter={formatINRCurrency} />
                    <Legend />
                    <Line type="monotone" dataKey="billed" stroke="#8884d8" name="Billed Amount" />
                    <Line type="monotone" dataKey="paid" stroke="#82ca9d" name="Collected Amount" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <div className="text-lg font-semibold mb-2">Bill Status Distribution</div>
              </div>
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={formatStatusData()} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                      {formatStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={formatINRCurrency} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

// Add handleExport for CSV, Excel, PDF
function handleExport(type) {
  const headers = ['Invoice #', 'Date', 'Patient', 'Amount', 'Status'];
  const rows = (stats.invoices || []).filter(inv => {
    if (search && !(
      (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.patientId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.paymentStatus || '').toLowerCase().includes(search.toLowerCase())
    )) return false;
    if (statusFilter && inv.paymentStatus !== statusFilter) return false;
    if (patientFilter && inv.patientId?._id !== patientFilter.value) return false;
    if (dateRange.start && new Date(inv.createdAt) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(inv.createdAt) > new Date(dateRange.end)) return false;
    return true;
  }).map(inv => [
    inv.invoiceNumber || `INV-${inv._id.substring(0, 8)}`,
    format(new Date(inv.createdAt), 'dd MMM yyyy'),
    inv.patientId?.name || 'N/A',
    formatINRCurrency(inv.total),
    inv.paymentStatus
  ]);
  if (type === 'csv' || type === 'excel') {
    let csv = headers.join(',') + '\n';
    rows.forEach(r => { csv += r.join(',') + '\n'; });
    const blob = new Blob([csv], { type: type === 'csv' ? 'text/csv' : 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing_report.${type === 'csv' ? 'csv' : 'xls'}`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (type === 'pdf') {
    const doc = new jsPDF();
    doc.autoTable({ head: [headers], body: rows });
    doc.save('billing_report.pdf');
  }
}

// Placeholder for PaymentDetail (implement as needed)
const PaymentDetail = ({ payment, onEdit, onBack }) => (
  <div className="p-4">
    <h2 className="text-lg font-bold mb-2">Payment Details</h2>
    <pre className="bg-gray-100 p-2 rounded text-xs">{JSON.stringify(payment, null, 2)}</pre>
    <div className="flex justify-end space-x-2 mt-4">
      <Button variant="secondary" onClick={onBack}>Close</Button>
      {onEdit && <Button variant="primary" onClick={() => onEdit(payment)}>Edit</Button>}
    </div>
  </div>
);

export default BillingDashboard;
