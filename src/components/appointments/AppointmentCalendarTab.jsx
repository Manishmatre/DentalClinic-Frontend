import React, { useState } from 'react';
import AppointmentCalendar from './AppointmentCalendar';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FaFilter, FaSearch } from 'react-icons/fa';

const AppointmentCalendarTab = ({ 
  appointments, 
  onViewAppointment, 
  onEditAppointment, 
  onDeleteAppointment,
  onDateChange,
  currentDate,
  doctors,
  filterDoctor,
  setFilterDoctor,
  filterStatus,
  setFilterStatus,
  onCreateAppointment,
  clinicId
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleViewAppointment = (appointment) => {
    if (onViewAppointment) {
      onViewAppointment(appointment);
    }
  };

  const handleEditAppointment = (appointment) => {
    if (onEditAppointment) {
      onEditAppointment(appointment);
    }
  };

  const handleDeleteAppointment = (appointment) => {
    if (onDeleteAppointment) {
      onDeleteAppointment(appointment);
    }
  };

  const handleDateChange = (date) => {
    if (onDateChange) {
      onDateChange(date);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const applyFilters = (appointments) => {
    if (!appointments || !Array.isArray(appointments)) {
      console.warn('No appointments array provided or invalid format');
      return [];
    }
    
    let filteredAppointments = [...appointments];
    
    // Apply doctor filter
    if (filterDoctor && filterDoctor !== 'all') {
      filteredAppointments = filteredAppointments.filter(appointment => {
        const appointmentDoctorId = appointment.doctorId || 
          (appointment.doctor?._id) || 
          (appointment.doctor?.id);
        return appointmentDoctorId === filterDoctor;
      });
    }
    
    // Apply status filter
    if (filterStatus && filterStatus !== 'all') {
      filteredAppointments = filteredAppointments.filter(appointment => {
        // Normalize status case for comparison
        const appointmentStatus = appointment.status?.toLowerCase() || '';
        return appointmentStatus === filterStatus.toLowerCase();
      });
    }
    
    return filteredAppointments;
  };

  // Handler for slot selection
  const handleCreateAppointment = (slot) => {
    if (onCreateAppointment) {
      onCreateAppointment(slot);
    }
  };

  // Fallback: if no clinicId, try to get from first doctor
  const effectiveClinicId = clinicId || (doctors && doctors[0] && doctors[0].clinicId) || undefined;

  return (
    <div>
      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="mb-2 sm:mb-0">
          <h3 className="text-lg font-medium text-gray-900">Appointment Calendar</h3>
          <p className="text-sm text-gray-600">View and manage appointments on the calendar</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={toggleFilters}
            className="flex items-center"
          >
            <FaFilter className="mr-2" /> Filters
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
              >
                <option value="all">All Doctors</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-Show</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-lg overflow-hidden">
        <AppointmentCalendar
          appointments={applyFilters(appointments)}
          onViewAppointment={handleViewAppointment}
          onEditAppointment={handleEditAppointment}
          onDeleteAppointment={handleDeleteAppointment}
          onDateChange={handleDateChange}
          currentDate={currentDate}
          onCreateAppointment={handleCreateAppointment}
          clinicId={effectiveClinicId}
        />
      </div>
    </div>
  );
};

export default AppointmentCalendarTab;
