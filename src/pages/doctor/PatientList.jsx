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
} from '@chakra-ui/react';
import { FiSearch, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const mockPatients = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          status: 'active',
          lastVisit: '2024-03-01',
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1987654321',
          status: 'inactive',
          lastVisit: '2024-02-15',
        },
      ];
      setPatients(mockPatients);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch patients',
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

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
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

  return (
    <Box p={5}>
      <VStack spacing={5} align="stretch">
        <Box>
          <Heading size="lg">Patients</Heading>
          <Text mt={2} color="gray.600">
            Manage and view patient information
          </Text>
        </Box>

        <HStack spacing={4}>
          <InputGroup>
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
          >
            Add New Patient
          </Button>
        </HStack>

        <Box overflowX="auto">
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
                <Tr key={patient.id}>
                  <Td>
                    <HStack>
                      <FiUser />
                      <Text>{patient.name}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <FiMail />
                        <Text>{patient.email}</Text>
                      </HStack>
                      <HStack>
                        <FiPhone />
                        <Text>{patient.phone}</Text>
                      </HStack>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </Td>
                  <Td>{new Date(patient.lastVisit).toLocaleDateString()}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                    >
                      View Details
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
};

export default PatientList;