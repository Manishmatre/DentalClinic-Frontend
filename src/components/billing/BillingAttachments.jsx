import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
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
  Icon,
  SimpleGrid
} from '@chakra-ui/react';
import { FaUpload, FaDownload, FaEye, FaTrash, FaFilePdf, FaFileInvoice, FaFileAlt } from 'react-icons/fa';
import FileUpload from '../common/FileUpload';
import ImageGallery from '../common/ImageGallery';
import LoadingSpinner from '../common/LoadingSpinner';
import billService from '../../api/billing/billService';
import uploadService from '../../api/upload/uploadService';

/**
 * Component for managing billing attachments like invoices, receipts, insurance claims, etc.
 */
const BillingAttachments = ({ 
  billId, 
  attachments = [], 
  onAttachmentsChange, 
  readOnly = false,
  showGallery = true 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState(attachments || []);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // File metadata state
  const [fileMetadata, setFileMetadata] = useState({
    description: '',
    type: 'invoice',
    tags: ''
  });

  // Process attachments when they change
  useEffect(() => {
    setCurrentAttachments(attachments || []);
  }, [attachments]);

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

  // Save attachment to bill
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
          type: fileMetadata.type,
          category: fileMetadata.type, // Match category with type for consistency
          tags: [...tagsArray, 'billing', fileMetadata.type], // Ensure billing tag is included
          uploadedAt: new Date()
        };

        // Call API to add attachment to bill
        const result = await billService.addAttachment(billId, attachmentData);

        if (result.error) {
          throw new Error(result.error);
        }

        // Update attachments list
        if (result.attachments) {
          setCurrentAttachments(result.attachments);
          
          if (onAttachmentsChange) {
            onAttachmentsChange(result.attachments);
          }
        }
      }

      // Reset form and close modal
      setFileMetadata({
        description: '',
        type: 'invoice',
        tags: ''
      });
      setUploadedFiles([]);
      onClose();

      toast({
        title: 'Attachment added',
        description: 'File has been successfully attached to the bill',
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
      
      // Then remove it from the bill
      const result = await billService.removeAttachment(billId, attachmentId);

      if (result.error) {
        throw new Error(result.error);
      }

      // Update attachments list
      if (result.attachments) {
        setCurrentAttachments(result.attachments);
        
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
      type: attachment.type
    }));
  };

  // Get appropriate icon based on attachment type
  const getAttachmentIcon = (type) => {
    switch (type) {
      case 'invoice':
        return FaFileInvoice;
      case 'receipt':
        return FaFileAlt;
      case 'insurance':
        return FaFilePdf;
      default:
        return FaFileAlt;
    }
  };

  // Render type badge
  const getTypeBadge = (type) => {
    const typeColors = {
      invoice: 'blue',
      receipt: 'green',
      insurance: 'purple',
      claim: 'orange',
      statement: 'teal',
      other: 'gray'
    };

    const typeLabels = {
      invoice: 'Invoice',
      receipt: 'Receipt',
      insurance: 'Insurance',
      claim: 'Claim',
      statement: 'Statement',
      other: 'Other'
    };

    return (
      <Badge colorScheme={typeColors[type] || 'gray'}>
        {typeLabels[type] || 'Other'}
      </Badge>
    );
  };

  return (
    <Box>
      <Heading size="md" mb={4}>
        Billing Attachments
      </Heading>

      {isLoading && <LoadingSpinner />}

      {!readOnly && (
        <Box mb={4}>
          <FileUpload
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf"
            multiple={false}
            onChange={handleUploadComplete}
            maxSize={10}
            isDisabled={readOnly}
            uploadType="bill"
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
            Upload invoices, receipts, insurance documents, claim forms, etc.
          </Text>
        </Box>
      )}

      {/* Attachments gallery */}
      {showGallery && currentAttachments.length > 0 && (
        <Box mt={4}>
          <ImageGallery
            images={formatAttachmentsForGallery(currentAttachments)}
            columns={{ base: 1, sm: 2, md: 3 }}
            showFileName={true}
            onImageClick={(file) => {
              // For non-image files, open in a new tab
              if (file.url && (!file.mimeType || !file.mimeType.startsWith('image/'))) {
                window.open(file.url, '_blank');
              }
            }}
          />
        </Box>
      )}

      {/* List view of attachments with more details */}
      {currentAttachments.length > 0 ? (
        <Box mt={6}>
          <Divider mb={4} />
          <Heading size="sm" mb={3}>Attachment Details</Heading>
          <VStack align="stretch" spacing={3}>
            {currentAttachments.map((attachment) => (
              <Box 
                key={attachment._id} 
                p={3} 
                borderWidth="1px" 
                borderRadius="md"
                _hover={{ bg: 'gray.50' }}
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={4}>
                    <Icon as={getAttachmentIcon(attachment.type)} boxSize={6} color="gray.600" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">{attachment.name}</Text>
                      <HStack>
                        {getTypeBadge(attachment.type)}
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
                  </HStack>
                  
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
      ) : (
        <Text color="gray.500" py={8} textAlign="center">
          No attachments found
        </Text>
      )}

      {/* File metadata modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Document Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>
                Please provide additional information about the uploaded document:
              </Text>
              
              <FormControl>
                <FormLabel>Document Type</FormLabel>
                <Select
                  value={fileMetadata.type}
                  onChange={(e) => setFileMetadata({...fileMetadata, type: e.target.value})}
                >
                  <option value="invoice">Invoice</option>
                  <option value="receipt">Receipt</option>
                  <option value="insurance">Insurance Document</option>
                  <option value="claim">Insurance Claim</option>
                  <option value="statement">Financial Statement</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={fileMetadata.description}
                  onChange={(e) => setFileMetadata({...fileMetadata, description: e.target.value})}
                  placeholder="Brief description of this document"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Tags (comma-separated)</FormLabel>
                <Input
                  value={fileMetadata.tags}
                  onChange={(e) => setFileMetadata({...fileMetadata, tags: e.target.value})}
                  placeholder="e.g. patient payment, insurance, copay"
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
              Save Document
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BillingAttachments;
