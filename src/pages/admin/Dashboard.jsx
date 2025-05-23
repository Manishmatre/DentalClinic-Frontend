// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import appointmentService from '../../api/appointments/appointmentService';
import clinicService from '../../api/clinic/clinicService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { clinic, user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    staffPresent: 0,
    totalStaff: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get clinic ID from multiple sources
      let clinicId;
      
      // First try from auth context
      if (clinic && clinic._id) {
        clinicId = typeof clinic._id === 'object' ? clinic._id.toString() : clinic._id.toString();
        console.log('Using clinic ID from auth context:', clinicId);
      } 
      // Then try from localStorage clinicData
      else {
        const storedClinicData = localStorage.getItem('clinicData');
        if (storedClinicData) {
          const parsedClinicData = JSON.parse(storedClinicData);
          clinicId = parsedClinicData._id;
          console.log('Using clinic ID from localStorage clinicData:', clinicId);
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
              console.log('Using clinic ID from localStorage userData:', clinicId);
            }
          }
          // Last resort - try defaultClinicId
          else {
            clinicId = localStorage.getItem('defaultClinicId');
            console.log('Using defaultClinicId from localStorage:', clinicId);
          }
        }
      }

      // Check if user has Admin or Doctor role for clinic stats
      const userRole = user?.role || localStorage.getItem('userRole');
      let clinicStats = {
        totalPatients: 0,
        totalDoctors: 0,
        todayAppointments: 0,
        monthlyRevenue: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        staffPresent: 0,
        totalStaff: 0
      };
      
      // Fetch data based on user role
      if (userRole === 'Admin' || userRole === 'Doctor') {
        try {
          // Only fetch clinic stats if user has appropriate role
          clinicStats = await clinicService.getClinicStats(clinicId);
        } catch (statsError) {
          console.error('Error fetching clinic stats:', statsError);
          toast.warning('Unable to load clinic statistics. Some features may be limited.');
          // Continue with default stats
        }
      } else {
        console.log('User does not have Admin or Doctor role. Using default stats.');
      }

      // Fetch appointments (available to all roles)
      const appointments = await appointmentService.getAppointments({
        limit: 5,
        sort: '-startTime',
        clinicId: clinicId
      });

      setStats(clinicStats);
      setRecentAppointments(appointments);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
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
        <h1 className="text-2xl font-semibold text-gray-900">Clinic Dashboard</h1>
        <Button onClick={() => navigate('/admin/reports')}>
          View Reports
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Total Patients</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalPatients}</div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Monthly Revenue</div>
            <div className="mt-1 text-3xl font-semibold text-green-600">₹{stats.monthlyRevenue.toFixed(2)}</div>
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
            <div className="text-sm font-medium text-gray-500">Staff Present</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.staffPresent}/{stats.totalStaff}
            </div>
          </div>
        </Card>
      </div>

      {/* Appointment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Appointment Status">
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Pending</span>
                  <span className="text-sm font-medium text-gray-900">{stats.pendingAppointments}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${(stats.pendingAppointments / (stats.pendingAppointments + stats.completedAppointments)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Completed</span>
                  <span className="text-sm font-medium text-gray-900">{stats.completedAppointments}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(stats.completedAppointments / (stats.pendingAppointments + stats.completedAppointments)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Staff Overview">
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Total Doctors</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalDoctors}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Active Staff</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.staffPresent}</div>
              </div>
              <div className="col-span-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate('/admin/staff')}
                >
                  Manage Staff
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card title="Recent Appointments">
        <div className="overflow-x-auto">
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
                  Service
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAppointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="link"
            onClick={() => navigate('/admin/appointments')}
            className="w-full text-center"
          >
            View All Appointments
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
