import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Spinner,
  Center,
  Button,
  Flex,
  useToast,
  Badge,
  Card,
  CardBody,
  Stack,
  StackDivider,
  HStack,
  VStack,
  Grid,
  GridItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import DoctorLayout from '../../layouts/DoctorLayout';
import patientService from '../../api/patients/patientService';
import appointmentService from '../../api/appointments/appointmentService';
import { documentService } from '../../api/documents/documentService';
import DocumentLibrary from '../../components/common/DocumentLibrary';

/**
 * PatientMedicalHistory page for doctors to view and manage a patient's medical history
 */
const PatientMedicalHistory = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [medicalNotes, setMedicalNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'general' });
  const toast = useToast();
  const navigate = useNavigate();
  
  const { 
    isOpen: isAddNoteOpen, 
    onOpen: onAddNoteOpen, 
    onClose: onAddNoteClose 
  } = useDisclosure();

  // Fetch patient data on component mount
  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient details
      const patientResponse = await patientService.getPatientById(patientId);
      if (!patientResponse.success) {
        throw new Error(patientResponse.message || 'Failed to fetch patient details');
      }
      setPatient(patientResponse.data);
      
      // Fetch patient appointments
      const appointmentsResponse = await appointmentService.getPatientAppointments(patientId);
      if (appointmentsResponse.success) {
        setAppointments(appointmentsResponse.data);
      }
      
      // Fetch patient documents
      const documentsResponse = await documentService.getDocuments(patientId);
      if (documentsResponse.success) {
        const formattedDocuments = documentsResponse.data.map(doc => ({
          id: doc._id,
          name: doc.name,
          category: doc.category.replace(/_/g, '-'),
          url: doc.url,
          publicId: doc.publicId,
          uploadedAt: doc.createdAt,
          description: doc.description || '',
          type: doc.type,
          uploadedBy: doc.uploadedBy?.name || 'System',
          doctorName: doc.doctorId?.name || null
        }));
        setDocuments(formattedDocuments);
      }
      
      // Fetch medical notes (assuming this endpoint exists)
      // This would need to be implemented in the backend
      const notesResponse = await patientService.getPatientMedicalNotes(patientId);
      if (notesResponse.success) {
        setMedicalNotes(notesResponse.data);
      }
      
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load patient data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/doctor/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    try {
      if (!newNote.title || !newNote.content) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      const response = await patientService.addPatientMedicalNote(patientId, newNote);
      if (response.success) {
        setMedicalNotes([...medicalNotes, response.data]);
        setNewNote({ title: '', content: '', category: 'general' });
        onAddNoteClose();
        toast({
          title: 'Success',
          description: 'Medical note added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(response.message || 'Failed to add medical note');
      }
    } catch (error) {
      console.error('Error adding medical note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add medical note. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <Center h="calc(100vh - 100px)">
          <Spinner size="xl" color="blue.500" />
        </Center>
      </DoctorLayout>
    );
  }

  if (!patient) {
    return (
      <DoctorLayout>
        <Container maxW="container.xl" py={6}>
          <Box textAlign="center" py={10}>
            <Heading as="h2" size="lg" mb={4}>Patient Not Found</Heading>
            <Text mb={6}>The patient you're looking for doesn't exist or you don't have permission to view their details.</Text>
            <Button colorScheme="blue" onClick={() => navigate('/doctor/patients')}>
              Back to Patients
            </Button>
          </Box>
        </Container>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <Container maxW="container.xl" py={6}>
        <Box mb={6}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Heading as="h1" size="xl">{patient.name}</Heading>
              <HStack mt={2} spacing={4}>
                <Text color="gray.600">
                  <strong>ID:</strong> {patient.idNumber || 'N/A'}
                </Text>
                <Text color="gray.600">
                  <strong>Age:</strong> {patient.age || 'N/A'}
                </Text>
                <Text color="gray.600">
                  <strong>Gender:</strong> {patient.gender || 'N/A'}
                </Text>
                <Badge colorScheme={patient.status === 'active' ? 'green' : 'red'}>
                  {patient.status || 'Unknown'}
                </Badge>
              </HStack>
            </Box>
            <Button 
              colorScheme="blue" 
              onClick={() => navigate(`/doctor/patients`)}
            >
              Back to Patients
            </Button>
          </Flex>
        </Box>

        <Tabs colorScheme="blue" isLazy>
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Medical Notes</Tab>
            <Tab>Appointments</Tab>
            <Tab>Documents</Tab>
            <Tab>Test Results</Tab>
            <Tab>Prescriptions</Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                <GridItem colSpan={{ base: 12, md: 6 }}>
                  <Card>
                    <CardBody>
                      <Heading size="md" mb={4}>Personal Information</Heading>
                      <Stack divider={<StackDivider />} spacing={4}>
                        <Box>
                          <Text fontWeight="bold">Full Name</Text>
                          <Text>{patient.name}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Email</Text>
                          <Text>{patient.email || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Phone</Text>
                          <Text>{patient.phone || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Address</Text>
                          <Text>{patient.address || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Date of Birth</Text>
                          <Text>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</Text>
                        </Box>
                      </Stack>
                    </CardBody>
                  </Card>
                </GridItem>

                <GridItem colSpan={{ base: 12, md: 6 }}>
                  <Card mb={6}>
                    <CardBody>
                      <Heading size="md" mb={4}>Medical Information</Heading>
                      <Stack divider={<StackDivider />} spacing={4}>
                        <Box>
                          <Text fontWeight="bold">Blood Type</Text>
                          <Text>{patient.bloodType || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Allergies</Text>
                          <Text>{patient.allergies || 'None reported'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Chronic Conditions</Text>
                          <Text>{patient.chronicConditions || 'None reported'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Current Medications</Text>
                          <Text>{patient.currentMedications || 'None reported'}</Text>
                        </Box>
                      </Stack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <Heading size="md" mb={4}>Emergency Contact</Heading>
                      <Stack divider={<StackDivider />} spacing={4}>
                        <Box>
                          <Text fontWeight="bold">Name</Text>
                          <Text>{patient.emergencyContact?.name || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Relationship</Text>
                          <Text>{patient.emergencyContact?.relationship || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Phone</Text>
                          <Text>{patient.emergencyContact?.phone || 'N/A'}</Text>
                        </Box>
                      </Stack>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </TabPanel>

            {/* Medical Notes Tab */}
            <TabPanel>
              <Flex justifyContent="space-between" alignItems="center" mb={6}>
                <Heading size="md">Medical Notes</Heading>
                <Button 
                  leftIcon={<AddIcon />} 
                  colorScheme="blue" 
                  onClick={onAddNoteOpen}
                >
                  Add Note
                </Button>
              </Flex>

              {medicalNotes.length === 0 ? (
                <Box textAlign="center" py={10} borderRadius="md" bg="gray.50">
                  <Text fontSize="lg" mb={4}>No medical notes found</Text>
                  <Button colorScheme="blue" onClick={onAddNoteOpen}>
                    Add First Note
                  </Button>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {medicalNotes.map((note) => (
                    <Card key={note._id}>
                      <CardBody>
                        <Flex justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Heading size="sm" mb={2}>{note.title}</Heading>
                            <HStack mb={3}>
                              <Badge colorScheme="blue">{note.category}</Badge>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(note.createdAt).toLocaleDateString()} by {note.createdBy?.name || 'Unknown'}
                              </Text>
                            </HStack>
                            <Text>{note.content}</Text>
                          </Box>
                          <Button 
                            leftIcon={<EditIcon />} 
                            size="sm" 
                            variant="ghost"
                          >
                            Edit
                          </Button>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </TabPanel>

            {/* Appointments Tab */}
            <TabPanel>
              <Flex justifyContent="space-between" alignItems="center" mb={6}>
                <Heading size="md">Appointment History</Heading>
                <Button 
                  leftIcon={<AddIcon />} 
                  colorScheme="blue" 
                  onClick={() => navigate(`/doctor/appointment-management?patientId=${patientId}`)}
                >
                  Schedule Appointment
                </Button>
              </Flex>

              {appointments.length === 0 ? (
                <Box textAlign="center" py={10} borderRadius="md" bg="gray.50">
                  <Text fontSize="lg" mb={4}>No appointments found</Text>
                  <Button 
                    colorScheme="blue" 
                    onClick={() => navigate(`/doctor/appointment-management?patientId=${patientId}`)}
                  >
                    Schedule First Appointment
                  </Button>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {appointments.map((appointment) => (
                    <Card key={appointment._id}>
                      <CardBody>
                        <Flex justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Heading size="sm" mb={2}>{appointment.title || 'Appointment'}</Heading>
                            <HStack mb={3}>
                              <Badge colorScheme={
                                appointment.status === 'completed' ? 'green' : 
                                appointment.status === 'cancelled' ? 'red' : 
                                appointment.status === 'confirmed' ? 'blue' : 'yellow'
                              }>
                                {appointment.status}
                              </Badge>
                              <Text fontSize="sm" color="gray.500">
                                {new Date(appointment.startTime).toLocaleString()}
                              </Text>
                            </HStack>
                            <Text>{appointment.notes || 'No notes available'}</Text>
                          </Box>
                          <Button 
                            size="sm" 
                            colorScheme="blue" 
                            variant="outline"
                            onClick={() => navigate(`/doctor/appointment-management?appointmentId=${appointment._id}`)}
                          >
                            View Details
                          </Button>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              )}
            </TabPanel>

            {/* Documents Tab */}
            <TabPanel>
              <Flex justifyContent="space-between" alignItems="center" mb={6}>
                <Heading size="md">Patient Documents</Heading>
                <Button 
                  leftIcon={<AddIcon />} 
                  colorScheme="blue" 
                  onClick={() => navigate(`/doctor/patient/${patientId}/documents`)}
                >
                  Manage Documents
                </Button>
              </Flex>

              {documents.length === 0 ? (
                <Box textAlign="center" py={10} borderRadius="md" bg="gray.50">
                  <Text fontSize="lg" mb={4}>No documents found</Text>
                  <Button 
                    colorScheme="blue" 
                    onClick={() => navigate(`/doctor/patient/${patientId}/documents`)}
                  >
                    Upload Documents
                  </Button>
                </Box>
              ) : (
                <DocumentLibrary 
                  documents={documents}
                  categories={documentService.getDocumentCategories()}
                  onViewAll={() => navigate(`/doctor/patient/${patientId}/documents`)}
                />
              )}
            </TabPanel>

            {/* Test Results Tab */}
            <TabPanel>
              <Box textAlign="center" py={10} borderRadius="md" bg="gray.50">
                <Text fontSize="lg" mb={4}>Test Results feature coming soon</Text>
                <Button 
                  colorScheme="blue" 
                  onClick={() => navigate(`/doctor/patients`)}
                >
                  Back to Patients
                </Button>
              </Box>
            </TabPanel>

            {/* Prescriptions Tab */}
            <TabPanel>
              <Box textAlign="center" py={10} borderRadius="md" bg="gray.50">
                <Text fontSize="lg" mb={4}>Prescriptions feature coming soon</Text>
                <Button 
                  colorScheme="blue" 
                  onClick={() => navigate(`/doctor/patients`)}
                >
                  Back to Patients
                </Button>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* Add Medical Note Modal */}
      <Modal isOpen={isAddNoteOpen} onClose={onAddNoteClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Medical Note</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Title</FormLabel>
              <Input 
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                placeholder="Enter note title"
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Category</FormLabel>
              <Select 
                value={newNote.category}
                onChange={(e) => setNewNote({...newNote, category: e.target.value})}
              >
                <option value="general">General</option>
                <option value="diagnosis">Diagnosis</option>
                <option value="treatment">Treatment</option>
                <option value="medication">Medication</option>
                <option value="follow-up">Follow-up</option>
                <option value="lab-result">Lab Result</option>
                <option value="procedure">Procedure</option>
                <option value="allergy">Allergy</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Content</FormLabel>
              <Textarea 
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                placeholder="Enter note content"
                rows={6}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddNoteClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddNote}>
              Save Note
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DoctorLayout>
  );
};

export default PatientMedicalHistory;
