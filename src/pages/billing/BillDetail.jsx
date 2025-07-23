import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaFileInvoiceDollar, 
  FaPrint, 
  FaMoneyBillWave, 
  FaFileAlt,
  FaPaperclip,
  FaExchangeAlt
} from 'react-icons/fa';

import billService from '../../api/billing/billService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BillingDetail from '../../components/billing/BillingDetail';

const BillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  // Load bill data
  useEffect(() => {
    const fetchBill = async () => {
      try {
        const billData = await billService.getBillById(id);
        setBill(billData);
      } catch (error) {
        toast({
          title: 'Error loading bill',
          description: error.message || 'Could not load bill details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBill();
    }
  }, [id, toast]);
  
  // Handle payment addition
  const handleAddPayment = async (paymentData) => {
    try {
      const result = await billService.addPayment(id, paymentData);
      if (result && !result.error) {
        // Refresh bill data
        const billData = await billService.getBillById(id);
        setBill(billData);
        setPaymentModalOpen(false);
        
        toast({
          title: 'Payment added',
          description: 'Payment has been successfully recorded',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error adding payment',
        description: error.message || 'Could not add payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle generating PDF
  const handleGeneratePdf = () => {
    billService.generateBillPdf(id);
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    const statusInfo = billService.getStatusInfo(status);
    
    return (
      <Badge colorScheme={statusInfo.color.split('.')[0]} fontSize="0.9em" px={2} py={1} borderRadius="md">
        {statusInfo.label}
      </Badge>
    );
  };
  
  // Get formatted date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!bill) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading size="md" mb={4}>Bill not found</Heading>
        <Button leftIcon={<FaArrowLeft />} onClick={() => navigate('/billing/bills')}>
          Back to Bills
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.md" py={6}>
      <BillingDetail invoice={bill} onBack={() => navigate('/billing/bills')} />
    </Container>
  );
};

export default BillDetail;
