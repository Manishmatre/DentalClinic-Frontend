import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Icon,
  Input,
  Progress,
  Badge,
  Image,
  useToast,
  IconButton,
  VStack,
  HStack,
  Tooltip,
  Select,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { 
  FaUpload, 
  FaFile, 
  FaImage, 
  FaFilePdf, 
  FaFileWord, 
  FaFileExcel, 
  FaFilePowerpoint, 
  FaFileAlt, 
  FaTrash, 
  FaCheck,
  FaNotesMedical,
  FaPrescription,
  FaFlask,
  FaFileInvoice,
  FaIdCard
} from 'react-icons/fa';
import uploadService from '../../api/upload/uploadService';

/**
 * Reusable file upload component that supports single and multiple file uploads
 * using Cloudinary for storage with document categorization for medical records
 */
const FileUpload = ({
  accept = 'image/*',
  multiple = false,
  maxFiles = 5,
  maxSize = 5, // in MB
  onChange,
  onUploadProgress,
  uploadType = 'image',
  value = [],
  showPreview = true,
  previewSize = 100,
  buttonText = 'Upload File',
  isDisabled = false,
  metadata = {}, // Additional metadata for upload
  showCategorySelector = false,
  patientId = null,
  doctorId = null,
  appointmentId = null,
  clinicId = null
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState(Array.isArray(value) ? value : value ? [value] : []);
  const [category, setCategory] = useState(metadata.category || 'general');
  const fileInputRef = useRef(null);
  const toast = useToast();
  
  // Document categories for medical system
  const documentCategories = [
    { value: 'general', label: 'General Document', icon: FaFile },
    { value: 'medical-record', label: 'Medical Record', icon: FaNotesMedical },
    { value: 'prescription', label: 'Prescription', icon: FaPrescription },
    { value: 'lab-result', label: 'Lab Result', icon: FaFlask },
    { value: 'bill', label: 'Bill/Invoice', icon: FaFileInvoice },
    { value: 'id-document', label: 'ID Document', icon: FaIdCard },
    { value: 'insurance', label: 'Insurance Document', icon: FaFilePdf },
    { value: 'consent-form', label: 'Consent Form', icon: FaFileAlt },
    { value: 'referral', label: 'Referral', icon: FaFileAlt },
    { value: 'profile-picture', label: 'Profile Picture', icon: FaImage }
  ];

  // Handle category change
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length === 0) return;
    
    // Validate number of files
    if (multiple && selectedFiles.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `You can only upload a maximum of ${maxFiles} files at once.`,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // Validate file size
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: 'File too large',
        description: `Some files exceed the maximum size of ${maxSize}MB.`,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    setUploading(true);
    
    // Progress tracking function that updates our component state
    // and calls the parent's progress handler if provided
    const trackProgress = (progressValue) => {
      setProgress(progressValue);
      if (onUploadProgress) {
        onUploadProgress(progressValue);
      }
    };
    
    try {
      let uploadedFiles = [];
      
      // Prepare enhanced metadata with category and related IDs
      const enhancedMetadata = {
        ...metadata,
        category,
        ...(patientId && { patientId }),
        ...(doctorId && { doctorId }),
        ...(appointmentId && { appointmentId }),
        ...(clinicId && { clinicId }),
        uploadedAt: new Date().toISOString()
      };
      
      if (multiple) {
        // Upload multiple files
        const uploadTypeValue = getUploadTypeValue(uploadType);
        const result = await uploadService.uploadMultipleFiles(selectedFiles, uploadTypeValue, trackProgress, enhancedMetadata);
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Process the response based on its structure
        if (Array.isArray(result)) {
          uploadedFiles = result.map(processFileResult);
        } else if (result.files) {
          uploadedFiles = result.files.map(processFileResult);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        // Upload single file
        const uploadTypeValue = getUploadTypeValue(uploadType);
        const result = await uploadService.uploadFile(
          selectedFiles[0],
          uploadTypeValue,
          trackProgress,
          enhancedMetadata
        );
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Extract file data from the response
        const fileData = result.file || result;
        uploadedFiles = [processFileResult(fileData)];
      }
      
      // Helper function to process file data from the response
      function processFileResult(fileData) {
        return {
          url: fileData.url || fileData.path,
          publicId: fileData.public_id || fileData.publicId,
          name: fileData.originalname || fileData.name || selectedFiles[0].name,
          size: fileData.size,
          type: fileData.mimetype || fileData.mimeType || fileData.type,
          fileType: fileData.fileType || uploadType
        };
      }
      
      // Helper function to get the appropriate upload type value
      function getUploadTypeValue(type) {
        switch (type) {
          case 'image': return 'images';
          case 'document': return 'documents';
          case 'medical-record': return 'medical-records';
          case 'bill': return 'bill';
          case 'profile-picture': return 'profile-picture';
          case 'lab-result': return 'lab-results';
          case 'prescription': return 'prescriptions';
          default: return type;
        }
      }
      
      // Update state and call onChange handler
      const newFiles = multiple ? [...files, ...uploadedFiles] : uploadedFiles;
      setFiles(newFiles);
      
      if (onChange) {
        onChange(multiple ? newFiles : newFiles[0]);
      }
      
      toast({
        title: 'Upload successful',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Remove a file
  const handleRemoveFile = async (index) => {
    try {
      const fileToRemove = files[index];
      
      // Delete from Cloudinary if we have a publicId
      if (fileToRemove.publicId) {
        await uploadService.deleteFile(fileToRemove.publicId);
      }
      
      // Update state
      const newFiles = [...files];
      newFiles.splice(index, 1);
      setFiles(newFiles);
      
      // Call onChange handler
      if (onChange) {
        onChange(multiple ? newFiles : newFiles[0] || null);
      }
      
      toast({
        title: 'File removed',
        status: 'info',
        duration: 2000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Error removing file',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  // Get file icon based on file type
  const getFileIcon = (file) => {
    if (!file.name && !file.url) return FaFile;
    
    const url = file.url || file.name || '';
    
    // Use the uploadService's getFileTypeIcon function if available
    if (uploadService.getFileTypeIcon) {
      const iconType = uploadService.getFileTypeIcon(url);
      
      // Map the icon type to the appropriate icon component
      switch (iconType) {
        case 'image': return FaImage;
        case 'pdf': return FaFilePdf;
        case 'word': return FaFileWord;
        case 'excel': return FaFileExcel;
        case 'powerpoint': return FaFilePowerpoint;
        case 'text': return FaFileAlt;
        default: return FaFile;
      }
    }
    
    // Fallback to basic extension checking
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return FaImage;
    } else if (url.match(/\.(pdf)$/i)) {
      return FaFilePdf;
    } else if (url.match(/\.(doc|docx)$/i)) {
      return FaFileWord;
    } else if (url.match(/\.(xls|xlsx|csv)$/i)) {
      return FaFileExcel;
    } else if (url.match(/\.(ppt|pptx)$/i)) {
      return FaFilePowerpoint;
    } else if (url.match(/\.(txt|rtf|md)$/i)) {
      return FaFileAlt;
    } else {
      return FaFile;
    }
  };
  
  // Get file preview
  const getFilePreview = (file, index) => {
    const isImage = file.url && file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isPdf = file.url && file.url.match(/\.(pdf)$/i);
    
    // Get optimized image URL for previews if using Cloudinary
    const previewUrl = isImage && file.publicId && uploadService.getOptimizedImageUrl
      ? uploadService.getOptimizedImageUrl(file.url, previewSize, previewSize)
      : file.url;
      
    // Get thumbnail for PDFs if using Cloudinary  
    const pdfThumbnail = isPdf && file.publicId && uploadService.getThumbnailUrl
      ? uploadService.getThumbnailUrl(file.url, previewSize)
      : null;
      
    // Format file size if available
    const formattedSize = file.size && uploadService.formatFileSize
      ? uploadService.formatFileSize(file.size)
      : '';
    
    return (
      <Box 
        key={index} 
        borderWidth="1px" 
        borderRadius="md" 
        p={2} 
        mb={2}
        position="relative"
        _hover={{ bg: 'gray.50' }}
      >
        <HStack spacing={3} align="center">
          {showPreview && (isImage || pdfThumbnail) ? (
            <Image 
              src={isImage ? previewUrl : pdfThumbnail} 
              alt={file.name || 'Uploaded file'}
              boxSize={`${previewSize}px`}
              objectFit="cover"
              borderRadius="md"
              fallback={<Icon as={getFileIcon(file)} boxSize={6} />}
            />
          ) : (
            <Icon as={getFileIcon(file)} boxSize={6} color="blue.500" />
          )}
          
          <VStack align="start" flex="1" spacing={0}>
            <Tooltip label={file.name || 'Uploaded file'} placement="top">
              <Text fontSize="sm" noOfLines={1} fontWeight="medium">{file.name || 'Uploaded file'}</Text>
            </Tooltip>
            <HStack>
              <Badge colorScheme="green" size="sm">
                <Icon as={FaCheck} mr={1} boxSize={3} />
                Uploaded
              </Badge>
              {formattedSize && (
                <Text fontSize="xs" color="gray.500">{formattedSize}</Text>
              )}
            </HStack>
          </VStack>
          
          <IconButton
            icon={<FaTrash />}
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={() => handleRemoveFile(index)}
            aria-label="Remove file"
            isDisabled={isDisabled}
          />
        </HStack>
      </Box>
    );
  };
  
  return (
    <Box width="100%">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        disabled={isDisabled || uploading}
      />
      
      <Flex direction="column" width="100%">
        {/* Document Category Selector */}
        {showCategorySelector && (
          <FormControl mb={4}>
            <FormLabel>Document Category</FormLabel>
            <Select 
              value={category} 
              onChange={handleCategoryChange}
              disabled={isDisabled || uploading}
            >
              {documentCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
          </FormControl>
        )}
        
        {/* Upload button */}
        <Button
          onClick={() => fileInputRef.current.click()}
          colorScheme="blue"
          isLoading={uploading}
          loadingText="Uploading..."
          leftIcon={<Icon as={FaUpload} />}
          mb={4}
          isDisabled={isDisabled}
        >
          {buttonText}
        </Button>

        {/* Progress bar */}
        {uploading && (
          <Box mb={4}>
            <Progress value={progress} size="sm" colorScheme="blue" borderRadius="md" />
            <Text fontSize="xs" textAlign="center" mt={1}>{progress}%</Text>
          </Box>
        )}
        
        {/* File previews */}
        {files.length > 0 && (
          <VStack align="stretch" mb={3} width="100%">
            {files.map((file, index) => getFilePreview(file, index))}
          </VStack>
        )}
        
        {/* Upload button */}
        <Button
          leftIcon={<FaUpload />}
          onClick={() => fileInputRef.current.click()}
          isLoading={uploading}
          loadingText="Uploading..."
          colorScheme="blue"
          isDisabled={isDisabled || (multiple && files.length >= maxFiles)}
          size="md"
        >
          {buttonText}
        </Button>
        
        {/* Upload progress */}
        {uploading && progress > 0 && (
          <Box mt={2}>
            <Progress value={progress} size="sm" colorScheme="blue" />
            <Text fontSize="xs" textAlign="right" mt={1}>
              {progress}%
            </Text>
          </Box>
        )}
        
        {/* Helper text */}
        <Text fontSize="xs" color="gray.500" mt={1}>
          {multiple 
            ? `You can upload up to ${maxFiles} files (max ${maxSize}MB each).`
            : `Maximum file size: ${maxSize}MB`
          }
        </Text>
      </Flex>
    </Box>
  );
};

export default FileUpload;
