import React, { useState, useEffect, useCallback } from 'react';
import { FaUserClock, FaArrowUp, FaArrowDown, FaCheck, FaTimes, FaClock, FaExclamationTriangle, FaUser, FaStethoscope, FaPhone, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import moment from 'moment';
import appointmentService from '../../api/appointments/appointmentService';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import LoadingSpinner from '../ui/LoadingSpinner';

const QueueManagement = () => {
  const { user, clinic } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [averageAppointmentDuration, setAverageAppointmentDuration] = useState(30); // minutes

  // Fetch doctors for the clinic
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

  // Auto-refresh queue every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !selectedDoctor) return;

    const interval = setInterval(() => {
      fetchQueue();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, selectedDoctor]);

  const fetchQueue = useCallback(async () => {
    if (!selectedDoctor || !clinic?._id) return;

    try {
      setLoading(true);
      const response = await appointmentService.getAppointments({
        clinicId: clinic._id,
        doctorId: selectedDoctor._id,
        status: ['Scheduled', 'Confirmed', 'In Progress'],
        startDate: moment().startOf('day').toISOString(),
        endDate: moment().endOf('day').toISOString()
      });

      if (response.error) {
        toast.error(response.message || 'Failed to fetch queue');
        return;
      }

      const appointmentsArray = Array.isArray(response) ? response : 
                              (response.data && Array.isArray(response.data)) ? response.data : [];

      // Filter and sort queue
      const queueData = appointmentsArray
        .filter(apt => 
          apt.status === 'Scheduled' || apt.status === 'Confirmed' || apt.status === 'In Progress'
        )
        .sort((a, b) => {
          // In Progress appointments first
          if (a.status === 'In Progress' && b.status !== 'In Progress') return -1;
          if (b.status === 'In Progress' && a.status !== 'In Progress') return 1;
          
          // Then by scheduled time
          return new Date(a.startTime) - new Date(b.startTime);
        });

      setQueue(queueData);
      setLastUpdate(new Date());

      // Set current appointment (first In Progress or first in queue)
      const current = queueData.find(apt => apt.status === 'In Progress') || queueData[0];
      setCurrentAppointment(current);
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast.error('Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  }, [selectedDoctor, clinic]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const calculateWaitTime = (appointment, index) => {
    if (!currentAppointment) return 0;
    
    const currentIndex = queue.findIndex(apt => apt._id === currentAppointment._id);
    if (currentIndex === -1 || index <= currentIndex) return 0;
    
    const patientsAhead = index - currentIndex;
    return patientsAhead * averageAppointmentDuration;
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      const result = await appointmentService.updateAppointment(appointmentId, {
        status: newStatus
      });
      
      if (result.error) {
        toast.error(result.message || 'Failed to update appointment status');
        return;
      }
      
      toast.success('Appointment status updated successfully');
      fetchQueue(); // Refresh queue
    } catch (error) {
      toast.error('Failed to update appointment status');
    } finally {
      setLoading(false);
    }
  };

  const moveInQueue = async (appointmentId, direction) => {
    try {
      const currentIndex = queue.findIndex(apt => apt._id === appointmentId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex >= 0 && newIndex < queue.length) {
        const targetAppointment = queue[newIndex];
        
        // Swap appointment times
        const currentAppt = queue[currentIndex];
        const tempStartTime = currentAppt.startTime;
        const tempEndTime = currentAppt.endTime;
        
        await Promise.all([
          appointmentService.updateAppointment(currentAppt._id, {
            startTime: targetAppointment.startTime,
            endTime: targetAppointment.endTime
          }),
          appointmentService.updateAppointment(targetAppointment._id, {
            startTime: tempStartTime,
            endTime: tempEndTime
          })
        ]);
        
        toast.success('Queue order updated');
        fetchQueue();
      }
    } catch (error) {
      toast.error('Failed to update queue order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (appointment) => {
    // Check for urgent notes or special requirements
    if (appointment.notes?.toLowerCase().includes('urgent') || 
        appointment.notes?.toLowerCase().includes('emergency')) {
      return <FaExclamationTriangle className="text-red-500" />;
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Queue Management</h2>
          <p className="text-gray-600">Real-time patient queue monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Auto-refresh</span>
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueue}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Doctor Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Doctor
        </label>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedDoctor?._id || ''}
          onChange={(e) => {
            const doctor = doctors.find(d => d._id === e.target.value);
            setSelectedDoctor(doctor);
          }}
        >
          <option value="">Choose a doctor...</option>
          {doctors.map(doctor => (
            <option key={doctor._id} value={doctor._id}>
              Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization || 'General'}
            </option>
          ))}
        </select>
      </div>

      {/* Current Appointment Display */}
      {currentAppointment && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-blue-900">Currently Seeing</h3>
            </div>
            <Badge variant="blue">{currentAppointment.status}</Badge>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <FaUser className="text-gray-500" />
              <span className="font-medium">{currentAppointment.patientName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaClock className="text-gray-500" />
              <span>{moment(currentAppointment.startTime).format('h:mm A')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaStethoscope className="text-gray-500" />
              <span>{currentAppointment.serviceType}</span>
            </div>
          </div>
        </div>
      )}

      {/* Queue List */}
      {selectedDoctor ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Queue ({queue.length} patients)
            </h3>
            <div className="text-sm text-gray-500">
              Last updated: {moment(lastUpdate).format('h:mm:ss A')}
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-8">
              <FaUserClock className="mx-auto text-gray-400 text-4xl mb-4" />
              <p className="text-gray-500">No patients in queue</p>
            </div>
          ) : (
            queue.map((appointment, index) => {
              const waitTime = calculateWaitTime(appointment, index);
              const isCurrent = appointment._id === currentAppointment?._id;
              
              return (
                <div
                  key={appointment._id}
                  className={`p-4 bg-white rounded-lg shadow-sm border-l-4 ${
                    isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        {getPriorityIcon(appointment)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {appointment.patientName}
                          </h4>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FaClock className="text-gray-400" />
                            <span>{moment(appointment.startTime).format('h:mm A')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FaStethoscope className="text-gray-400" />
                            <span>{appointment.serviceType}</span>
                          </div>
                          {waitTime > 0 && (
                            <div className="flex items-center space-x-1">
                              <FaUserClock className="text-gray-400" />
                              <span>~{waitTime} min wait</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!isCurrent && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveInQueue(appointment._id, 'up')}
                            disabled={index === 0}
                            title="Move up in queue"
                          >
                            <FaArrowUp />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveInQueue(appointment._id, 'down')}
                            disabled={index === queue.length - 1}
                            title="Move down in queue"
                          >
                            <FaArrowDown />
                          </Button>
                        </>
                      )}
                      
                      {appointment.status === 'Scheduled' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusUpdate(appointment._id, 'In Progress')}
                          disabled={loading}
                          title="Start appointment"
                        >
                          <FaCheck />
                        </Button>
                      )}
                      
                      {appointment.status === 'In Progress' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusUpdate(appointment._id, 'Completed')}
                          disabled={loading}
                          title="Complete appointment"
                        >
                          <FaCheck />
                        </Button>
                      )}
                      
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusUpdate(appointment._id, 'Cancelled')}
                        disabled={loading}
                        title="Cancel appointment"
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <FaStethoscope className="mx-auto text-gray-400 text-4xl mb-4" />
          <p className="text-gray-500">Please select a doctor to view their queue</p>
        </div>
      )}
    </Card>
  );
};

export default QueueManagement; 