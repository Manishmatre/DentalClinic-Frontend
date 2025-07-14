import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  IconButton
} from '@chakra-ui/react';
import { FiSearch, FiUser, FiPhone, FiMail, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const toast = useToast();
  const navigate = useNavigate();
  const { socket } = useAuth();

  useEffect(() => {
    fetchPatients();

    // Setup socket event listeners for real-time updates
    if (socket) {
      socket.on('patientCreated', (newPatient) => {
        setPatients(prev => [newPatient, ...prev]);
      });

      socket.on('patientUpdated', (updatedPatient) => {
        setPatients(prev => prev.map(p => p._id === updatedPatient._id ? updatedPatient : p));
      });

      socket.on('patientDeleted', ({ id }) => {
        setPatients(prev => prev.filter(p => p._id !== id));
      });
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('patientCreated');
        socket.off('patientUpdated');
        socket.off('patientDeleted');
      }
    };
  }, [socket]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/patients', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const data = await response.json();
      const patientsData = data.data?.map((patient) => ({
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        status: patient.status || 'active',
        lastVisit: patient.updatedAt || patient.createdAt || ''
      })) || [];
      
      setPatients(patientsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch patients',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const response = await fetch(`/api/patients/${patientId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete patient');
        }
        
        setPatients(prev => prev.filter(p => p.id !== patientId));
        
        toast({
          title: 'Success',
          description: 'Patient deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete patient',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const filteredPatients = patients.filter((patient) => {
    if (!patient) return false;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (patient.name?.toLowerCase() || '').includes(searchLower) ||
      (patient.email?.toLowerCase() || '').includes(searchLower) ||
      (patient.phone || '').includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Box p={5} display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={5}>
      <VStack spacing={5} align="stretch">
        <Box>
          <Heading size="lg">Patients</Heading>
          <Text mt={2} color="gray.600">
            Manage and view patient information
          </Text>
        </Box>

        <HStack spacing={4} flexWrap="wrap">
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
          <Select
            value={filterStatus}
            onChange={handleFilterChange}
            w="200px"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <Button
            colorScheme="blue"
            onClick={() => navigate('/doctor/patients/new')}
            leftIcon={<FiUser />}
          >
            Add New Patient
          </Button>
        </HStack>

        {filteredPatients.length === 0 ? (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            No patients found. {searchTerm ? 'Try a different search term.' : 'Add a new patient to get started.'}
          </Alert>
        ) : (
          <Box overflowX="auto" borderWidth="1px" borderRadius="lg" p={4}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>Status</Th>
                  <Th>Last Visit</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPatients.map((patient) => (
                  <Tr key={patient.id} _hover={{ bg: 'gray.50' }}>
                    <Td>
                      <HStack>
                        <FiUser />
                        <Text fontWeight="medium">{patient.name || 'N/A'}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack spacing={2}>
                          <FiMail size={14} />
                          <Text fontSize="sm">{patient.email || 'N/A'}</Text>
                        </HStack>
                        {patient.phone && (
                          <HStack spacing={2}>
                            <FiPhone size={14} />
                            <Text fontSize="sm">{patient.phone}</Text>
                          </HStack>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(patient.status)}>
                        {patient.status || 'N/A'}
                      </Badge>
                    </Td>
                    <Td>{formatDate(patient.lastVisit)}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="View patient details"
                          icon={<FiEye />}
                          size="sm"
                          onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                        />
                        <IconButton
                          aria-label="Edit patient"
                          icon={<FiEdit2 />}
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => navigate(`/doctor/patients/edit/${patient.id}`)}
                        />
                        <IconButton
                          aria-label="Delete patient"
                          icon={<FiTrash2 />}
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleDelete(patient.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default PatientList;