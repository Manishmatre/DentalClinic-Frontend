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
  Avatar,
  Spinner
} from '@chakra-ui/react';
import { FaSearch, FaUserMd, FaInfoCircle } from 'react-icons/fa';
import doctorService from '../../api/staff/doctorService';

/**
 * Modal component for searching and selecting doctors
 */
const DoctorSearchModal = ({ isOpen, onClose, onSelect, preSelectedDoctorId = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const toast = useToast();

  // Load doctors when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  // Fetch doctors from API
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await doctorService.getDoctors();
      if (response && response.doctors) {
        setDoctors(response.doctors);
        setFilteredDoctors(response.doctors);
        
        // If there's a pre-selected doctor, select it
        if (preSelectedDoctorId) {
          const doctor = response.doctors.find(d => d._id === preSelectedDoctorId);
          if (doctor) {
            setSelectedDoctor(doctor);
          }
        }
      }
    } catch (error) {
      toast({
        title: 'Error fetching doctors',
        description: error.message || 'Could not load doctors',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDoctors(doctors);
    } else {
      const filtered = doctors.filter(doctor => 
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.phone?.includes(searchTerm)
      );
      setFilteredDoctors(filtered);
    }
  }, [searchTerm, doctors]);

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedDoctor) {
      onSelect(selectedDoctor);
      onClose();
    } else {
      toast({
        title: 'No doctor selected',
        description: 'Please select a doctor first',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxW="900px">
        <ModalHeader>
          <Flex align="center">
            <FaUserMd mr={2} />
            <Text>Select Doctor</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Search input */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search doctors by name, email, or specialization"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            {/* Doctors table */}
            {loading ? (
              <Flex justify="center" py={8}>
                <Spinner size="lg" />
              </Flex>
            ) : filteredDoctors.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Specialization</Th>
                      <Th>Contact</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredDoctors.map((doctor) => (
                      <Tr 
                        key={doctor._id}
                        bg={selectedDoctor?._id === doctor._id ? 'blue.50' : 'transparent'}
                        onClick={() => handleDoctorSelect(doctor)}
                        cursor="pointer"
                        _hover={{ bg: 'gray.50' }}
                      >
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={doctor.name} src={doctor.photo} />
                            <Text fontWeight="medium">{doctor.name}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          {doctor.specialization ? (
                            <Badge colorScheme="green">
                              {doctor.specialization}
                            </Badge>
                          ) : (
                            <Text fontSize="sm" color="gray.500">Not specified</Text>
                          )}
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm">{doctor.email || 'No email'}</Text>
                            <Text fontSize="sm">{doctor.phone || 'No phone'}</Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={
                              doctor.status === 'active' ? 'green' : 
                              doctor.status === 'on_leave' ? 'orange' : 'gray'
                            }
                          >
                            {doctor.status ? doctor.status.replace('_', ' ') : 'Unknown'}
                          </Badge>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant={selectedDoctor?._id === doctor._id ? 'solid' : 'outline'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDoctorSelect(doctor);
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
                <Text mt={2} color="gray.500">No doctors found matching your search criteria</Text>
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
            isDisabled={!selectedDoctor}
          >
            Confirm Selection
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DoctorSearchModal;
