import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import dashboardService from '../../api/dashboard/dashboardService';
import { formatRevenueData } from '../../utils/chartUtils';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import KpiCard from '../../components/dashboard/KpiCard';
import ChartCard from '../../components/dashboard/ChartCard';
import BarChart from '../../components/dashboard/BarChart';
import LineChart from '../../components/dashboard/LineChart';
import PieChart from '../../components/dashboard/PieChart';
import { toast } from 'react-toastify';
import {
  FaCalendarCheck,
  FaCalendarAlt,
  FaUserPlus,
  FaFileInvoiceDollar,
  FaChartPie,
  FaUserMd,
  FaTooth,
  FaClipboardList
} from 'react-icons/fa';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { user, clinic } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: [],
    stats: {
      totalAppointments: 0,
      confirmedAppointments: 0,
      pendingPayments: 0,
      todayRevenue: 0,
      newPatients: 0,
      appointmentsByStatus: [],
      appointmentsByDoctor: [],
      revenueByDay: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!clinic?._id) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Fetch receptionist dashboard data using our service
      const data = await dashboardService.getReceptionistDashboardData(clinic._id);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      toast.error('Error loading dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [clinic?._id]);

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

  // Prepare chart data for appointments by status
  const getAppointmentsByStatusChartData = () => {
    if (!dashboardData.stats?.appointmentsByStatus?.length) return { labels: [], datasets: [] };
    
    return {
      labels: dashboardData.stats.appointmentsByStatus.map(item => item.status),
      datasets: [{
        label: 'Appointments by Status',
        data: dashboardData.stats.appointmentsByStatus.map(item => item.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    };
  };

  // Prepare chart data for appointments by doctor
  const getAppointmentsByDoctorChartData = () => {
    if (!dashboardData.stats?.appointmentsByDoctor?.length) return { labels: [], datasets: [] };
    
    return {
      labels: dashboardData.stats.appointmentsByDoctor.map(item => item.doctor),
      datasets: [{
        label: 'Appointments by Doctor',
        data: dashboardData.stats.appointmentsByDoctor.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    };
  };

  // Prepare chart data for revenue by day
  const getRevenueByDayChartData = () => {
    if (!dashboardData.stats?.revenueByDay?.length) return { labels: [], datasets: [] };
    
    return {
      labels: dashboardData.stats.revenueByDay.map(item => 
        new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' })
      ),
      datasets: [{
        label: 'Revenue',
        data: dashboardData.stats.revenueByDay.map(item => item.amount),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8">
        <Alert
          variant="error"
          title="Error Loading Dashboard"
          message={error}
        />
        <div className="mt-4">
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  const { todayAppointments, stats } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaTooth className="mr-2 text-indigo-600" /> 
            DentalOS.AI Receptionist Portal
          </h1>
          <p className="text-gray-500">Welcome, {user?.name} | {clinic?.name}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="primary"
            onClick={() => handleQuickAction('newAppointment')}
          >
            <FaCalendarAlt className="mr-2" /> New Appointment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Today's Appointments"
          value={stats.totalAppointments}
          icon={<FaCalendarCheck />}
          color="primary"
          onClick={() => navigate('/receptionist/appointments')}
        />

        <KpiCard
          title="Confirmed Appointments"
          value={stats.confirmedAppointments}
          icon={<FaCalendarAlt />}
          color="success"
          onClick={() => navigate('/receptionist/appointments?status=Confirmed')}
        />

        <KpiCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={<FaFileInvoiceDollar />}
          color="warning"
          onClick={() => navigate('/receptionist/billing')}
        />

        <KpiCard
          title="Today's Revenue"
          value={stats.todayRevenue.toLocaleString()}
          unit="₹"
          icon={<FaFileInvoiceDollar />}
          color="info"
          onClick={() => navigate('/receptionist/billing')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Appointments by Status">
          <PieChart data={getAppointmentsByStatusChartData()} height={250} />
        </ChartCard>

        <ChartCard title="Weekly Revenue">
          <LineChart data={getRevenueByDayChartData()} height={250} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card title="Quick Actions" className="h-full">
          <div className="p-4 space-y-4">
            <Button
              onClick={() => handleQuickAction('newAppointment')}
              className="w-full flex items-center justify-center"
            >
              <FaCalendarAlt className="mr-2" /> New Appointment
            </Button>
            <Button
              onClick={() => handleQuickAction('newPatient')}
              variant="secondary"
              className="w-full flex items-center justify-center"
            >
              <FaUserPlus className="mr-2" /> Register Patient
            </Button>
            <Button
              onClick={() => handleQuickAction('payments')}
              variant="secondary"
              className="w-full flex items-center justify-center"
            >
              <FaFileInvoiceDollar className="mr-2" /> Manage Payments
            </Button>
          </div>
        </Card>

        {/* Today's Schedule - Brief View */}
        <Card title="Today's Schedule" className="lg:col-span-2">
          {todayAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No appointments scheduled for today</p>
              <Button 
                variant="primary"
                onClick={() => handleQuickAction('newAppointment')}
              >
                Schedule Appointment
              </Button>
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
                    <tr key={appointment._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/receptionist/appointments/${appointment._id}`)}>
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

      {/* Appointments by Doctor */}
      {dashboardData.stats?.appointmentsByDoctor?.length > 0 && (
        <ChartCard 
          title="Appointments by Doctor" 
          actions={
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => navigate('/receptionist/appointments')}
            >
              View All
            </Button>
          }
        >
          <BarChart data={getAppointmentsByDoctorChartData()} height={250} />
        </ChartCard>
      )}
    </div>
  );
};

export default ReceptionistDashboard;