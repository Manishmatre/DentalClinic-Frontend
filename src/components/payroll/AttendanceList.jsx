import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaFilter, FaSort, FaSortUp, FaSortDown, FaPlus, FaEdit, FaTrash, FaEye, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Pagination from '../ui/Pagination';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal';
import attendanceService from '../../api/payroll/attendanceService';
import AsyncSelect from 'react-select/async';
import staffService from '../../api/staff/staffService';
import DatePicker from '../ui/DatePicker';
import { useAuth } from '../../context/AuthContext';

// Helper to get local date string in YYYY-MM-DD
function getLocalDateString(date) {
  if (!(date instanceof Date)) return undefined;
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

const AttendanceList = ({
  attendance = [],
  loading = false,
  onAddAttendance,
  onEditAttendance,
  onDeleteAttendance,
  totalAttendance = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  fetchAttendance,
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('employeeName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [punchType, setPunchType] = useState('IN');
  const [punchNote, setPunchNote] = useState('');
  const [punchLocation, setPunchLocation] = useState('');
  const [punchLoading, setPunchLoading] = useState({}); // { [staffId_action]: true }
  const [showBulkPunchModal, setShowBulkPunchModal] = useState(false);
  const [bulkEmployees, setBulkEmployees] = useState([]);
  const [bulkPunchType, setBulkPunchType] = useState('IN');
  const [bulkPunchNote, setBulkPunchNote] = useState('');
  const [bulkPunchLocation, setBulkPunchLocation] = useState('');
  const [bulkPunchLoading, setBulkPunchLoading] = useState(false);
  const [allStaff, setAllStaff] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  });
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [showPunchLogModal, setShowPunchLogModal] = useState(false);
  const [punchLog, setPunchLog] = useState([]);
  const [punchLogStaff, setPunchLogStaff] = useState(null);
  const { user } = useAuth ? useAuth() : { user: { role: 'Admin' } };
  const [markLoading, setMarkLoading] = useState({}); // { [staffId_status]: true }
  const [punchLogLoadingId, setPunchLogLoadingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Fetch all staff on mount
  useEffect(() => {
    const fetchStaff = async () => {
      setLoadingStaff(true);
      try {
        const res = await staffService.getStaff({ status: 'Active' });
        setAllStaff(Array.isArray(res.data) ? res.data : []);
      } catch {
        setAllStaff([]);
      } finally {
        setLoadingStaff(false);
      }
    };
    fetchStaff();
  }, []);
  // Filter attendance for selected date
  const attendanceForDate = useMemo(() => {
    return attendance.filter(r => r.date === selectedDate);
  }, [attendance, selectedDate]);
  // Merge staff with attendance
  const mergedRows = useMemo(() => {
    return allStaff.map(staff => {
      const record = attendanceForDate.find(a => a.employeeId === staff._id || a.employeeId === staff.employeeId);
      return {
        staff,
        attendance: record
      };
    });
  }, [allStaff, attendanceForDate]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon based on current sort state
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-gray-300 ml-1" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-blue-500 ml-1" /> : <FaSortDown className="text-blue-500 ml-1" />;
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({ date: '', status: 'all', sortBy: 'date', sortOrder: 'desc' });
    setSearchTerm('');
    setShowFilters(false);
  };

  // Filter attendance based on search term and filters
  const filteredAttendance = useMemo(() => {
    return attendance.filter(record => {
      // Search term filter
      if (searchTerm && !record.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Date filter
      if (filters.date && record.date !== filters.date) {
        return false;
      }
      // Status filter
      if (filters.status !== 'all' && record.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [attendance, searchTerm, filters]);

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handlePunch = async (e) => {
    e.preventDefault();
    setPunchLoading(true);
    try {
      const dateToSend = typeof selectedDate === 'string' ? selectedDate : getLocalDateString(selectedDate);
      await attendanceService.punch({ type: punchType, note: punchNote, location: punchLocation, date: dateToSend });
      setShowPunchModal(false);
      setPunchNote('');
      setPunchLocation('');
      setPunchType('IN');
      toast.success('Punch recorded!');
      await refreshAttendance();
    } catch (err) {
      toast.error('Failed to record punch');
    } finally {
      setPunchLoading(false);
    }
  };

  const loadStaffOptions = async (inputValue) => {
    try {
      const res = await staffService.getStaff({ search: inputValue, status: 'Active' });
      const staffList = Array.isArray(res.data) ? res.data : [];
      return staffList.map(staff => ({ value: staff._id, label: staff.name, data: staff }));
    } catch {
      return [];
    }
  };
  const handleBulkPunch = async (e) => {
    e.preventDefault();
    setBulkPunchLoading(true);
    let success = 0, fail = 0;
    const dateToSend = typeof selectedDate === 'string' ? selectedDate : getLocalDateString(selectedDate);
    for (const emp of bulkEmployees) {
      try {
        await attendanceService.punch({ employeeId: emp.value, employeeName: emp.label, type: bulkPunchType, note: bulkPunchNote, location: bulkPunchLocation, date: dateToSend });
        success++;
      } catch {
        fail++;
      }
    }
    setShowBulkPunchModal(false);
    setBulkEmployees([]);
    setBulkPunchNote('');
    setBulkPunchLocation('');
    setBulkPunchType('IN');
    toast.success(`Punch recorded for ${success} staff${fail ? ", failed for " + fail : ''}`);
    setBulkPunchLoading(false);
    await refreshAttendance();
  };

  const refreshAttendance = async () => {
    if (fetchAttendance) await fetchAttendance();
  };
  const handleQuickMark = async (staff, status) => {
    const key = staff._id + '_' + status;
    setMarkLoading(prev => ({ ...prev, [key]: true }));
    try {
      const dateToSend = typeof selectedDate === 'string' ? selectedDate : getLocalDateString(selectedDate);
      // Always update or create the attendance record for staff/date
      const existing = attendanceForDate.find(a => a.employeeId === staff._id || a.employeeId === staff.employeeId);
      if (existing) {
        await attendanceService.updateAttendance(existing._id, {
          employeeId: staff._id,
          employeeName: staff.name,
          date: dateToSend,
          status
        });
      } else {
        await attendanceService.addAttendance({
          employeeId: staff._id,
          employeeName: staff.name,
          date: dateToSend,
          status
        });
      }
      toast.success(`Marked ${status} for ${staff.name}`);
      await refreshAttendance();
    } catch {
      toast.error('Failed to mark attendance');
    } finally {
      setMarkLoading(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };
  const handleShowPunchLog = (attendance, staff) => {
    setPunchLog(attendance.punches || []);
    setPunchLogStaff(staff);
    setShowPunchLogModal(true);
  };
  const handleDelete = (attendance) => {
    setDeleteTarget(attendance);
    setShowDeleteConfirm(true);
  };
  const confirmDelete = async () => {
    setPunchLogLoadingId(deleteTarget._id); // Use deleteTarget._id for loading state
    try {
      await onDeleteAttendance(deleteTarget);
      toast.success('Attendance deleted');
      await refreshAttendance();
    } catch {
      toast.error('Failed to delete attendance');
    } finally {
      setPunchLogLoadingId(null);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };
  // Export to CSV
  const handleExport = () => {
    let csv = 'Employee,Date,Status,In Time,Out Time\n';
    mergedRows.forEach(({ staff, attendance }) => {
      let inTime = '', outTime = '';
      if (attendance && attendance.punches && attendance.punches.length > 0) {
        const punchesIn = attendance.punches.filter(p => p.type === 'IN');
        const punchesOut = attendance.punches.filter(p => p.type === 'OUT');
        if (punchesIn.length > 0) inTime = new Date(punchesIn[0].timeIn).toLocaleTimeString();
        if (punchesOut.length > 0) outTime = new Date(punchesOut[punchesOut.length - 1].timeIn).toLocaleTimeString();
      }
      csv += `${staff.name},${selectedDate},${attendance ? attendance.status : 'Not Marked'},${inTime},${outTime}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle punch in/out action
  const handlePunchAction = async (staff, type) => {
    const key = staff._id + '_' + type;
    setPunchLoading(prev => ({ ...prev, [key]: true }));
    try {
      const dateToSend = typeof selectedDate === 'string' ? selectedDate : getLocalDateString(selectedDate);
      await attendanceService.punch({
        employeeId: staff._id,
        employeeName: staff.name,
        type,
        date: dateToSend
      });
      await refreshAttendance();
      toast.success(`Punch ${type === 'IN' ? 'In' : 'Out'} recorded!`);
    } catch (err) {
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to record punch');
      }
      await refreshAttendance();
    } finally {
      setPunchLoading(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  if (showCalendar) {
    // Lazy load AttendanceCalendar (to be created)
    const AttendanceCalendar = React.lazy(() => import('./AttendanceCalendar'));
    return (
      <React.Suspense fallback={<LoadingSpinner />}>
        <AttendanceCalendar onBack={() => setShowCalendar(false)} />
      </React.Suspense>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons with Search Bar */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        {/* Date Picker */}
        <div className="mb-2 md:mb-0">
          <DatePicker
            value={selectedDate}
            onChange={date => {
              if (date instanceof Date && !isNaN(date)) {
                const localDateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                setSelectedDate(localDateString);
              } else if (typeof date === 'string') {
                setSelectedDate(date);
              } else {
                setSelectedDate('');
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {/* Search bar */}
        <div className="w-full md:w-auto mb-2 md:mb-0">
          <form onSubmit={handleSearchSubmit} className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search employee..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-l-0 border-gray-300 rounded-r-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <FaFilter />
            </button>
          </form>
        </div>
        {/* Add Attendance Button */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCalendar(true)}
            variant="secondary"
            className="flex items-center text-sm"
          >
            <FaCalendarAlt className="mr-1" /> Calendar View
          </Button>
          <Button
            onClick={() => setShowBulkPunchModal(true)}
            variant="warning"
            className="flex items-center text-sm"
          >
            Bulk Mark In/Out
          </Button>
        <Button
          onClick={onAddAttendance}
          variant="primary"
          className="flex items-center text-sm ml-2"
        >
          <FaPlus className="mr-1" /> Add Attendance
        </Button>
          <Button onClick={handleExport} variant="info" className="flex items-center text-sm">Export</Button>
        </div>
      </div>
      {/* Punch Modal */}
      <Modal isOpen={showPunchModal} onClose={() => setShowPunchModal(false)} title="Punch In/Out">
        <form onSubmit={handlePunch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={punchType}
              onChange={e => setPunchType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <input
              type="text"
              value={punchNote}
              onChange={e => setPunchNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Reason, remarks, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
            <input
              type="text"
              value={punchLocation}
              onChange={e => setPunchLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Office, remote, etc."
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="secondary" onClick={() => setShowPunchModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={punchLoading}>Punch</Button>
          </div>
        </form>
      </Modal>
      {/* Bulk Punch Modal */}
      <Modal isOpen={showBulkPunchModal} onClose={() => setShowBulkPunchModal(false)} title="Bulk Mark In/Out">
        <form onSubmit={handleBulkPunch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Employees</label>
            <AsyncSelect
              isMulti
              cacheOptions
              defaultOptions
              loadOptions={loadStaffOptions}
              value={bulkEmployees}
              onChange={setBulkEmployees}
              placeholder="Search and select staff..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={bulkPunchType}
              onChange={e => setBulkPunchType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
            <input
              type="text"
              value={bulkPunchNote}
              onChange={e => setBulkPunchNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Reason, remarks, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
            <input
              type="text"
              value={bulkPunchLocation}
              onChange={e => setBulkPunchLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Office, remote, etc."
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="secondary" onClick={() => setShowBulkPunchModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={bulkPunchLoading} disabled={bulkEmployees.length === 0}>Mark In/Out</Button>
          </div>
        </form>
      </Modal>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
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
                  <option value="date">Date</option>
                  <option value="employeeName">Employee Name</option>
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
      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Out Time</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading || loadingStaff ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : mergedRows.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No staff found
                </td>
              </tr>
            ) : (
              mergedRows.map(({ staff, attendance }) => {
                // Get first IN and last OUT times
                let inTime = '', outTime = '';
                if (attendance && attendance.punches && attendance.punches.length > 0) {
                  const punchesIn = attendance.punches.filter(p => p.type === 'IN');
                  const punchesOut = attendance.punches.filter(p => p.type === 'OUT');
                  if (punchesIn.length > 0) inTime = punchesIn[0].timeIn ? new Date(punchesIn[0].timeIn).toLocaleTimeString() : '';
                  if (punchesOut.length > 0) outTime = punchesOut[punchesOut.length - 1].timeIn ? new Date(punchesOut[punchesOut.length - 1].timeIn).toLocaleTimeString() : '';
                }
                const status = attendance ? attendance.status : 'Not Marked';
                const punchDisabled = status === 'Absent' || status === 'On Leave';
                const attendanceExists = !!attendance;
                return (
                  <tr key={staff._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                      <div className="text-xs text-gray-500">{staff._id}</div>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{typeof selectedDate === 'string' ? selectedDate : (selectedDate instanceof Date ? selectedDate.toISOString().slice(0, 10) : String(selectedDate))}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${attendance ? (attendance.status === 'Present' ? 'bg-green-100 text-green-800' : attendance.status === 'Absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800') : 'bg-gray-100 text-gray-500'}`}>
                        {attendance ? attendance.status : 'Not Marked'}
                    </span>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{typeof inTime === 'string' ? inTime : (inTime ? inTime.toString() : '-')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{typeof outTime === 'string' ? outTime : (outTime ? outTime.toString() : '-')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* Only show mark present/absent/on leave if not marked */}
                        {!attendance && user.role === 'Admin' && (
                          <>
                            <Button size="sm" variant="success" onClick={() => handleQuickMark(staff, 'Present')} disabled={!!markLoading[staff._id + '_Present'] || attendanceExists} loading={!!markLoading[staff._id + '_Present']}>
                              Mark Present
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleQuickMark(staff, 'Absent')} disabled={!!markLoading[staff._id + '_Absent'] || attendanceExists} loading={!!markLoading[staff._id + '_Absent']}>
                              Mark Absent
                            </Button>
                            <Button size="sm" variant="warning" onClick={() => handleQuickMark(staff, 'On Leave')} disabled={!!markLoading[staff._id + '_On Leave'] || attendanceExists} loading={!!markLoading[staff._id + '_On Leave']}>
                              Mark On Leave
                            </Button>
                          </>
                        )}
                        {/* If present, show punch in time and punch action */}
                        {attendance && attendance.status === 'Present' && (
                          <>
                            {/* Show punch in time if exists */}
                            {attendance.punches && attendance.punches.length > 0 && (
                              <span className="text-xs text-green-700 bg-green-50 rounded px-2 py-1 mr-2">
                                In: {(() => {
                                  const punchesIn = attendance.punches.filter(p => p.type === 'IN');
                                  return punchesIn.length > 0 ? new Date(punchesIn[punchesIn.length - 1].timeIn).toLocaleTimeString() : '-';
                                })()}
                              </span>
                            )}
                            {/* Show punch out/in button depending on last punch */}
                            {(() => {
                              const lastPunch = attendance.punches && attendance.punches.length > 0 ? attendance.punches[attendance.punches.length - 1] : null;
                              const inCount = attendance.punches ? attendance.punches.filter(p => p.type === 'IN').length : 0;
                              const outCount = attendance.punches ? attendance.punches.filter(p => p.type === 'OUT').length : 0;
                              // Hide punch buttons if both IN and OUT exist
                              if (inCount >= 1 && outCount >= 1) return null;
                              if (!lastPunch || lastPunch.type === 'OUT') {
                                const key = staff._id + '_IN';
                                return <Button size="sm" variant="success" onClick={() => handlePunchAction(staff, 'IN')} disabled={!!punchLoading[key]} loading={!!punchLoading[key]}>Punch In</Button>;
                              } else {
                                const key = staff._id + '_OUT';
                                return <Button size="sm" variant="warning" onClick={() => handlePunchAction(staff, 'OUT')} disabled={!!punchLoading[key]} loading={!!punchLoading[key]}>Punch Out</Button>;
                              }
                            })()}
                          </>
                        )}
                        {/* Only show punch log if attendance exists */}
                        {attendance && (
                          <Button size="sm" variant="info" onClick={() => handleShowPunchLog(attendance, staff)} disabled={punchLogLoadingId === staff._id} loading={punchLogLoadingId === staff._id}>
                            <FaClock className="mr-1" /> View Punch Log
                          </Button>
                        )}
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Punch Log Modal */}
      <Modal isOpen={showPunchLogModal} onClose={() => setShowPunchLogModal(false)} title={`Punch Log for ${punchLogStaff ? punchLogStaff.name : ''} (${selectedDate})`}>
        {/* Show status badge */}
        {(() => {
          const attendance = punchLogStaff && attendanceForDate.find(a => a.employeeId === punchLogStaff._id || a.employeeId === punchLogStaff.employeeId);
          const status = attendance ? attendance.status : 'Not Marked';
          let badgeClass = 'bg-gray-100 text-gray-500';
          if (status === 'Present') badgeClass = 'bg-green-100 text-green-800';
          else if (status === 'Absent') badgeClass = 'bg-red-100 text-red-800';
          else if (status === 'On Leave') badgeClass = 'bg-yellow-100 text-yellow-800';
          return (
            <div className={`mb-4 inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>{status}</div>
          );
        })()}
        {(() => {
          const attendance = punchLogStaff && attendanceForDate.find(a => a.employeeId === punchLogStaff._id || a.employeeId === punchLogStaff.employeeId);
          const status = attendance ? attendance.status : 'Not Marked';
          if (status !== 'Present') {
            return <div className="text-gray-500">No punch records for this day (status: {status}).</div>;
          }
          if (!attendance || !attendance.punches || attendance.punches.length === 0) {
            return <div className="text-gray-500">No punch records for this day.</div>;
          }
          return (
            <ul className="space-y-2">
              {attendance.punches.map((p, idx) => (
                <li key={idx} className="border-b pb-2">
                  <div><b>Type:</b> {p.type}</div>
                  <div><b>Time:</b> {p.timeIn ? new Date(p.timeIn).toLocaleTimeString() : '-'}</div>
                  {p.note && <div><b>Note:</b> {p.note}</div>}
                  {p.location && <div><b>Location:</b> {p.location}</div>}
                </li>
              ))}
            </ul>
          );
        })()}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Delete">
        <div>Are you sure you want to delete this attendance record? This action cannot be undone.</div>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={punchLogLoadingId !== null}>Cancel</Button>
          <Button type="button" variant="danger" onClick={confirmDelete} loading={punchLogLoadingId !== null}>Delete</Button>
        </div>
      </Modal>
      {/* Pagination */}
      {!loading && filteredAttendance.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between mt-4">
          <div className="flex items-center text-sm text-gray-700 mb-4 sm:mb-0">
            <span>Showing </span>
            <select
              className="mx-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span> of {totalAttendance || 0} attendance records</span>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AttendanceList; 