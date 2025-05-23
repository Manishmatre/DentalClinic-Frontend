import React, { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Image,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  IconButton,
  useDisclosure,
  Flex,
  Badge,
  Icon
} from '@chakra-ui/react';
import { FaExpand, FaChevronLeft, FaChevronRight, FaDownload, FaFile, FaFilePdf } from 'react-icons/fa';
import uploadService from '../../api/upload/uploadService';

/**
 * A responsive image gallery component that displays images and documents
 * with modal preview and download capabilities
 */
const ImageGallery = ({
  images = [],
  columns = { base: 2, md: 3, lg: 4 },
  spacing = 4,
  imageHeight = 200,
  showFileName = true,
  onImageClick = null,
  emptyText = 'No images to display'
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Handle image click to open modal
  const handleImageClick = (index) => {
    if (onImageClick) {
      onImageClick(images[index], index);
      return;
    }
    
    setSelectedIndex(index);
    onOpen();
  };
  
  // Navigate to next image in modal
  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };
  
  // Navigate to previous image in modal
  const handlePrevious = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  // Download the current image
  const handleDownload = (e) => {
    e.stopPropagation();
    const image = images[selectedIndex];
    const url = image.url || uploadService.getFileUrl(image.publicId);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = image.name || `download-${Date.now()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Check if file is an image
  const isImage = (file) => {
    const url = file.url || file.publicId || '';
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
           (file.mimeType && file.mimeType.startsWith('image/'));
  };
  
  // Check if file is a PDF
  const isPdf = (file) => {
    const url = file.url || file.publicId || '';
    return url.match(/\.(pdf)$/i) || 
           (file.mimeType && file.mimeType === 'application/pdf');
  };
  
  // Get appropriate icon for non-image files
  const getFileIcon = (file) => {
    if (isPdf(file)) {
      return FaFilePdf;
    } else {
      return FaFile;
    }
  };
  
  // Get type badge for files
  const getTypeBadge = (file) => {
    if (isImage(file)) {
      return (
        <Badge colorScheme="blue" position="absolute" top={2} right={2}>
          Image
        </Badge>
      );
    } else if (isPdf(file)) {
      return (
        <Badge colorScheme="red" position="absolute" top={2} right={2}>
          PDF
        </Badge>
      );
    } else {
      return (
        <Badge colorScheme="gray" position="absolute" top={2} right={2}>
          File
        </Badge>
      );
    }
  };
  
  // If no images, show empty state
  if (!images || images.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">{emptyText}</Text>
      </Box>
    );
  }
  
  return (
    <>
      <SimpleGrid columns={columns} spacing={spacing}>
        {images.map((image, index) => (
          <Box
            key={index}
            position="relative"
            cursor="pointer"
            onClick={() => handleImageClick(index)}
            borderWidth="1px"
            borderRadius="md"
            overflow="hidden"
            transition="all 0.2s"
            _hover={{
              transform: 'scale(1.02)',
              shadow: 'md'
            }}
          >
            {isImage(image) ? (
              <Image
                src={image.url || uploadService.getOptimizedImageUrl(image.publicId)}
                alt={image.name || `Image ${index + 1}`}
                height={`${imageHeight}px`}
                width="100%"
                objectFit="cover"
                fallbackSrc="https://via.placeholder.com/150?text=Loading..."
              />
            ) : (
              <Flex
                height={`${imageHeight}px`}
                alignItems="center"
                justifyContent="center"
                bg="gray.100"
              >
                <Icon as={getFileIcon(image)} boxSize={12} color="gray.500" />
              </Flex>
            )}
            
            {getTypeBadge(image)}
            
            <IconButton
              icon={<FaExpand />}
              size="sm"
              aria-label="Expand image"
              position="absolute"
              bottom={2}
              right={2}
              onClick={(e) => {
                e.stopPropagation();
                handleImageClick(index);
              }}
            />
            
            {showFileName && image.name && (
              <Box p={2} bg="white">
                <Text fontSize="sm" noOfLines={1}>{image.name}</Text>
              </Box>
            )}
          </Box>
        ))}
      </SimpleGrid>

      {/* Modal for image preview */}
      {images.length > 0 && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton zIndex="popover" />
            <ModalBody p={0} position="relative">
              {/* Image/File Preview */}
              {isImage(images[selectedIndex]) ? (
                <Image
                  src={images[selectedIndex].url || uploadService.getFileUrl(images[selectedIndex].publicId)}
                  alt={images[selectedIndex].name || `Image ${selectedIndex + 1}`}
                  width="100%"
                  maxH="80vh"
                  objectFit="contain"
                />
              ) : isPdf(images[selectedIndex]) ? (
                <Box height="80vh" width="100%">
                  <iframe
                    src={`${images[selectedIndex].url || uploadService.getFileUrl(images[selectedIndex].publicId)}#toolbar=0`}
                    width="100%"
                    height="100%"
                    title={images[selectedIndex].name || `Document ${selectedIndex + 1}`}
                    style={{ border: 'none' }}
                  />
                </Box>
              ) : (
                <Flex
                  height="80vh"
                  alignItems="center"
                  justifyContent="center"
                  bg="gray.100"
                >
                  <Icon as={getFileIcon(images[selectedIndex])} boxSize={20} color="gray.500" />
                  <Text mt={4}>{images[selectedIndex].name || 'File'}</Text>
                </Flex>
              )}

              {/* Navigation and controls */}
              <Flex 
                position="absolute" 
                bottom={4} 
                left="50%" 
                transform="translateX(-50%)"
                bg="blackAlpha.600" 
                borderRadius="md" 
                p={2}
              >
                {images.length > 1 && (
                  <IconButton
                    icon={<FaChevronLeft />}
                    onClick={handlePrevious}
                    aria-label="Previous image"
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    mr={2}
                  />
                )}
                
                <IconButton
                  icon={<FaDownload />}
                  onClick={handleDownload}
                  aria-label="Download image"
                  variant="ghost"
                  colorScheme="whiteAlpha"
                />
                
                {images.length > 1 && (
                  <IconButton
                    icon={<FaChevronRight />}
                    onClick={handleNext}
                    aria-label="Next image"
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    ml={2}
                  />
                )}
              </Flex>
              
              {/* Image counter */}
              {images.length > 1 && (
                <Badge 
                  position="absolute" 
                  top={4} 
                  left={4}
                  px={2}
                  py={1}
                  bg="blackAlpha.700"
                  color="white"
                  borderRadius="md"
                >
                  {selectedIndex + 1} / {images.length}
                </Badge>
              )}
              
              {/* File name */}
              {images[selectedIndex].name && (
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  bg="blackAlpha.700"
                  p={2}
                  color="white"
                >
                  <Text fontSize="sm" textAlign="center">
                    {images[selectedIndex].name}
                  </Text>
                </Box>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default ImageGallery;
