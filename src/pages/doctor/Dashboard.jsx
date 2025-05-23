import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import appointmentService from '../../api/appointments/appointmentService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DoctorDashboard = () => {
  const { user, clinic } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    completedToday: 0,
    pendingToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);
      setError(null);

      const today = new Date();
      const appointments = await appointmentService.getAppointmentsByDoctor(user._id, {
        startDate: today.toISOString(),
        endDate: new Date(today.setHours(23, 59, 59)).toISOString()
      });

      setTodayAppointments(appointments);
      setStats({
        totalPatients: 0, // TODO: Implement patient count
        todayAppointments: appointments.length,
        completedToday: appointments.filter(a => a.status === 'Completed').length,
        pendingToday: appointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length
      });
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
        <h1 className="text-2xl font-semibold text-gray-900">Welcome, Dr. {user?.name}</h1>
        <Button onClick={() => window.location.href = '/doctor/appointments'}>
          View All Appointments
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Total Patients</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalPatients}</div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Today's Appointments</div>
            <div className="mt-1 text-3xl font-semibold text-indigo-600">{stats.todayAppointments}</div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Completed Today</div>
            <div className="mt-1 text-3xl font-semibold text-green-600">{stats.completedToday}</div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Pending Today</div>
            <div className="mt-1 text-3xl font-semibold text-yellow-600">{stats.pendingToday}</div>
          </div>
        </Card>
      </div>

      <Card title="Today's Schedule">
        {todayAppointments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No appointments scheduled for today
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(appointment.startTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patientId?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {appointment.patientId?._id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.serviceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.status === 'Completed' 
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'Scheduled'
                          ? 'bg-yellow-100 text-yellow-800'
                          : appointment.status === 'Confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => window.location.href = `/doctor/appointments/${appointment._id}`}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DoctorDashboard;