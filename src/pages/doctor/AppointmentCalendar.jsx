import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  useToast,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
} from '@chakra-ui/react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

const AppointmentCalendar = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      // TODO: Replace with actual API call
      const mockAppointments = [
        {
          id: 1,
          patientName: 'John Doe',
          time: '09:00',
          date: '2024-02-19',
          service: 'Check-up',
          status: 'Scheduled',
        },
        {
          id: 2,
          patientName: 'Jane Smith',
          time: '10:30',
          date: '2024-02-19',
          service: 'Consultation',
          status: 'Confirmed',
        },
      ];
      setAppointments(mockAppointments);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch appointments',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    onOpen();
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.date), date)
    );
  };

  return (
    <Box p={5}>
      <VStack spacing={5} align="stretch">
        <Box>
          <Heading size="lg">Appointment Calendar</Heading>
          <Text mt={2} color="gray.600">
            Manage your appointments and schedule
          </Text>
        </Box>

        <Box display="flex" gap={2} mb={4}>
          {weekDays.map((day) => (
            <Button
              key={day.toString()}
              variant={isSameDay(day, selectedDate) ? 'solid' : 'outline'}
              colorScheme={isSameDay(day, selectedDate) ? 'blue' : 'gray'}
              onClick={() => handleDateClick(day)}
              flex={1}
            >
              {format(day, 'EEE dd')}
            </Button>
          ))}
        </Box>

        <Box bg="white" p={4} rounded="lg" shadow="sm">
          <Heading size="md" mb={4}>
            Appointments for {format(selectedDate, 'MMMM dd, yyyy')}
          </Heading>
          <VStack spacing={3} align="stretch">
            {getAppointmentsForDate(selectedDate).map((appointment) => (
              <Box
                key={appointment.id}
                p={3}
                borderWidth={1}
                rounded="md"
                cursor="pointer"
                onClick={() => handleAppointmentClick(appointment)}
                _hover={{ bg: 'gray.50' }}
              >
                <Text fontWeight="bold">{appointment.patientName}</Text>
                <Text color="gray.600">
                  {appointment.time} - {appointment.service}
                </Text>
                <Text
                  color={
                    appointment.status === 'Confirmed'
                      ? 'green.500'
                      : appointment.status === 'Scheduled'
                      ? 'blue.500'
                      : 'gray.500'
                  }
                >
                  {appointment.status}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Appointment Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedAppointment && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Patient Name</FormLabel>
                  <Input value={selectedAppointment.patientName} isReadOnly />
                </FormControl>
                <FormControl>
                  <FormLabel>Time</FormLabel>
                  <Input value={selectedAppointment.time} isReadOnly />
                </FormControl>
                <FormControl>
                  <FormLabel>Service</FormLabel>
                  <Input value={selectedAppointment.service} isReadOnly />
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select value={selectedAppointment.status}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea placeholder="Add notes about the appointment..." />
                </FormControl>
                <Button colorScheme="blue" mr={3}>
                  Update Appointment
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AppointmentCalendar;