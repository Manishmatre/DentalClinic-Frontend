import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import appointmentService from '../../api/appointments/appointmentService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { user, clinic } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    confirmedAppointments: 0,
    pendingPayments: 0,
    todayRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const today = new Date();
      const appointments = await appointmentService.getAppointments({
        startDate: today.toISOString(),
        endDate: new Date(today.setHours(23, 59, 59)).toISOString()
      });

      setTodayAppointments(appointments);
      setStats({
        totalAppointments: appointments.length,
        confirmedAppointments: appointments.filter(a => a.status === 'Confirmed').length,
        pendingPayments: 0, // TODO: Implement billing stats
        todayRevenue: 0 // TODO: Implement revenue calculation
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickAction = (action) => {
    switch (action) {
      case 'newAppointment':
        navigate('/receptionist/appointments');
        break;
      case 'newPatient':
        navigate('/receptionist/patients/register');
        break;
      case 'payments':
        navigate('/receptionist/billing');
        break;
      default:
        break;
    }
  };

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
            <div className="text-sm font-medium text-gray-500">Today's Appointments</div>
            <div className="mt-1 text-3xl font-semibold text-indigo-600">{stats.totalAppointments}</div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Confirmed</div>
            <div className="mt-1 text-3xl font-semibold text-green-600">{stats.confirmedAppointments}</div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Pending Payments</div>
            <div className="mt-1 text-3xl font-semibold text-yellow-600">{stats.pendingPayments}</div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Today's Revenue</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">₹{stats.todayRevenue.toFixed(2)}</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="p-4 space-y-4">
            <Button
              onClick={() => handleQuickAction('newAppointment')}
              className="w-full"
            >
              New Appointment
            </Button>
            <Button
              onClick={() => handleQuickAction('newPatient')}
              variant="secondary"
              className="w-full"
            >
              Register Patient
            </Button>
            <Button
              onClick={() => handleQuickAction('payments')}
              variant="secondary"
              className="w-full"
            >
              Manage Payments
            </Button>
          </div>
        </Card>

        {/* Today's Schedule - Brief View */}
        <Card title="Today's Schedule" className="md:col-span-2">
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
                      Doctor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayAppointments.slice(0, 5).map((appointment) => (
                    <tr key={appointment._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(appointment.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.patientId?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Dr. {appointment.doctorId?.name}
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
                    </tr>
                  ))}
                </tbody>
              </table>
              {todayAppointments.length > 5 && (
                <div className="p-4 text-center">
                  <Button
                    variant="link"
                    onClick={() => navigate('/receptionist/appointments')}
                  >
                    View all {todayAppointments.length} appointments
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;