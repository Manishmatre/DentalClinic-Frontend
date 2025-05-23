import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useToast,
  HStack,
  Text,
  Input,
  Select,
  FormControl,
  FormLabel,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  VStack
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEllipsisV, FaFilePdf, FaEdit, FaTrash, FaMoneyBillWave, FaFilter } from 'react-icons/fa';
import { format } from 'date-fns';

import billService from '../../api/billing/billService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FilterDrawer from '../../components/common/FilterDrawer';
import Pagination from '../../components/common/Pagination';

const BillList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    patientName: '',
    limit: 10
  });
  
  // Modals and drawers
  const filterDrawer = useDisclosure();
  const paymentModal = useDisclosure();
  const deleteAlert = useDisclosure();
  
  // Refs
  const cancelRef = useRef();
  const [selectedBill, setSelectedBill] = useState(null);
  
  useEffect(() => {
    fetchBills();
  }, [pagination.page, filters]);
  
  const fetchBills = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: filters.limit,
        ...filters
      };
      
      const response = await billService.getBills(params);
      if (response && response.bills) {
        setBills(response.bills);
        setPagination(response.pagination || pagination);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch bills',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      patientName: '',
      limit: 10
    });
  };
  
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };
  
  const handleAddPayment = (bill) => {
    setSelectedBill(bill);
    paymentModal.onOpen();
  };
  
  const handleDeleteClick = (bill) => {
    setSelectedBill(bill);
    deleteAlert.onOpen();
  };
  
  const confirmDelete = async () => {
    if (!selectedBill) return;
    
    try {
      const response = await billService.deleteBill(selectedBill._id);
      if (response && !response.error) {
        toast({
          title: 'Success',
          description: 'Bill deleted successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchBills();
      } else {
        throw new Error(response.error || 'Failed to delete bill');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete bill',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      deleteAlert.onClose();
    }
  };
  
  const handlePaymentSuccess = () => {
    fetchBills();
    paymentModal.onClose();
  };
  
  const getStatusBadge = (status) => {
    const statusInfo = billService.getStatusInfo(status);
    return (
      <Badge colorScheme={statusInfo.color.split('.')[0]}>
        {statusInfo.label}
      </Badge>
    );
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  if (loading && bills.length === 0) {
    return <LoadingSpinner />;
  }
  
  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Billing Management</Heading>
        <HStack>
          <Button 
            leftIcon={<FaFilter />} 
            onClick={filterDrawer.onOpen}
            colorScheme="teal"
            variant="outline"
          >
            Filter
          </Button>
          <Button 
            leftIcon={<FaPlus />} 
            colorScheme="blue"
            onClick={() => navigate('/billing/new')}
          >
            Create Bill
          </Button>
        </HStack>
      </Flex>
      
      {/* Quick Filters */}
      <Flex mb={4} flexWrap="wrap" gap={2}>
        <Input
          placeholder="Search by patient name"
          value={filters.patientName}
          onChange={(e) => handleFilterChange('patientName', e.target.value)}
          maxW="250px"
        />
        <Select
          placeholder="Filter by status"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          maxW="200px"
        >
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Button 
          onClick={resetFilters} 
          size="md" 
          variant="ghost"
        >
          Clear Filters
        </Button>
      </Flex>
      
      {/* Bills Table */}
      <Box overflowX="auto" borderWidth="1px" borderRadius="lg" bg="white">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Bill #</Th>
              <Th>Patient</Th>
              <Th>Date</Th>
              <Th>Due Date</Th>
              <Th isNumeric>Amount</Th>
              <Th isNumeric>Paid</Th>
              <Th isNumeric>Balance</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {bills.length === 0 ? (
              <Tr>
                <Td colSpan={9} textAlign="center">No bills found</Td>
              </Tr>
            ) : (
              bills.map((bill) => (
                <Tr key={bill._id}>
                  <Td fontWeight="medium">{bill.billNumber}</Td>
                  <Td>{bill.patientId?.name || 'N/A'}</Td>
                  <Td>{formatDate(bill.billDate)}</Td>
                  <Td>{formatDate(bill.dueDate)}</Td>
                  <Td isNumeric>{billService.formatCurrency(bill.totalAmount)}</Td>
                  <Td isNumeric>{billService.formatCurrency(bill.paidAmount)}</Td>
                  <Td isNumeric>{billService.formatCurrency(bill.balanceAmount)}</Td>
                  <Td>{getStatusBadge(bill.status)}</Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FaEllipsisV />}
                        variant="ghost"
                        size="sm"
                        aria-label="Options"
                      />
                      <MenuList>
                        <MenuItem 
                          icon={<FaEdit />} 
                          onClick={() => navigate(`/billing/${bill._id}`)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem 
                          icon={<FaMoneyBillWave />} 
                          onClick={() => handleAddPayment(bill)}
                          isDisabled={bill.status === 'paid' || bill.status === 'cancelled'}
                        >
                          Add Payment
                        </MenuItem>
                        <MenuItem 
                          icon={<FaFilePdf />} 
                          onClick={() => billService.generateBillPdf(bill._id)}
                        >
                          Generate PDF
                        </MenuItem>
                        <MenuItem 
                          icon={<FaTrash />} 
                          onClick={() => handleDeleteClick(bill)}
                          isDisabled={bill.status === 'paid' || bill.paidAmount > 0}
                          color="red.500"
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
      
      {/* Pagination */}
      {bills.length > 0 && (
        <Flex justifyContent="flex-end" mt={4}>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </Flex>
      )}
      
      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={filterDrawer.isOpen}
        onClose={filterDrawer.onClose}
        onApply={() => {
          filterDrawer.onClose();
          setPagination(prev => ({ ...prev, page: 1 }));
        }}
      >
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>End Date</FormLabel>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Status</FormLabel>
            <Select
              placeholder="All statuses"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </FormControl>
          
          <FormControl>
            <FormLabel>Items Per Page</FormLabel>
            <Select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </Select>
          </FormControl>
          
          <Button onClick={resetFilters} colorScheme="gray" size="sm">
            Reset Filters
          </Button>
        </VStack>
      </FilterDrawer>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteAlert.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteAlert.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Bill
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this bill? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteAlert.onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default BillList;
