import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import dentalProcedureService from '../../api/dental/dentalProcedureService';
import patientService from '../../api/patients/patientService';
import staffService from '../../api/staff/staffService';
import appointmentService from '../../api/appointments/appointmentService';
import notificationService from '../../api/notifications/notificationService';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaPlus, FaClock, FaUser, FaTooth, FaTimes, FaExclamationTriangle, FaCheck } from 'react-icons/fa';

const DentalProcedureScheduler = () => {
  const { user, clinic } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [scheduledProcedures, setScheduledProcedures] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [procedureCategories, setProcedureCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    dentistId: '',
    category: '',
    name: '',
    description: '',
    duration: 60, // Default duration in minutes
    status: 'Scheduled'
  });
  const [inventoryCheck, setInventoryCheck] = useState(null);
  const [isInventoryCheckModalOpen, setIsInventoryCheckModalOpen] = useState(false);

  // Initialize week dates
  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const end = endOfWeek(currentDate, { weekStartsOn: 1 }); // End on Sunday
    const dates = eachDayOfInterval({ start, end });
    setWeekDates(dates);
  }, [currentDate]);

  // Fetch scheduled procedures for the current week
  useEffect(() => {
    if (weekDates.length > 0) {
      fetchScheduledProcedures();
    }
  }, [weekDates]);

  // Fetch patients, dentists, and procedure categories
  useEffect(() => {
    fetchPatients();
    fetchDentists();
    setProcedureCategories(dentalProcedureService.getProcedureCategories());
  }, []);

  // Fetch scheduled procedures
  const fetchScheduledProcedures = async () => {
    if (weekDates.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const startDate = weekDates[0];
      const endDate = weekDates[weekDates.length - 1];
      
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'Scheduled'
      };
      
      const data = await dentalProcedureService.getDentalProcedures(params);
      setScheduledProcedures(data.procedures || []);
    } catch (err) {
      console.error('Error fetching scheduled procedures:', err);
      setError('Failed to load scheduled procedures');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const data = await patientService.getPatients();
      // Ensure we always have an array
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setPatients([]);
      setError('Failed to load patients');
    }
  };

  // Fetch dentists
  const fetchDentists = async () => {
    try {
      const data = await staffService.getStaff({ role: 'dentist' });
      setDentists(data);
    } catch (err) {
      console.error('Error fetching dentists:', err);
    }
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, -7));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentDate(prevDate => addDays(prevDate, 7));
  };

  // Handle opening schedule modal
  const handleOpenScheduleModal = (date, timeSlot) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    setIsScheduleModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Check inventory availability for the procedure
  const checkInventoryAvailability = async () => {
    if (!formData.category || !formData.name) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Get common inventory items for this procedure category
      const commonItems = await dentalProcedureService.getCommonInventoryItems(formData.category);
      
      if (commonItems && commonItems.length > 0) {
        // Check inventory availability for these items
        const checkResult = {
          hasLowStock: false,
          items: []
        };
        
        for (const item of commonItems) {
          const estimatedQuantity = item.estimatedQuantity || 1;
          checkResult.items.push({
            name: item.name,
            estimatedQuantity,
            currentStock: item.currentStock,
            isLow: item.currentStock < estimatedQuantity
          });
          
          if (item.currentStock < estimatedQuantity) {
            checkResult.hasLowStock = true;
          }
        }
        
        setInventoryCheck(checkResult);
        if (checkResult.hasLowStock) {
          setIsInventoryCheckModalOpen(true);
        } else {
          // If all items are available, proceed with scheduling
          await handleScheduleProcedure();
        }
      } else {
        // If no items are required, proceed with scheduling
        await handleScheduleProcedure();
      }
    } catch (err) {
      console.error('Error checking inventory:', err);
      setError('Failed to check inventory availability');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle scheduling a procedure
  const handleScheduleProcedure = async () => {
    if (!formData.patientId || !formData.dentistId || !formData.category || !formData.name) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Format the date and time for the procedure
      const procedureDate = new Date(selectedDate);
      const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
      procedureDate.setHours(hours, minutes, 0, 0);
      
      // Calculate end time based on duration
      const endDate = new Date(procedureDate);
      endDate.setMinutes(endDate.getMinutes() + formData.duration);
      
      // Create the procedure data
      const procedureData = {
        ...formData,
        date: selectedDate.toISOString(),
        clinic: clinic._id,
        createdBy: user._id,
        updatedBy: user._id,
        inventoryItems: inventoryCheck ? inventoryCheck.items.map(item => ({
          itemId: item._id,
          name: item.name,
          quantity: item.estimatedQuantity
        })) : []
      };
      
      // Create the procedure
      const response = await dentalProcedureService.createDentalProcedure(procedureData);
      
      // Update the scheduled procedures list
      setScheduledProcedures(prev => [...prev, response]);
      
      // Send notifications
      try {
        // Get patient and dentist names for the notification
        const patientName = getPatientName(formData.patientId);
        const dentistName = getDentistName(formData.dentistId);
        
        // Create notification for admin/staff
        await notificationService.createProcedureScheduledNotification(
          formData.name,
          patientName,
          procedureDate,
          dentistName
        );
        
        // Notify the dentist about the procedure
        await notificationService.notifyDentistAboutProcedure(
          formData.dentistId,
          formData.name,
          patientName,
          procedureDate
        );
        
        // If inventory check was performed, create inventory check notification
        if (inventoryCheck) {
          const missingItems = inventoryCheck.items
            .filter(item => item.currentStock < item.estimatedQuantity)
            .map(item => item.name);
          
          await notificationService.createInventoryCheckNotification(
            formData.name,
            missingItems.length === 0,
            missingItems
          );
        }
      } catch (notifError) {
        console.error('Error sending notifications:', notifError);
        // Don't fail the whole procedure if notifications fail
      }
      
      // Close modals and reset form
      setIsInventoryCheckModalOpen(false);
      setIsScheduleModalOpen(false);
      setFormData({
        patientId: '',
        dentistId: '',
        category: '',
        name: '',
        description: '',
        duration: 60,
        status: 'Scheduled'
      });
      
      // Show success message
      setSuccessMessage('Dental procedure scheduled successfully');
      setTimeout(() => setSuccessMessage(''), 5000);
      
      // Refresh procedures
      fetchScheduledProcedures();
    } catch (err) {
      console.error('Error scheduling dental procedure:', err);
      setError(err.response?.data?.message || 'Failed to schedule dental procedure');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate time slots for the scheduler
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  };

  // Get procedures for a specific date and time slot
  const getProceduresForSlot = (date, timeSlot) => {
    if (!scheduledProcedures.length) return [];
    
    return scheduledProcedures.filter(procedure => {
      const procedureDate = new Date(procedure.scheduledDate);
      const procedureTimeStr = `${procedureDate.getHours()}:${procedureDate.getMinutes() === 0 ? '00' : '30'}`;
      
      return isSameDay(procedureDate, date) && procedureTimeStr === timeSlot;
    });
  };

  // Get patient name by ID
  const getPatientName = (patientId) => {
    const patient = patients.find(p => p._id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  // Get dentist name by ID
  const getDentistName = (dentistId) => {
    const dentist = dentists.find(d => d._id === dentistId);
    return dentist ? `Dr. ${dentist.firstName} ${dentist.lastName}` : 'Unknown Dentist';
  };

  // Time slots for the scheduler
  const timeSlots = generateTimeSlots();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Success message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-md">
          <div className="flex items-center">
            <FaCheck className="mr-2" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Week navigation */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Dental Procedure Schedule</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={goToPreviousWeek} 
              className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center hover:bg-gray-100"
            >
              <FaChevronLeft className="mr-1" /> Previous Week
            </button>
            <span className="text-gray-600">
              {weekDates.length > 0 ? `${format(weekDates[0], 'MMM d')} - ${format(weekDates[weekDates.length - 1], 'MMM d, yyyy')}` : ''}
            </span>
            <button 
              onClick={goToNextWeek} 
              className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center hover:bg-gray-100"
            >
              Next Week <FaChevronRight className="ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Scheduler grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Time
              </th>
              {weekDates.map((date, index) => (
                <th 
                  key={index} 
                  className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${isToday(date) ? 'bg-blue-50' : ''}`}
                >
                  <div className="text-sm">
                    {format(date, 'EEEE')}
                  </div>
                  <div className={`text-sm mt-1 ${isToday(date) ? 'text-blue-600 font-semibold' : ''}`}>
                    {format(date, 'MMM d')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeSlots.map((timeSlot, timeIndex) => (
              <tr key={timeIndex} className={timeIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {timeSlot}
                </td>
                {weekDates.map((date, dateIndex) => {
                  const procedures = getProceduresForSlot(date, timeSlot);
                  return (
                    <td 
                      key={dateIndex} 
                      className={`px-2 py-2 text-sm border border-gray-100 ${isToday(date) ? 'bg-blue-50' : ''}`}
                      onClick={() => handleOpenScheduleModal(date, timeSlot)}
                      style={{ height: '80px', minWidth: '150px', cursor: 'pointer' }}
                    >
                      {procedures.length > 0 ? (
                        <div className="space-y-2">
                          {procedures.map((procedure, procIndex) => (
                            <div 
                              key={procIndex} 
                              className="p-2 rounded-md text-xs bg-indigo-100 border-l-4 border-indigo-500"
                            >
                              <div className="font-medium">{procedure.name}</div>
                              <div className="flex items-center text-gray-600 mt-1">
                                <FaUser className="mr-1" size={10} />
                                <span>{getPatientName(procedure.patient)}</span>
                              </div>
                              <div className="flex items-center text-gray-600 mt-1">
                                <FaTooth className="mr-1" size={10} />
                                <span>{procedure.category}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 hover:text-gray-600">
                          <FaPlus size={12} className="mr-1" />
                          <span className="text-xs">Schedule</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsScheduleModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Schedule Dental Procedure</h3>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setIsScheduleModalOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="mb-4 bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-indigo-600 mr-2" />
                      <span className="font-medium">
                        {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
                      </span>
                    </div>
                    <div className="flex items-center mt-2">
                      <FaClock className="text-indigo-600 mr-2" />
                      <span className="font-medium">{selectedTimeSlot}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                        Patient
                      </label>
                      <select
                        id="patientId"
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select Patient</option>
                        {Array.isArray(patients) ? (
                          patients.map(patient => (
                            <option key={patient._id} value={patient._id}>
                              {patient.firstName} {patient.lastName}
                            </option>
                          ))
                        ) : (
                          <option value="">Loading patients...</option>
                        )}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="dentistId" className="block text-sm font-medium text-gray-700 mb-1">
                        Dentist
                      </label>
                      <select
                        id="dentistId"
                        name="dentistId"
                        value={formData.dentistId}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select Dentist</option>
                        {dentists.map(dentist => (
                          <option key={dentist._id} value={dentist._id}>
                            Dr. {dentist.firstName} {dentist.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Procedure Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select Category</option>
                        {procedureCategories.map((category, index) => (
                          <option key={index} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Procedure Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        min={15}
                        step={15}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={checkInventoryAvailability}
                  disabled={isLoading || !formData.patientId || !formData.dentistId || !formData.category || !formData.name}
                >
                  {isLoading ? 'Scheduling...' : 'Schedule Procedure'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsScheduleModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Inventory Check Modal */}
      {isInventoryCheckModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsInventoryCheckModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Inventory Check</h3>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => setIsInventoryCheckModalOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-4">
                  {inventoryCheck && (
                    <div>
                      <div className={`p-3 rounded-md mb-4 ${inventoryCheck.hasLowStock ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                        <div className="font-medium">
                          {inventoryCheck.hasLowStock 
                            ? 'Warning: Some inventory items have low stock' 
                            : 'All inventory items are available'}
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Item
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Required
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                In Stock
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {inventoryCheck.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.estimatedQuantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {item.currentStock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {item.currentStock >= item.estimatedQuantity ? (
                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                      Available
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                      Low Stock
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-6 flex justify-end space-x-3">
                        <button 
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsInventoryCheckModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          type="button"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                          onClick={handleScheduleProcedure}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Scheduling...' : 'Proceed with Scheduling'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DentalProcedureScheduler;
