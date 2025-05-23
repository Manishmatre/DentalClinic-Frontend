import React, { useState, useEffect, useCallback } from 'react';
import AppointmentList from '../../components/appointments/AppointmentList';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import appointmentService from '../../api/appointments/appointmentService';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AppointmentScheduling = () => {
  const { user, clinic } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch appointments for the current clinic
      const data = await appointmentService.getAppointments(); 
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.response?.data?.message || 'Failed to load appointments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFormSubmit = async (formData) => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const dataWithUser = {
        ...formData,
        modifiedBy: user._id
      };
      
      if (editingAppointment) {
        // Update existing appointment
        await appointmentService.updateAppointment(editingAppointment._id, dataWithUser);
        setEditingAppointment(null);
      } else {
        // Create new appointment
        await appointmentService.createAppointment({
          ...dataWithUser,
          createdBy: user._id
        });
      }
      setIsFormOpen(false);
      fetchAppointments(); // Refresh the list
    } catch (err) {
      console.error("Error submitting appointment:", err);
      setSubmitError(err.response?.data?.message || 'Failed to save appointment.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
    setSubmitError(null); // Clear previous submit errors when opening form
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentService.deleteAppointment(id);
        fetchAppointments(); // Refresh the list
      } catch (err) {
        console.error("Error deleting appointment:", err);
        setError(err.response?.data?.message || 'Failed to delete appointment.');
      }
    }
  };

  const openCreateForm = () => {
    setEditingAppointment(null);
    setIsFormOpen(true);
    setSubmitError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Appointment Scheduling</h1>
        <Button onClick={openCreateForm}>
          + New Appointment
        </Button>
      </div>

      {error && <Alert variant="error" title="Error" message={error} onClose={() => setError(null)} />}

      {/* Form Modal/Section (Simplified inline for now) */}
      {isFormOpen && (
        <Card title={editingAppointment ? 'Edit Appointment' : 'Create New Appointment'}>
          <AppointmentForm 
            onSubmit={handleFormSubmit}
            initialData={editingAppointment}
            isLoading={submitLoading}
            error={submitError}
            clinicId={clinic?._id}
          />
        </Card>
      )}

      {/* Appointment List */}
      <Card title="Upcoming Appointments">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <LoadingSpinner />
          </div>
        ) : (
          <AppointmentList 
            appointments={appointments}
            onEdit={handleEdit}
            onDelete={handleDelete}
            // Receptionists see both patient and doctor
            showPatient={true}
            showDoctor={true}
          />
        )}
      </Card>
    </div>
  );
};

export default AppointmentScheduling;