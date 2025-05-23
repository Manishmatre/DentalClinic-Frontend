import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import appointmentService from '../../api/appointments/appointmentService';
import clinicService from '../../api/clinic/clinicService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';
import TextField from '../../components/ui/TextField';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import Checkbox from '../../components/ui/Checkbox';
import FileUpload from '../../components/ui/FileUpload';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { user, clinic } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [notes, setNotes] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  const services = [
    'Check-up',
    'Cleaning',
    'Filling',
    'Root Canal',
    'Extraction',
    'Whitening',
    'Braces Consultation'
  ];

  // Fetch doctors from the clinic
  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await clinicService.getDoctors(clinic?._id);
      setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.response?.data?.message || 'Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  }, [clinic?._id]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Fetch available slots when doctor and date are selected
  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;

    try {
      setIsLoading(true);
      const slots = await appointmentService.getAvailableSlots(selectedDoctor, selectedDate);
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setError(err.response?.data?.message || 'Failed to load available time slots');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot || !selectedService || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Calculate end time (assuming 30 min appointments)
      const startDateTime = new Date(selectedDate + 'T' + selectedSlot);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // Add 30 minutes

      const appointmentData = {
        doctorId: selectedDoctor,
        patientId: user._id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        serviceType: selectedService,
        reason: reason,
        priority: priority,
        notes: notes,
        medicalHistory: medicalHistory,
        symptoms: symptoms,
        attachments: attachments,
        isFollowUp: isFollowUp,
        status: 'Scheduled'
      };

      await appointmentService.createAppointment(appointmentData);
      navigate('/patient/appointments');
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle adding symptoms
  const handleAddSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };
  
  // Handle removing symptoms
  const handleRemoveSymptom = (symptomToRemove) => {
    setSymptoms(symptoms.filter(symptom => symptom !== symptomToRemove));
  };
  
  // Handle file uploads
  const handleFileUpload = (files) => {
    // In a real application, you would upload these files to your server/cloud storage
    // and then store the URLs. For this example, we'll just store the file objects.
    const newAttachments = Array.from(files).map(file => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file) // This is temporary and will be lost on page refresh
    }));
    
    setAttachments([...attachments, ...newAttachments]);
  };
  
  // Handle removing attachments
  const handleRemoveAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };
  
  // Move to next step
  const nextStep = () => {
    setStep(step + 1);
  };
  
  // Move to previous step
  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Book an Appointment</h1>
      </div>

      {error && (
        <Alert 
          variant="error" 
          title="Error" 
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <Card>
        <div className="p-6">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${step >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  1
                </div>
                <span>Doctor & Time</span>
              </div>
              <div className="flex-1 h-1 mx-4 bg-gray-200">
                <div className={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }}></div>
              </div>
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${step >= 2 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  2
                </div>
                <span>Reason & Details</span>
              </div>
              <div className="flex-1 h-1 mx-4 bg-gray-200">
                <div className={`h-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: step >= 3 ? '100%' : '0%' }}></div>
              </div>
              <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-2 ${step >= 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  3
                </div>
                <span>Medical Info</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Doctor and Time Selection */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Service Selection */}
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700">
                    Service Type *
                  </label>
                  <select
                    id="service"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                {/* Doctor Selection */}
                <div>
                  <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">
                    Doctor *
                  </label>
                  <select
                    id="doctor"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>Dr. {doctor.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  />
                </div>

                {/* Time Slot Selection */}
                {availableSlots.length > 0 && (
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                      Available Time Slots *
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-3">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          variant={selectedSlot === slot ? 'primary' : 'secondary'}
                          onClick={() => setSelectedSlot(slot)}
                          className="w-full"
                        >
                          {new Date('1970-01-01T' + slot).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/patient/appointments')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={!selectedDoctor || !selectedDate || !selectedSlot || !selectedService}
                    onClick={nextStep}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Reason and Details */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                    Reason for Visit *
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows="3"
                    required
                    placeholder="Please describe the reason for your appointment"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows="3"
                    placeholder="Any additional information for the doctor or staff"
                  />
                </div>

                {/* Follow-up Checkbox */}
                <div className="flex items-center">
                  <input
                    id="isFollowUp"
                    type="checkbox"
                    checked={isFollowUp}
                    onChange={(e) => setIsFollowUp(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFollowUp" className="ml-2 block text-sm text-gray-700">
                    This is a follow-up appointment
                  </label>
                </div>

                <div className="flex justify-between space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={prevStep}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    disabled={!reason}
                    onClick={nextStep}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Medical Information */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Medical History */}
                <div>
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
                    Relevant Medical History
                  </label>
                  <textarea
                    id="medicalHistory"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows="3"
                    placeholder="Any relevant medical history the doctor should know about"
                  />
                </div>

                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptoms
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter a symptom"
                    />
                    <Button
                      type="button"
                      onClick={handleAddSymptom}
                      disabled={!symptomInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {symptoms.map((symptom, index) => (
                        <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {symptom}
                          <button
                            type="button"
                            onClick={() => handleRemoveSymptom(symptom)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments (Medical Records, Test Results, etc.)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <div className="flex items-center">
                            <span className="text-sm font-medium">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={prevStep}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !reason}
                  >
                    {isLoading ? <LoadingSpinner /> : 'Book Appointment'}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </Card>
    </div>
  );
};

export default BookAppointment;