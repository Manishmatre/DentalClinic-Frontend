import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import PatientLayout from '../../layouts/PatientLayout';
import DocumentLibrary from '../../components/common/DocumentLibrary';
import uploadService from '../../api/upload/uploadService';
import { documentService } from '../../api/documents/documentService';
import { useAuth } from '../../context/AuthContext';

/**
 * PatientDocuments page for viewing and managing patient documents
 * Allows patients to view their medical records, prescriptions, lab results, etc.
 */
const PatientDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  // Fetch patient documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await documentService.getMyDocuments();
        
        if (response.success) {
          // Transform the data to match our component's expected format
          const formattedDocuments = response.data.map(doc => ({
            id: doc._id,
            name: doc.name,
            category: doc.category.replace(/_/g, '-'), // Convert underscores to dashes for UI
            url: doc.url,
            publicId: doc.publicId,
            uploadedAt: doc.createdAt,
            description: doc.description || '',
            type: doc.type,
            uploadedBy: doc.uploadedBy?.name || 'System',
            doctorName: doc.doctorId?.name || null
          }));
          
          setDocuments(formattedDocuments);
        } else {
          throw new Error('Failed to fetch documents');
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load documents. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [toast]);

  // Handle document upload
  const handleUpload = async (files) => {
    try {
      // Create a FormData object for the file upload
      const formData = new FormData();
      
      // Add each file to the form data
      files.forEach(file => {
        // Get the actual file object
        const fileObj = file.file || file;
        formData.append('files', fileObj);
      });
      
      // Add category if available
      if (files[0]?.category) {
        formData.append('category', files[0].category);
      }
      
      // Add description if available
      if (files[0]?.description) {
        const metadata = { description: files[0].description };
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      // Upload the document using the document service
      const response = await documentService.uploadDocuments(user.patientId, formData);
      
      if (response.success) {
        // Refresh documents list
        const updatedDocsResponse = await documentService.getMyDocuments();
        if (updatedDocsResponse.success) {
          const formattedDocuments = updatedDocsResponse.data.map(doc => ({
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
        
        toast({
          title: 'Success',
          description: 'Document uploaded successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to upload document');
      }
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
      // Delete the document using the document service
      const response = await documentService.deleteDocument(document.id);
      
      if (response.success) {
        // Remove the document from the local state
        setDocuments(documents.filter(doc => doc.id !== document.id));
        
        toast({
          title: 'Success',
          description: 'Document deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to delete document');
      }
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

  return (
    <PatientLayout>
      <Container maxW="container.xl" py={6}>
        <Box mb={6}>
          <Heading size="lg" mb={2}>My Documents</Heading>
          <Text color="gray.600">
            View and manage your medical records, prescriptions, lab results, and other documents
          </Text>
        </Box>

        {loading ? (
          <Center py={10}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : (
          <DocumentLibrary
            documents={documents}
            onUpload={handleUpload}
            onDelete={handleDelete}
            patientId={user?.id}
            showUploadButton={true}
            title="My Medical Documents"
          />
        )}
      </Container>
    </PatientLayout>
  );
};

export default PatientDocuments;
