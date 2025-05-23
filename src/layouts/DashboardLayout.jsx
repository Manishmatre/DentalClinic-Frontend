import React, { useState } from 'react';
import {
  Box,
  Flex,
  IconButton,
  useColorModeValue,
  Text,
  VStack,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from '@chakra-ui/react';
import { FiMenu, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box
        ml={{ base: 0, md: 60 }}
        transition=".3s ease"
      >
        <Flex
          as="header"
          align="center"
          justify="space-between"
          w="full"
          px="4"
          bg={useColorModeValue('white', 'gray.800')}
          borderBottomWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          h="16"
          position="fixed"
          top="0"
          zIndex="1000"
        >
          <IconButton
            aria-label="Menu"
            display={{ base: 'inline-flex', md: 'none' }}
            onClick={onOpen}
            icon={<FiMenu />}
            size="sm"
          />

          <HStack spacing={4}>
            <Menu>
              <MenuButton>
                <HStack spacing={3}>
                  <Avatar
                    size="sm"
                    name={user?.name}
                    src={user?.avatar}
                  />
                  <Text>{user?.name}</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem
                  icon={<FiUser />}
                  as={RouterLink}
                  to="/profile"
                >
                  Profile
                </MenuItem>
                <MenuItem
                  icon={<FiSettings />}
                  as={RouterLink}
                  to="/settings"
                >
                  Settings
                </MenuItem>
                <MenuItem
                  icon={<FiLogOut />}
                  onClick={handleLogout}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        <Box
          as="main"
          p="4"
          mt="16"
        >
          {children}
        </Box>
      </Box>

      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        isFullHeight
        preserveScrollBarGap
        blockScrollOnMount={false}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {/* Add your navigation items here */}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default DashboardLayout;