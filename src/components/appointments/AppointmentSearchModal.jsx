import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  VStack,
  HStack,
  Flex,
  useToast,
  Badge,
  Spinner,
  Select,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { FaSearch, FaCalendarAlt, FaInfoCircle, FaFilter } from 'react-icons/fa';
import appointmentService from '../../api/appointments/appointmentService';

/**
 * Modal component for searching and selecting appointments
 */
const AppointmentSearchModal = ({ isOpen, onClose, onSelect, patientId = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const toast = useToast();

  // Load appointments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAppointments();
    }
  }, [isOpen, patientId]);

  // Fetch appointments from API
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let response;
      
      // If patient ID is provided, only fetch appointments for that patient
      if (patientId) {
        response = await appointmentService.getAppointmentsByPatient(patientId);
      } else {
        response = await appointmentService.getAppointments();
      }
      
      if (response) {
        // The response structure might vary, handle both array and object with appointments property
        const appointmentData = Array.isArray(response) ? response : response.appointments || [];
        setAppointments(appointmentData);
        setFilteredAppointments(appointmentData);
      }
    } catch (error) {
      toast({
        title: 'Error fetching appointments',
        description: error.message || 'Could not load appointments',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter appointments based on search term and status
  useEffect(() => {
    let filtered = [...appointments];
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(appointment => 
        appointment.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === filterStatus);
    }
    
    setFilteredAppointments(filtered);
  }, [searchTerm, filterStatus, appointments]);

  // Handle appointment selection
  const handleAppointmentSelect = (appointment) => {
    setSelectedAppointment(appointment);
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedAppointment) {
      onSelect(selectedAppointment);
      onClose();
    } else {
      toast({
        title: 'No appointment selected',
        description: 'Please select an appointment first',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxW="900px">
        <ModalHeader>
          <Flex align="center">
            <FaCalendarAlt mr={2} />
            <Text>Select Appointment</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Search and filter */}
            <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
              <InputGroup flex="1">
                <InputLeftElement pointerEvents="none">
                  <FaSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search by patient, doctor, or service"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              <FormControl width={{ base: '100%', md: '200px' }}>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  icon={<FaFilter />}
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </Select>
              </FormControl>
            </Flex>
            
            {/* Appointments table */}
            {loading ? (
              <Flex justify="center" py={8}>
                <Spinner size="lg" />
              </Flex>
            ) : filteredAppointments.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Date & Time</Th>
                      <Th>Patient</Th>
                      <Th>Doctor</Th>
                      <Th>Service</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAppointments.map((appointment) => (
                      <Tr 
                        key={appointment._id}
                        bg={selectedAppointment?._id === appointment._id ? 'blue.50' : 'transparent'}
                        onClick={() => handleAppointmentSelect(appointment)}
                        cursor="pointer"
                        _hover={{ bg: 'gray.50' }}
                      >
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{formatDate(appointment.startTime)}</Text>
                            <Text fontSize="sm" color="gray.600">{formatTime(appointment.startTime)}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text>{appointment.patientId?.name || 'Unknown'}</Text>
                        </Td>
                        <Td>
                          <Text>{appointment.doctorId?.name || 'Unknown'}</Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue">
                            {appointment.serviceType || 'General'}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={
                              appointment.status === 'completed' ? 'green' : 
                              appointment.status === 'scheduled' ? 'blue' : 
                              appointment.status === 'cancelled' ? 'red' : 'gray'
                            }
                          >
                            {appointment.status || 'Unknown'}
                          </Badge>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant={selectedAppointment?._id === appointment._id ? 'solid' : 'outline'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentSelect(appointment);
                            }}
                          >
                            Select
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Flex justify="center" direction="column" align="center" py={8}>
                <FaInfoCircle size={24} color="gray" />
                <Text mt={2} color="gray.500">No appointments found matching your criteria</Text>
              </Flex>
            )}
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleConfirm}
            isDisabled={!selectedAppointment}
          >
            Confirm Selection
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AppointmentSearchModal;
