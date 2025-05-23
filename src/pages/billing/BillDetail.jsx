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
import BillingAttachments from '../../components/billing/BillingAttachments';
import AddPaymentModal from '../../components/billing/AddPaymentModal';

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
    <Container maxW="container.xl" py={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack>
          <Button leftIcon={<FaArrowLeft />} variant="outline" onClick={() => navigate('/billing/bills')}>
            Back
          </Button>
          <Heading size="lg">Bill #{bill.billNumber}</Heading>
          {getStatusBadge(bill.status)}
        </HStack>
        
        <HStack spacing={3}>
          <Button 
            leftIcon={<FaEdit />} 
            colorScheme="blue" 
            onClick={() => navigate(`/billing/bills/edit/${id}`)}
          >
            Edit
          </Button>
          <Button 
            leftIcon={<FaPrint />} 
            variant="outline" 
            onClick={handleGeneratePdf}
          >
            Print
          </Button>
          {['pending', 'partially_paid', 'overdue'].includes(bill.status) && (
            <Button 
              leftIcon={<FaMoneyBillWave />} 
              colorScheme="green"
              onClick={() => setPaymentModalOpen(true)}
            >
              Add Payment
            </Button>
          )}
        </HStack>
      </Flex>
      
      {/* Tabs */}
      <Tabs variant="enclosed" colorScheme="blue" isLazy>
        <TabList>
          <Tab><Icon as={FaFileInvoiceDollar} mr={2} /> Bill Details</Tab>
          <Tab><Icon as={FaMoneyBillWave} mr={2} /> Payments {bill.payments?.length > 0 && <Badge ml={1} colorScheme="green">{bill.payments.length}</Badge>}</Tab>
          <Tab><Icon as={FaPaperclip} mr={2} /> Attachments {bill.attachments?.length > 0 && <Badge ml={1} colorScheme="blue">{bill.attachments.length}</Badge>}</Tab>
          {bill.insuranceProvider && (
            <Tab><Icon as={FaExchangeAlt} mr={2} /> Insurance</Tab>
          )}
        </TabList>
        
        <TabPanels>
          {/* Bill Details Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* Patient & Doctor Info */}
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={4}>Patient & Provider Information</Heading>
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <VStack align="start">
                    <Text fontWeight="bold">Patient:</Text>
                    <Text>{bill.patientId?.name || 'N/A'}</Text>
                    
                    <Text fontWeight="bold" mt={2}>Contact:</Text>
                    <Text>{bill.patientId?.phone || 'N/A'}</Text>
                    <Text>{bill.patientId?.email || 'N/A'}</Text>
                  </VStack>
                  
                  <VStack align="start">
                    <Text fontWeight="bold">Doctor:</Text>
                    <Text>{bill.doctorId?.name || 'N/A'}</Text>
                    
                    <Text fontWeight="bold" mt={2}>Appointment:</Text>
                    <Text>
                      {bill.appointmentId 
                        ? formatDate(bill.appointmentId.startTime) 
                        : 'No appointment linked'}
                    </Text>
                  </VStack>
                </Grid>
              </Box>
              
              {/* Financial Summary */}
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={4}>Financial Summary</Heading>
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <VStack align="start">
                    <Text fontWeight="bold">Bill Date:</Text>
                    <Text>{formatDate(bill.billDate)}</Text>
                    
                    <Text fontWeight="bold" mt={2}>Due Date:</Text>
                    <Text>{formatDate(bill.dueDate)}</Text>
                    
                    <Text fontWeight="bold" mt={2}>Status:</Text>
                    <Text>{getStatusBadge(bill.status)}</Text>
                  </VStack>
                  
                  <VStack align="start">
                    <Text fontWeight="bold">Total Amount:</Text>
                    <Text>{billService.formatCurrency(bill.totalAmount)}</Text>
                    
                    <Text fontWeight="bold" mt={2}>Paid Amount:</Text>
                    <Text>{billService.formatCurrency(bill.paidAmount)}</Text>
                    
                    <Text fontWeight="bold" mt={2}>Balance:</Text>
                    <Text color={bill.balanceAmount > 0 ? "red.500" : "green.500"}>
                      {billService.formatCurrency(bill.balanceAmount)}
                    </Text>
                  </VStack>
                </Grid>
              </Box>
            </SimpleGrid>
            
            {/* Bill Items */}
            <Box mt={8} p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Bill Items</Heading>
              <Box overflowX="auto">
                <Box as="table" width="100%" mb={4}>
                  <Box as="thead" bg="gray.50">
                    <Box as="tr">
                      <Box as="th" textAlign="left" p={2}>Item</Box>
                      <Box as="th" textAlign="center" p={2}>Qty</Box>
                      <Box as="th" textAlign="right" p={2}>Unit Price</Box>
                      <Box as="th" textAlign="right" p={2}>Discount</Box>
                      <Box as="th" textAlign="right" p={2}>Tax</Box>
                      <Box as="th" textAlign="right" p={2}>Total</Box>
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {bill.items && bill.items.map((item, index) => (
                      <Box as="tr" key={index} borderBottomWidth="1px" borderColor="gray.200">
                        <Box as="td" p={2}>
                          <Text fontWeight="medium">{item.name}</Text>
                          {item.description && <Text fontSize="sm" color="gray.600">{item.description}</Text>}
                        </Box>
                        <Box as="td" textAlign="center" p={2}>{item.quantity}</Box>
                        <Box as="td" textAlign="right" p={2}>{billService.formatCurrency(item.unitPrice)}</Box>
                        <Box as="td" textAlign="right" p={2}>{billService.formatCurrency(item.discount || 0)}</Box>
                        <Box as="td" textAlign="right" p={2}>{billService.formatCurrency(item.tax || 0)}</Box>
                        <Box as="td" textAlign="right" p={2} fontWeight="medium">{billService.formatCurrency(item.totalAmount)}</Box>
                      </Box>
                    ))}
                  </Box>
                  <Box as="tfoot" bg="gray.50">
                    <Box as="tr">
                      <Box as="td" colSpan={5} textAlign="right" p={2} fontWeight="bold">Subtotal:</Box>
                      <Box as="td" textAlign="right" p={2}>{billService.formatCurrency(bill.subtotal)}</Box>
                    </Box>
                    <Box as="tr">
                      <Box as="td" colSpan={5} textAlign="right" p={2} fontWeight="bold">Tax Total:</Box>
                      <Box as="td" textAlign="right" p={2}>{billService.formatCurrency(bill.taxAmount)}</Box>
                    </Box>
                    <Box as="tr">
                      <Box as="td" colSpan={5} textAlign="right" p={2} fontWeight="bold">Discount Total:</Box>
                      <Box as="td" textAlign="right" p={2}>{billService.formatCurrency(bill.discountAmount)}</Box>
                    </Box>
                    <Box as="tr">
                      <Box as="td" colSpan={5} textAlign="right" p={2} fontWeight="bold">Total:</Box>
                      <Box as="td" textAlign="right" p={2} fontWeight="bold">{billService.formatCurrency(bill.totalAmount)}</Box>
                    </Box>
                    {bill.insuranceCoverage > 0 && (
                      <>
                        <Box as="tr">
                          <Box as="td" colSpan={5} textAlign="right" p={2} fontWeight="bold">Insurance Coverage:</Box>
                          <Box as="td" textAlign="right" p={2}>{billService.formatCurrency(bill.insuranceCoverage)}</Box>
                        </Box>
                        <Box as="tr">
                          <Box as="td" colSpan={5} textAlign="right" p={2} fontWeight="bold">Patient Responsibility:</Box>
                          <Box as="td" textAlign="right" p={2} fontWeight="bold">
                            {billService.formatCurrency(Math.max(0, bill.totalAmount - bill.insuranceCoverage))}
                          </Box>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
              
              {bill.notes && (
                <Box mt={4}>
                  <Text fontWeight="bold">Notes:</Text>
                  <Text>{bill.notes}</Text>
                </Box>
              )}
            </Box>
          </TabPanel>
          
          {/* Payments Tab */}
          <TabPanel>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Payment History</Heading>
                {['pending', 'partially_paid', 'overdue'].includes(bill.status) && (
                  <Button 
                    leftIcon={<FaMoneyBillWave />} 
                    colorScheme="green" 
                    size="sm"
                    onClick={() => setPaymentModalOpen(true)}
                  >
                    Add Payment
                  </Button>
                )}
              </Flex>
              
              {bill.payments && bill.payments.length > 0 ? (
                <Box overflowX="auto">
                  <Box as="table" width="100%">
                    <Box as="thead" bg="gray.50">
                      <Box as="tr">
                        <Box as="th" textAlign="left" p={2}>Date</Box>
                        <Box as="th" textAlign="left" p={2}>Method</Box>
                        <Box as="th" textAlign="left" p={2}>Transaction ID</Box>
                        <Box as="th" textAlign="right" p={2}>Amount</Box>
                        <Box as="th" textAlign="center" p={2}>Status</Box>
                        <Box as="th" textAlign="left" p={2}>Notes</Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {bill.payments.map((payment, index) => (
                        <Box as="tr" key={index} borderBottomWidth="1px" borderColor="gray.200">
                          <Box as="td" p={2}>{formatDate(payment.paymentDate)}</Box>
                          <Box as="td" p={2}>{payment.paymentMethod.replace('_', ' ')}</Box>
                          <Box as="td" p={2}>{payment.transactionId || '-'}</Box>
                          <Box as="td" textAlign="right" p={2} fontWeight="medium">
                            {billService.formatCurrency(payment.amount)}
                          </Box>
                          <Box as="td" textAlign="center" p={2}>
                            <Badge 
                              colorScheme={payment.status === 'completed' ? 'green' : 
                                payment.status === 'pending' ? 'yellow' : 
                                payment.status === 'refunded' ? 'purple' : 'red'}
                            >
                              {payment.status}
                            </Badge>
                          </Box>
                          <Box as="td" p={2}>{payment.notes || '-'}</Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box textAlign="center" py={8}>
                  <Icon as={FaFileAlt} boxSize={12} color="gray.300" />
                  <Text mt={4} color="gray.500">No payments recorded yet.</Text>
                </Box>
              )}
              
              <Box mt={6} p={4} bg="gray.50" borderRadius="md">
                <SimpleGrid columns={3} spacing={10}>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Total Amount</Text>
                    <Text fontSize="xl" fontWeight="bold">{billService.formatCurrency(bill.totalAmount)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Paid Amount</Text>
                    <Text fontSize="xl" fontWeight="bold" color="green.500">{billService.formatCurrency(bill.paidAmount)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.500">Balance</Text>
                    <Text fontSize="xl" fontWeight="bold" color={bill.balanceAmount > 0 ? "red.500" : "green.500"}>
                      {billService.formatCurrency(bill.balanceAmount)}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>
            </Box>
          </TabPanel>
          
          {/* Attachments Tab */}
          <TabPanel>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <BillingAttachments
                billId={id}
                attachments={bill.attachments || []}
                onAttachmentsChange={(updatedAttachments) => {
                  setBill({...bill, attachments: updatedAttachments});
                }}
              />
            </Box>
          </TabPanel>
          
          {/* Insurance Tab */}
          {bill.insuranceProvider && (
            <TabPanel>
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={4}>Insurance Information</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                  <VStack align="start" spacing={3}>
                    <Box>
                      <Text fontWeight="bold">Insurance Provider:</Text>
                      <Text>{bill.insuranceProvider}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold">Policy Number:</Text>
                      <Text>{bill.insurancePolicyNumber || 'Not provided'}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="bold">Coverage Amount:</Text>
                      <Text>{billService.formatCurrency(bill.insuranceCoverage || 0)}</Text>
                    </Box>
                  </VStack>
                  
                  <VStack align="start" spacing={3}>
                    <Box>
                      <Text fontWeight="bold">Claim Status:</Text>
                      <Badge colorScheme={
                        bill.claimStatus === 'approved' ? 'green' :
                        bill.claimStatus === 'rejected' ? 'red' :
                        bill.claimStatus === 'in_process' ? 'yellow' :
                        bill.claimStatus === 'submitted' ? 'blue' : 'gray'
                      }>
                        {bill.claimStatus?.replace('_', ' ') || 'Not submitted'}
                      </Badge>
                    </Box>
                    
                    {bill.claimSubmissionDate && (
                      <Box>
                        <Text fontWeight="bold">Submission Date:</Text>
                        <Text>{formatDate(bill.claimSubmissionDate)}</Text>
                      </Box>
                    )}
                    
                    {bill.claimSettlementDate && (
                      <Box>
                        <Text fontWeight="bold">Settlement Date:</Text>
                        <Text>{formatDate(bill.claimSettlementDate)}</Text>
                      </Box>
                    )}
                  </VStack>
                </SimpleGrid>
                
                <Divider my={4} />
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Patient Responsibility:</Text>
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Total Bill Amount</Text>
                        <Text fontSize="xl" fontWeight="bold">{billService.formatCurrency(bill.totalAmount)}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Insurance Coverage</Text>
                        <Text fontSize="xl" fontWeight="bold" color="green.500">
                          {billService.formatCurrency(bill.insuranceCoverage || 0)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="sm" color="gray.500">Patient Responsibility</Text>
                        <Text fontSize="xl" fontWeight="bold" color={
                          bill.totalAmount - (bill.insuranceCoverage || 0) > 0 ? "red.500" : "green.500"
                        }>
                          {billService.formatCurrency(Math.max(0, bill.totalAmount - (bill.insuranceCoverage || 0)))}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                </Box>
              </Box>
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
      
      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handleAddPayment}
        billId={id}
        balance={bill.balanceAmount}
      />
    </Container>
  );
};

export default BillDetail;
