import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box minH="100vh" bg="gray.50" py={20}>
      <VStack spacing={8} textAlign="center">
        <Heading size="2xl" color="blue.500">
          404
        </Heading>
        <Heading size="lg">Page Not Found</Heading>
        <Text color="gray.600" maxW="md">
          The page you're looking for doesn't exist or has been moved. Please check
          the URL or navigate back to the homepage.
        </Text>
        <Button
          as={RouterLink}
          to="/"
          colorScheme="blue"
          size="lg"
        >
          Return to Home
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFound;