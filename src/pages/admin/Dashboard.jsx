// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../api/dashboard/dashboardService';
import { formatAppointmentStatusData, formatRevenueData, formatPatientDemographicsData, formatServicePopularityData } from '../../utils/chartUtils';
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
import { FaUserInjured, FaUserMd, FaCalendarCheck, FaMoneyBillWave, FaClipboardList, FaCheckCircle, FaUsersCog, FaTooth, FaCircle, FaCalendarAlt, FaEllipsisV, FaEdit, FaTimesCircle, FaCheck, FaClock } from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { clinic, user } = useAuth();
  const [actionMenu, setActionMenu] = useState({ isOpen: false, appointmentId: null, position: { x: 0, y: 0 } });
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPatients: 0,
      totalDoctors: 0,
      todayAppointments: 0,
      monthlyRevenue: 0,
      pendingAppointments: 0,
      completedAppointments: 0,
      staffPresent: 0,
      totalStaff: 0,
      onlineDoctors: []
    },
    trends: {},
    recentAppointments: [],
    scheduledAppointments: [],
    chartData: {
      weeklyRevenue: [],
      monthlyRevenue: [],
      appointmentsByService: [],
      patientDemographics: {}
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueTimeframe, setRevenueTimeframe] = useState('week'); // 'week' or 'month'

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get clinic ID from multiple sources
      let clinicId;
      
      // First try from auth context
      if (clinic && clinic._id) {
        clinicId = typeof clinic._id === 'object' ? clinic._id.toString() : clinic._id.toString();
      } 
      // Then try from localStorage clinicData
      else {
        const storedClinicData = localStorage.getItem('clinicData');
        if (storedClinicData) {
          const parsedClinicData = JSON.parse(storedClinicData);
          clinicId = parsedClinicData._id;
        }
        // Finally try from userData.clinicId
        else {
          const storedUserData = localStorage.getItem('userData');
          if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);
            if (parsedUserData.clinicId) {
              clinicId = typeof parsedUserData.clinicId === 'object' ? 
                (parsedUserData.clinicId._id || parsedUserData.clinicId.id) : 
                parsedUserData.clinicId;
            }
          }
          // Last resort - try defaultClinicId
          else {
            clinicId = localStorage.getItem('defaultClinicId');
          }
        }
      }

      // Fetch dashboard data using our new service
      const data = await dashboardService.getAdminDashboardData(clinicId);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      toast.error('Error loading dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [clinic]);

  // Check if user has required role for clinic stats
  const checkUserRole = useCallback(() => {
    // Try multiple sources to determine user role
    let userRole = user?.role;
    
    if (!userRole) {
      try {
        // Try userData in localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          userRole = parsedUserData.role || parsedUserData.userRole;
        }
        
        // Try user in localStorage
        if (!userRole) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            userRole = parsedUser.role;
          }
        }
        
        // Try direct userRole in localStorage
        if (!userRole) {
          userRole = localStorage.getItem('userRole');
        }
      } catch (e) {
        console.error('Error checking user role:', e);
      }
    }
    
    return userRole === 'Admin' || userRole === 'Doctor';
  }, [user]);

  useEffect(() => {
    // Store user role in localStorage for other components to use
    if (user && user.role) {
      localStorage.setItem('userRole', user.role);
    }
    
    fetchDashboardData();
  }, [fetchDashboardData, user]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      // Show loading toast
      const toastId = toast.loading(`Updating appointment status to ${newStatus}...`);
      
      // Call API to update appointment status
      // This is a placeholder - you would need to implement the actual API call
      // await appointmentService.updateStatus(appointmentId, newStatus);
      
      // For now, let's update the state locally
      setDashboardData(prevData => {
        // Update in recentAppointments
        const updatedRecentAppointments = prevData.recentAppointments.map(apt => 
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        );
        
        // Update in scheduledAppointments if present
        const updatedScheduledAppointments = prevData.scheduledAppointments?.map(apt => 
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        ) || [];
        
        return {
          ...prevData,
          recentAppointments: updatedRecentAppointments,
          scheduledAppointments: updatedScheduledAppointments
        };
      });
      
      // Show success toast
      toast.update(toastId, { 
        render: `Appointment status updated to ${newStatus}`, 
        type: "success", 
        isLoading: false,
        autoClose: 3000
      });
      
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  // Prepare chart data
  const getRevenueChartData = () => {
    const revenueData = revenueTimeframe === 'week' 
      ? dashboardData.chartData.weeklyRevenue 
      : dashboardData.chartData.monthlyRevenue;
    
    return formatRevenueData(revenueData, revenueTimeframe);
  };

  const getAppointmentStatusChartData = () => {
    return formatAppointmentStatusData(dashboardData.recentAppointments);
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

  const getServicePopularityChartData = () => {
    if (!dashboardData.chartData.appointmentsByService) return { labels: [], datasets: [] };
    
    return {
      labels: dashboardData.chartData.appointmentsByService.map(item => item.service),
      datasets: [{
        label: 'Appointments',
        data: dashboardData.chartData.appointmentsByService.map(item => item.count),
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

  const { stats, trends, recentAppointments } = dashboardData;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaTooth className="mr-2 text-indigo-600" /> 
            DentalOS.AI Dashboard
          </h1>
          <p className="text-gray-500">Welcome back, {user?.name || 'Admin'}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="primary"
            onClick={() => navigate('/admin/appointments/new')}
          >
            New Appointment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Patients"
          value={stats.totalPatients}
          trend={trends.totalPatients?.value}
          trendDirection={trends.totalPatients?.direction}
          icon={<FaUserInjured />}
          color="primary"
          onClick={() => navigate('/admin/patients')}
        />

        <KpiCard
          title="Doctors"
          value={stats.totalDoctors}
          trend={trends.totalDoctors?.value}
          trendDirection={trends.totalDoctors?.direction}
          icon={<FaUserMd />}
          color="dental"
          onClick={() => navigate('/admin/staff')}
        />

        <KpiCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          trend={trends.todayAppointments?.value}
          trendDirection={trends.todayAppointments?.direction}
          icon={<FaCalendarCheck />}
          color="info"
          onClick={() => navigate('/admin/appointments')}
        />

        <KpiCard
          title="Monthly Revenue"
          value={stats.monthlyRevenue.toLocaleString()}
          unit="₹"
          trend={trends.monthlyRevenue?.value}
          trendDirection={trends.monthlyRevenue?.direction}
          icon={<FaMoneyBillWave />}
          color="success"
          onClick={() => navigate('/admin/billing')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Revenue Trend" 
          actions={
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant={revenueTimeframe === 'week' ? 'primary' : 'secondary'}
                onClick={() => setRevenueTimeframe('week')}
              >
                Weekly
              </Button>
              <Button 
                size="sm" 
                variant={revenueTimeframe === 'month' ? 'primary' : 'secondary'}
                onClick={() => setRevenueTimeframe('month')}
              >
                Monthly
              </Button>
            </div>
          }
        >
          <LineChart data={getRevenueChartData()} height={300} />
        </ChartCard>

        <ChartCard title="Appointment Status">
          <PieChart data={getAppointmentStatusChartData()} height={300} />
        </ChartCard>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Patient Demographics">
          <BarChart data={getPatientDemographicsChartData()} height={300} />
        </ChartCard>

        <ChartCard title="Popular Services">
          <BarChart data={getServicePopularityChartData()} height={300} />
        </ChartCard>
      </div>

      {/* KPI Cards - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Pending Appointments"
          value={stats.pendingAppointments}
          trend={trends.pendingAppointments?.value}
          trendDirection={trends.pendingAppointments?.direction === 'up' ? 'down' : 'up'} // Inverse trend for pending (down is good)
          icon={<FaClipboardList />}
          color="warning"
        />

        <KpiCard
          title="Completed Appointments"
          value={stats.completedAppointments}
          trend={trends.completedAppointments?.value}
          trendDirection={trends.completedAppointments?.direction}
          icon={<FaCheckCircle />}
          color="success"
        />

        <KpiCard
          title="Staff Present"
          value={`${stats.staffPresent}/${stats.totalStaff}`}
          trend={trends.staffPresent?.value}
          trendDirection={trends.staffPresent?.direction}
          icon={<FaUsersCog />}
          color="info"
          onClick={() => navigate('/admin/staff')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Online Doctors */}
        <Card title="Online Doctors" className="h-full">
          <div className="p-4">
            {dashboardData.stats.onlineDoctors && dashboardData.stats.onlineDoctors.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.stats.onlineDoctors.map((doctor, index) => (
                  <div key={doctor._id || index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/staff/${doctor._id}`)}>
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FaUserMd className="text-indigo-600" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="text-sm font-medium text-gray-900">Dr. {doctor.name}</div>
                      <div className="text-sm text-gray-500">{doctor.specialty || 'General Dentist'}</div>
                    </div>
                    <div className="flex items-center">
                      <FaCircle className="text-green-500 mr-2" size={10} />
                      <span className="text-sm text-green-600">Online</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaUserMd className="mx-auto text-4xl text-gray-300 mb-4" />
                <p className="text-gray-500">No doctors currently online</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="link"
              onClick={() => navigate('/admin/staff')}
              className="w-full text-center"
            >
              View All Staff
            </Button>
          </div>
        </Card>

        {/* Scheduled Appointments */}
        <Card title="Upcoming Scheduled Appointments" className="h-full">
          <div className="overflow-x-auto">
            {dashboardData.scheduledAppointments && dashboardData.scheduledAppointments.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
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
                  {dashboardData.scheduledAppointments.slice(0, 5).map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/appointments/${appointment._id}`)}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.patientId?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Dr. {appointment.doctorId?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          appointment.status === 'Confirmed' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-4" />
                <p className="text-gray-500">No upcoming scheduled appointments</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="link"
              onClick={() => navigate('/admin/appointments?status=Scheduled')}
              className="w-full text-center"
            >
              View All Scheduled Appointments
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Appointments - Improved with PieChart styling */}
      <ChartCard 
        title="Recent Appointments" 
        actions={
          <Button 
            size="sm" 
            variant="primary"
            onClick={() => navigate('/admin/appointments/new')}
            className="flex items-center"
          >
            <FaCalendarAlt className="mr-2" /> New Appointment
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-indigo-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-indigo-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((appointment, index) => (
                    <tr key={appointment._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/admin/appointments/${appointment._id}`)}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer" onClick={() => navigate(`/admin/patients/${appointment.patientId?._id}`)}>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3 shadow-sm">
                            <FaUserInjured className="text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-medium">{appointment.patientId?.name}</div>
                            <div className="text-xs text-gray-500">{appointment.patientId?.phone || 'No phone'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 cursor-pointer" onClick={() => navigate(`/admin/staff/${appointment.doctorId?._id}`)}>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 shadow-sm">
                            <FaUserMd className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">Dr. {appointment.doctorId?.name}</div>
                            <div className="text-xs text-gray-500">{appointment.doctorId?.specialty || 'General'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 cursor-pointer" onClick={() => navigate(`/admin/appointments/${appointment._id}`)}>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center mr-2 shadow-sm">
                            <FaTooth className="text-teal-600" />
                          </div>
                          <div>
                            <div className="font-medium">{appointment.serviceType}</div>
                            <div className="text-xs text-gray-500">{appointment.duration || '30'} mins</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => navigate(`/admin/appointments/${appointment._id}`)}>
                        <span className={`px-3 py-1.5 inline-flex items-center text-xs font-medium rounded-full shadow-sm ${
                          appointment.status === 'Completed' 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : appointment.status === 'Scheduled'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : appointment.status === 'Confirmed'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : appointment.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {appointment.status === 'Completed' && <FaCheck className="mr-1.5" />}
                          {appointment.status === 'Scheduled' && <FaClock className="mr-1.5" />}
                          {appointment.status === 'Confirmed' && <FaCalendarCheck className="mr-1.5" />}
                          {appointment.status === 'Cancelled' && <FaTimesCircle className="mr-1.5" />}
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        <div className="flex justify-center space-x-2">
                          {appointment.status !== 'Completed' && (
                            <button 
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md transition-colors duration-200 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(appointment._id, 'Completed');
                              }}
                              title="Mark as Completed"
                            >
                              <FaCheck size={14} />
                            </button>
                          )}
                          {appointment.status !== 'Confirmed' && appointment.status !== 'Completed' && (
                            <button 
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors duration-200 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(appointment._id, 'Confirmed');
                              }}
                              title="Confirm Appointment"
                            >
                              <FaCalendarCheck size={14} />
                            </button>
                          )}
                          <button 
                            className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md transition-colors duration-200 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/appointments/edit/${appointment._id}`);
                            }}
                            title="Edit Appointment"
                          >
                            <FaEdit size={14} />
                          </button>
                          {appointment.status !== 'Cancelled' && (
                            <button 
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition-colors duration-200 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(appointment._id, 'Cancelled');
                              }}
                              title="Cancel Appointment"
                            >
                              <FaTimesCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                          <FaCalendarAlt className="text-gray-400 text-4xl" />
                        </div>
                        <p className="text-gray-600 font-medium mb-2">No recent appointments found</p>
                        <p className="text-gray-500 mb-4 max-w-md">Schedule new appointments to see them appear here</p>
                        <Button
                          variant="primary"
                          size="sm"
                          className="shadow-sm"
                          onClick={() => navigate('/admin/appointments/new')}
                        >
                          <FaCalendarAlt className="mr-2" /> Create New Appointment
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {recentAppointments.length} of {recentAppointments.length} recent appointments
          </div>
          <Button
            variant="link"
            onClick={() => navigate('/admin/appointments')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View All Appointments →
          </Button>
        </div>
      </ChartCard>
    </div>
  );
};

export default AdminDashboard;
