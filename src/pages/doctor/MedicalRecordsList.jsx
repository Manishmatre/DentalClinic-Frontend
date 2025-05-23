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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import { getAll, getById } from '../../api/medicalRecords';
import { formatDate } from '../../utils/dateUtils';

const MedicalRecordsList = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const data = await getAll();
      setRecords(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch medical records',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRecordClick = async (recordId) => {
    try {
      const record = await getById(recordId);
      setSelectedRecord(record);
      onOpen();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch record details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={5}>
      <VStack spacing={5} align="stretch">
        <Box>
          <Heading size="lg">Medical Records</Heading>
          <Text mt={2} color="gray.600">
            View and manage patient medical records
          </Text>
        </Box>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Patient</Th>
                <Th>Date</Th>
                <Th>Diagnosis</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {records.map((record) => (
                <Tr key={record._id}>
                  <Td>{record.patientName}</Td>
                  <Td>{formatDate(record.date)}</Td>
                  <Td>{record.diagnosis}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleRecordClick(record._id)}
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

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Medical Record Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedRecord && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Patient Name</FormLabel>
                  <Text>{selectedRecord.patientName}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Text>{formatDate(selectedRecord.date)}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Diagnosis</FormLabel>
                  <Text>{selectedRecord.diagnosis}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Treatment</FormLabel>
                  <Text>{selectedRecord.treatment}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Text>{selectedRecord.notes}</Text>
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Badge colorScheme={getStatusColor(selectedRecord.status)}>
                    {selectedRecord.status}
                  </Badge>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MedicalRecordsList;