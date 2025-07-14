import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  SimpleGrid,
  Heading,
  Divider,
  useToast,
  Select,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Badge,
  IconButton,
  Text,
  FormErrorMessage,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaUpload, FaSave, FaArrowLeft } from 'react-icons/fa';
import ehrService from '../../api/ehr/ehrService';
import patientService from '../../api/patients/patientService';
import staffService from '../../api/staff/staffService';
import appointmentService from '../../api/appointments/appointmentService';
import { useAuth } from '../../context/AuthContext';

const MedicalRecordForm = () => {
  const { id: recordId, patientId: urlPatientId, appointmentId: urlAppointmentId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State for form data
  const [formData, setFormData] = useState({
    patientId: urlPatientId || '',
    doctorId: user?.role === 'Doctor' ? user._id : '',
    appointmentId: urlAppointmentId || '',
    visitType: 'routine',
    visitDate: new Date().toISOString().split('T')[0],
    
    // Vitals
    vitals: {
      height: '',
      weight: '',
      temperature: '',
      bloodPressure: {
        systolic: '',
        diastolic: ''
      },
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      bloodGlucose: ''
    },
    
    // Chief complaint and history
    chiefComplaint: '',
    presentIllnessHistory: '',
    symptoms: [],
    symptomsNotes: '',
    
    // Examination and assessment
    physicalExamination: '',
    diagnoses: [{
      code: '',
      description: '',
      type: 'primary',
      notes: ''
    }],
    
    // Treatment plan
    treatmentPlan: '',
    medications: [{
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      prescribed: false
    }],
    procedures: [],
    labTests: [],
    
    // Follow-up and instructions
    followUpInstructions: '',
    followUpDate: '',
    patientEducation: '',
    dietaryRecommendations: '',
    activityRestrictions: '',
    
    // Consent
    consentGiven: false,
    consentNotes: ''
  });
  
  // Other state
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadDescription, setUploadDescription] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch patients
        const patientsData = await patientService.getPatients();
        setPatients(patientsData);
        
        // Fetch doctors
        const doctorsData = (await staffService.getStaff({ role: 'Doctor', status: 'Active' })).data || [];
        setDoctors(doctorsData);
        
        // If editing an existing record, fetch it
        if (recordId) {
          const record = await ehrService.getRecord(recordId);
          setFormData(record);
          setIsEditing(true);
        }
        
        // If patient ID is provided, fetch their appointments
        if (urlPatientId) {
          const appointmentsData = await appointmentService.getAppointmentsByPatient(urlPatientId);
          setAppointments(appointmentsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load required data',
          status: 'error',
          duration: 3000,
          isClosable: true
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [recordId, urlPatientId, toast]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle blood pressure changes (special case for nested object)
  const handleBPChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        bloodPressure: {
          ...prev.vitals.bloodPressure,
          [field]: value
        }
      }
    }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle array field additions (symptoms, diagnoses, medications, etc.)
  const handleArrayAdd = (fieldName, newItem) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], newItem]
    }));
  };
  
  // Handle array field removals
  const handleArrayRemove = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };
  
  // Handle array field updates
  const handleArrayItemChange = (fieldName, index, key, value) => {
    setFormData(prev => {
      const newArray = [...prev[fieldName]];
      newArray[index] = {
        ...newArray[index],
        [key]: value
      };
      return {
        ...prev,
        [fieldName]: newArray
      };
    });
  };
  
  // Add a new symptom
  const handleAddSymptom = () => {
    if (newSymptom.trim()) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, newSymptom.trim()]
      }));
      setNewSymptom('');
    }
  };
  
  // Remove a symptom
  const handleRemoveSymptom = (index) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };
  
  // Handle file selection for attachments
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };
  
  // Upload attachment
  const handleUploadAttachment = async () => {
    if (!fileToUpload) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (recordId) {
        // If we have a record ID, upload directly to that record
        await ehrService.uploadAttachment(recordId, fileToUpload, uploadDescription);
        
        // Refresh the record data
        const updatedRecord = await ehrService.getRecord(recordId);
        setFormData(updatedRecord);
        
        // Reset file upload state
        setFileToUpload(null);
        setUploadDescription('');
        onClose();
        
        toast({
          title: 'Success',
          description: 'File uploaded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        // If no record ID yet, store the file to be uploaded after record creation
        // This would be handled in the form submission
        toast({
          title: 'Info',
          description: 'File will be uploaded when the record is saved',
          status: 'info',
          duration: 3000,
          isClosable: true
        });
        onClose();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Validate the form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.patientId) newErrors.patientId = 'Patient is required';
    if (!formData.doctorId) newErrors.doctorId = 'Doctor is required';
    if (!formData.chiefComplaint) newErrors.chiefComplaint = 'Chief complaint is required';
    if (!formData.visitType) newErrors.visitType = 'Visit type is required';
    
    // At least one diagnosis is required and must have a description
    if (!formData.diagnoses.length || !formData.diagnoses[0].description) {
      newErrors.diagnoses = 'At least one diagnosis is required';
    }
    
    // Treatment plan is required
    if (!formData.treatmentPlan) newErrors.treatmentPlan = 'Treatment plan is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      let response;
      if (isEditing) {
        // Update existing record
        response = await ehrService.updateRecord(recordId, formData);
        toast({
          title: 'Success',
          description: 'Medical record updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      } else {
        // Create new record
        response = await ehrService.createRecord(formData);
        toast({
          title: 'Success',
          description: 'Medical record created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
        
        // If we have a file to upload, do it now that we have a record ID
        if (fileToUpload) {
          await ehrService.uploadAttachment(response._id, fileToUpload, uploadDescription);
        }
      }
      
      // Navigate back to the patient's records or the doctor dashboard
      if (formData.patientId) {
        navigate(`/doctor/patients/${formData.patientId}/records`);
      } else {
        navigate('/doctor/medical-records');
      }
    } catch (error) {
      console.error('Error saving medical record:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save medical record',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Upload attachment modal
  const renderUploadModal = () => (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload Attachment</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Select File</FormLabel>
              <Input type="file" onChange={handleFileChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input 
                value={uploadDescription} 
                onChange={(e) => setUploadDescription(e.target.value)} 
                placeholder="Enter file description"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleUploadAttachment} isLoading={isLoading}>
            Upload
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return (
    <Box p={5} maxWidth="1200px" mx="auto">
      {renderUploadModal()}
      
      <HStack mb={6} justifyContent="space-between">
        <Button leftIcon={<FaArrowLeft />} onClick={() => navigate(-1)} variant="outline">
          Back
        </Button>
        <Heading size="lg">
          {isEditing ? 'Edit Medical Record' : 'New Medical Record'}
        </Heading>
        <Button
          colorScheme="blue"
          leftIcon={<FaSave />}
          onClick={handleSubmit}
          isLoading={isLoading}
          loadingText={isEditing ? 'Updating...' : 'Creating...'}
        >
          {isEditing ? 'Update Record' : 'Save Record'}
        </Button>
      </HStack>
      
      <form onSubmit={handleSubmit}>
        <Tabs isFitted variant="enclosed" colorScheme="blue">
          <TabList mb="1em">
            <Tab>Patient & Visit</Tab>
            <Tab>Vitals</Tab>
            <Tab>Examination</Tab>
            <Tab>Diagnosis & Treatment</Tab>
            <Tab>Follow-up</Tab>
            <Tab>Attachments</Tab>
          </TabList>
          
          <TabPanels>
            {/* Tab 1: Patient & Visit Information */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired isInvalid={errors.patientId}>
                    <FormLabel>Patient</FormLabel>
                    <Select
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleChange}
                      placeholder="Select patient"
                      isDisabled={isEditing || urlPatientId}
                    >
                      {patients.map(patient => (
                        <option key={patient._id} value={patient._id}>
                          {patient.name} ({patient.patientId || 'No ID'})
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.patientId}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={errors.doctorId}>
                    <FormLabel>Doctor</FormLabel>
                    <Select
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleChange}
                      placeholder="Select doctor"
                      isDisabled={user?.role === 'Doctor'}
                    >
                      {doctors.map(doctor => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.name} ({doctor.specialization || 'General'})
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.doctorId}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Appointment</FormLabel>
                    <Select
                      name="appointmentId"
                      value={formData.appointmentId}
                      onChange={handleChange}
                      placeholder="Select appointment (optional)"
                      isDisabled={isEditing || urlAppointmentId}
                    >
                      {appointments.map(apt => {
                        const date = new Date(apt.startTime);
                        return (
                          <option key={apt._id} value={apt._id}>
                            {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </option>
                        );
                      })}
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={errors.visitType}>
                    <FormLabel>Visit Type</FormLabel>
                    <Select
                      name="visitType"
                      value={formData.visitType}
                      onChange={handleChange}
                    >
                      <option value="routine">Routine</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="emergency">Emergency</option>
                      <option value="specialist">Specialist</option>
                      <option value="procedure">Procedure</option>
                      <option value="lab-work">Lab Work</option>
                    </Select>
                    <FormErrorMessage>{errors.visitType}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Visit Date</FormLabel>
                    <Input
                      type="date"
                      name="visitDate"
                      value={formData.visitDate}
                      onChange={handleChange}
                    />
                  </FormControl>
                  
                  <FormControl isRequired isInvalid={errors.chiefComplaint}>
                    <FormLabel>Chief Complaint</FormLabel>
                    <Textarea
                      name="chiefComplaint"
                      value={formData.chiefComplaint}
                      onChange={handleChange}
                      placeholder="Primary reason for visit"
                    />
                    <FormErrorMessage>{errors.chiefComplaint}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Present Illness History</FormLabel>
                  <Textarea
                    name="presentIllnessHistory"
                    value={formData.presentIllnessHistory}
                    onChange={handleChange}
                    placeholder="History of present illness"
                    rows={4}
                  />
                </FormControl>
                
                <Box>
                  <FormLabel>Symptoms</FormLabel>
                  <HStack mb={2}>
                    <Input
                      value={newSymptom}
                      onChange={(e) => setNewSymptom(e.target.value)}
                      placeholder="Enter symptom"
                    />
                    <IconButton
                      icon={<FaPlus />}
                      onClick={handleAddSymptom}
                      aria-label="Add symptom"
                      colorScheme="blue"
                    />
                  </HStack>
                  
                  <Box mt={2}>
                    {formData.symptoms.map((symptom, index) => (
                      <Badge
                        key={index}
                        m={1}
                        p={2}
                        borderRadius="full"
                        variant="solid"
                        colorScheme="blue"
                      >
                        {symptom}
                        <IconButton
                          icon={<FaTrash />}
                          onClick={() => handleRemoveSymptom(index)}
                          aria-label="Remove symptom"
                          size="xs"
                          ml={2}
                          variant="ghost"
                          colorScheme="red"
                        />
                      </Badge>
                    ))}
                  </Box>
                </Box>
                
                <FormControl>
                  <FormLabel>Symptoms Notes</FormLabel>
                  <Textarea
                    name="symptomsNotes"
                    value={formData.symptomsNotes}
                    onChange={handleChange}
                    placeholder="Additional notes about symptoms"
                  />
                </FormControl>
              </VStack>
            </TabPanel>
            
            {/* Tab 2: Vitals */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Height (cm)</FormLabel>
                    <NumberInput min={0} max={300}>
                      <NumberInputField
                        name="vitals.height"
                        value={formData.vitals.height}
                        onChange={handleChange}
                        placeholder="Height in cm"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Weight (kg)</FormLabel>
                    <NumberInput min={0} max={500} precision={1}>
                      <NumberInputField
                        name="vitals.weight"
                        value={formData.vitals.weight}
                        onChange={handleChange}
                        placeholder="Weight in kg"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>BMI</FormLabel>
                    <NumberInput min={0} max={100} precision={1} isReadOnly>
                      <NumberInputField
                        name="vitals.bmi"
                        value={
                          formData.vitals.height && formData.vitals.weight
                            ? (formData.vitals.weight / Math.pow(formData.vitals.height / 100, 2)).toFixed(1)
                            : ''
                        }
                        placeholder="BMI (calculated)"
                      />
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Temperature (°C)</FormLabel>
                    <NumberInput min={30} max={45} precision={1} step={0.1}>
                      <NumberInputField
                        name="vitals.temperature"
                        value={formData.vitals.temperature}
                        onChange={handleChange}
                        placeholder="Temperature in °C"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Heart Rate (bpm)</FormLabel>
                    <NumberInput min={0} max={300}>
                      <NumberInputField
                        name="vitals.heartRate"
                        value={formData.vitals.heartRate}
                        onChange={handleChange}
                        placeholder="Heart rate in bpm"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Respiratory Rate</FormLabel>
                    <NumberInput min={0} max={100}>
                      <NumberInputField
                        name="vitals.respiratoryRate"
                        value={formData.vitals.respiratoryRate}
                        onChange={handleChange}
                        placeholder="Breaths per minute"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Blood Pressure</FormLabel>
                    <HStack>
                      <NumberInput min={0} max={300}>
                        <NumberInputField
                          value={formData.vitals.bloodPressure.systolic}
                          onChange={(e) => handleBPChange('systolic', e.target.value)}
                          placeholder="Systolic"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text>/</Text>
                      <NumberInput min={0} max={200}>
                        <NumberInputField
                          value={formData.vitals.bloodPressure.diastolic}
                          onChange={(e) => handleBPChange('diastolic', e.target.value)}
                          placeholder="Diastolic"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Oxygen Saturation (%)</FormLabel>
                    <NumberInput min={0} max={100}>
                      <NumberInputField
                        name="vitals.oxygenSaturation"
                        value={formData.vitals.oxygenSaturation}
                        onChange={handleChange}
                        placeholder="SpO2 percentage"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Blood Glucose (mg/dL)</FormLabel>
                    <NumberInput min={0} max={1000}>
                      <NumberInputField
                        name="vitals.bloodGlucose"
                        value={formData.vitals.bloodGlucose}
                        onChange={handleChange}
                        placeholder="Blood glucose level"
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </TabPanel>
            
            {/* Tab 3: Examination */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel>Physical Examination</FormLabel>
                  <Textarea
                    name="physicalExamination"
                    value={formData.physicalExamination}
                    onChange={handleChange}
                    placeholder="Enter physical examination findings"
                    rows={6}
                  />
                </FormControl>
                
                <Box>
                  <Heading size="md" mb={4}>Diagnoses</Heading>
                  {formData.diagnoses.map((diagnosis, index) => (
                    <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={4}>
                      <HStack justifyContent="space-between" mb={2}>
                        <Heading size="sm">Diagnosis {index + 1}</Heading>
                        {index > 0 && (
                          <IconButton
                            icon={<FaTrash />}
                            onClick={() => handleArrayRemove('diagnoses', index)}
                            aria-label="Remove diagnosis"
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                          />
                        )}
                      </HStack>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isInvalid={index === 0 && errors.diagnoses}>
                          <FormLabel>Description</FormLabel>
                          <Textarea
                            value={diagnosis.description}
                            onChange={(e) => handleArrayItemChange('diagnoses', index, 'description', e.target.value)}
                            placeholder="Diagnosis description"
                          />
                          {index === 0 && errors.diagnoses && (
                            <FormErrorMessage>{errors.diagnoses}</FormErrorMessage>
                          )}
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>ICD-10 Code</FormLabel>
                          <Input
                            value={diagnosis.code}
                            onChange={(e) => handleArrayItemChange('diagnoses', index, 'code', e.target.value)}
                            placeholder="ICD-10 or other code (optional)"
                          />
                        </FormControl>
                      </SimpleGrid>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                        <FormControl>
                          <FormLabel>Type</FormLabel>
                          <Select
                            value={diagnosis.type}
                            onChange={(e) => handleArrayItemChange('diagnoses', index, 'type', e.target.value)}
                          >
                            <option value="primary">Primary</option>
                            <option value="secondary">Secondary</option>
                            <option value="differential">Differential</option>
                          </Select>
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Notes</FormLabel>
                          <Textarea
                            value={diagnosis.notes}
                            onChange={(e) => handleArrayItemChange('diagnoses', index, 'notes', e.target.value)}
                            placeholder="Additional notes about this diagnosis"
                          />
                        </FormControl>
                      </SimpleGrid>
                    </Box>
                  ))}
                  
                  <Button
                    leftIcon={<FaPlus />}
                    onClick={() => handleArrayAdd('diagnoses', {
                      code: '',
                      description: '',
                      type: 'secondary',
                      notes: ''
                    })}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    mt={2}
                  >
                    Add Another Diagnosis
                  </Button>
                </Box>
              </VStack>
            </TabPanel>
            
            {/* Tab 4: Diagnosis & Treatment */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired isInvalid={errors.treatmentPlan}>
                  <FormLabel>Treatment Plan</FormLabel>
                  <Textarea
                    name="treatmentPlan"
                    value={formData.treatmentPlan}
                    onChange={handleChange}
                    placeholder="Enter treatment plan"
                    rows={4}
                  />
                  <FormErrorMessage>{errors.treatmentPlan}</FormErrorMessage>
                </FormControl>
                
                {/* Medications */}
                <Box>
                  <Heading size="md" mb={4}>Medications</Heading>
                  {formData.medications.map((medication, index) => (
                    <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={4}>
                      <HStack justifyContent="space-between" mb={2}>
                        <Heading size="sm">Medication {index + 1}</Heading>
                        <IconButton
                          icon={<FaTrash />}
                          onClick={() => handleArrayRemove('medications', index)}
                          aria-label="Remove medication"
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                        />
                      </HStack>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Name</FormLabel>
                          <Input
                            value={medication.name}
                            onChange={(e) => handleArrayItemChange('medications', index, 'name', e.target.value)}
                            placeholder="Medication name"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Dosage</FormLabel>
                          <Input
                            value={medication.dosage}
                            onChange={(e) => handleArrayItemChange('medications', index, 'dosage', e.target.value)}
                            placeholder="Dosage (e.g., 500mg)"
                          />
                        </FormControl>
                      </SimpleGrid>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                        <FormControl>
                          <FormLabel>Frequency</FormLabel>
                          <Input
                            value={medication.frequency}
                            onChange={(e) => handleArrayItemChange('medications', index, 'frequency', e.target.value)}
                            placeholder="Frequency (e.g., twice daily)"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Duration</FormLabel>
                          <Input
                            value={medication.duration}
                            onChange={(e) => handleArrayItemChange('medications', index, 'duration', e.target.value)}
                            placeholder="Duration (e.g., 7 days)"
                          />
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl mt={4}>
                        <FormLabel>Instructions</FormLabel>
                        <Textarea
                          value={medication.instructions}
                          onChange={(e) => handleArrayItemChange('medications', index, 'instructions', e.target.value)}
                          placeholder="Special instructions"
                        />
                      </FormControl>
                      
                      <Checkbox 
                        mt={4}
                        isChecked={medication.prescribed}
                        onChange={(e) => handleArrayItemChange('medications', index, 'prescribed', e.target.checked)}
                      >
                        Prescribed
                      </Checkbox>
                    </Box>
                  ))}
                  
                  <Button
                    leftIcon={<FaPlus />}
                    onClick={() => handleArrayAdd('medications', {
                      name: '',
                      dosage: '',
                      frequency: '',
                      duration: '',
                      instructions: '',
                      prescribed: false
                    })}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    mt={2}
                  >
                    Add Medication
                  </Button>
                </Box>
                
                {/* Procedures */}
                <Box>
                  <Heading size="md" mb={4}>Procedures</Heading>
                  {formData.procedures.map((procedure, index) => (
                    <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={4}>
                      <HStack justifyContent="space-between" mb={2}>
                        <Heading size="sm">Procedure {index + 1}</Heading>
                        <IconButton
                          icon={<FaTrash />}
                          onClick={() => handleArrayRemove('procedures', index)}
                          aria-label="Remove procedure"
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                        />
                      </HStack>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Name</FormLabel>
                          <Input
                            value={procedure.name}
                            onChange={(e) => handleArrayItemChange('procedures', index, 'name', e.target.value)}
                            placeholder="Procedure name"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Scheduled Date</FormLabel>
                          <Input
                            type="date"
                            value={procedure.scheduledDate ? new Date(procedure.scheduledDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleArrayItemChange('procedures', index, 'scheduledDate', e.target.value)}
                          />
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl mt={4}>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          value={procedure.description}
                          onChange={(e) => handleArrayItemChange('procedures', index, 'description', e.target.value)}
                          placeholder="Procedure description"
                        />
                      </FormControl>
                      
                      <FormControl mt={4}>
                        <FormLabel>Notes</FormLabel>
                        <Textarea
                          value={procedure.notes}
                          onChange={(e) => handleArrayItemChange('procedures', index, 'notes', e.target.value)}
                          placeholder="Additional notes"
                        />
                      </FormControl>
                    </Box>
                  ))}
                  
                  <Button
                    leftIcon={<FaPlus />}
                    onClick={() => handleArrayAdd('procedures', {
                      name: '',
                      description: '',
                      notes: '',
                      scheduledDate: ''
                    })}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    mt={2}
                  >
                    Add Procedure
                  </Button>
                </Box>
                
                {/* Lab Tests */}
                <Box>
                  <Heading size="md" mb={4}>Lab Tests</Heading>
                  {formData.labTests.map((test, index) => (
                    <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={4}>
                      <HStack justifyContent="space-between" mb={2}>
                        <Heading size="sm">Lab Test {index + 1}</Heading>
                        <IconButton
                          icon={<FaTrash />}
                          onClick={() => handleArrayRemove('labTests', index)}
                          aria-label="Remove lab test"
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                        />
                      </HStack>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl>
                          <FormLabel>Name</FormLabel>
                          <Input
                            value={test.name}
                            onChange={(e) => handleArrayItemChange('labTests', index, 'name', e.target.value)}
                            placeholder="Test name"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Status</FormLabel>
                          <Select
                            value={test.status}
                            onChange={(e) => handleArrayItemChange('labTests', index, 'status', e.target.value)}
                          >
                            <option value="ordered">Ordered</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </Select>
                        </FormControl>
                      </SimpleGrid>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
                        <FormControl>
                          <FormLabel>Ordered Date</FormLabel>
                          <Input
                            type="date"
                            value={test.orderedDate ? new Date(test.orderedDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleArrayItemChange('labTests', index, 'orderedDate', e.target.value)}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Completed Date</FormLabel>
                          <Input
                            type="date"
                            value={test.completedDate ? new Date(test.completedDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleArrayItemChange('labTests', index, 'completedDate', e.target.value)}
                            isDisabled={test.status !== 'completed'}
                          />
                        </FormControl>
                      </SimpleGrid>
                      
                      <FormControl mt={4}>
                        <FormLabel>Results</FormLabel>
                        <Textarea
                          value={test.results}
                          onChange={(e) => handleArrayItemChange('labTests', index, 'results', e.target.value)}
                          placeholder="Test results"
                          isDisabled={test.status !== 'completed'}
                        />
                      </FormControl>
                    </Box>
                  ))}
                  
                  <Button
                    leftIcon={<FaPlus />}
                    onClick={() => handleArrayAdd('labTests', {
                      name: '',
                      status: 'ordered',
                      results: '',
                      orderedDate: new Date().toISOString().split('T')[0],
                      completedDate: ''
                    })}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    mt={2}
                  >
                    Add Lab Test
                  </Button>
                </Box>
              </VStack>
            </TabPanel>
            
            {/* Tab 5: Follow-up */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Follow-up Date</FormLabel>
                    <Input
                      type="date"
                      name="followUpDate"
                      value={formData.followUpDate ? new Date(formData.followUpDate).toISOString().split('T')[0] : ''}
                      onChange={handleChange}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Follow-up Instructions</FormLabel>
                    <Textarea
                      name="followUpInstructions"
                      value={formData.followUpInstructions}
                      onChange={handleChange}
                      placeholder="Instructions for follow-up visit"
                    />
                  </FormControl>
                </SimpleGrid>
                
                <FormControl>
                  <FormLabel>Patient Education</FormLabel>
                  <Textarea
                    name="patientEducation"
                    value={formData.patientEducation}
                    onChange={handleChange}
                    placeholder="Educational materials or information provided to patient"
                    rows={4}
                  />
                </FormControl>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Dietary Recommendations</FormLabel>
                    <Textarea
                      name="dietaryRecommendations"
                      value={formData.dietaryRecommendations}
                      onChange={handleChange}
                      placeholder="Dietary advice or restrictions"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Activity Restrictions</FormLabel>
                    <Textarea
                      name="activityRestrictions"
                      value={formData.activityRestrictions}
                      onChange={handleChange}
                      placeholder="Activity limitations or recommendations"
                    />
                  </FormControl>
                </SimpleGrid>
                
                <Box p={4} borderWidth="1px" borderRadius="md">
                  <FormControl>
                    <Checkbox
                      name="consentGiven"
                      isChecked={formData.consentGiven}
                      onChange={handleCheckboxChange}
                    >
                      Patient has given consent for treatment plan
                    </Checkbox>
                  </FormControl>
                  
                  <FormControl mt={4}>
                    <FormLabel>Consent Notes</FormLabel>
                    <Textarea
                      name="consentNotes"
                      value={formData.consentNotes}
                      onChange={handleChange}
                      placeholder="Additional notes regarding patient consent"
                    />
                  </FormControl>
                </Box>
              </VStack>
            </TabPanel>
            
            {/* Tab 6: Attachments */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justifyContent="space-between">
                  <Heading size="md">Attachments</Heading>
                  <Button
                    leftIcon={<FaUpload />}
                    colorScheme="blue"
                    onClick={onOpen}
                  >
                    Upload New Attachment
                  </Button>
                </HStack>
                
                {formData.attachments && formData.attachments.length > 0 ? (
                  <Box>
                    {formData.attachments.map((attachment, index) => (
                      <Box 
                        key={index} 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md" 
                        mb={2}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Text fontWeight="bold">{attachment.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {attachment.description || 'No description'}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Uploaded: {new Date(attachment.uploadedAt).toLocaleString()}
                          </Text>
                        </Box>
                        <HStack>
                          <Button 
                            as="a" 
                            href={attachment.url} 
                            target="_blank" 
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                          >
                            View
                          </Button>
                          <IconButton
                            icon={<FaTrash />}
                            onClick={() => {
                              if (recordId) {
                                // If we have a record ID, we can remove the attachment
                                ehrService.removeAttachment(recordId, attachment._id)
                                  .then(() => {
                                    // Update the form data to reflect the removal
                                    setFormData(prev => ({
                                      ...prev,
                                      attachments: prev.attachments.filter((_, i) => i !== index)
                                    }));
                                    toast({
                                      title: 'Success',
                                      description: 'Attachment removed successfully',
                                      status: 'success',
                                      duration: 3000,
                                      isClosable: true
                                    });
                                  })
                                  .catch(error => {
                                    console.error('Error removing attachment:', error);
                                    toast({
                                      title: 'Error',
                                      description: 'Failed to remove attachment',
                                      status: 'error',
                                      duration: 3000,
                                      isClosable: true
                                    });
                                  });
                              } else {
                                // If no record ID yet, just remove from local state
                                setFormData(prev => ({
                                  ...prev,
                                  attachments: prev.attachments.filter((_, i) => i !== index)
                                }));
                              }
                            }}
                            aria-label="Remove attachment"
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                          />
                        </HStack>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box 
                    p={8} 
                    textAlign="center" 
                    borderWidth="1px" 
                    borderRadius="md" 
                    borderStyle="dashed"
                  >
                    <Text color="gray.500">No attachments yet. Click the button above to upload files.</Text>
                  </Box>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </form>
    </Box>
  );
};

export default MedicalRecordForm;