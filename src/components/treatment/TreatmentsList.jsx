import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Spinner,
  Flex,
  Badge
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getTreatments, deleteTreatment } from '../../api/treatments';

const TreatmentsList = () => {
  const [treatments, setTreatments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const data = await getTreatments();
      setTreatments(data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch treatments',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTreatment(id);
      setTreatments(treatments.filter(treatment => treatment._id !== id));
      toast({
        title: 'Success',
        description: 'Treatment deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete treatment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Treatments</Heading>
        <Button
          colorScheme="blue"
          onClick={() => navigate('new')}
        >
          Add New Treatment
        </Button>
      </Flex>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Category</Th>
            <Th>Duration</Th>
            <Th>Price</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {treatments.map((treatment) => (
            <Tr key={treatment._id}>
              <Td>{treatment.name}</Td>
              <Td>
                <Badge colorScheme="blue">
                  {treatment.category}
                </Badge>
              </Td>
              <Td>{treatment.duration} minutes</Td>
              <Td>₹{treatment.price}</Td>
              <Td>
                <Button
                  colorScheme="blue"
                  size="sm"
                  mr={2}
                  onClick={() => navigate(`${treatment._id}`)}
                >
                  Edit
                </Button>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={() => handleDelete(treatment._id)}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TreatmentsList;