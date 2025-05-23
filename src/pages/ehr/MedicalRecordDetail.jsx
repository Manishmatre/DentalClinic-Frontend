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
  List,
  ListItem,
  ListIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaPrint, 
  FaUserMd, 
  FaFileMedical,
  FaPaperclip,
  FaVial,
  FaPills,
  FaProcedures,
  FaCalendarCheck,
  FaListUl,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle
} from 'react-icons/fa';

import ehrService from '../../api/ehr/ehrService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AttachmentsSection from '../../components/ehr/AttachmentsSection';

const MedicalRecordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load medical record data
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const recordData = await ehrService.getMedicalRecordById(id);
        setRecord(recordData);
      } catch (error) {
        toast({
          title: 'Error loading medical record',
          description: error.message || 'Could not load record details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchRecord();
    }
  }, [id, toast]);
  
  // Handle attachments update
  const handleAttachmentsChange = (updatedAttachments) => {
    if (record) {
      setRecord({...record, attachments: updatedAttachments});
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format time from date
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString();
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!record) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading size="md" mb={4}>Medical Record not found</Heading>
        <Button leftIcon={<FaArrowLeft />} onClick={() => navigate('/ehr/records')}>
          Back to Records
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack>
          <Button leftIcon={<FaArrowLeft />} variant="outline" onClick={() => navigate('/ehr/records')}>
            Back
          </Button>
          <Heading size="lg">Medical Record</Heading>
          <Badge colorScheme="blue" px={2} py={1}>
            {record.visitType?.toUpperCase() || 'VISIT'}
          </Badge>
        </HStack>
        
        <HStack spacing={3}>
          <Button 
            leftIcon={<FaEdit />} 
            colorScheme="blue" 
            onClick={() => navigate(`/ehr/records/edit/${id}`)}
          >
            Edit
          </Button>
          <Button 
            leftIcon={<FaPrint />} 
            variant="outline" 
            onClick={() => ehrService.generatePdf(id)}
          >
            Print
          </Button>
        </HStack>
      </Flex>
      
      {/* Tabs */}
      <Tabs variant="enclosed" colorScheme="blue" isLazy>
        <TabList>
          <Tab><Icon as={FaFileMedical} mr={2} /> Overview</Tab>
          <Tab><Icon as={FaListUl} mr={2} /> History & Examination</Tab>
          <Tab><Icon as={FaVial} mr={2} /> Tests & Procedures</Tab>
          <Tab><Icon as={FaPills} mr={2} /> Medications</Tab>
          <Tab><Icon as={FaPaperclip} mr={2} /> Attachments {record.attachments?.length > 0 && <Badge ml={1} colorScheme="blue">{record.attachments.length}</Badge>}</Tab>
        </TabList>
        
        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* Patient & Doctor Info */}
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={4}>Visit Information</Heading>
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <VStack align="start">
                    <Text fontWeight="bold">Patient:</Text>
                    <Text>{record.patientId?.name || 'N/A'}</Text>
                    
                    <Text fontWeight="bold" mt={2}>Visit Date:</Text>
                    <Text>{formatDate(record.visitDate)}</Text>
                    
                    <Text fontWeight="bold" mt={2}>Visit Type:</Text>
                    <Text>{record.visitType?.replace('_', ' ') || 'N/A'}</Text>
                  </VStack>
                  
                  <VStack align="start">
                    <Text fontWeight="bold">Doctor:</Text>
                    <Text>{record.doctorId?.name || 'N/A'}</Text>
                    
                    <Text fontWeight="bold" mt={2}>Specialization:</Text>
                    <Text>{record.doctorId?.specialization || 'N/A'}</Text>
                    
                    <Text fontWeight="bold" mt={2}>Appointment:</Text>
                    <Text>
                      {record.appointmentId 
                        ? `${formatDate(record.appointmentId.startTime)} at ${formatTime(record.appointmentId.startTime)}` 
                        : 'No appointment linked'}
                    </Text>
                  </VStack>
                </Grid>
              </Box>
              
              {/* Vitals Summary */}
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={4}>Vital Signs</Heading>
                {record.vitals ? (
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel>Height</StatLabel>
                      <StatNumber>{record.vitals.height || 'N/A'}</StatNumber>
                      <StatHelpText>cm</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Weight</StatLabel>
                      <StatNumber>{record.vitals.weight || 'N/A'}</StatNumber>
                      <StatHelpText>kg</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>BMI</StatLabel>
                      <StatNumber>{record.vitals.bmi || 'N/A'}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Temperature</StatLabel>
                      <StatNumber>{record.vitals.temperature || 'N/A'}</StatNumber>
                      <StatHelpText>°C</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Blood Pressure</StatLabel>
                      <StatNumber>
                        {record.vitals.bloodPressure?.systolic 
                          ? `${record.vitals.bloodPressure.systolic}/${record.vitals.bloodPressure.diastolic}` 
                          : 'N/A'}
                      </StatNumber>
                      <StatHelpText>mmHg</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Heart Rate</StatLabel>
                      <StatNumber>{record.vitals.heartRate || 'N/A'}</StatNumber>
                      <StatHelpText>bpm</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Respiratory Rate</StatLabel>
                      <StatNumber>{record.vitals.respiratoryRate || 'N/A'}</StatNumber>
                      <StatHelpText>breaths/min</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Oxygen Saturation</StatLabel>
                      <StatNumber>{record.vitals.oxygenSaturation || 'N/A'}</StatNumber>
                      <StatHelpText>%</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                ) : (
                  <Text color="gray.500">No vital signs recorded.</Text>
                )}
              </Box>
            </SimpleGrid>
            
            {/* Diagnoses */}
            <Box mt={8} p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Diagnoses</Heading>
              {record.diagnoses && record.diagnoses.length > 0 ? (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Diagnosis</Th>
                      <Th>Code</Th>
                      <Th>Type</Th>
                      <Th>Notes</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {record.diagnoses.map((diagnosis, index) => (
                      <Tr key={index}>
                        <Td fontWeight={diagnosis.type === 'primary' ? 'bold' : 'normal'}>
                          {diagnosis.description}
                        </Td>
                        <Td>{diagnosis.code || 'N/A'}</Td>
                        <Td>
                          <Badge colorScheme={
                            diagnosis.type === 'primary' ? 'red' :
                            diagnosis.type === 'secondary' ? 'blue' : 'purple'
                          }>
                            {diagnosis.type || 'N/A'}
                          </Badge>
                        </Td>
                        <Td>{diagnosis.notes || 'N/A'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Text color="gray.500">No diagnoses recorded.</Text>
              )}
            </Box>
            
            {/* Treatment Plan Summary */}
            <Box mt={8} p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Treatment Plan</Heading>
              <Text whiteSpace="pre-wrap">{record.treatmentPlan || 'No treatment plan recorded.'}</Text>
            </Box>
            
            {/* Follow-up */}
            <Box mt={8} p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Follow-up</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <VStack align="start">
                  <Text fontWeight="bold">Follow-up Date:</Text>
                  <Text>{formatDate(record.followUpDate) || 'No follow-up scheduled'}</Text>
                  
                  <Text fontWeight="bold" mt={2}>Follow-up Instructions:</Text>
                  <Text whiteSpace="pre-wrap">{record.followUpInstructions || 'No instructions provided.'}</Text>
                </VStack>
                
                <VStack align="start">
                  <Text fontWeight="bold">Patient Education:</Text>
                  <Text whiteSpace="pre-wrap">{record.patientEducation || 'No education provided.'}</Text>
                  
                  <Text fontWeight="bold" mt={2}>Activity Restrictions:</Text>
                  <Text whiteSpace="pre-wrap">{record.activityRestrictions || 'No restrictions specified.'}</Text>
                </VStack>
              </SimpleGrid>
            </Box>
          </TabPanel>
          
          {/* History & Examination Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* Chief Complaint */}
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={4}>Chief Complaint</Heading>
                <Text whiteSpace="pre-wrap">{record.chiefComplaint || 'Not recorded.'}</Text>
              </Box>
              
              {/* Present Illness */}
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={4}>Present Illness History</Heading>
                <Text whiteSpace="pre-wrap">{record.presentIllnessHistory || 'Not recorded.'}</Text>
              </Box>
            </SimpleGrid>
            
            {/* Symptoms */}
            <Box mt={8} p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Symptoms</Heading>
              {record.symptoms && record.symptoms.length > 0 ? (
                <List spacing={2}>
                  {record.symptoms.map((symptom, index) => (
                    <ListItem key={index}>
                      <ListIcon as={FaInfoCircle} color="blue.500" />
                      {symptom}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Text color="gray.500">No symptoms recorded.</Text>
              )}
              
              {record.symptomsNotes && (
                <Box mt={4}>
                  <Text fontWeight="bold">Notes:</Text>
                  <Text whiteSpace="pre-wrap">{record.symptomsNotes}</Text>
                </Box>
              )}
            </Box>
            
            {/* Physical Examination */}
            <Box mt={8} p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Physical Examination</Heading>
              <Text whiteSpace="pre-wrap">{record.physicalExamination || 'No physical examination recorded.'}</Text>
            </Box>
          </TabPanel>
          
          {/* Tests & Procedures Tab */}
          <TabPanel>
            {/* Lab Tests */}
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" mb={8}>
              <Heading size="md" mb={4}>Lab Tests</Heading>
              {record.labTests && record.labTests.length > 0 ? (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Test</Th>
                      <Th>Status</Th>
                      <Th>Ordered Date</Th>
                      <Th>Completed Date</Th>
                      <Th>Results</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {record.labTests.map((test, index) => (
                      <Tr key={index}>
                        <Td>{test.name}</Td>
                        <Td>
                          <Badge colorScheme={
                            test.status === 'completed' ? 'green' :
                            test.status === 'ordered' ? 'blue' : 'red'
                          }>
                            {test.status}
                          </Badge>
                        </Td>
                        <Td>{formatDate(test.orderedDate)}</Td>
                        <Td>{formatDate(test.completedDate) || 'N/A'}</Td>
                        <Td>{test.results || 'N/A'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Text color="gray.500">No lab tests ordered.</Text>
              )}
            </Box>
            
            {/* Procedures */}
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Procedures</Heading>
              {record.procedures && record.procedures.length > 0 ? (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Procedure</Th>
                      <Th>Scheduled Date</Th>
                      <Th>Description</Th>
                      <Th>Notes</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {record.procedures.map((procedure, index) => (
                      <Tr key={index}>
                        <Td fontWeight="medium">{procedure.name}</Td>
                        <Td>{formatDate(procedure.scheduledDate) || 'Not scheduled'}</Td>
                        <Td>{procedure.description || 'N/A'}</Td>
                        <Td>{procedure.notes || 'N/A'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Text color="gray.500">No procedures planned.</Text>
              )}
            </Box>
          </TabPanel>
          
          {/* Medications Tab */}
          <TabPanel>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <Heading size="md" mb={4}>Medications</Heading>
              {record.medications && record.medications.length > 0 ? (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Medication</Th>
                      <Th>Dosage</Th>
                      <Th>Frequency</Th>
                      <Th>Duration</Th>
                      <Th>Instructions</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {record.medications.map((medication, index) => (
                      <Tr key={index}>
                        <Td fontWeight="medium">{medication.name}</Td>
                        <Td>{medication.dosage || 'N/A'}</Td>
                        <Td>{medication.frequency || 'N/A'}</Td>
                        <Td>{medication.duration || 'N/A'}</Td>
                        <Td>{medication.instructions || 'N/A'}</Td>
                        <Td>
                          <Badge colorScheme={medication.prescribed ? 'green' : 'blue'}>
                            {medication.prescribed ? 'Prescribed' : 'Recommended'}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Text color="gray.500">No medications prescribed.</Text>
              )}
            </Box>
            
            {/* Dietary Recommendations */}
            {record.dietaryRecommendations && (
              <Box mt={8} p={5} shadow="md" borderWidth="1px" borderRadius="md">
                <Heading size="md" mb={4}>Dietary Recommendations</Heading>
                <Text whiteSpace="pre-wrap">{record.dietaryRecommendations}</Text>
              </Box>
            )}
          </TabPanel>
          
          {/* Attachments Tab */}
          <TabPanel>
            <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
              <AttachmentsSection
                medicalRecordId={id}
                attachments={record.attachments || []}
                onAttachmentsChange={handleAttachmentsChange}
              />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default MedicalRecordDetail;
