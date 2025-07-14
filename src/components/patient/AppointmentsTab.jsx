import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUserMd, FaBuilding, FaTimes } from 'react-icons/fa';
import { formatAppointmentTimeRange } from '../../utils/timeZoneUtils';
import { appointmentService } from '../../services/appointmentService';
import { toast } from 'react-toastify';

const AppointmentsTab = ({ patientId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getPatientAppointments(patientId);
      setAppointments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await appointmentService.cancelAppointment(appointmentId);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.startTime);

    switch (filter) {
      case 'upcoming':
        return appointmentDate >= now;
      case 'past':
        return appointmentDate < now;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-md ${
            filter === 'upcoming'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-md ${
            filter === 'past'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All
        </button>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredAppointments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FaCalendarAlt className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {formatAppointmentTimeRange(
                            appointment.startTime,
                            appointment.endTime,
                            appointment.clinic.timeZone
                          )}
                        </h3>
                        <div className="mt-2 space-y-1">
                          <p className="flex items-center text-sm text-gray-500">
                            <FaUserMd className="mr-2" />
                            Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                          </p>
                          <p className="flex items-center text-sm text-gray-500">
                            <FaBuilding className="mr-2" />
                            {appointment.clinic.name}
                          </p>
                          <p className="flex items-center text-sm text-gray-500">
                            <FaClock className="mr-2" />
                            {appointment.duration} minutes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {filter === 'upcoming' && (
                    <button
                      onClick={() => handleCancelAppointment(appointment._id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {appointment.notes && (
                  <div className="mt-4 text-sm text-gray-500">
                    <p className="font-medium">Notes:</p>
                    <p>{appointment.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No appointments found
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsTab; 