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
  FaCalendar,
  FaUser
} from 'react-icons/fa';
import { Doughnut, Line, Bar, Radar } from 'react-chartjs-2';
import moment from 'moment';
import appointmentService from '../../api/appointments/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { Chart, RadialLinearScale, RadarController } from 'chart.js';

Chart.register(RadialLinearScale, RadarController);

const AppointmentDashboard = ({ analytics: analyticsProp, loading: loadingProp, error: errorProp }) => {
  const { user, clinic } = useAuth();
  const [analytics, setAnalytics] = useState(analyticsProp || null);
  const [loading, setLoading] = useState(loadingProp ?? true);
  const [dateRange, setDateRange] = useState('week'); // week, month, quarter, year
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes
  const [error, setError] = useState(errorProp ?? null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  // Only fetch if analyticsProp is not provided
  const fetchAnalytics = useCallback(async () => {
    if (analyticsProp) return;
    if (!clinic?._id) return;
    try {
      setLoading(true);
      const endDate = moment().endOf('day');
      let startDate;
      switch (dateRange) {
        case 'week': startDate = moment().startOf('week'); break;
        case 'month': startDate = moment().startOf('month'); break;
        case 'quarter': startDate = moment().startOf('quarter'); break;
        case 'year': startDate = moment().startOf('year'); break;
        default: startDate = moment().startOf('week');
      }
      const params = {
        clinicId: clinic._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        doctorId: selectedDoctor !== 'all' ? selectedDoctor : undefined
      };
      let response;
      if (appointmentService.getAppointmentAnalytics) {
        response = await appointmentService.getAppointmentAnalytics(params);
      } else if (appointmentService.getAppointmentStats) {
        response = await appointmentService.getAppointmentStats(params);
      } else {
        response = null;
      }
      if (!response || response.error) {
        setAnalytics(null);
        setLoading(false);
        setError(response?.message || 'Failed to fetch analytics');
        console.error('Appointment analytics error:', response);
        return;
      }
      setAnalytics(response);
      setError(null);
    } catch (error) {
      setAnalytics(null);
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [clinic, dateRange, selectedDoctor, analyticsProp]);

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
    if (analyticsProp) {
      setAnalytics(analyticsProp);
      setLoading(loadingProp ?? false);
      setError(errorProp ?? null);
      return;
    }
    fetchAnalytics();
    
    const interval = setInterval(() => {
      fetchAnalytics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchAnalytics, refreshInterval, analyticsProp, loadingProp, errorProp]);

  // Fetch recent and upcoming appointments if not present in analytics
  useEffect(() => {
    if (analytics && analytics.recentAppointments && analytics.upcomingAppointments) {
      setRecentAppointments(analytics.recentAppointments);
      setUpcomingAppointments(analytics.upcomingAppointments);
      return;
    }
    // Fetch recent appointments (last 7 days)
    const fetchRecent = async () => {
      try {
        const res = await appointmentService.getAppointments({ limit: 5, sort: '-startTime' });
        setRecentAppointments(res.data || []);
      } catch (e) { setRecentAppointments([]); }
    };
    // Fetch upcoming appointments (next 7 days)
    const fetchUpcoming = async () => {
      try {
        const now = new Date();
        const in7 = new Date(); in7.setDate(now.getDate() + 7);
        const res = await appointmentService.getAppointments({ startDate: now, endDate: in7, status: 'Scheduled', limit: 5, sort: 'startTime' });
        setUpcomingAppointments(res.data || []);
      } catch (e) { setUpcomingAppointments([]); }
    };
    fetchRecent();
    fetchUpcoming();
  }, [analytics]);

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

  // Map backend analytics fields to dashboard metrics
  const statusLabels = analytics?.statusBreakdown?.map(s => s._id) || [];
  const statusData = analytics?.statusBreakdown?.map(s => s.count) || [];
  const doctorLabels = analytics?.doctorBreakdown?.map(d => d.doctorName || 'Unknown') || [];
  const doctorData = analytics?.doctorBreakdown?.map(d => d.count) || [];
  const trendLabels = analytics?.dailyCounts?.map(d => d._id) || [];
  const trendData = analytics?.dailyCounts?.map(d => d.count) || [];
  const serviceTypeLabels = analytics?.serviceTypeBreakdown?.map(s => s._id) || [];
  const serviceTypeData = analytics?.serviceTypeBreakdown?.map(s => s.count) || [];

  // Extract real status counts from statusBreakdown
  const statusMap = (analytics?.statusBreakdown || []).reduce((acc, s) => {
    acc[s._id?.toLowerCase() || s._id] = s.count;
    return acc;
  }, {});
  const totalAppointments = analytics?.totalAppointments || 0;
  const scheduled = statusMap['scheduled'] || 0;
  const completed = statusMap['completed'] || 0;
  const cancelled = statusMap['cancelled'] || 0;
  const noShow = statusMap['no show'] || statusMap['no_show'] || statusMap['no-show'] || 0;

  if (loading && !analytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 font-semibold mb-2">{error}</div>
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

  // Use real data for cards
  const recent = recentAppointments.length ? recentAppointments : (appointmentAnalytics.recentAppointments || []);
  const upcoming = upcomingAppointments.length ? upcomingAppointments : (appointmentAnalytics.upcomingAppointments || []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Appointments */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Appointments</p>
                <h3 className="text-3xl font-bold mt-1">{totalAppointments}</h3>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
                <FaCalendarAlt className="text-2xl" />
              </div>
            </div>
          </div>
        </Card>
        {/* Scheduled */}
        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Scheduled</p>
                <h3 className="text-3xl font-bold mt-1">{scheduled}</h3>
              </div>
              <div className="bg-indigo-400 bg-opacity-30 p-3 rounded-full">
                <FaCalendar className="text-2xl" />
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
                <h3 className="text-3xl font-bold mt-1">{completed}</h3>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
                <FaCheckCircle className="text-2xl" />
              </div>
            </div>
          </div>
        </Card>
        {/* Cancelled */}
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Cancelled</p>
                <h3 className="text-3xl font-bold mt-1">{cancelled}</h3>
              </div>
              <div className="bg-red-400 bg-opacity-30 p-3 rounded-full">
                <FaTimesCircle className="text-2xl" />
              </div>
            </div>
          </div>
        </Card>
        {/* No Show */}
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">No Show</p>
                <h3 className="text-3xl font-bold mt-1">{noShow}</h3>
              </div>
              <div className="bg-yellow-400 bg-opacity-30 p-3 rounded-full">
                <FaExclamationTriangle className="text-2xl" />
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
                  labels: statusLabels,
                  datasets: [{
                    data: statusData,
                    backgroundColor: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'],
                    borderWidth: 2,
                    borderColor: '#fff'
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } }
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
                  labels: trendLabels,
                  datasets: [{
                    label: 'Appointments',
                    data: trendData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                  plugins: { legend: { position: 'top' } }
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Doctor Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctor Performance</h3>
            <div className="h-80">
              <Bar 
                data={{
                  labels: doctorLabels,
                  datasets: [{
                    label: 'Appointments',
                    data: doctorData,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3B82F6',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }}
              />
            </div>
          </div>
        </Card>
        {/* Appointments by Service Type */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointments by Service Type</h3>
            <div className="h-80">
              <Bar 
                data={{
                  labels: serviceTypeLabels,
                  datasets: [{
                    label: 'Appointments',
                    data: serviceTypeData,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: '#10B981',
                    borderWidth: 1
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }}
              />
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
            {recent.length > 0 ? (
              <div className="space-y-3">
                {recent.slice(0, 5).map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-blue-600 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patientName || appointment.patientId?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{moment(appointment.startTime || appointment.date).format('MMM DD, h:mm A')}</p>
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
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.slice(0, 5).map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCalendarAlt className="text-green-600 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patientName || appointment.patientId?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">
                          {moment(appointment.startTime || appointment.date).format('MMM DD, h:mm A')} • Dr. {appointment.doctorName || appointment.doctorId?.name || 'Unknown'}
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
