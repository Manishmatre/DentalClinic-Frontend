import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Box,
  Text,
  Flex,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';

import serviceService from '../../api/services/serviceService';

const ServiceSearchModal = ({ isOpen, onClose, onSelect }) => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await serviceService.getServices();
      if (response && response.services) {
        setServices(response.services);
        setFilteredServices(response.services);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch services',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      setFilteredServices(services);
      return;
    }
    
    const filtered = services.filter(service => 
      service.name.toLowerCase().includes(query) || 
      service.description.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query)
    );
    
    setFilteredServices(filtered);
  };

  const handleSelect = (service) => {
    onSelect(service);
    onClose();
  };

  const getCategoryBadge = (category) => {
    const colorMap = {
      consultation: 'blue',
      procedure: 'green',
      medication: 'purple',
      lab: 'orange',
      other: 'gray'
    };
    
    return (
      <Badge colorScheme={colorMap[category] || 'gray'}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Service</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <InputGroup mb={4}>
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search services by name, description, or category"
              value={searchQuery}
              onChange={handleSearch}
            />
          </InputGroup>

          {loading ? (
            <Flex justify="center" align="center" height="200px">
              <Spinner size="xl" />
            </Flex>
          ) : filteredServices.length === 0 ? (
            <Box py={4} textAlign="center">
              <Text>No services found</Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Category</Th>
                    <Th>Duration</Th>
                    <Th isNumeric>Price</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredServices.map((service) => (
                    <Tr key={service._id}>
                      <Td>
                        <Text fontWeight="bold">{service.name}</Text>
                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                          {service.description}
                        </Text>
                      </Td>
                      <Td>{getCategoryBadge(service.category)}</Td>
                      <Td>{service.duration} min</Td>
                      <Td isNumeric>{formatCurrency(service.price)}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => handleSelect(service)}
                        >
                          Select
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ServiceSearchModal;
