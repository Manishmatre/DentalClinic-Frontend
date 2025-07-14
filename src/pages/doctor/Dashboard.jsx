import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import dashboardService from '../../api/dashboard/dashboardService';
import { formatRevenueData, formatPatientDemographicsData } from '../../utils/chartUtils';
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
import { FaUserInjured, FaCalendarCheck, FaCheckCircle, FaClipboardList, FaStar, FaTooth } from 'react-icons/fa';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, clinic } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPatients: 0,
      todayAppointments: 0,
      completedToday: 0,
      pendingToday: 0,
      averageRating: 0,
      weeklyAppointments: 0,
      weeklyAppointmentsTrend: { value: 0, direction: 'neutral' }
    },
    todayAppointments: [],
    chartData: {
      patientDemographics: {},
      treatmentStats: {},
      weeklyAppointments: []
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get clinic ID if available
      let clinicId;
      if (clinic && clinic._id) {
        clinicId = typeof clinic._id === 'object' ? clinic._id.toString() : clinic._id.toString();
      } else {
        const storedClinicData = localStorage.getItem('clinicData');
        if (storedClinicData) {
          const parsedClinicData = JSON.parse(storedClinicData);
          clinicId = parsedClinicData._id;
        }
      }

      // Fetch doctor dashboard data using our service
      const data = await dashboardService.getDoctorDashboardData(user._id, clinicId);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      toast.error('Error loading dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, clinic]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Prepare chart data
  const getWeeklyAppointmentsChartData = () => {
    if (!dashboardData.chartData.weeklyAppointments?.length) return { labels: [], datasets: [] };
    
    return formatRevenueData(dashboardData.chartData.weeklyAppointments, 'week');
  };

  const getPatientDemographicsChartData = () => {
    if (!dashboardData.chartData.patientDemographics?.ageGroups) return { labels: [], datasets: [] };
    
    return {
      labels: dashboardData.chartData.patientDemographics.ageGroups.map(item => item.group),
      datasets: [{
        label: 'Patients by Age',
        data: dashboardData.chartData.patientDemographics.ageGroups.map(item => item.count),
        backgroundColor: ['#4f46e5', '#818cf8', '#c7d2fe', '#e0e7ff', '#eef2ff'],
        borderWidth: 1
      }]
    };
  };

  const getTreatmentStatsChartData = () => {
    if (!dashboardData.chartData.treatmentStats) return { labels: [], datasets: [] };
    
    const treatmentStats = dashboardData.chartData.treatmentStats;
    return {
      labels: ['Cleanings', 'Fillings', 'Root Canals', 'Extractions', 'Implants'],
      datasets: [{
        label: 'Treatments Performed',
        data: [
          treatmentStats.cleanings || 0,
          treatmentStats.fillings || 0,
          treatmentStats.rootCanals || 0,
          treatmentStats.extractions || 0,
          treatmentStats.implants || 0
        ],
        backgroundColor: ['#00a4bd', '#59cbe8', '#b3e7f2', '#d6f3f8', '#e8f8fb'],
        borderWidth: 1
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

  const { stats, todayAppointments } = dashboardData;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaTooth className="mr-2 text-indigo-600" /> 
            DentalOS.AI Doctor Dashboard
          </h1>
          <p className="text-gray-500">Welcome, Dr. {user?.name}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="primary"
            onClick={() => navigate('/doctor/appointments')}
          >
            View All Appointments
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="My Patients"
          value={stats.totalPatients}
          icon={<FaUserInjured />}
          color="primary"
          onClick={() => navigate('/doctor/patients')}
        />

        <KpiCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={<FaCalendarCheck />}
          color="info"
          onClick={() => navigate('/doctor/appointments')}
        />

        <KpiCard
          title="Weekly Appointments"
          value={stats.weeklyAppointments}
          trend={stats.weeklyAppointmentsTrend?.value}
          trendDirection={stats.weeklyAppointmentsTrend?.direction}
          icon={<FaClipboardList />}
          color="dental"
        />

        <KpiCard
          title="Patient Rating"
          value={stats.averageRating}
          unit="/5"
          icon={<FaStar />}
          color="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Weekly Appointment Load">
          <LineChart data={getWeeklyAppointmentsChartData()} height={300} />
        </ChartCard>

        <ChartCard title="Treatment Statistics">
          <BarChart data={getTreatmentStatsChartData()} height={300} />
        </ChartCard>
      </div>

      {/* Second Row of Charts and KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Patient Demographics" className="lg:col-span-2">
          <PieChart data={getPatientDemographicsChartData()} height={300} />
        </ChartCard>

        <div className="space-y-4">
          <KpiCard
            title="Completed Today"
            value={stats.completedToday}
            icon={<FaCheckCircle />}
            color="success"
          />

          <KpiCard
            title="Pending Today"
            value={stats.pendingToday}
            icon={<FaClipboardList />}
            color="warning"
          />
        </div>
      </div>

      {/* Today's Schedule */}
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
                  <tr key={appointment._id} className="hover:bg-gray-50">
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
                        onClick={() => navigate(`/doctor/appointments/${appointment._id}`)}
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