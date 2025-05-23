import React from 'react';
import { Box, Container, Image, VStack } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8}>
          <Image
            src="/logo.png"
            alt="Clinic Management System"
            h="60px"
            objectFit="contain"
          />
          <Box
            w="full"
            maxW="md"
            bg="white"
            borderRadius="lg"
            boxShadow="lg"
            p={8}
          >
            <Outlet />
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default AuthLayout;