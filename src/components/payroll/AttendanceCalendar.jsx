import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import attendanceService from '../../api/payroll/attendanceService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';

const localizer = momentLocalizer(moment);

const AttendanceCalendar = ({ onBack }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [punchLog, setPunchLog] = useState([]);
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment().startOf('month'));

  // Fetch attendance for the current month
  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const start = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
      const end = currentMonth.clone().endOf('month').format('YYYY-MM-DD');
      const data = await attendanceService.getCalendar({ start, end });
      // Map attendance to calendar events
      const mapped = (data || []).map(record => ({
        id: record._id,
        title: `${record.employeeName} (${record.status})`,
        start: new Date(record.date),
        end: new Date(record.date),
        allDay: true,
        resource: record
      }));
      setEvents(mapped);
    } catch (err) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  // Handle day click to show punch log
  const handleSelectSlot = async (slotInfo) => {
    const date = moment(slotInfo.start).format('YYYY-MM-DD');
    setSelectedDate(date);
    setShowPunchModal(true);
    // For demo, fetch for first employee found on that date
    const event = events.find(e => moment(e.start).format('YYYY-MM-DD') === date);
    if (event) {
      const punches = await attendanceService.getDailyPunchLog(event.resource.employeeId, date);
      setPunchLog(Array.isArray(punches) ? punches : []);
    } else {
      setPunchLog([]);
    }
  };

  // Handle month navigation
  const handleNavigate = (date) => {
    setCurrentMonth(moment(date).startOf('month'));
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Attendance Calendar</h2>
        <Button onClick={onBack} variant="secondary">Back to List</Button>
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
        />
      )}
      <Modal isOpen={showPunchModal} onClose={() => setShowPunchModal(false)} title={`Punch Log for ${selectedDate}`}> 
        {punchLog.length === 0 ? (
          <div className="text-gray-500">No punch records for this day.</div>
        ) : (
          <ul className="space-y-2">
            {punchLog.map((p, idx) => (
              <li key={idx} className="border-b pb-2">
                <div><b>Type:</b> {p.type}</div>
                <div><b>Time In:</b> {p.timeIn ? moment(p.timeIn).format('HH:mm:ss') : '-'}</div>
                <div><b>Time Out:</b> {p.timeOut ? moment(p.timeOut).format('HH:mm:ss') : '-'}</div>
                {p.note && <div><b>Note:</b> {p.note}</div>}
                {p.location && <div><b>Location:</b> {p.location}</div>}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </Card>
  );
};

export default AttendanceCalendar; 