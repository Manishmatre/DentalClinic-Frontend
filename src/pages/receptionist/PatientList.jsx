import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  useToast,
  Spinner,
  Center,
  Flex,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  HStack,
  useDisclosure
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { Link, useNavigate } from 'react-router-dom';
import ReceptionistLayout from '../../layouts/ReceptionistLayout';
import patientService from '../../api/patients/patientService';
import PatientsList from '../../components/patients/PatientsList';
import PatientModal from '../../components/patients/PatientModal';
import PatientDetailsModal from '../../components/patients/PatientDetailsModal';

/**
 * PatientList page for receptionists to view and manage patients
 */
const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  
  const { 
    isOpen: isAddModalOpen, 
    onOpen: onAddModalOpen, 
    onClose: onAddModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDetailsModalOpen, 
    onOpen: onDetailsModalOpen, 
    onClose: onDetailsModalClose 
  } = useDisclosure();

  // Fetch patients on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients when search term or filter status changes
  useEffect(() => {
    filterPatients();
  }, [searchTerm, filterStatus, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAllPatients();
      if (response.success) {
        setPatients(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patients. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.name?.toLowerCase().includes(term) || 
        patient.email?.toLowerCase().includes(term) || 
        patient.phone?.includes(term) ||
        patient.idNumber?.includes(term)
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(patient => patient.status === filterStatus);
    }
    
    setFilteredPatients(filtered);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPatients();
    setIsRefreshing(false);
  };

  const handlePatientAdded = () => {
    fetchPatients();
    onAddModalClose();
    toast({
      title: 'Success',
      description: 'Patient added successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    onDetailsModalOpen();
  };

  const handleCreateAppointment = (patient) => {
    navigate(`/receptionist/appointments?patientId=${patient._id}`);
  };

  return (
    <ReceptionistLayout>
      <Container maxW="container.xl" py={6}>
        <Box mb={6}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading as="h1" size="xl">Patient Management</Heading>
            <Button 
              leftIcon={<AddIcon />} 
              colorScheme="blue" 
              onClick={onAddModalOpen}
            >
              Add New Patient
            </Button>
          </Flex>
          <Text color="gray.600">View and manage patient records</Text>
        </Box>

        {/* Filters */}
        <Flex mb={6} gap={4} flexWrap="wrap">
          <InputGroup maxW="sm">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Search by name, email, phone or ID" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            maxW="xs" 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Patients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          
          <Button 
            onClick={handleRefresh} 
            isLoading={isRefreshing}
            variant="outline"
          >
            Refresh
          </Button>
        </Flex>

        {/* Patients List */}
        {loading ? (
          <Center py={10}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : filteredPatients.length === 0 ? (
          <Box textAlign="center" py={10} borderRadius="md" bg="gray.50">
            <Text fontSize="lg" mb={4}>No patients found</Text>
            <Button colorScheme="blue" onClick={onAddModalOpen}>
              Add New Patient
            </Button>
          </Box>
        ) : (
          <PatientsList 
            patients={filteredPatients} 
            onViewDetails={handleViewDetails}
            onCreateAppointment={handleCreateAppointment}
            onRefresh={handleRefresh}
          />
        )}
      </Container>

      {/* Add Patient Modal */}
      {isAddModalOpen && (
        <PatientModal 
          isOpen={isAddModalOpen} 
          onClose={onAddModalClose}
          onSuccess={handlePatientAdded}
        />
      )}

      {/* Patient Details Modal */}
      {isDetailsModalOpen && selectedPatient && (
        <PatientDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={onDetailsModalClose}
          patient={selectedPatient}
          onRefresh={handleRefresh}
        />
      )}
    </ReceptionistLayout>
  );
};

export default PatientList;
