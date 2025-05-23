import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import appointmentService from '../../api/appointments/appointmentService';
import patientService from '../../api/patients/patientService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [medicalSummary, setMedicalSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch appointments and medical history in parallel
      const [appointmentsData, historyData] = await Promise.all([
        appointmentService.getAppointmentsByPatient(user._id),
        patientService.getMedicalHistory(user._id)
      ]);

      // Filter for upcoming appointments only
      const upcomingAppointments = appointmentsData.filter(
        apt => new Date(apt.startTime) > new Date()
      ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

      setAppointments(upcomingAppointments);
      setMedicalSummary(historyData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user?.name}</h1>
        <Button onClick={() => navigate('/patient/appointments/book')}>
          Book Appointment
        </Button>
      </div>

      {error && (
        <Alert 
          variant="error" 
          title="Error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Medical Summary Card */}
        <Card title="Medical Summary">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Last Visit</label>
              <div className="mt-1 text-sm text-gray-900">
                {medicalSummary?.lastVisit 
                  ? new Date(medicalSummary.lastVisit).toLocaleDateString()
                  : 'No previous visits'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Ongoing Treatments</label>
              <div className="mt-1 text-sm text-gray-900">
                {medicalSummary?.ongoingTreatments?.length || 0}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Next Follow-up</label>
              <div className="mt-1 text-sm text-gray-900">
                {medicalSummary?.nextFollowUp 
                  ? new Date(medicalSummary.nextFollowUp).toLocaleDateString()
                  : 'Not scheduled'}
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate('/patient/medical-history')}
            >
              View Full History
            </Button>
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card title="Upcoming Appointments" className="md:col-span-2">
          {appointments.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No upcoming appointments scheduled
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.slice(0, 3).map((appointment) => (
                    <tr key={appointment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(appointment.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.startTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Dr. {appointment.doctorId?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.serviceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.status === 'Confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {appointments.length > 3 && (
                <div className="p-4 text-center">
                  <Button
                    variant="link"
                    onClick={() => navigate('/patient/appointments')}
                  >
                    View all {appointments.length} appointments
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          onClick={() => navigate('/patient/billing')}
        >
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Billing & Payments</h3>
            <p className="mt-1 text-sm text-gray-500">View your bills and make payments</p>
          </div>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          onClick={() => navigate('/patient/medical-history')}
        >
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Medical Records</h3>
            <p className="mt-1 text-sm text-gray-500">Access your complete medical history</p>
          </div>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          onClick={() => navigate('/patient/profile')}
        >
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
            <p className="mt-1 text-sm text-gray-500">Update your personal information</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;