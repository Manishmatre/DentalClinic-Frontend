import React from 'react';
import { Button, ButtonGroup, Flex, Text } from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * A reusable pagination component for navigating through paginated data
 * @param {number} currentPage - The current page number
 * @param {number} totalPages - The total number of pages
 * @param {function} onPageChange - Function called when a page is selected
 * @param {boolean} showPageNumbers - Whether to show numbered page buttons
 * @param {string} size - Size of the pagination buttons
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = true,
  size = 'md'
}) => {
  // Don't render if there's only one page
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    // Determine start and end page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <Flex alignItems="center" justifyContent="center">
      <ButtonGroup size={size} isAttached variant="outline">
        {/* Previous button */}
        <Button
          leftIcon={<FaChevronLeft />}
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          aria-label="Previous page"
        >
          Prev
        </Button>
        
        {/* Page numbers */}
        {showPageNumbers && getPageNumbers().map(page => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            colorScheme={currentPage === page ? 'blue' : 'gray'}
            variant={currentPage === page ? 'solid' : 'outline'}
          >
            {page}
          </Button>
        ))}
        
        {/* Next button */}
        <Button
          rightIcon={<FaChevronRight />}
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Next
        </Button>
      </ButtonGroup>
      
      {/* Page information */}
      <Text ml={4} color="gray.500" fontSize="sm">
        Page {currentPage} of {totalPages}
      </Text>
    </Flex>
  );
};

export default Pagination;
