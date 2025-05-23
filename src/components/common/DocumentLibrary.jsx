import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Text,
  Flex,
  Badge,
  Icon,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select,
  Input,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaNotesMedical, 
  FaPrescription, 
  FaFlask, 
  FaFileInvoice, 
  FaIdCard, 
  FaFilePdf, 
  FaFileAlt, 
  FaImage, 
  FaFile,
  FaDownload,
  FaTrash,
  FaEye
} from 'react-icons/fa';
import FileUpload from './FileUpload';
import ImageGallery from './ImageGallery';
import uploadService from '../../api/upload/uploadService';
import { useAuth } from '../../context/AuthContext';

/**
 * DocumentLibrary component for displaying and managing categorized documents
 * Supports filtering, sorting, and viewing documents by category
 */
const DocumentLibrary = ({
  documents = [],
  onUpload,
  onDelete,
  patientId = null,
  doctorId = null,
  appointmentId = null,
  clinicId = null,
  readOnly = false,
  showUploadButton = true,
  title = 'Document Library'
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [filteredDocs, setFilteredDocs] = useState([]);
  
  // Document categories
  const documentCategories = [
    { value: 'all', label: 'All Documents', icon: FaFile },
    { value: 'medical-record', label: 'Medical Records', icon: FaNotesMedical },
    { value: 'prescription', label: 'Prescriptions', icon: FaPrescription },
    { value: 'lab-result', label: 'Lab Results', icon: FaFlask },
    { value: 'bill', label: 'Bills/Invoices', icon: FaFileInvoice },
    { value: 'id-document', label: 'ID Documents', icon: FaIdCard },
    { value: 'insurance', label: 'Insurance', icon: FaFilePdf },
    { value: 'consent-form', label: 'Consent Forms', icon: FaFileAlt },
    { value: 'referral', label: 'Referrals', icon: FaFileAlt },
    { value: 'profile-picture', label: 'Profile Pictures', icon: FaImage },
    { value: 'general', label: 'Other Documents', icon: FaFile }
  ];
  
  // Filter and sort documents when dependencies change
  useEffect(() => {
    let filtered = [...documents];
    
    // Apply category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === activeCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name?.toLowerCase().includes(query) || 
        doc.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.uploadedAt || a.createdAt);
      const dateB = new Date(b.uploadedAt || b.createdAt);
      
      if (sortOrder === 'newest') {
        return dateB - dateA;
      } else if (sortOrder === 'oldest') {
        return dateA - dateB;
      } else if (sortOrder === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortOrder === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });
    
    setFilteredDocs(filtered);
  }, [documents, activeCategory, searchQuery, sortOrder]);
  
  // Get icon for document type
  const getDocumentIcon = (category) => {
    const found = documentCategories.find(cat => cat.value === category);
    return found ? found.icon : FaFile;
  };
  
  // Handle document upload
  const handleUpload = (files) => {
    if (onUpload) {
      onUpload(files);
    }
    onClose();
  };
  
  // Handle document deletion
  const handleDelete = (document) => {
    if (onDelete) {
      onDelete(document);
    }
  };
  
  // Handle document download
  const handleDownload = (document) => {
    const link = document.url || uploadService.getFileUrl(document.publicId);
    if (link) {
      window.open(link, '_blank');
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">{title}</Heading>
        
        {showUploadButton && !readOnly && (
          <Button 
            colorScheme="blue" 
            leftIcon={<Icon as={FaFile} />}
            onClick={onOpen}
            size="sm"
          >
            Upload Document
          </Button>
        )}
      </Flex>
      
      {/* Search and filter bar */}
      <Flex mb={4} gap={2} flexWrap="wrap">
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input 
            placeholder="Search documents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        
        <Select 
          maxW="200px"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          leftIcon={<FaSort />}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </Select>
      </Flex>
      
      {/* Document categories tabs */}
      <Tabs variant="soft-rounded" colorScheme="blue" onChange={(index) => setActiveCategory(documentCategories[index].value)}>
        <TabList overflowX="auto" py={2} css={{ scrollbarWidth: 'thin' }}>
          {documentCategories.map((category) => (
            <Tab key={category.value} px={4}>
              <Flex align="center" gap={2}>
                <Icon as={category.icon} />
                <Text display={{ base: 'none', md: 'block' }}>{category.label}</Text>
              </Flex>
            </Tab>
          ))}
        </TabList>
        
        <TabPanels>
          {documentCategories.map((category) => (
            <TabPanel key={category.value} p={0} pt={4}>
              {filteredDocs.length > 0 ? (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                  {filteredDocs.map((doc, index) => (
                    <Box 
                      key={index} 
                      borderWidth="1px" 
                      borderRadius="lg" 
                      overflow="hidden"
                      _hover={{ shadow: 'md' }}
                    >
                      <Flex 
                        direction="column" 
                        p={3}
                        h="100%"
                      >
                        <Flex justify="center" align="center" h="120px" bg="gray.50" mb={2} borderRadius="md">
                          <Icon 
                            as={getDocumentIcon(doc.category || 'general')} 
                            boxSize={10} 
                            color="blue.500" 
                          />
                        </Flex>
                        
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1} mb={1}>
                          {doc.name || 'Unnamed Document'}
                        </Text>
                        
                        <Text fontSize="xs" color="gray.500" mb={2}>
                          {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}
                        </Text>
                        
                        <Badge colorScheme="blue" alignSelf="flex-start" mb={2}>
                          {doc.category || 'general'}
                        </Badge>
                        
                        {doc.description && (
                          <Text fontSize="xs" color="gray.600" noOfLines={2} mb={2}>
                            {doc.description}
                          </Text>
                        )}
                        
                        <Flex mt="auto" justify="space-between">
                          <Button 
                            size="xs" 
                            leftIcon={<Icon as={FaEye} />} 
                            onClick={() => handleDownload(doc)}
                            variant="outline"
                          >
                            View
                          </Button>
                          
                          {!readOnly && (
                            <Button 
                              size="xs" 
                              leftIcon={<Icon as={FaTrash} />} 
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDelete(doc)}
                            >
                              Delete
                            </Button>
                          )}
                        </Flex>
                      </Flex>
                    </Box>
                  ))}
                </SimpleGrid>
              ) : (
                <Flex 
                  direction="column" 
                  align="center" 
                  justify="center" 
                  p={10} 
                  bg="gray.50" 
                  borderRadius="md"
                >
                  <Icon as={FaFile} boxSize={10} color="gray.300" mb={4} />
                  <Text color="gray.500">No documents found</Text>
                  {!readOnly && (
                    <Button 
                      mt={4} 
                      colorScheme="blue" 
                      leftIcon={<Icon as={FaFile} />}
                      onClick={onOpen}
                      size="sm"
                    >
                      Upload Document
                    </Button>
                  )}
                </Flex>
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
      
      {/* Upload document modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent>
          <ModalHeader>Upload Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FileUpload
              accept="*/*"
              buttonText="Select Document"
              uploadType="document"
              showCategorySelector={true}
              patientId={patientId}
              doctorId={doctorId}
              appointmentId={appointmentId}
              clinicId={clinicId}
              onChange={handleUpload}
              multiple={false}
              maxSize={10} // 10MB max
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DocumentLibrary;
