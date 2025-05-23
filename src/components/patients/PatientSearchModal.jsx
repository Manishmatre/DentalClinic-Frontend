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
  IconButton,
  Spinner
} from '@chakra-ui/react';
import { FaSearch, FaUser, FaInfoCircle } from 'react-icons/fa';
import patientService from '../../api/patients/patientService';

/**
 * Modal component for searching and selecting patients
 */
const PatientSearchModal = ({ isOpen, onClose, onSelect, preSelectedPatientId = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const toast = useToast();

  // Load patients when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  // Fetch patients from API
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await patientService.getPatients();
      if (response && response.patients) {
        setPatients(response.patients);
        setFilteredPatients(response.patients);
        
        // If there's a pre-selected patient, select it
        if (preSelectedPatientId) {
          const patient = response.patients.find(p => p._id === preSelectedPatientId);
          if (patient) {
            setSelectedPatient(patient);
          }
        }
      }
    } catch (error) {
      toast({
        title: 'Error fetching patients',
        description: error.message || 'Could not load patients',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter patients based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedPatient) {
      onSelect(selectedPatient);
      onClose();
    } else {
      toast({
        title: 'No patient selected',
        description: 'Please select a patient first',
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxW="900px">
        <ModalHeader>
          <Flex align="center">
            <FaUser mr={2} />
            <Text>Select Patient</Text>
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
                placeholder="Search patients by name, email, or phone"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            {/* Patients table */}
            {loading ? (
              <Flex justify="center" py={8}>
                <Spinner size="lg" />
              </Flex>
            ) : filteredPatients.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Contact</Th>
                      <Th>Date of Birth</Th>
                      <Th>Insurance</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredPatients.map((patient) => (
                      <Tr 
                        key={patient._id}
                        bg={selectedPatient?._id === patient._id ? 'blue.50' : 'transparent'}
                        onClick={() => handlePatientSelect(patient)}
                        cursor="pointer"
                        _hover={{ bg: 'gray.50' }}
                      >
                        <Td>
                          <HStack>
                            <Text fontWeight="medium">{patient.name}</Text>
                            {patient.gender && (
                              <Badge size="sm" colorScheme={patient.gender === 'Male' ? 'blue' : 'pink'}>
                                {patient.gender}
                              </Badge>
                            )}
                          </HStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm">{patient.email || 'No email'}</Text>
                            <Text fontSize="sm">{patient.phone || 'No phone'}</Text>
                          </VStack>
                        </Td>
                        <Td>{formatDate(patient.dateOfBirth)}</Td>
                        <Td>
                          {patient.insuranceProvider ? (
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm">{patient.insuranceProvider}</Text>
                              <Text fontSize="xs" color="gray.500">
                                Policy: {patient.insurancePolicyNumber || 'N/A'}
                              </Text>
                            </VStack>
                          ) : (
                            <Text fontSize="sm" color="gray.500">No insurance</Text>
                          )}
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant={selectedPatient?._id === patient._id ? 'solid' : 'outline'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePatientSelect(patient);
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
                <Text mt={2} color="gray.500">No patients found matching your search criteria</Text>
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
            isDisabled={!selectedPatient}
          >
            Confirm Selection
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PatientSearchModal;
