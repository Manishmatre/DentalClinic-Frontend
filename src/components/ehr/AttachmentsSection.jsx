import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  HStack,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
  Badge,
  Divider,
  Flex,
  Icon
} from '@chakra-ui/react';
import { FaUpload, FaDownload, FaEye, FaTrash, FaFilter } from 'react-icons/fa';
import FileUpload from '../common/FileUpload';
import ImageGallery from '../common/ImageGallery';
import LoadingSpinner from '../common/LoadingSpinner';
import ehrService from '../../api/ehr/ehrService';
import uploadService from '../../api/upload/uploadService';

/**
 * Component to manage medical record attachments with Cloudinary integration
 */
const AttachmentsSection = ({ medicalRecordId, attachments = [], onAttachmentsChange, readOnly = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState(attachments || []);
  const [filteredAttachments, setFilteredAttachments] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // File metadata state
  const [fileMetadata, setFileMetadata] = useState({
    description: '',
    category: 'other',
    tags: ''
  });

  // Process attachments when they change
  useEffect(() => {
    setCurrentAttachments(attachments || []);
    filterAttachments(activeCategory, attachments);
  }, [attachments]);

  // Filter attachments by category
  const filterAttachments = (category, attachmentsToFilter = currentAttachments) => {
    setActiveCategory(category);
    
    if (category === 'all') {
      setFilteredAttachments(attachmentsToFilter);
    } else {
      setFilteredAttachments(
        attachmentsToFilter.filter(attachment => attachment.category === category)
      );
    }
  };

  // Handle file upload completion
  const handleUploadComplete = (files) => {
    // Ensure files is always treated as an array
    const fileArray = Array.isArray(files) ? files : [files];
    
    // Filter out any null or undefined values
    const validFiles = fileArray.filter(file => file && file.url);
    
    if (validFiles.length === 0) {
      toast({
        title: 'Upload failed',
        description: 'No valid files were uploaded',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    setUploadedFiles(validFiles);
    onOpen(); // Open metadata modal
  };

  // Save attachment to medical record
  const handleSaveAttachment = async () => {
    if (!uploadedFiles.length) {
      toast({
        title: 'No files uploaded',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    setIsLoading(true);

    try {
      // Process tags from string to array
      const tagsArray = fileMetadata.tags
        ? fileMetadata.tags.split(',').map(tag => tag.trim())
        : [];

      // Save each uploaded file as an attachment
      for (const file of uploadedFiles) {
        // For files uploaded via the uploadService, the structure may be different
        // Extract the file data correctly based on the response structure
        const fileData = file.file || file;
        
        const attachmentData = {
          name: fileData.originalname || fileData.name || 'Unnamed file',
          fileType: fileData.fileType || (fileData.name ? fileData.name.split('.').pop() : 'unknown'),
          mimeType: fileData.mimetype || fileData.mimeType || fileData.type || 'application/octet-stream',
          url: fileData.url || fileData.path,
          publicId: fileData.public_id || fileData.publicId,
          size: fileData.size || 0,
          description: fileMetadata.description,
          category: fileMetadata.category,
          tags: [...tagsArray, 'medical-record', fileMetadata.category], // Ensure medical-record tag is included
          uploadedAt: new Date()
        };

        // Call API to add attachment to medical record
        const result = await ehrService.addAttachment(medicalRecordId, attachmentData);

        if (result.error) {
          throw new Error(result.error);
        }

        // Update attachments list
        if (result.attachments) {
          setCurrentAttachments(result.attachments);
          filterAttachments(activeCategory, result.attachments);
          
          if (onAttachmentsChange) {
            onAttachmentsChange(result.attachments);
          }
        }
      }

      // Reset form and close modal
      setFileMetadata({
        description: '',
        category: 'other',
        tags: ''
      });
      setUploadedFiles([]);
      onClose();

      toast({
        title: 'Attachment added',
        description: 'File has been successfully attached to the medical record',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Failed to add attachment',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete attachment
  const handleDeleteAttachment = async (attachmentId) => {
    if (!attachmentId || readOnly) return;

    if (!window.confirm('Are you sure you want to delete this attachment?')) {
      return;
    }
    
    // Find the attachment to get its publicId
    const attachment = currentAttachments.find(att => att._id === attachmentId);

    setIsLoading(true);

    try {
      // If attachment has a publicId, delete it from Cloudinary first
      if (attachment && attachment.publicId) {
        await uploadService.deleteFile(attachment.publicId);
      }
      
      // Then remove it from the medical record
      const result = await ehrService.removeAttachment(medicalRecordId, attachmentId);

      if (result.error) {
        throw new Error(result.error);
      }

      // Update attachments list
      if (result.attachments) {
        setCurrentAttachments(result.attachments);
        filterAttachments(activeCategory, result.attachments);
        
        if (onAttachmentsChange) {
          onAttachmentsChange(result.attachments);
        }
      }

      toast({
        title: 'Attachment deleted',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Failed to delete attachment',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format attachments for ImageGallery component
  const formatAttachmentsForGallery = (attachments) => {
    return attachments.map(attachment => ({
      name: attachment.name,
      url: attachment.url,
      publicId: attachment.publicId,
      mimeType: attachment.mimeType,
      description: attachment.description,
      id: attachment._id,
      uploadedAt: attachment.uploadedAt,
      category: attachment.category
    }));
  };

  // Render category badge
  const getCategoryBadge = (category) => {
    const categoryColors = {
      lab_result: 'purple',
      imaging: 'blue',
      prescription: 'green',
      consent_form: 'orange',
      referral: 'teal',
      other: 'gray'
    };

    const categoryLabels = {
      lab_result: 'Lab Result',
      imaging: 'Imaging',
      prescription: 'Prescription',
      consent_form: 'Consent Form',
      referral: 'Referral',
      other: 'Other'
    };

    return (
      <Badge colorScheme={categoryColors[category] || 'gray'}>
        {categoryLabels[category] || 'Other'}
      </Badge>
    );
  };

  return (
    <Box>
      <Heading size="md" mb={4}>
        Medical Record Attachments
      </Heading>

      {isLoading && <LoadingSpinner />}

      {!readOnly && (
        <Box mb={4}>
          <FileUpload
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf"
            multiple={false}
            onChange={handleUploadComplete}
            maxSize={15}
            isDisabled={readOnly}
            uploadType="medical-record"
            metadata={{ category: activeCategory !== 'all' ? activeCategory : 'other' }}
            onUploadProgress={(progress) => {
              // Optional progress tracking
              if (progress === 100) {
                toast({
                  title: 'Upload complete',
                  description: 'Processing file...',
                  status: 'info',
                  duration: 2000,
                  isClosable: true
                });
              }
            }}
          />
          <Text fontSize="xs" color="gray.500" mt={1}>
            Upload medical documents, lab results, imaging, prescriptions, etc.
          </Text>
        </Box>
      )}

      {/* Category filter tabs */}
      <Tabs variant="soft-rounded" colorScheme="blue" mt={4} onChange={(index) => {
        const categories = ['all', 'lab_result', 'imaging', 'prescription', 'consent_form', 'referral', 'other'];
        filterAttachments(categories[index]);
      }}>
        <TabList>
          <Tab>All</Tab>
          <Tab>Lab Results</Tab>
          <Tab>Imaging</Tab>
          <Tab>Prescriptions</Tab>
          <Tab>Consent Forms</Tab>
          <Tab>Referrals</Tab>
          <Tab>Other</Tab>
        </TabList>
      </Tabs>

      {/* Attachments gallery */}
      <Box mt={4}>
        {filteredAttachments.length === 0 ? (
          <Text color="gray.500" py={8} textAlign="center">
            No {activeCategory !== 'all' ? activeCategory.replace('_', ' ') : ''} attachments found
          </Text>
        ) : (
          <ImageGallery
            images={formatAttachmentsForGallery(filteredAttachments)}
            columns={{ base: 1, sm: 2, md: 3 }}
            showFileName={true}
            onImageClick={(file) => {
              // For non-image files, open in a new tab
              if (file.url && !file.mimeType?.startsWith('image/')) {
                window.open(file.url, '_blank');
              }
            }}
          />
        )}
      </Box>

      {/* List view of attachments with more details */}
      {filteredAttachments.length > 0 && (
        <Box mt={6}>
          <Divider mb={4} />
          <Heading size="sm" mb={3}>Attachment Details</Heading>
          <VStack align="stretch" spacing={3}>
            {filteredAttachments.map((attachment) => (
              <Box 
                key={attachment._id} 
                p={3} 
                borderWidth="1px" 
                borderRadius="md"
                _hover={{ bg: 'gray.50' }}
              >
                <Flex justify="space-between" align="center">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{attachment.name}</Text>
                    <HStack>
                      {getCategoryBadge(attachment.category)}
                      <Text fontSize="xs" color="gray.500">
                        Uploaded: {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                    {attachment.description && (
                      <Text fontSize="sm" color="gray.700" mt={1}>
                        {attachment.description}
                      </Text>
                    )}
                  </VStack>
                  
                  <HStack>
                    <Button
                      size="sm"
                      leftIcon={<FaEye />}
                      variant="outline"
                      onClick={() => {
                        // Use the appropriate viewer based on file type
                        const fileUrl = attachment.url;
                        window.open(fileUrl, '_blank');
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<FaDownload />}
                      variant="outline"
                      onClick={() => {
                        // For files stored in Cloudinary, ensure we get the attachment URL
                        // with a content-disposition header for download
                        const downloadUrl = attachment.url.includes('cloudinary.com') && !attachment.url.includes('fl_attachment') 
                          ? `${attachment.url.replace('/upload/', '/upload/fl_attachment/')}`
                          : attachment.url;
                          
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.download = attachment.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                    >
                      Download
                    </Button>
                    {!readOnly && (
                      <Button
                        size="sm"
                        leftIcon={<FaTrash />}
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteAttachment(attachment._id)}
                      >
                        Delete
                      </Button>
                    )}
                  </HStack>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* File metadata modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>File Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                Please provide additional information about the uploaded file:
              </Text>
              
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={fileMetadata.category}
                  onChange={(e) => setFileMetadata({...fileMetadata, category: e.target.value})}
                >
                  <option value="lab_result">Lab Result</option>
                  <option value="imaging">Imaging</option>
                  <option value="prescription">Prescription</option>
                  <option value="consent_form">Consent Form</option>
                  <option value="referral">Referral</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={fileMetadata.description}
                  onChange={(e) => setFileMetadata({...fileMetadata, description: e.target.value})}
                  placeholder="Brief description of this file"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Tags (comma-separated)</FormLabel>
                <Input
                  value={fileMetadata.tags}
                  onChange={(e) => setFileMetadata({...fileMetadata, tags: e.target.value})}
                  placeholder="e.g. bloodwork, annual, urgent"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSaveAttachment}
              isLoading={isLoading}
            >
              Save Attachment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AttachmentsSection;
