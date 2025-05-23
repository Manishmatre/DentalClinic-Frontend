import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
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
  Avatar,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { FaUser, FaIdCard, FaUserMd, FaFileMedical, FaFileInvoiceDollar, FaCalendarAlt, FaPaperclip, FaCamera } from 'react-icons/fa';

import patientService from '../../api/patients/patientService';
import ehrService from '../../api/ehr/ehrService';
import billService from '../../api/billing/billService';
import appointmentService from '../../api/appointments/appointmentService';
import uploadService from '../../api/upload/uploadService';
import LoadingSpinner from '../common/LoadingSpinner';
import FileUpload from '../common/FileUpload';
import BillingAttachments from '../billing/BillingAttachments';
import AttachmentsSection from '../ehr/AttachmentsSection';

/**
 * Comprehensive Patient Profile component with Cloudinary integration
 * Displays patient information, medical history, billing, appointments, and documents
 */
const PatientProfile = ({ patientId, onClose }) => {
  const [patient, setPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [bills, setBills] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoModalDisclosure = useDisclosure();
  const toast = useToast();

  // Load patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        // Get patient information
        const patientData = await patientService.getPatientById(patientId);
        setPatient(patientData);

        // Get patient's medical records
        const records = await ehrService.getPatientRecords(patientId);
        setMedicalRecords(records);

        // Get patient's bills
        const billsData = await billService.getPatientBills(patientId);
        setBills(billsData.bills || []);

        // Get patient's appointments
        const appointmentsData = await appointmentService.getPatientAppointments(patientId);
        setAppointments(appointmentsData || []);

        // Gather documents from medical records and bills
        const allDocuments = gatherPatientDocuments(records, billsData.bills || []);
        setDocuments(allDocuments);
      } catch (error) {
        toast({
          title: 'Error loading patient data',
          description: error.message || 'Could not load patient information',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientData();
    }
  }, [patientId, toast]);

  // Gather all patient documents from various sources
  const gatherPatientDocuments = (records, bills) => {
    const recordDocs = records.reduce((docs, record) => {
      if (record.attachments && record.attachments.length > 0) {
        const formattedDocs = record.attachments.map(attachment => ({
          ...attachment,
          source: 'medical_record',
          sourceId: record._id,
          sourceDate: record.visitDate,
          doctorName: record.doctorId?.name || 'Unknown'
        }));
        return [...docs, ...formattedDocs];
      }
      return docs;
    }, []);

    const billDocs = bills.reduce((docs, bill) => {
      if (bill.attachments && bill.attachments.length > 0) {
        const formattedDocs = bill.attachments.map(attachment => ({
          ...attachment,
          source: 'bill',
          sourceId: bill._id,
          sourceDate: bill.billDate,
          billNumber: bill.billNumber
        }));
        return [...docs, ...formattedDocs];
      }
      return docs;
    }, []);

    // Combine and sort by date (newest first)
    return [...recordDocs, ...billDocs].sort((a, b) => 
      new Date(b.sourceDate || b.uploadedAt) - new Date(a.sourceDate || a.uploadedAt)
    );
  };

  // Handle profile photo upload
  const handleProfilePhotoUpload = async (file) => {
    if (!file) return;
    
    setUploadingPhoto(true);
    try {
      const result = await uploadService.uploadProfilePicture(file);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update patient profile with the new photo URL
      const updateData = {
        photo: result.file.url,
        photoPublicId: result.file.public_id
      };
      
      await patientService.updatePatient(patientId, updateData);
      
      // Update local state
      setPatient(prev => ({
        ...prev,
        photo: result.file.url,
        photoPublicId: result.file.public_id
      }));
      
      toast({
        title: 'Profile photo updated',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      
      photoModalDisclosure.onClose();
    } catch (error) {
      toast({
        title: 'Error updating profile photo',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!patient) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="md">Patient not found</Heading>
        <Button mt={4} onClick={onClose}>Close</Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Patient Header */}
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        align={{ base: 'center', md: 'flex-start' }}
        mb={6}
        p={4}
        bg="white"
        borderRadius="md"
        shadow="md"
      >
        {/* Profile Photo */}
        <Box mr={{ base: 0, md: 6 }} mb={{ base: 4, md: 0 }} position="relative">
          <Avatar 
            size="2xl" 
            name={patient.name} 
            src={patient.photo ? uploadService.getOptimizedImageUrl(patient.photo, 200, 200) : undefined}
            bg="blue.500"
          />
          <Button
            size="sm"
            position="absolute"
            bottom="0"
            right="0"
            colorScheme="blue"
            borderRadius="full"
            onClick={photoModalDisclosure.onOpen}
            leftIcon={<FaCamera />}
          >
            Change
          </Button>
        </Box>
        
        {/* Patient Info */}
        <Box flex="1">
          <Heading size="lg">{patient.name}</Heading>
          <HStack mt={2} spacing={4}>
            <Badge colorScheme="blue">{patient.gender}</Badge>
            <Badge colorScheme="green">{calculateAge(patient.dateOfBirth)} years</Badge>
            {patient.bloodType && <Badge colorScheme="red">Blood: {patient.bloodType}</Badge>}
          </HStack>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
            <Box>
              <Text fontWeight="bold">ID:</Text>
              <Text>{patient._id}</Text>
              
              <Text fontWeight="bold" mt={2}>Contact:</Text>
              <Text>{patient.phone || 'No phone'}</Text>
              <Text>{patient.email || 'No email'}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold">Date of Birth:</Text>
              <Text>{formatDate(patient.dateOfBirth)}</Text>
              
              <Text fontWeight="bold" mt={2}>Address:</Text>
              <Text>{patient.address || 'No address on file'}</Text>
            </Box>
          </SimpleGrid>
        </Box>
      </Flex>
      
      {/* Patient Data Tabs */}
      <Tabs variant="enclosed" colorScheme="blue" isLazy>
        <TabList>
          <Tab><Icon as={FaIdCard} mr={2} /> Overview</Tab>
          <Tab><Icon as={FaFileMedical} mr={2} /> Medical Records {medicalRecords.length > 0 && <Badge ml={1} colorScheme="blue">{medicalRecords.length}</Badge>}</Tab>
          <Tab><Icon as={FaFileInvoiceDollar} mr={2} /> Billing {bills.length > 0 && <Badge ml={1} colorScheme="green">{bills.length}</Badge>}</Tab>
          <Tab><Icon as={FaCalendarAlt} mr={2} /> Appointments {appointments.length > 0 && <Badge ml={1} colorScheme="purple">{appointments.length}</Badge>}</Tab>
          <Tab><Icon as={FaPaperclip} mr={2} /> Documents {documents.length > 0 && <Badge ml={1} colorScheme="orange">{documents.length}</Badge>}</Tab>
        </TabList>
        
        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* Medical Summary */}
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={4}>Medical Summary</Heading>
                <VStack align="start" spacing={3}>
                  <HStack width="100%" justify="space-between">
                    <Text fontWeight="bold">Blood Type:</Text>
                    <Text>{patient.bloodType || 'Not recorded'}</Text>
                  </HStack>
                  <HStack width="100%" justify="space-between">
                    <Text fontWeight="bold">Allergies:</Text>
                    <Text>{patient.allergies?.join(', ') || 'None recorded'}</Text>
                  </HStack>
                  <HStack width="100%" justify="space-between">
                    <Text fontWeight="bold">Chronic Conditions:</Text>
                    <Text>{patient.chronicConditions?.join(', ') || 'None recorded'}</Text>
                  </HStack>
                  <HStack width="100%" justify="space-between">
                    <Text fontWeight="bold">Medications:</Text>
                    <Text>{patient.currentMedications?.join(', ') || 'None recorded'}</Text>
                  </HStack>
                  <HStack width="100%" justify="space-between">
                    <Text fontWeight="bold">Emergency Contact:</Text>
                    <Text>{patient.emergencyContact?.name || 'Not provided'}</Text>
                  </HStack>
                </VStack>
              </Box>
              
              {/* Activity Summary */}
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={4}>Activity Summary</Heading>
                <SimpleGrid columns={2} spacing={6}>
                  <Stat>
                    <StatLabel>Medical Records</StatLabel>
                    <StatNumber>{medicalRecords.length}</StatNumber>
                    <StatHelpText>
                      Last visit: {formatDate(patient.lastVisit) || 'Never'}
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Bills</StatLabel>
                    <StatNumber>{bills.length}</StatNumber>
                    <StatHelpText>
                      {bills.filter(b => b.status === 'pending' || b.status === 'overdue').length} pending
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Appointments</StatLabel>
                    <StatNumber>{appointments.length}</StatNumber>
                    <StatHelpText>
                      {appointments.filter(a => new Date(a.startTime) > new Date()).length} upcoming
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Documents</StatLabel>
                    <StatNumber>{documents.length}</StatNumber>
                    <StatHelpText>
                      Across all services
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
              </Box>
            </SimpleGrid>
            
            {/* Recent Activity */}
            <Box mt={8} p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Recent Activity</Heading>
              {/* Combine and sort recent records, bills, and appointments */}
              {(medicalRecords.length === 0 && bills.length === 0 && appointments.length === 0) ? (
                <Text color="gray.500">No recent activity</Text>
              ) : (
                <VStack align="stretch" spacing={4} divider={<Divider />}>
                  {[...medicalRecords, ...bills, ...appointments]
                    .sort((a, b) => new Date(b.visitDate || b.billDate || b.startTime) - new Date(a.visitDate || a.billDate || a.startTime))
                    .slice(0, 5)
                    .map((item, index) => {
                      // Determine item type
                      const isRecord = 'visitDate' in item;
                      const isBill = 'billNumber' in item;
                      const isAppointment = 'startTime' in item;
                      
                      return (
                        <Flex key={index} justify="space-between" align="center">
                          <HStack>
                            <Icon 
                              as={isRecord ? FaFileMedical : isBill ? FaFileInvoiceDollar : FaCalendarAlt} 
                              color={isRecord ? 'blue.500' : isBill ? 'green.500' : 'purple.500'}
                              boxSize={5}
                            />
                            <Box>
                              <Text fontWeight="medium">
                                {isRecord ? 'Medical Visit' : 
                                  isBill ? `Bill #${item.billNumber}` : 
                                  `Appointment with Dr. ${item.doctorId?.name || 'Unknown'}`}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                {isRecord ? item.chiefComplaint?.substring(0, 50) : 
                                  isBill ? `Amount: ${billService.formatCurrency(item.totalAmount)}` : 
                                  item.serviceType}
                              </Text>
                            </Box>
                          </HStack>
                          <Text fontSize="sm">
                            {formatDate(item.visitDate || item.billDate || item.startTime)}
                          </Text>
                        </Flex>
                      );
                    })}
                </VStack>
              )}
            </Box>
          </TabPanel>
          
          {/* Medical Records Tab */}
          <TabPanel>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Medical Records</Heading>
              {medicalRecords.length > 0 ? (
                <Box overflowX="auto">
                  <Box as="table" width="100%">
                    <Box as="thead" bg="gray.50">
                      <Box as="tr">
                        <Box as="th" textAlign="left" p={2}>Date</Box>
                        <Box as="th" textAlign="left" p={2}>Doctor</Box>
                        <Box as="th" textAlign="left" p={2}>Visit Type</Box>
                        <Box as="th" textAlign="left" p={2}>Chief Complaint</Box>
                        <Box as="th" textAlign="left" p={2}>Diagnoses</Box>
                        <Box as="th" textAlign="left" p={2}>Actions</Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {medicalRecords.map((record, index) => (
                        <Box as="tr" key={index} borderBottomWidth="1px" borderColor="gray.200">
                          <Box as="td" p={2}>{formatDate(record.visitDate)}</Box>
                          <Box as="td" p={2}>{record.doctorId?.name || 'Unknown'}</Box>
                          <Box as="td" p={2}>
                            <Badge colorScheme="blue">
                              {record.visitType?.replace('_', ' ')}
                            </Badge>
                          </Box>
                          <Box as="td" p={2}>{record.chiefComplaint?.substring(0, 50) || 'Not recorded'}</Box>
                          <Box as="td" p={2}>
                            {record.diagnoses && record.diagnoses.length > 0 
                              ? record.diagnoses.map((d, i) => (
                                <Badge key={i} mr={1} mb={1} colorScheme={d.type === 'primary' ? 'red' : 'gray'}>
                                  {d.description?.substring(0, 20)}
                                </Badge>
                              ))
                              : 'None recorded'
                            }
                          </Box>
                          <Box as="td" p={2}>
                            <Button size="sm" colorScheme="blue" as="a" href={`/ehr/records/${record._id}`} target="_blank">
                              View
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Text color="gray.500">No medical records found.</Text>
              )}
            </Box>
          </TabPanel>
          
          {/* Billing Tab */}
          <TabPanel>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Billing History</Heading>
              {bills.length > 0 ? (
                <Box overflowX="auto">
                  <Box as="table" width="100%">
                    <Box as="thead" bg="gray.50">
                      <Box as="tr">
                        <Box as="th" textAlign="left" p={2}>Bill #</Box>
                        <Box as="th" textAlign="left" p={2}>Date</Box>
                        <Box as="th" textAlign="left" p={2}>Due Date</Box>
                        <Box as="th" textAlign="right" p={2}>Amount</Box>
                        <Box as="th" textAlign="right" p={2}>Paid</Box>
                        <Box as="th" textAlign="center" p={2}>Status</Box>
                        <Box as="th" textAlign="left" p={2}>Actions</Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {bills.map((bill, index) => (
                        <Box as="tr" key={index} borderBottomWidth="1px" borderColor="gray.200">
                          <Box as="td" p={2}>{bill.billNumber}</Box>
                          <Box as="td" p={2}>{formatDate(bill.billDate)}</Box>
                          <Box as="td" p={2}>{formatDate(bill.dueDate)}</Box>
                          <Box as="td" textAlign="right" p={2}>{billService.formatCurrency(bill.totalAmount)}</Box>
                          <Box as="td" textAlign="right" p={2}>{billService.formatCurrency(bill.paidAmount)}</Box>
                          <Box as="td" textAlign="center" p={2}>
                            <Badge 
                              colorScheme={
                                bill.status === 'paid' ? 'green' : 
                                bill.status === 'partially_paid' ? 'blue' : 
                                bill.status === 'overdue' ? 'red' : 
                                bill.status === 'cancelled' ? 'gray' : 'yellow'
                              }
                            >
                              {bill.status?.replace('_', ' ')}
                            </Badge>
                          </Box>
                          <Box as="td" p={2}>
                            <Button size="sm" colorScheme="blue" as="a" href={`/billing/bills/${bill._id}`} target="_blank">
                              View
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Text color="gray.500">No billing history found.</Text>
              )}
            </Box>
          </TabPanel>
          
          {/* Appointments Tab */}
          <TabPanel>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Appointments</Heading>
              {appointments.length > 0 ? (
                <Box overflowX="auto">
                  <Box as="table" width="100%">
                    <Box as="thead" bg="gray.50">
                      <Box as="tr">
                        <Box as="th" textAlign="left" p={2}>Date</Box>
                        <Box as="th" textAlign="left" p={2}>Time</Box>
                        <Box as="th" textAlign="left" p={2}>Doctor</Box>
                        <Box as="th" textAlign="left" p={2}>Service</Box>
                        <Box as="th" textAlign="center" p={2}>Status</Box>
                        <Box as="th" textAlign="left" p={2}>Actions</Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {appointments.map((appointment, index) => {
                        const appointmentDate = new Date(appointment.startTime);
                        const now = new Date();
                        const isPast = appointmentDate < now;
                        
                        return (
                          <Box as="tr" key={index} borderBottomWidth="1px" borderColor="gray.200">
                            <Box as="td" p={2}>{formatDate(appointment.startTime)}</Box>
                            <Box as="td" p={2}>
                              {appointmentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </Box>
                            <Box as="td" p={2}>{appointment.doctorId?.name || 'Unknown'}</Box>
                            <Box as="td" p={2}>{appointment.serviceType || 'General'}</Box>
                            <Box as="td" textAlign="center" p={2}>
                              <Badge 
                                colorScheme={
                                  appointment.status === 'cancelled' ? 'red' : 
                                  appointment.status === 'completed' ? 'green' : 
                                  isPast ? 'gray' : 'blue'
                                }
                              >
                                {appointment.status || (isPast ? 'Past' : 'Scheduled')}
                              </Badge>
                            </Box>
                            <Box as="td" p={2}>
                              <Button size="sm" colorScheme="blue" as="a" href={`/appointments/${appointment._id}`} target="_blank">
                                View
                              </Button>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Text color="gray.500">No appointments found.</Text>
              )}
            </Box>
          </TabPanel>
          
          {/* Documents Tab */}
          <TabPanel>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Patient Documents</Heading>
              {documents.length > 0 ? (
                <VStack align="stretch" spacing={4}>
                  {documents.map((document, index) => (
                    <Box 
                      key={index} 
                      borderWidth="1px" 
                      borderRadius="md" 
                      p={4}
                      _hover={{ bg: 'gray.50' }}
                    >
                      <Flex justify="space-between" align="center">
                        <HStack spacing={4}>
                          <Icon 
                            as={document.source === 'medical_record' ? FaFileMedical : FaFileInvoiceDollar} 
                            color={document.source === 'medical_record' ? 'blue.500' : 'green.500'}
                            boxSize={6}
                          />
                          <Box>
                            <Text fontWeight="bold">{document.name}</Text>
                            <HStack mt={1}>
                              <Badge colorScheme={document.source === 'medical_record' ? 'blue' : 'green'}>
                                {document.source === 'medical_record' ? 'Medical Record' : 'Billing'}
                              </Badge>
                              <Text fontSize="sm" color="gray.500">
                                {formatDate(document.uploadedAt)} | {document.source === 'medical_record' ? `Dr. ${document.doctorName}` : `Bill #${document.billNumber}`}
                              </Text>
                            </HStack>
                          </Box>
                        </HStack>
                        
                        <HStack>
                          <Button 
                            size="sm" 
                            colorScheme="blue" 
                            onClick={() => window.open(document.url, '_blank')}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = document.url;
                              a.download = document.name || 'document';
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }}
                          >
                            Download
                          </Button>
                        </HStack>
                      </Flex>
                      
                      {document.description && (
                        <Text mt={2} fontSize="sm" color="gray.600">
                          {document.description}
                        </Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text color="gray.500">No documents found.</Text>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Profile Photo Upload Modal */}
      <Modal isOpen={photoModalDisclosure.isOpen} onClose={photoModalDisclosure.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Profile Photo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FileUpload
              accept="image/*"
              multiple={false}
              maxSize={5}
              buttonText="Choose Photo"
              onChange={handleProfilePhotoUpload}
              showPreview={true}
              previewSize={200}
              isDisabled={uploadingPhoto}
              uploadType="profile-picture"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={photoModalDisclosure.onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PatientProfile;
