import React from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Stack
} from '@chakra-ui/react';

/**
 * A reusable filter drawer component that can be used throughout the application
 * @param {boolean} isOpen - Whether the drawer is open
 * @param {function} onClose - Function to close the drawer
 * @param {function} onApply - Function to apply the filters
 * @param {React.ReactNode} children - The filter form content
 * @param {string} title - The drawer title
 */
const FilterDrawer = ({ 
  isOpen, 
  onClose, 
  onApply, 
  children, 
  title = "Filter Options" 
}) => {
  const handleApply = () => {
    if (onApply) {
      onApply();
    }
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">{title}</DrawerHeader>

        <DrawerBody>
          <Stack spacing={4} mt={4}>
            {children}
          </Stack>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleApply}>
            Apply Filters
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default FilterDrawer;
