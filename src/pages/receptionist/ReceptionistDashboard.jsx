import React, { useState, useEffect } from 'react';
import appointmentService from '../../api/appointments/appointmentService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ReceptionistDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [appointments, waiting, checkins] = await Promise.all([
          appointmentService.getTodayAppointments(),
          appointmentService.getWaitingPatients(),
          appointmentService.getRecentCheckins()
        ]);

        setTodayAppointments(appointments);
        setWaitingPatients(waiting);
        setRecentCheckins(checkins);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    // Set up auto-refresh every 2 minutes
    const refreshInterval = setInterval(fetchDashboardData, 120000);
    return () => clearInterval(refreshInterval);
  }, []);

  const handleCheckin = async (appointmentId) => {
    try {
      setError(null);
      await appointmentService.checkinPatient(appointmentId);
      // Refresh dashboard data
      const [appointments, waiting, checkins] = await Promise.all([
        appointmentService.getTodayAppointments(),
        appointmentService.getWaitingPatients(),
        appointmentService.getRecentCheckins()
      ]);
      setTodayAppointments(appointments);
      setWaitingPatients(waiting);
      setRecentCheckins(checkins);
    } catch (err) {
      console.error('Error checking in patient:', err);
      setError(err.response?.data?.message || 'Failed to check in patient');
    }
  };

  const handleCheckout = async (appointmentId) => {
    try {
      setError(null);
      await appointmentService.checkoutPatient(appointmentId);
      // Refresh dashboard data
      const [waiting, checkins] = await Promise.all([
        appointmentService.getWaitingPatients(),
        appointmentService.getRecentCheckins()
      ]);
      setWaitingPatients(waiting);
      setRecentCheckins(checkins);
    } catch (err) {
      console.error('Error checking out patient:', err);
      setError(err.response?.data?.message || 'Failed to check out patient');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Checked In':
        return 'bg-green-100 text-green-800';
      case 'Waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reception Dashboard</h1>
      </div>

      {error && (
        <Alert 
          variant="error" 
          title="Error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Today's Appointments</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {todayAppointments.length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Patients Waiting</div>
            <div className="mt-1 text-3xl font-semibold text-yellow-600">
              {waitingPatients.length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Recent Check-ins</div>
            <div className="mt-1 text-3xl font-semibold text-green-600">
              {recentCheckins.length}
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Appointments</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(appointment.date).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{appointment.patient.name}</div>
                      <div className="text-sm text-gray-500">{appointment.patient.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">Dr. {appointment.doctor.name}</div>
                      <div className="text-sm text-gray-500">{appointment.service}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getStatusBadgeColor(appointment.status)
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {appointment.status === 'Scheduled' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCheckin(appointment._id)}
                        >
                          Check In
                        </Button>
                      )}
                      {appointment.status === 'In Progress' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCheckout(appointment._id)}
                        >
                          Check Out
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Waiting List */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Waiting List</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wait Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {waitingPatients.map((patient) => (
                  <tr key={patient._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(patient.checkinTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Dr. {patient.doctor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {Math.floor((Date.now() - new Date(patient.checkinTime)) / 60000)} mins
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Recent Check-ins */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Check-ins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCheckins.map((checkin) => (
              <div
                key={checkin._id}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {checkin.patient.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(checkin.checkinTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getStatusBadgeColor(checkin.status)
                  }`}>
                    {checkin.status}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Dr. {checkin.doctor.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {checkin.service}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReceptionistDashboard;