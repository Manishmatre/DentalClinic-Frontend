import React from 'react';
import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';

/**
 * A reusable loading spinner component with an optional message
 * @param {string} message - Optional message to display below the spinner
 * @param {string} size - Size of the spinner (xs, sm, md, lg, xl)
 * @param {string} color - Color of the spinner
 */
const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'xl', 
  color = 'blue.500' 
}) => {
  return (
    <Flex 
      width="100%" 
      height="100%" 
      minHeight="200px" 
      justifyContent="center" 
      alignItems="center"
    >
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color={color}
          size={size}
        />
        {message && <Text color="gray.500">{message}</Text>}
      </VStack>
    </Flex>
  );
};

export default LoadingSpinner;
