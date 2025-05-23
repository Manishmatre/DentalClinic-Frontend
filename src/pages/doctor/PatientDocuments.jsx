import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  useToast,
  Spinner,
  Center,
  Flex,
  Button,
  Select,
  InputGroup,
  InputLeftElement,
  Input,
  Icon,
  Divider
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaUserMd } from 'react-icons/fa';
import DoctorLayout from '../../layouts/DoctorLayout';
import DocumentLibrary from '../../components/common/DocumentLibrary';
import uploadService from '../../api/upload/uploadService';
import { useAuth } from '../../context/AuthContext';

/**
 * PatientDocuments page for doctors to view and manage patient documents
 * Allows doctors to view and upload medical records, prescriptions, lab results, etc.
 */
const PatientDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const { patientId } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Fetch patient details and documents on component mount
  useEffect(() => {
    const fetchPatientAndDocuments = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, these would be API calls to get patient details and documents
        // For now, we'll simulate with a timeout
        setTimeout(() => {
          // Sample patient data for demonstration
          const samplePatient = {
            id: patientId,
            name: 'John Doe',
            age: 42,
            gender: 'Male',
            phone: '(555) 123-4567',
            email: 'john.doe@example.com'
          };
          
          // Sample documents for demonstration
          const sampleDocuments = [
            {
              id: '1',
              name: 'Blood Test Results.pdf',
              category: 'lab-result',
              url: 'https://example.com/blood-test.pdf',
              publicId: 'documents/lab_results/blood_test_123',
              uploadedAt: '2025-05-20T10:30:00Z',
              description: 'Complete blood count and metabolic panel results'
            },
            {
              id: '2',
              name: 'Prescription - Antibiotics.pdf',
              category: 'prescription',
              url: 'https://example.com/prescription.pdf',
              publicId: 'documents/prescriptions/antibiotics_456',
              uploadedAt: '2025-05-18T14:15:00Z',
              description: 'Amoxicillin 500mg, 3 times daily for 7 days'
            },
            {
              id: '3',
              name: 'Medical History.docx',
              category: 'medical-record',
              url: 'https://example.com/medical-history.docx',
              publicId: 'documents/medical_records/history_789',
              uploadedAt: '2025-05-15T09:45:00Z',
              description: 'Complete medical history and previous conditions'
            },
            {
              id: '4',
              name: 'X-Ray Results.jpg',
              category: 'lab-result',
              url: 'https://example.com/xray.jpg',
              publicId: 'documents/lab_results/xray_012',
              uploadedAt: '2025-05-12T13:20:00Z',
              description: 'Chest X-Ray showing normal lung function'
            },
            {
              id: '5',
              name: 'Treatment Plan.pdf',
              category: 'medical-record',
              url: 'https://example.com/treatment-plan.pdf',
              publicId: 'documents/medical_records/treatment_345',
              uploadedAt: '2025-05-10T16:30:00Z',
              description: 'Comprehensive treatment plan for hypertension'
            }
          ];
          
          setPatient(samplePatient);
          setDocuments(sampleDocuments);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load patient data. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientAndDocuments();
    }
  }, [patientId, toast]);

  // Handle document upload
  const handleUpload = async (files) => {
    try {
      // In a real implementation, this would update the documents in the database
      // For now, we'll just add it to our local state
      const newDocuments = files.map(file => ({
        id: Date.now().toString(),
        name: file.name,
        category: file.category || 'general',
        url: file.url,
        publicId: file.publicId,
        uploadedAt: new Date().toISOString(),
        description: file.description || ''
      }));
      
      setDocuments([...newDocuments, ...documents]);
      
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle document deletion
  const handleDelete = async (document) => {
    try {
      // In a real implementation, this would delete the document from the database
      // For now, we'll just remove it from our local state
      setDocuments(documents.filter(doc => doc.id !== document.id));
      
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Go back to patient list or details
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <DoctorLayout>
      <Container maxW="container.xl" py={6}>
        <Button 
          leftIcon={<Icon as={FaArrowLeft} />} 
          variant="ghost" 
          mb={4}
          onClick={handleGoBack}
        >
          Back to Patient
        </Button>

        {loading ? (
          <Center py={10}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : (
          <>
            {patient && (
              <Box mb={6}>
                <Heading size="lg" mb={2}>
                  {patient.name}'s Documents
                </Heading>
                <Flex gap={4} color="gray.600" fontSize="sm">
                  <Text>Age: {patient.age}</Text>
                  <Text>Gender: {patient.gender}</Text>
                  <Text>Phone: {patient.phone}</Text>
                </Flex>
              </Box>
            )}

            <Divider mb={6} />

            <DocumentLibrary
              documents={documents}
              onUpload={handleUpload}
              onDelete={handleDelete}
              patientId={patientId}
              doctorId={user?.id}
              showUploadButton={true}
              title="Patient Medical Documents"
            />
          </>
        )}
      </Container>
    </DoctorLayout>
  );
};

export default PatientDocuments;
