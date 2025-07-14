import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaFileMedical, FaUserMd, FaCreditCard, FaBell } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/patientService';
import { appointmentService } from '../../services/appointmentService';
import { formatAppointmentTimeRange } from '../../utils/timeZoneUtils';
import { toast } from 'react-toastify';
import AppointmentsTab from './AppointmentsTab';
import MedicalRecordsTab from './MedicalRecordsTab';

const PatientPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientData = await patientService.getPatientByUserId(user._id);
        setPatient(patientData);
        
        const appointmentsData = await appointmentService.getPatientAppointments(patientData._id);
        setAppointments(appointmentsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        toast.error('Failed to load patient data');
        setLoading(false);
      }
    };

    if (user) {
      fetchPatientData();
    }
  }, [user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Patient Portal</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-gray-600 hover:text-indigo-600"
              >
                <FaBell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>
              <div className="flex items-center space-x-2">
                <img
                  src={patient?.profileImage || '/default-avatar.png'}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">
                  {patient?.firstName} {patient?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaCalendarAlt className="inline-block mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => handleTabChange('appointments')}
              className={`${
                activeTab === 'appointments'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaCalendarAlt className="inline-block mr-2" />
              Appointments
            </button>
            <button
              onClick={() => handleTabChange('medical-records')}
              className={`${
                activeTab === 'medical-records'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaFileMedical className="inline-block mr-2" />
              Medical Records
            </button>
            <button
              onClick={() => handleTabChange('doctors')}
              className={`${
                activeTab === 'doctors'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaUserMd className="inline-block mr-2" />
              Doctors
            </button>
            <button
              onClick={() => handleTabChange('billing')}
              className={`${
                activeTab === 'billing'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <FaCreditCard className="inline-block mr-2" />
              Billing
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Upcoming Appointments */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment._id}
                        className="border-l-4 border-indigo-500 pl-4 py-2"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {formatAppointmentTimeRange(
                            appointment.startTime,
                            appointment.endTime,
                            appointment.clinic.timeZone
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No upcoming appointments</p>
                )}
              </div>

              {/* Recent Medical Records */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Medical Records</h2>
                <p className="text-gray-500">Coming soon...</p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/book-appointment')}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Book New Appointment
                  </button>
                  <button
                    onClick={() => navigate('/medical-records')}
                    className="w-full bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    View Medical Records
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">My Appointments</h2>
                <AppointmentsTab patientId={patient._id} />
              </div>
            </div>
          )}

          {activeTab === 'medical-records' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Medical Records</h2>
                <MedicalRecordsTab patientId={patient._id} />
              </div>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">My Doctors</h2>
                {/* Doctors list will be implemented here */}
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing & Payments</h2>
                {/* Billing information will be implemented here */}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientPortal; 