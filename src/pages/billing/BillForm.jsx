import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  IconButton,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  FormErrorMessage,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaFileInvoiceDollar, FaPaperclip } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import billService from '../../api/billing/billService';
import patientService from '../../api/patients/patientService';
import staffService from '../../api/staff/staffService';
import appointmentService from '../../api/appointments/appointmentService';
import serviceService from '../../api/services/serviceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PatientSearchModal from '../../components/patients/PatientSearchModal';
import DoctorSearchModal from '../../components/staff/DoctorSearchModal';
import BillingAttachments from '../../components/billing/BillingAttachments';
import AppointmentSearchModal from '../../components/appointments/AppointmentSearchModal';
import ServiceSearchModal from '../../components/services/ServiceSearchModal';

const BillForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [services, setServices] = useState([]);
  const [attachments, setAttachments] = useState([]);
  
  // Modals
  const patientModal = useDisclosure();
  const doctorModal = useDisclosure();
  const appointmentModal = useDisclosure();
  const serviceModal = useDisclosure();
  
  // Form validation schema
  const validationSchema = Yup.object({
    patientId: Yup.string().required('Patient is required'),
    items: Yup.array().min(1, 'At least one item is required').of(
      Yup.object().shape({
        name: Yup.string().required('Name is required'),
        quantity: Yup.number().min(1, 'Quantity must be at least 1').required('Quantity is required'),
        unitPrice: Yup.number().min(0, 'Price cannot be negative').required('Price is required')
      })
    ),
    dueDate: Yup.date().required('Due date is required')
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      patientId: '',
      patientName: '',
      doctorId: '',
      doctorName: '',
      appointmentId: '',
      appointmentDate: '',
      items: [],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: '',
      insuranceProvider: '',
      insurancePolicyNumber: '',
      insuranceCoverage: 0
    },
    validationSchema,
    onSubmit: handleSubmit
  });
  
  // Load bill data if editing
  useEffect(() => {
    const fetchData = async () => {
      setInitializing(true);
      try {
        // Load available services
        const servicesResponse = await serviceService.getServices();
        if (servicesResponse.services) {
          setServices(servicesResponse.services);
        }
        
        // If editing an existing bill
        if (id) {
          const billData = await billService.getBillById(id);
          if (billData) {
            // Format the data for the form
            const formattedData = {
              patientId: billData.patientId?._id || billData.patientId,
              patientName: billData.patientId?.name || '',
              doctorId: billData.doctorId?._id || billData.doctorId || '',
              doctorName: billData.doctorId?.name || '',
              appointmentId: billData.appointmentId?._id || billData.appointmentId || '',
              appointmentDate: billData.appointmentId?.startTime 
                ? new Date(billData.appointmentId.startTime).toLocaleDateString() 
                : '',
              attachments: billData.attachments || [],
              items: billData.items || [],
              dueDate: billData.dueDate ? new Date(billData.dueDate) : null,
              notes: billData.notes || '',
              insuranceProvider: billData.insuranceProvider || '',
              insurancePolicyNumber: billData.insurancePolicyNumber || '',
              insuranceCoverage: billData.insuranceCoverage || 0
            };
            
            formik.setValues(formattedData);
            setAttachments(formattedData.attachments);
          }
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setInitializing(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Handle form submission
  async function handleSubmit(values) {
    setLoading(true);
    try {
      // Calculate totals for each item
      const processedItems = values.items.map(item => {
        const quantity = Number(item.quantity) || 1;
        const unitPrice = Number(item.unitPrice) || 0;
        const discount = Number(item.discount) || 0;
        const tax = Number(item.tax) || 0;
        const totalAmount = (quantity * unitPrice) + tax - discount;
        
        return {
          ...item,
          quantity,
          unitPrice,
          discount,
          tax,
          totalAmount
        };
      });
      
      const billData = {
        patientId: values.patientId,
        doctorId: values.doctorId || undefined,
        appointmentId: values.appointmentId || undefined,
        items: processedItems,
        dueDate: values.dueDate,
        notes: values.notes,
        insuranceProvider: values.insuranceProvider,
        insurancePolicyNumber: values.insurancePolicyNumber,
        insuranceCoverage: Number(values.insuranceCoverage) || 0,
        attachments: attachments || []
      };
      
      let response;
      if (id) {
        // Update existing bill
        response = await billService.updateBill(id, billData);
      } else {
        // Create new bill
        response = await billService.createBill(billData);
      }
      
      if (response && !response.error) {
        toast({
          title: 'Success',
          description: id ? 'Bill updated successfully' : 'Bill created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Navigate back to bills list
        navigate('/billing/bills');
      } else {
        throw new Error(response.error || 'Operation failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save bill',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }
  
  // Add a new item to the bill
  const addItem = (serviceData = null) => {
    const newItem = serviceData ? {
      name: serviceData.name,
      description: serviceData.description,
      serviceId: serviceData._id,
      category: serviceData.category || 'other',
      quantity: 1,
      unitPrice: serviceData.price || 0,
      discount: 0,
      tax: 0,
      totalAmount: serviceData.price || 0
    } : {
      name: '',
      description: '',
      category: 'other',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 0,
      totalAmount: 0
    };
    
    formik.setFieldValue('items', [...formik.values.items, newItem]);
  };
  
  // Remove an item from the bill
  const removeItem = (index) => {
    const updatedItems = [...formik.values.items];
    updatedItems.splice(index, 1);
    formik.setFieldValue('items', updatedItems);
  };
  
  // Update item field
  const updateItemField = (index, field, value) => {
    const updatedItems = [...formik.values.items];
    updatedItems[index][field] = value;
    
    // Recalculate total amount
    const item = updatedItems[index];
    const quantity = Number(item.quantity) || 1;
    const unitPrice = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const tax = Number(item.tax) || 0;
    item.totalAmount = (quantity * unitPrice) + tax - discount;
    
    formik.setFieldValue('items', updatedItems);
  };
  
  // Handle patient selection
  const handlePatientSelect = (patient) => {
    formik.setFieldValue('patientId', patient._id);
    formik.setFieldValue('patientName', patient.name);
    patientModal.onClose();
  };
  
  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    formik.setFieldValue('doctorId', doctor._id);
    formik.setFieldValue('doctorName', doctor.name);
    doctorModal.onClose();
  };
  
  // Handle appointment selection
  const handleAppointmentSelect = async (appointment) => {
    formik.setFieldValue('appointmentId', appointment._id);
    formik.setFieldValue('appointmentDate', new Date(appointment.startTime).toLocaleDateString());
    
    // If appointment has a doctor, set the doctor
    if (appointment.doctorId) {
      formik.setFieldValue('doctorId', appointment.doctorId._id || appointment.doctorId);
      formik.setFieldValue('doctorName', appointment.doctorId.name || '');
    }
    
    // If appointment has a service, add it as an item
    if (appointment.serviceId) {
      try {
        const serviceData = await serviceService.getServiceById(appointment.serviceId);
        if (serviceData) {
          addItem(serviceData);
        }
      } catch (error) {
        console.warn('Failed to fetch service details:', error);
      }
    }
    
    appointmentModal.onClose();
  };
  
  // Handle service selection
  const handleServiceSelect = (service) => {
    addItem(service);
    serviceModal.onClose();
  };
  
  // Calculate totals
  const calculateSubtotal = () => {
    return formik.values.items.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  };
  
  const calculateTaxTotal = () => {
    return formik.values.items.reduce((sum, item) => sum + (Number(item.tax) || 0), 0);
  };
  
  const calculateDiscountTotal = () => {
    return formik.values.items.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
  };
  
  const calculateTotal = () => {
    return calculateSubtotal();
  };
  
  if (initializing) {
    return <LoadingSpinner />;
  }
  
  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{id ? 'Edit Bill' : 'Create New Bill'}</Heading>
        <HStack>
          <Button 
            leftIcon={<FaArrowLeft />} 
            onClick={() => navigate('/billing/bills')}
            colorScheme="gray"
          >
            Back
          </Button>
          <Button 
            leftIcon={<FaSave />} 
            colorScheme="blue" 
            isLoading={loading}
            onClick={formik.handleSubmit}
          >
            Save Bill
          </Button>
          {id && (
            <Button 
              leftIcon={<FaFileInvoiceDollar />} 
              colorScheme="green"
              onClick={() => billService.generateBillPdf(id)}
            >
              Generate PDF
            </Button>
          )}
        </HStack>
      </Flex>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} mb={6}>
          {/* Patient Information */}
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
            <Heading size="md" mb={4}>Patient Information</Heading>
            <FormControl isRequired isInvalid={formik.touched.patientId && formik.errors.patientId}>
              <FormLabel>Patient</FormLabel>
              <Flex>
                <Input 
                  value={formik.values.patientName} 
                  isReadOnly 
                  placeholder="Select a patient"
                  mr={2}
                />
                <Button onClick={patientModal.onOpen}>Select</Button>
              </Flex>
              <FormErrorMessage>{formik.errors.patientId}</FormErrorMessage>
            </FormControl>
          </Box>
          
          {/* Doctor & Appointment */}
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
            <Heading size="md" mb={4}>Doctor & Appointment</Heading>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Doctor</FormLabel>
                <Flex>
                  <Input 
                    value={formik.values.doctorName} 
                    isReadOnly 
                    placeholder="Select a doctor (optional)"
                    mr={2}
                  />
                  <Button onClick={doctorModal.onOpen}>Select</Button>
                </Flex>
              </FormControl>
              
              <FormControl>
                <FormLabel>Appointment</FormLabel>
                <Flex>
                  <Input 
                    value={formik.values.appointmentDate} 
                    isReadOnly 
                    placeholder="Select an appointment (optional)"
                    mr={2}
                  />
                  <Button onClick={appointmentModal.onOpen}>Select</Button>
                </Flex>
              </FormControl>
            </VStack>
          </Box>
        </Grid>
        
        {/* Bill Items */}
        <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" mb={6}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md">Bill Items</Heading>
            <HStack>
              <Button 
                leftIcon={<FaPlus />} 
                colorScheme="teal" 
                size="sm"
                onClick={() => serviceModal.onOpen()}
              >
                Add Service
              </Button>
              <Button 
                leftIcon={<FaPlus />} 
                colorScheme="blue" 
                size="sm"
                onClick={() => addItem()}
              >
                Add Custom Item
              </Button>
            </HStack>
          </Flex>
          
          {formik.touched.items && formik.errors.items && typeof formik.errors.items === 'string' && (
            <Text color="red.500" mb={2}>{formik.errors.items}</Text>
          )}
          
          <Table variant="simple" mb={4}>
            <Thead>
              <Tr>
                <Th>Item</Th>
                <Th>Quantity</Th>
                <Th>Unit Price</Th>
                <Th>Discount</Th>
                <Th>Tax</Th>
                <Th>Total</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {formik.values.items.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center">No items added yet</Td>
                </Tr>
              ) : (
                formik.values.items.map((item, index) => (
                  <Tr key={index}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Input 
                          value={item.name}
                          onChange={(e) => updateItemField(index, 'name', e.target.value)}
                          size="sm"
                          isInvalid={
                            formik.touched.items && 
                            formik.errors.items && 
                            formik.errors.items[index] && 
                            formik.errors.items[index].name
                          }
                        />
                        <Input 
                          value={item.description || ''}
                          onChange={(e) => updateItemField(index, 'description', e.target.value)}
                          placeholder="Description (optional)"
                          size="sm"
                        />
                        <Select 
                          value={item.category}
                          onChange={(e) => updateItemField(index, 'category', e.target.value)}
                          size="sm"
                        >
                          <option value="consultation">Consultation</option>
                          <option value="procedure">Procedure</option>
                          <option value="medication">Medication</option>
                          <option value="lab">Laboratory</option>
                          <option value="other">Other</option>
                        </Select>
                      </VStack>
                    </Td>
                    <Td>
                      <NumberInput 
                        value={item.quantity} 
                        min={1}
                        onChange={(value) => updateItemField(index, 'quantity', value)}
                        size="sm"
                        isInvalid={
                          formik.touched.items && 
                          formik.errors.items && 
                          formik.errors.items[index] && 
                          formik.errors.items[index].quantity
                        }
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Td>
                    <Td>
                      <NumberInput 
                        value={item.unitPrice} 
                        min={0}
                        onChange={(value) => updateItemField(index, 'unitPrice', value)}
                        size="sm"
                        isInvalid={
                          formik.touched.items && 
                          formik.errors.items && 
                          formik.errors.items[index] && 
                          formik.errors.items[index].unitPrice
                        }
                      >
                        <NumberInputField />
                      </NumberInput>
                    </Td>
                    <Td>
                      <NumberInput 
                        value={item.discount || 0} 
                        min={0}
                        onChange={(value) => updateItemField(index, 'discount', value)}
                        size="sm"
                      >
                        <NumberInputField />
                      </NumberInput>
                    </Td>
                    <Td>
                      <NumberInput 
                        value={item.tax || 0} 
                        min={0}
                        onChange={(value) => updateItemField(index, 'tax', value)}
                        size="sm"
                      >
                        <NumberInputField />
                      </NumberInput>
                    </Td>
                    <Td>
                      <Text fontWeight="bold">
                        {billService.formatCurrency(item.totalAmount || 0)}
                      </Text>
                    </Td>
                    <Td>
                      <IconButton
                        icon={<FaTrash />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => removeItem(index)}
                        aria-label="Remove item"
                      />
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
          
          <Divider my={4} />
          
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <Box>
              <FormControl isRequired isInvalid={formik.touched.dueDate && formik.errors.dueDate}>
                <FormLabel>Due Date</FormLabel>
                <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={2}>
                  <DatePicker
                    selected={formik.values.dueDate}
                    onChange={(date) => formik.setFieldValue('dueDate', date)}
                    dateFormat="MM/dd/yyyy"
                    className="form-control w-full"
                  />
                </Box>
                <FormErrorMessage>{formik.errors.dueDate}</FormErrorMessage>
              </FormControl>
              
              <FormControl mt={4}>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formik.values.notes}
                  onChange={(e) => formik.setFieldValue('notes', e.target.value)}
                  placeholder="Add any notes about this bill"
                  rows={3}
                />
              </FormControl>
            </Box>
            
            <Box>
              <Heading size="sm" mb={2}>Insurance Information</Heading>
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel>Insurance Provider</FormLabel>
                  <Input
                    value={formik.values.insuranceProvider}
                    onChange={(e) => formik.setFieldValue('insuranceProvider', e.target.value)}
                    placeholder="Insurance provider name"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Policy Number</FormLabel>
                  <Input
                    value={formik.values.insurancePolicyNumber}
                    onChange={(e) => formik.setFieldValue('insurancePolicyNumber', e.target.value)}
                    placeholder="Insurance policy number"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Coverage Amount</FormLabel>
                  <NumberInput
                    value={formik.values.insuranceCoverage}
                    min={0}
                    onChange={(value) => formik.setFieldValue('insuranceCoverage', value)}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </VStack>
            </Box>
          </Grid>
        </Box>
        
        {/* Billing and Attachments Tabs */}
        <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" mb={6}>
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab><Icon as={FaFileInvoiceDollar} mr={2} /> Bill Summary</Tab>
              <Tab><Icon as={FaPaperclip} mr={2} /> Attachments {attachments.length > 0 && <Badge ml={2} colorScheme="blue">{attachments.length}</Badge>}</Tab>
            </TabList>
            
            <TabPanels>
              {/* Bill Summary Tab */}
              <TabPanel px={0} pt={4}>
                <Heading size="md" mb={4}>Bill Summary</Heading>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                  <VStack align="stretch" spacing={2}>
                    <Flex justify="space-between">
                      <Text>Subtotal:</Text>
                      <Text>{billService.formatCurrency(calculateSubtotal())}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Tax:</Text>
                      <Text>{billService.formatCurrency(calculateTaxTotal())}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Discount:</Text>
                      <Text>{billService.formatCurrency(calculateDiscountTotal())}</Text>
                    </Flex>
                    <Divider my={2} />
                    <Flex justify="space-between">
                      <Text fontWeight="bold">Total:</Text>
                      <Text fontWeight="bold">{billService.formatCurrency(calculateTotal())}</Text>
                    </Flex>
                    {formik.values.insuranceCoverage > 0 && (
                      <>
                        <Flex justify="space-between">
                          <Text>Insurance Coverage:</Text>
                          <Text>{billService.formatCurrency(formik.values.insuranceCoverage)}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text fontWeight="bold">Patient Responsibility:</Text>
                          <Text fontWeight="bold">
                            {billService.formatCurrency(Math.max(0, calculateTotal() - formik.values.insuranceCoverage))}
                          </Text>
                        </Flex>
                      </>
                    )}
                  </VStack>
                  
                  <Box>
                    <Button
                      leftIcon={<FaSave />}
                      colorScheme="blue"
                      size="lg"
                      width="100%"
                      isLoading={loading}
                      onClick={formik.handleSubmit}
                      mb={4}
                    >
                      {id ? 'Update Bill' : 'Create Bill'}
                    </Button>
                    
                    {!id && (
                      <Button
                        colorScheme="gray"
                        size="md"
                        width="100%"
                        onClick={() => navigate('/billing/bills')}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Grid>
              </TabPanel>
              
              {/* Attachments Tab */}
              <TabPanel px={0} pt={4}>
                {id ? (
                  <BillingAttachments 
                    billId={id} 
                    attachments={attachments}
                    onAttachmentsChange={(updatedAttachments) => setAttachments(updatedAttachments)}
                    readOnly={loading}
                  />
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">You can attach documents after creating the bill.</Text>
                  </Box>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </form>
      
      {/* Modals */}
      <PatientSearchModal
        isOpen={patientModal.isOpen}
        onClose={patientModal.onClose}
        onSelect={handlePatientSelect}
      />
      
      <DoctorSearchModal
        isOpen={doctorModal.isOpen}
        onClose={doctorModal.onClose}
        onSelect={handleDoctorSelect}
      />
      
      <AppointmentSearchModal
        isOpen={appointmentModal.isOpen}
        onClose={appointmentModal.onClose}
        onSelect={handleAppointmentSelect}
        patientId={formik.values.patientId}
      />
      
      <ServiceSearchModal
        isOpen={serviceModal.isOpen}
        onClose={serviceModal.onClose}
        onSelect={handleServiceSelect}
      />
    </Box>
  );
};

export default BillForm;
