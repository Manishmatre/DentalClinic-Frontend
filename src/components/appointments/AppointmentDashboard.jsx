import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaFilter,
  FaChartLine,
  FaUsers,
  FaClock,
  FaDollarSign,
  FaStar,
  FaCalendarWeek,
  FaCalendarDay,
  FaCalendar
} from 'react-icons/fa';
import { Doughnut, Line, Bar, Radar } from 'react-chartjs-2';
import moment from 'moment';
import appointmentService from '../../api/appointments/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AppointmentDashboard = () => {
  const { user, clinic } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // week, month, quarter, year
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!clinic?._id) return;

    try {
      setLoading(true);
      const endDate = moment().endOf('day');
      let startDate;

      switch (dateRange) {
        case 'week':
          startDate = moment().startOf('week');
          break;
        case 'month':
          startDate = moment().startOf('month');
          break;
        case 'quarter':
          startDate = moment().startOf('quarter');
          break;
        case 'year':
          startDate = moment().startOf('year');
          break;
        default:
          startDate = moment().startOf('week');
      }

      const params = {
        clinicId: clinic._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        doctorId: selectedDoctor !== 'all' ? selectedDoctor : undefined
      };

      const response = await appointmentService.getAppointmentAnalytics(params);
      
      if (response.error) {
        toast.error(response.message || 'Failed to fetch analytics');
        return;
      }

      setAnalytics(response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [clinic, dateRange, selectedDoctor]);

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        if (clinic?._id) {
          const response = await fetch(`/api/doctors?clinicId=${clinic._id}`);
          const data = await response.json();
          if (data.success) {
            setDoctors(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, [clinic]);

  // Auto-refresh analytics
  useEffect(() => {
    fetchAnalytics();
    
    const interval = setInterval(() => {
      fetchAnalytics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchAnalytics, refreshInterval]);

  // Export analytics data
  const exportAnalytics = () => {
    if (!analytics) return;

    const data = {
      dateRange,
      generatedAt: new Date().toISOString(),
      clinic: clinic?.name,
      analytics
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointment-analytics-${moment().format('YYYY-MM-DD')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics exported successfully');
  };

  // Calculate utilization rate
  const calculateUtilizationRate = () => {
    if (!analytics) return 0;
    const totalSlots = analytics.totalScheduled + analytics.totalCompleted + analytics.totalCancelled + analytics.totalNoShow;
    return totalSlots > 0 ? Math.round((analytics.totalCompleted / totalSlots) * 100) : 0;
  };

  // Calculate average appointment duration
  const calculateAverageDuration = () => {
    if (!analytics?.appointmentDurations) return 0;
    const durations = analytics.appointmentDurations;
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    return durations.length > 0 ? Math.round(total / durations.length) : 0;
  };

  // Calculate revenue metrics
  const calculateRevenueMetrics = () => {
    if (!analytics?.revenueData) return { total: 0, average: 0, trend: 0 };
    
    const revenue = analytics.revenueData;
    const total = revenue.reduce((sum, item) => sum + item.amount, 0);
    const average = revenue.length > 0 ? total / revenue.length : 0;
    const trend = revenue.length > 1 ? 
      ((revenue[revenue.length - 1].amount - revenue[0].amount) / revenue[0].amount) * 100 : 0;
    
    return { total, average, trend };
  };

  if (loading && !analytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const appointmentAnalytics = analytics || {
    totalScheduled: 0,
    totalCompleted: 0,
    totalCancelled: 0,
    totalNoShow: 0,
    appointmentsByStatus: { labels: [], data: [] },
    appointmentsByDoctor: { labels: [], data: [] },
    appointmentTrend: { labels: [], data: [] },
    recentAppointments: [],
    upcomingAppointments: [],
    utilizationRate: 0,
    averageDuration: 0,
    revenueData: []
  };

  const utilizationRate = calculateUtilizationRate();
  const averageDuration = calculateAverageDuration();
  const revenueMetrics = calculateRevenueMetrics();

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
    <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2 bg-white rounded-lg border p-2">
            <Button
              variant={dateRange === 'week' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setDateRange('week')}
            >
              <FaCalendarWeek className="mr-1" />
              Week
            </Button>
            <Button
              variant={dateRange === 'month' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setDateRange('month')}
            >
              <FaCalendarDay className="mr-1" />
              Month
            </Button>
            <Button
              variant={dateRange === 'quarter' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setDateRange('quarter')}
            >
              <FaCalendar className="mr-1" />
              Quarter
            </Button>
          </div>

          {/* Doctor Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="all">All Doctors</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.firstName} {doctor.lastName}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <Button
            variant="outline"
            onClick={exportAnalytics}
            disabled={!analytics}
          >
            <FaDownload className="mr-2" />
            Export
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : <FaChartLine />}
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Scheduled */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-blue-100 text-sm font-medium">Scheduled</p>
                <h3 className="text-3xl font-bold mt-1">{appointmentAnalytics.totalScheduled}</h3>
                <p className="text-blue-100 text-sm mt-2 flex items-center">
                  <FaArrowUp className="mr-1" /> 
                  {analytics?.growthRate?.scheduled || 0}% from last period
              </p>
            </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                <FaCalendarAlt className="text-2xl" />
              </div>
            </div>
          </div>
        </Card>
        
        {/* Completed */}
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <h3 className="text-3xl font-bold mt-1">{appointmentAnalytics.totalCompleted}</h3>
                <p className="text-green-100 text-sm mt-2 flex items-center">
                  <FaArrowUp className="mr-1" /> 
                  {analytics?.growthRate?.completed || 0}% from last period
              </p>
            </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                <FaCheckCircle className="text-2xl" />
              </div>
            </div>
          </div>
        </Card>
        
        {/* Utilization Rate */}
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-purple-100 text-sm font-medium">Utilization Rate</p>
                <h3 className="text-3xl font-bold mt-1">{utilizationRate}%</h3>
                <p className="text-purple-100 text-sm mt-2 flex items-center">
                  <FaClock className="mr-1" /> 
                  {averageDuration} min avg duration
              </p>
            </div>
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
                <FaUsers className="text-2xl" />
              </div>
            </div>
          </div>
        </Card>
        
        {/* Revenue */}
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-yellow-100 text-sm font-medium">Revenue</p>
                <h3 className="text-3xl font-bold mt-1">${revenueMetrics.total.toLocaleString()}</h3>
                <p className="text-yellow-100 text-sm mt-2 flex items-center">
                  {revenueMetrics.trend > 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                  {Math.abs(revenueMetrics.trend).toFixed(1)}% trend
              </p>
            </div>
              <div className="bg-yellow-400 bg-opacity-30 p-3 rounded-full">
                <FaDollarSign className="text-2xl" />
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Status */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointments by Status</h3>
            <div className="h-80">
              <Doughnut 
                data={{
                  labels: appointmentAnalytics.appointmentsByStatus.labels,
                  datasets: [{
                    data: appointmentAnalytics.appointmentsByStatus.data,
                    backgroundColor: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'],
                    borderWidth: 2,
                    borderColor: '#fff'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </div>
        </Card>
        
        {/* Appointment Trend */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Trend</h3>
            <div className="h-80">
              <Line 
                data={{
                  labels: appointmentAnalytics.appointmentTrend.labels,
                  datasets: [
                    {
                      label: 'Scheduled',
                      data: appointmentAnalytics.appointmentTrend.scheduled || [],
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.3
                    },
                    {
                      label: 'Completed',
                      data: appointmentAnalytics.appointmentTrend.completed || [],
                      borderColor: '#10B981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      tension: 0.3
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top'
                    }
                  }
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor Performance */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor Performance</h3>
            <div className="h-80">
              <Bar 
                data={{
                  labels: appointmentAnalytics.appointmentsByDoctor.labels,
                  datasets: [{
                    label: 'Appointments',
                    data: appointmentAnalytics.appointmentsByDoctor.data,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3B82F6',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 }
                    }
                  }
                }}
              />
            </div>
          </div>
        </Card>

        {/* Patient Satisfaction */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Satisfaction</h3>
            <div className="h-80">
              <Radar 
                data={{
                  labels: ['Timeliness', 'Communication', 'Care Quality', 'Facility', 'Overall'],
                  datasets: [{
                    label: 'Satisfaction Score',
                    data: analytics?.satisfactionScores || [85, 90, 88, 82, 87],
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3B82F6',
                    borderWidth: 2,
                    pointBackgroundColor: '#3B82F6'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100
                    }
                  }
                }}
              />
            </div>
          </div>
        </Card>

        {/* Revenue Analysis */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-semibold">${revenueMetrics.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average per Appointment</span>
                <span className="font-semibold">${revenueMetrics.average.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Growth Trend</span>
                <span className={`font-semibold ${revenueMetrics.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueMetrics.trend > 0 ? '+' : ''}{revenueMetrics.trend.toFixed(1)}%
                </span>
              </div>
              <div className="pt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, Math.max(0, utilizationRate))}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Capacity Utilization</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Appointments</h3>
            {appointmentAnalytics.recentAppointments.length > 0 ? (
              <div className="space-y-3">
                {appointmentAnalytics.recentAppointments.slice(0, 5).map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-blue-600 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patientName}</p>
                        <p className="text-sm text-gray-500">{moment(appointment.date).format('MMM DD, h:mm A')}</p>
                      </div>
                    </div>
                    <Badge className={
                      appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      appointment.status === 'No Show' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {appointment.status}
                    </Badge>
                  </div>
                    ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent appointments found.</p>
            )}
          </div>
        </Card>
        
        {/* Upcoming Appointments */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Appointments</h3>
            {appointmentAnalytics.upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {appointmentAnalytics.upcomingAppointments.slice(0, 5).map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCalendarAlt className="text-green-600 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {moment(appointment.date).format('MMM DD, h:mm A')} • Dr. {appointment.doctorName}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {appointment.serviceType}
                    </Badge>
                  </div>
                    ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming appointments found.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentDashboard;
