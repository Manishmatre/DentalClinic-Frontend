import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import attendanceService from '../../api/payroll/attendanceService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';
import AsyncSelect from 'react-select/async';

const localizer = momentLocalizer(moment);

// Helper to get color by status
const getStatusColor = (status) => {
  if (status === 'Present') return '#22c55e'; // green
  if (status === 'Absent') return '#ef4444'; // red
  if (status === 'On Leave') return '#facc15'; // yellow
  return '#9ca3af'; // gray
};

const AttendanceCalendar = ({ onBack }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayRecords, setDayRecords] = useState([]); // All attendance for selected day
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment().startOf('month'));
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Employee filter
  const loadEmployeeOptions = async (inputValue) => {
    // Replace with real API call if needed
    const res = await attendanceService.getAttendance({ search: inputValue });
    const employees = Array.isArray(res) ? res : (res.data || []);
    // Unique employees
    const unique = {};
    employees.forEach(e => { unique[e.employeeId] = e.employeeName; });
    return Object.entries(unique).map(([value, label]) => ({ value, label }));
  };

  // Fetch attendance for the current month
  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const start = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
      const end = currentMonth.clone().endOf('month').format('YYYY-MM-DD');
      const params = { start, end };
      if (selectedEmployee) params.employeeId = selectedEmployee.value;
      const data = await attendanceService.getCalendar(params);
      // Group by date (handle both string and ISO date formats)
      const grouped = {};
      (data || []).forEach(record => {
        let dateKey = record.date;
        if (typeof dateKey === 'string' && dateKey.includes('T')) {
          dateKey = dateKey.split('T')[0];
        }
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(record);
      });
      const mapped = Object.entries(grouped).map(([date, records]) => {
        const statusCount = records.reduce((acc, r) => {
          acc[r.status] = (acc[r.status] || 0) + 1;
          return acc;
        }, {});
        const summary = Object.entries(statusCount).map(([status, count]) => `${count} ${status}`).join(', ');
        const mainStatus = Object.entries(statusCount).sort((a, b) => b[1] - a[1])[0][0];
        // Tooltip: list employees and statuses
        const tooltip = records.map(r => `${r.employeeName} (${r.status})`).join('\n');
        return {
          id: date,
          title: summary,
          start: new Date(date + 'T00:00:00'),
          end: new Date(date + 'T00:00:00'),
          allDay: true,
          resource: { records, tooltip },
          bgColor: getStatusColor(mainStatus)
        };
      });
      setEvents(mapped);
    } catch (err) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, selectedEmployee]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  // Handle day click to show all records for that day
  const handleSelectSlot = async (slotInfo) => {
    const date = moment(slotInfo.start).format('YYYY-MM-DD');
    setSelectedDate(date);
    setShowPunchModal(true);
    const event = events.find(e => moment(e.start).format('YYYY-MM-DD') === date);
    if (event) {
      const recordsWithPunches = await Promise.all(event.resource.records.map(async rec => {
        let punches = [];
        if (rec.status === 'Present') {
          try {
            punches = await attendanceService.getDailyPunchLog(rec.employeeId, date);
          } catch {}
        }
        return { ...rec, punches };
      }));
      setDayRecords(recordsWithPunches);
    } else {
      setDayRecords([]);
    }
  };

  // Handle month navigation
  const handleNavigate = (date) => {
    setCurrentMonth(moment(date).startOf('month'));
  };

  // Custom event style
  const eventPropGetter = (event) => {
    return {
      style: {
        backgroundColor: event.bgColor,
        color: '#fff',
        borderRadius: '6px',
        border: 'none',
        fontWeight: 600,
        fontSize: '0.95em',
        padding: '2px 6px',
        opacity: 0.95,
        cursor: 'pointer',
      },
      title: event.resource.tooltip // For native browser tooltip
    };
  };

  // Highlight weekends
  const dayPropGetter = (date) => {
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return { style: { backgroundColor: '#f3f4f6' } };
    }
    return {};
  };

  // Export to CSV
  const handleExport = () => {
    let csv = 'Date,Employee,Status\n';
    events.forEach(ev => {
      ev.resource.records.forEach(r => {
        csv += `${ev.id},${r.employeeName},${r.status}\n`;
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_calendar_${currentMonth.format('YYYY-MM')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Legend
  const legend = [
    { color: '#22c55e', label: 'Present' },
    { color: '#ef4444', label: 'Absent' },
    { color: '#facc15', label: 'On Leave' },
    { color: '#9ca3af', label: 'Not Marked' }
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Attendance Calendar</h2>
        <Button onClick={onBack} variant="secondary">Back to List</Button>
      </div>
      {/* Legend and Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          {legend.map(l => (
            <span key={l.label} className="flex items-center gap-1 text-xs font-medium">
              <span style={{ backgroundColor: l.color, width: 16, height: 16, display: 'inline-block', borderRadius: 4 }}></span>
              {l.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div style={{ zIndex: 1002, position: 'relative', minWidth: 256 }}>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadEmployeeOptions}
              onChange={setSelectedEmployee}
              value={selectedEmployee}
              placeholder="Filter by Employee"
              className="w-64"
              isClearable
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 2000 }) }}
            />
          </div>
          <Button onClick={handleExport} variant="info" size="sm">Export CSV</Button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button size="sm" variant="outline" onClick={() => setCurrentMonth(moment())}>Today</Button>
          <Button size="sm" variant="outline" onClick={() => setCurrentMonth(prev => moment(prev).subtract(1, 'month'))}>Back</Button>
          <Button size="sm" variant="outline" onClick={() => setCurrentMonth(prev => moment(prev).add(1, 'month'))}>Next</Button>
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={['month', 'week', 'day']}
          selectable
          onSelectSlot={handleSelectSlot}
          onNavigate={handleNavigate}
          popup
          eventPropGetter={eventPropGetter}
          dayPropGetter={dayPropGetter}
        />
      )}
      <Modal isOpen={showPunchModal} onClose={() => setShowPunchModal(false)} title={`Attendance for ${selectedDate}`}> 
        {dayRecords.length === 0 ? (
          <div className="text-gray-500">No attendance records for this day.</div>
        ) : (
          <ul className="space-y-4">
            {dayRecords.map((rec, idx) => {
              let badgeClass = 'bg-gray-100 text-gray-500';
              if (rec.status === 'Present') badgeClass = 'bg-green-100 text-green-800';
              else if (rec.status === 'Absent') badgeClass = 'bg-red-100 text-red-800';
              else if (rec.status === 'On Leave') badgeClass = 'bg-yellow-100 text-yellow-800';
              return (
                <li key={rec._id || idx} className="border-b pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{rec.employeeName}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>{rec.status}</span>
                  </div>
                  {rec.status === 'Present' && rec.punches && rec.punches.length > 0 ? (
                    <ul className="ml-4 list-disc">
                      {rec.punches.map((p, i) => (
                        <li key={i} className="mb-1">
                          <span className="font-medium">{p.type}:</span> {p.timeIn ? moment(p.timeIn).format('HH:mm:ss') : '-'}
                          {p.note && <span className="ml-2 text-xs text-gray-500">Note: {p.note}</span>}
                          {p.location && <span className="ml-2 text-xs text-gray-500">Location: {p.location}</span>}
                        </li>
                      ))}
                    </ul>
                  ) : rec.status === 'Present' ? (
                    <div className="ml-4 text-gray-500 text-xs">No punch records.</div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Modal>
    </>
  );
};

export default AttendanceCalendar; 